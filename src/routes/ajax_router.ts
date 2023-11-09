import StatusCodes from 'http-status-codes';
import { Request, Response, Router,NextFunction } from 'express';

import { generateLink } from '@shared/functions';
import multer from 'multer';
import db from '@database/manager';
import Procedures from '@procedures/index';
import path from 'path';
import fs from 'fs';
import logger from 'jet-logger';
import { JetLogger } from 'jet-logger/lib/JetLogger';
const md5 = require('md5');
const router = Router();
const { CREATED, OK, NO_CONTENT,FORBIDDEN } = StatusCodes;

//tablo request
router.post('/table/:table',async function(req, res, next) {
    const { table } = req.params;
    if(!Procedures.checkAuth(table,req.session.auth,"read")) return res.status(FORBIDDEN).end();

    try {
      var data=JSON.parse(JSON.stringify(req.body.ndata));
      if(!Procedures.checkTable(table) ) {
          return res.status(NO_CONTENT).end();
      }
      const firmaId=req.session.user.firma_id; // hangi firmanın datasını çekeceği için
      res.send({d:await db.tableProcedure(table,data,firmaId),status:1});
    } catch (error) {
      logger.err(error, true);
      res.send({
        message: "Hata oluştu!",
        status: 0,
        color: "danger"
      });
    }
  
});
//select search
router.get('/dyndata/:table', async function (req, res, next) {
    const { table } = req.params; 
    const { q,col,c,cq } = req.query;
    if(!Procedures.checkTable(table)  ) return res.status(NO_CONTENT).end();
    if(!Procedures.checkAuth(table,req.session.auth,"read")) return res.status(FORBIDDEN).end();
    const restTable=Procedures.tables[table]; 
    if(!restTable.props[col]?.f) return res.status(NO_CONTENT).end();
    
    const targetTable=restTable.props[col].f;
    const tableIdName:string=Procedures.getTableIdColumnName(targetTable);
    const textName:string=restTable.props[col]?.k || col
    const colNames=[ tableIdName , textName ];
    let connect="";
    if(cq && restTable.props[col].connect===cq){
        if(!c){
            res.json([]);
            return;
        }
        connect=" AND "+restTable.props[col].connect+"=?";
    }
    const where= { };
    try {
      if( Procedures.tables[restTable.props[col].f].check_firma_id ){
        const firmaId= req.session.user.firma_id;
        where["firma_id"] = firmaId;
      }
    } catch (error) {
      logger.err(error, true);
      res.status(NO_CONTENT).end();
    }
   
    if(q){
      where[restTable.props[col]?.k] = q;
    }
    const result=await db.selectLikeWithColumn(colNames,targetTable+"_table", where ,"AND",connect+" LIMIT 10",[c]);
    res.json( Array.isArray(result) && result.map(x=> ({ "id": x[tableIdName] , "text": x[textName] }) ));
  });
  router.post('/register/:link', async (req: Request, res: Response) => {
    const data=req.body.kdata;
    const { link } = req.params; 
    var text, status=1 ;
    
    if (!data ) {
        text = "Parametre Eksik!";
        status = 0;
    }
    else{
        try {
  
            var katilimLinki:any[]=(await  db.selectQuery({
                katilim_linki:link
            },"katilim_linki_table"));
        
            var yetki:any[]=(await  db.selectQuery({
                yetki_key:"teknik"
            },"yetki_table"));
  
            if( yetki.length == 0 ){
                text = "Birşeyler ters gitti!";
                logger.err("yetki bulunamadı "+ JSON.stringify(yetki), true);
                status = 0;
            }else if(katilimLinki.length == 0){
                text = "Katılım Linki Bulunamadı!";
                status = 0;
            }
            else{
                const tempData = {
                    kullanici_isim: data.kullanici_isim,
                    kullanici_soyisim: data.kullanici_soyisim,
                    kullanici_adi:data.kullanici_adi,
                    kullanici_parola: md5(data.kullanici_parola),
                    kullanici_telefon: data.kullanici_telefon,
                    sube_id: katilimLinki[0].sube_id,
                    firma_id: katilimLinki[0].firma_id,
                    yetki_id:yetki[0].yetki_id
                }
                await db.insert(tempData,"kullanici_table");
                await db.setSilindi({  katilim_linki:data.link },"katilim_linki_table");
            }
           
           
        } catch (error) {
            logger.err(error, true);
            text = "Birşeyler ters gitti!";
            status = 0;
        }
    }
    
    return res.status(OK).send({
        message: text,
        status: status
    });
  });

