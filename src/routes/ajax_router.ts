import StatusCodes from 'http-status-codes';
import { Request, Response, Router,NextFunction } from 'express';
import SocketIO from 'socket.io';
import { generateLink } from '@shared/functions';
import multer from 'multer';
import db from '@database/manager';
import Procedures from '@procedures/index';
import fs from 'fs';
import logger from 'jet-logger';
import { JetLogger } from 'jet-logger/lib/JetLogger';
import {createToken,currentTimestamp} from '@shared/functions';
const md5 = require('md5');
const path = require('path');
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
      let subeId = null;
      if(req.session.auth != "admin"){
        subeId=req.session.user.sube_id;
      }
      res.send({d:await db.tableProcedure(table,data,firmaId,subeId),status:1});
    } catch (error) {
      logger.err(error, true);
      res.send({
        message: "Hata oluştu!",
        status: 0,
        color: "danger"
      });
    }
  
});

//select initial get Text
router.post('/dyndata/:table', async function (req, res, next) {
  const { table } = req.params; 
  const id = req.body.ndata.id;
  const col = req.body.ndata.col;
  if(!Procedures.checkTable(table)  ) return res.status(NO_CONTENT).end();
  if(!Procedures.checkAuth(table,req.session.auth,"read")) return res.status(FORBIDDEN).end();
  const restTable=Procedures.tables[table]; 
  if(!restTable.props[col]?.f) return res.status(NO_CONTENT).end();
  
  const targetTable=restTable.props[col].f;
  const tableIdName:string=Procedures.getTableIdColumnName(targetTable);
  const textName:string=restTable.props[col]?.k || col
  const colNames=[  textName ];
  
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
 
  if(id){
    where[tableIdName] = id;
  }
  const result = await db.selectOneQuery(where,targetTable+"_table")
  res.send({d:result[textName],status:1});
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
    const textName=restTable.props[col]?.k || col
    let colNames;
    if( typeof textName == 'string'){
       colNames=[ tableIdName , textName ];
    }else{
       colNames=[ tableIdName , ...textName ];
    }
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
      if( Procedures.tables[restTable.props[col].f].check_sube_id ){
        const sube_id= req.session.user.sube_id;
        where["sube_id"] = sube_id;
      }
    } catch (error) {
      logger.err(error, true);
      res.status(NO_CONTENT).end();
    }
   
    if(q){
      if( typeof textName == 'string'){
        where[textName] = q;
      }else{
        where[textName[0]] = q;
      }
    }
    if(restTable.props[col]?.extra){
      where[restTable.props[col].extra] = req.session.user[restTable.props[col].extra];
    }
    if(restTable.props[col]?.connectSql){
      const tempConnect=restTable.props[col]?.connectSql;
      where[tempConnect.connect] = (await db.selectOneQuery({[tempConnect.whereColumn]:tempConnect.whereValue},tempConnect.table))[tempConnect.column];
    }
    const result=await db.selectLikeWithColumn(colNames,targetTable+"_table", where ,"AND",connect+" LIMIT 10",[c]);
    if( typeof textName == 'string'){
      res.json( Array.isArray(result) && result.map(x=> ({ "id": x[tableIdName] , "text": x[textName] }) ));
   }else{
      res.json( Array.isArray(result) && result.map(x=> ({ "id": x[tableIdName] , "text": textName.map(i=> x[i] ).join(" ") }) ));
   }
   
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
        
            // var yetki:any[]=(await  db.selectQuery({
            //     yetki_key:"teknik"
            // },"yetki_table"));
  
            // if( yetki.length == 0 ){
            //     text = "Birşeyler ters gitti!";
            //     logger.err("yetki bulunamadı "+ JSON.stringify(yetki), true);
            //     status = 0;
            // }else 
            if(katilimLinki.length == 0){
                text = "Katılım Linki Bulunamadı!";
                status = 0;
            }
            else{
                const tempData = {
                    kullanici_isim: data.kullanici_isim,
                    kullanici_soyisim: data.kullanici_soyisim,
                    kullanici_adi:data.kullanici_adi.trim(),
                    kullanici_parola: md5(data.kullanici_parola),
                    kullanici_telefon: data.kullanici_telefon,
                    sube_id: katilimLinki[0].sube_id,
                    firma_id: katilimLinki[0].firma_id,
                    yetki_id:katilimLinki[0].yetki_id
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
  const subeId=req.session.user.sube_id;
  if(!firmaId) return res.status(FORBIDDEN).end();
  let isEmirleri = await db.queryObject(`
  SELECT g.*,durum.*,user.* FROM ${global.databaseName}.is_emri_table as g
  inner join ${global.databaseName}.is_emri_durum_table as durum on durum.is_emri_durum_id=g.is_emri_durum_id
  inner join ${global.databaseName}.kullanici_table as user on user.kullanici_id=g.is_emri_giden_kullanici_id
  where g.firma_id=:firmaId and user.sube_id=:subeId and g.silindi_mi=0 order by g.guncellenme_zamani desc limit 10;
  `,{firmaId,subeId});

  res.send({d:isEmirleri,status:1});
});
router.use('/binaAdd', async (req: Request, res: Response) => {
  const data=req.body.kdata;
  const firmaId=req.session.user.firma_id;
  const sube_id=req.session.user.sube_id;
  if(!["admin","sube","onay"].includes(req.session.auth)) return res.status(FORBIDDEN).end();
  if(!firmaId || !sube_id) return res.status(FORBIDDEN).end();
  if(!data.bina_adi) return res.status(NO_CONTENT).end();

  const insertId=(await db.insert({
    bina_adi:data.bina_adi,
    sube_id:sube_id,
    firma_id:firmaId,
  },"bina_table")).insertId;

  res.send({d:{bina_adi:data.bina_adi,bina_id:insertId},status:1});
});
router.use('/createLink', async (req: Request, res: Response) => {
  const data=req.body.kdata;
  const firmaId=req.session.user.firma_id;
  if(!["admin","sube","onay"].includes(req.session.auth)) return res.status(FORBIDDEN).end();
  if(!firmaId) return res.status(FORBIDDEN).end();
  const createdLink=generateLink();
  await db.insert({
    katilim_linki:createdLink,
    sube_id:data.sube_id,
    firma_id:firmaId,
    yetki_id:data.yetki_id
  },"katilim_linki_table")
  res.send({d:createdLink,status:1});
});

router.use('/teklifiKabulEt', async (req: Request, res: Response) => {
  const data=req.body;
  const firmaId=req.session.user.firma_id;
  if(!["onay","admin"].includes(req.session.auth)) {
    res.status(OK).send({
      message: "Onay Yetkiniz Bulunmamaktadır!",
      status: 0,
  });
  return
  }
  //return res.status(FORBIDDEN).end();
  if(!firmaId) return res.status(FORBIDDEN).end();
  const transferDurumu = await db.selectOneQuery({is_emri_durum_key:'open'},'is_emri_durum_table');
  await db.update({is_emri_durum_id:transferDurumu.is_emri_durum_id,guncellenme_zamani:currentTimestamp(),destek_talebi_id:data.dataId},{is_emri_id:data.id},'is_emri_table');
  refreshTable();

  const task = await db.selectOneQuery({is_emri_id:data.id},'is_emri_table');
  const yonlendirilenKullanici = await db.selectOneQuery({kullanici_id:task.is_emri_giden_kullanici_id},'kullanici_table');
        
  if(yonlendirilenKullanici && yonlendirilenKullanici.kullanici_push_token){
      
    global.sendNotification(yonlendirilenKullanici.kullanici_push_token,"İş Emri Güncellemesi","İş Emri Numarası : "+data.id);

  } 
  // const createdLink=generateLink();
  // await db.insert({
  //   katilim_linki:createdLink,
  //   sube_id:data.sube_id,
  //   firma_id:firmaId,
  //   yetki_id:data.yetki_id
  // },"katilim_linki_table")
  return res.status(OK).send({
      message: "Teklif Seçilmi Başarılı",
      status: 1,
  });
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

router.post('/pdf-faaliyetRaporu', async function (req, res, next) {
  const firmaId=req.session.user.firma_id;
  let tasks:any = await db.queryObject(`
  SELECT g.is_emri_id,u.kullanici_isim,u.kullanici_soyisim,g.is_emri_aciklama,g.is_emri_olusturma_tarihi,g.guncellenme_zamani,d.is_emri_durum_adi FROM ${global.databaseName}.is_emri_table as g
  inner join ${global.databaseName}.kullanici_table as u on u.kullanici_id = g.is_emri_giden_kullanici_id
  inner join ${global.databaseName}.is_emri_durum_table as d on d.is_emri_durum_id = g.is_emri_durum_id
  where g.firma_id = :firmaId and g.silindi_mi = 0 and g.faaliyet_raporunda_gozuksun=1 and  MONTH(g.is_emri_olusturma_tarihi) = MONTH(CURDATE());`
  ,{firmaId}) ;
  res.send({d:tasks,status:1});
});
router.post('/pdf-thisMonthClosedTasks', async function (req, res, next) {
  const firmaId=req.session.user.firma_id;
  const durum = await db.selectOneQuery({is_emri_durum_key:'success'},'is_emri_durum_table')
  let tasks:any = await db.queryObject(`
  SELECT g.is_emri_id,u.kullanici_isim,u.kullanici_soyisim,g.is_emri_aciklama,g.is_emri_olusturma_tarihi,g.guncellenme_zamani,d.is_emri_durum_adi FROM ${global.databaseName}.is_emri_table as g
  inner join ${global.databaseName}.kullanici_table as u on u.kullanici_id = g.is_emri_giden_kullanici_id
  inner join ${global.databaseName}.is_emri_durum_table as d on d.is_emri_durum_id = g.is_emri_durum_id
  where g.firma_id = :firmaId and d.is_emri_durum_id=:durumId and g.silindi_mi = 0 and  MONTH(g.is_emri_olusturma_tarihi) = MONTH(CURDATE());`
  ,{firmaId,durumId:durum.is_emri_durum_id}) ;
  res.send({d:tasks,status:1});
});
router.post('/pdf-thisMonthOpenTasks', async function (req, res, next) {
  const firmaId=req.session.user.firma_id;
  const durum = await db.selectOneQuery({is_emri_durum_key:'success'},'is_emri_durum_table')
  let tasks:any = await db.queryObject(`
  SELECT g.is_emri_id,u.kullanici_isim,u.kullanici_soyisim,g.is_emri_aciklama,g.is_emri_olusturma_tarihi,g.guncellenme_zamani,d.is_emri_durum_adi FROM ${global.databaseName}.is_emri_table as g
  inner join ${global.databaseName}.kullanici_table as u on u.kullanici_id = g.is_emri_giden_kullanici_id
  inner join ${global.databaseName}.is_emri_durum_table as d on d.is_emri_durum_id = g.is_emri_durum_id
  where g.firma_id = :firmaId and d.is_emri_durum_id!=:durumId and g.silindi_mi = 0 and  MONTH(g.is_emri_olusturma_tarihi) = MONTH(CURDATE());`
  ,{firmaId,durumId:durum.is_emri_durum_id}) ;
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
router.post('/userTask', async function (req, res, next) {
  const id=req.body.kdata.kullanici_id;
 
    const firmaId=req.session.user.firma_id;
    let tasks:any = await db.queryObject(`
    SELECT g.is_emri_id,u.kullanici_isim,u.kullanici_soyisim,g.is_emri_aciklama,g.is_emri_olusturma_tarihi,g.guncellenme_zamani,d.is_emri_durum_adi FROM ${global.databaseName}.is_emri_table as g
    inner join ${global.databaseName}.kullanici_table as u on u.kullanici_id = g.is_emri_giden_kullanici_id
    inner join ${global.databaseName}.is_emri_durum_table as d on d.is_emri_durum_id = g.is_emri_durum_id
    where g.firma_id = :firmaId and g.silindi_mi = 0 and is_emri_giden_kullanici_id= :id  `
    ,{firmaId,id}) ;
    res.send({d:tasks,status:1});
  
});
router.post('/binaTask', async function (req, res, next) {
  const id=req.body.kdata.bina_id;
 
    const firmaId=req.session.user.firma_id;
    let tasks:any = await db.queryObject(`
    SELECT g.is_emri_id,u.kullanici_isim,u.kullanici_soyisim,g.is_emri_aciklama,g.is_emri_olusturma_tarihi,g.guncellenme_zamani,d.is_emri_durum_adi FROM ${global.databaseName}.is_emri_table as g
    inner join ${global.databaseName}.kullanici_table as u on u.kullanici_id = g.is_emri_giden_kullanici_id
    inner join ${global.databaseName}.is_emri_durum_table as d on d.is_emri_durum_id = g.is_emri_durum_id
    where g.firma_id = :firmaId and g.silindi_mi = 0 and bina_id= :id`
    ,{firmaId,id}) ;
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
  
  const accessFiles=['jpg', 'png', 'pdf','jpeg','mp4'];
  
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
  
  const refreshTable = () => { 
    const io: SocketIO.Server = global.socketio;
    const msg = JSON.stringify({msg:"refreshTable"})
    io.emit("update",msg);
}

export default router;
