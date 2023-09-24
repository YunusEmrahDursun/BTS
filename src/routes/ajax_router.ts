import StatusCodes from 'http-status-codes';
import { Request, Response, Router,NextFunction } from 'express';

import { getCurrentDate } from '@shared/functions';
import { ParamMissingError } from '@shared/errors';
import multer from 'multer';
import db from '@database/manager';
import Procedures from '@procedures/index';
import path from 'path';
import fs from 'fs';
import logger from 'jet-logger';
const md5 = require('md5');
const router = Router();
const { CREATED, OK, NO_CONTENT,FORBIDDEN } = StatusCodes;

//tablo request
router.post('/table/:table',async function(req, res, next) {
    const { table } = req.params;
    if(!Procedures.checkAuth(table,req.session.user,"read")) return res.status(FORBIDDEN).end();

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
    if(!Procedures.checkAuth(table,req.session.user,"read")) return res.status(FORBIDDEN).end();
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
    if( restTable.check_firma_id ){
      const firmaId= req.session.user.firma_id;
      where["firma_id"] = firmaId;
    }
    if(q){
      where[restTable.props[col]?.k] = q;
    }
    const result=await db.selectLikeWithColumn(colNames,targetTable+"_table", where ,"AND",connect+" LIMIT 10",[c]);
    res.json( Array.isArray(result) && result.map(x=> ({ "id": x[tableIdName] , "text": x[textName] }) ));
  });
router.post("/register", async (req: Request, res: Response) => {
    const data=req.body.kdata;

    var text, status=0 ;
    try {
        var user=(await  db.selectQuery({
            kullanici_eposta:data.email
        },"kullanici_table"));

        if(user && Array.isArray(user) && user.length>0){
            throw "Bu email adresi sistemde kayıtlıdır!";
        }
        let insertedFirma:any=await db.insert({
            tam_unvan:data.tam_unvan,
            il_id:data.il_id,
            ilce_id:data.ilce_id,
            adres:data.adres,
            telefon:data.telefon,
            vergi_dairesi:data.vergi_dairesi,
            vergi_no:data.vergi_no,
            sektor_id:data.sektor_id,
            yetkili_isim:data.yetkili_isim,
            yetkili_soyisim:data.yetkili_soyisim,
            yetkili_tel:data.yetkili_tel,
            yetkili_eposta:data.yetkili_eposta,
        },"firma_table")
        let kullaniciId=await db.insert({
            kullanici_isim:data.yetkili_isim,
            kullanici_soyisim:data.yetkili_soyisim,
            kullanici_eposta:data.yetkili_eposta,
            kullanici_parola:md5(data.kullanici_parola),
            kullanici_telefon:data.yetkili_tel,
            firma_id:insertedFirma.insertId,
            yetki_id:1
        },"kullanici_table")
        try {
            const staticDir = path.join(__dirname+"../", 'public');
            await fs.mkdirSync(staticDir+'./firmaFiles'+insertedFirma);
            await fs.mkdirSync(staticDir+'./firmaImages'+insertedFirma);
        } catch (error) {
            logger.err(error, true);
        }

        text = "Kayıt Başarılı!";
        status = 1;
    } catch (error) {
        text=error.message || error
    }
    
    res.send({
        message: text,
        status: status,
    });
});

router.post("/login", async (req: Request, res: Response) => {
    const data=req.body.kdata;
    var text, status=0 ;
    try {
        if(!data.kullanici_eposta || !data.kullanici_parola){
            throw "Zorunlu alanların doldurulması gerekmektedir!"
        }
        var users=(await  db.selectQuery({
            kullanici_eposta:data.kullanici_eposta,
            kullanici_parola:md5(data.kullanici_parola)
        },"kullanici_table"));

        if(users && Array.isArray(users) && users.length>0){
            let user = users[0];
            let auth = (await db.getById(user.yetki_id,"yetki_table"));

            req.session.user = {
              ...user,
              auth: auth.yetki_key
            };

        }else{
            throw "E-posta veya şifre hatalı! "
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