router.post("/login", async (req: Request, res: Response) => {
    const data=req.body.kdata;
    var text, status=0 ;
    try {
        if(!data.kullanici_adi || !data.kullanici_parola){
            throw "Zorunlu alanların doldurulması gerekmektedir!"
        }
        var users=(await  db.selectQuery({
          kullanici_adi:data.kullanici_adi,
            kullanici_parola:md5(data.kullanici_parola)
        },"kullanici_table"));

        if(users && Array.isArray(users) && users.length>0){
            let user = users[0];
            let auth = (await db.getById(user.yetki_id,"yetki_table"));

            req.session.user = user
            req.session.auth= auth.yetki_key
        }else{
            throw "Kullanıcı adı veya şifre hatalı! "
        }
        text = "Giriş Yapılıyor!";
        status = 1;
    } catch (error) {
        text=error.message || error
    }
    
    res.send({
        message: text,
        status: status,
    });
});

router.post('/isEmirleri', async function (req, res, next) {
  const firmaId=req.session.user.firma_id;
  if(!firmaId) return res.status(FORBIDDEN).end();
  let isEmirleri = await db.queryObject(`
  SELECT g.*,durum.*,user.* FROM ${global.databaseName}.is_emri_table as g
  inner join ${global.databaseName}.is_emri_durum_table as durum on durum.is_emri_durum_id=g.is_emri_durum_id
  inner join ${global.databaseName}.kullanici_table as user on user.kullanici_id=g.is_emri_giden_kullanici_id
  where g.firma_id=:firmaId and g.silindi_mi=0 order by g.guncellenme_zamani desc limit 10;
  `,{firmaId});

  res.send({d:isEmirleri,status:1});
});

router.use('/createLink', async (req: Request, res: Response) => {
  const data=req.body.kdata;
  const firmaId=req.session.user.firma_id;
  if(!["admin","sube"].includes(req.session.auth)) return res.status(FORBIDDEN).end();
  if(!firmaId) return res.status(FORBIDDEN).end();
  const createdLink=generateLink();
  await db.insert({
    katilim_linki:createdLink,
    sube_id:data.sube_id,
    firma_id:firmaId
  },"katilim_linki_table")
  res.send({d:createdLink,status:1});
});
router.use('/checkJoinLink', async (req: Request, res: Response) => {
  const data=req.body.kdata;
  var text, status=1;

  var katilimLinki=(await  db.selectQuery({
      katilim_linki:data.link
  },"katilim_linki_table"));

  if(katilimLinki && Array.isArray(katilimLinki) && katilimLinki.length>0){
      status = 1;
  }
  else{
      text = "Katılım Linki Bulunamadı!";
      status = 0;
  }
  return res.status(OK).send({
      message: text,
      status: status,
  });
});
router.post('/pdf-thisMonthClosedTasks', async function (req, res, next) {
  const firmaId=req.session.user.firma_id;
  let tasks:any = await db.queryObject(`SELECT kullanici_isim,kullanici_soyisim,kullanici_telefon,kullanici_kayit_tarihi FROM ${global.databaseName}.kullanici_table where firma_id = :firmaId and silindi_mi = 0;`,{firmaId});
  res.send({d:[1,2,3],status:1});
});
router.post('/pdf-thisMonthOpenTasks', async function (req, res, next) {
  const firmaId=req.session.user.firma_id;
  let tasks:any = await db.queryObject(`
  SELECT g.is_emri_id,u.kullanici_isim,u.kullanici_soyisim,g.is_emri_aciklama,g.is_emri_olusturma_tarihi,g.guncellenme_zamani,d.is_emri_durum_adi FROM ${global.databaseName}.is_emri_table as g
  inner join ${global.databaseName}.kullanici_table as u on u.kullanici_id = g.is_emri_giden_kullanici_id
  inner join ${global.databaseName}.is_emri_durum_table as d on d.is_emri_durum_id = g.is_emri_durum_id
  where g.firma_id = :firmaId and g.silindi_mi = 0;`
  ,{firmaId}) ;
  res.send({d:tasks,status:1});
});
router.post('/pdf-users', async function (req, res, next) {
  const firmaId=req.session.user.firma_id;
  let user:any = await db.queryObject(`SELECT kullanici_isim,kullanici_soyisim,kullanici_telefon,kullanici_kayit_tarihi FROM ${global.databaseName}.kullanici_table where firma_id = :firmaId and silindi_mi = 0;`,{firmaId});
  res.send({d:user,status:1});
});
router.post('/pdf-all-taks', async function (req, res, next) {
  const firmaId=req.session.user.firma_id;
  let tasks:any = await db.queryObject(`
  SELECT g.is_emri_id,u.kullanici_isim,u.kullanici_soyisim,g.is_emri_aciklama,g.is_emri_olusturma_tarihi,g.guncellenme_zamani,d.is_emri_durum_adi FROM ${global.databaseName}.is_emri_table as g
  inner join ${global.databaseName}.kullanici_table as u on u.kullanici_id = g.is_emri_giden_kullanici_id
  inner join ${global.databaseName}.is_emri_durum_table as d on d.is_emri_durum_id = g.is_emri_durum_id
  where g.firma_id = :firmaId and g.silindi_mi = 0;`
  ,{firmaId}) ;
  res.send({d:tasks,status:1});
});
router.post('/pdf-month/:month', async function (req, res, next) {
  const { month } = req.params;
  const monthIndex= parseInt(month);
  if(isNaN(monthIndex)){
    res.send({
      message: "Hata oluştu!",
      status: 0,
      color: "danger"
    });
  }else{
    const firmaId=req.session.user.firma_id;
    let tasks:any = await db.queryObject(`
    SELECT g.is_emri_id,u.kullanici_isim,u.kullanici_soyisim,g.is_emri_aciklama,g.is_emri_olusturma_tarihi,g.guncellenme_zamani,d.is_emri_durum_adi FROM ${global.databaseName}.is_emri_table as g
    inner join ${global.databaseName}.kullanici_table as u on u.kullanici_id = g.is_emri_giden_kullanici_id
    inner join ${global.databaseName}.is_emri_durum_table as d on d.is_emri_durum_id = g.is_emri_durum_id
    where g.firma_id = :firmaId and g.silindi_mi = 0 and  MONTH(is_emri_olusturma_tarihi) = (MONTH(CURDATE()) - ${monthIndex}) `
    ,{firmaId}) ;
    res.send({d:tasks,status:1});
  }
  
});

/* #region  multer  */

var storageFile = multer.diskStorage({
    destination: function (req, file, cb) {
      var ext=file.originalname.substr(file.originalname.lastIndexOf("."));
      if(ext==".pdf"){
        cb(null, 'src/public/firmaFiles/'+req.session?.user?.firma_id+"/");
      }
      else {
        cb(null, 'src/public/firmaImages/'+req.session?.user?.firma_id+"/");
      }
    },
    filename: function (req, file, cb) {
      if(req.session.user && req.session.user.firma_id){
        var ext=file.originalname.substr(file.originalname.lastIndexOf("."));
        var fileName=md5(Math.random())+ext;
        if(!req.fileName){
          req.fileName=[];
        }
        if(ext==".pdf"){
          req.fileName.push({ "fileName":file.originalname,"pathName":fileName,"colName":file.colName});
        }
        else{
          req.fileName.push({"pathName":fileName,"colName":file.colName});
        }
        cb(null, fileName) ;
      }
      else{
        req.fileValidationError='Yetki Bulunamadı!';
        return cb(null, false)
      }
    }
  });
  
  const accessFiles=['jpg', 'png', 'pdf','jpeg'];
  
  var uploadFile = multer({ storage: storageFile, limits: { fileSize: 10 * 1024 * 1024 /*10MB*/ ,files: 10 } ,
    fileFilter: function (req, file, cb) {
      var obj=JSON.parse(decodeURIComponent(file.originalname));
      file.originalname=obj.name;
      file.colName=obj.colName;
      if(!accessFiles.some(ext => file.originalname.endsWith("." + ext))){
      req.fileValidationError='Dosya Tipi Geçersiz!';
      return cb(null, false)
    }
    if (req.session.user && req.session.user.firma_id ) {
      cb(null, true)
    }
    else{
      req.fileValidationError='Yetki Bulunamadı!';
      return cb(null, false)
    }
    
  }});
  router.use('/fileUpload',uploadFile.array('file',10),function(req,res,next){
    res.send({
      message: req["fileName"],
      status: 1,
    });
  }); 
  /* #endregion */
  
export default router;
