import StatusCodes, { FORBIDDEN } from 'http-status-codes';
import { Request, Response, Router,NextFunction } from 'express';
import SocketIO from 'socket.io';
import db from '@database/manager';
import Procedures from '@procedures/index';
import {createToken,currentTimestamp} from '@shared/functions';
const router = Router();
const { CREATED, OK, NO_CONTENT } = StatusCodes;
const md5 = require('md5');
import multer from 'multer';
import logger from 'jet-logger';
const path = require('path');
router.get('/test', async (req: Request, res: Response) => {
    return res.status(OK).json({a:1});
});



router.post('/checkToken', async (req: Request, res: Response) => {
    const data = req.body;
    var text, status;

    var users=(await  db.selectQuery({  kullanici_token:data.token},"kullanici_table"));
    
    if(users && Array.isArray(users) && users.length>0){
        status = 1;
    }else{
        status = 0;
    }
    
    return res.status(OK).send({
        message: text,
        status: status,
    });
});

router.get('/checkJoinLink/:link', async (req: Request, res: Response) => {
    const { link } = req.params;
    var text, status=1;

    var katilimLinki=(await  db.selectQuery({
        katilim_linki:link
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

router.post('/register', async (req: Request, res: Response) => {
    const data = req.body;
    var text, status=1, token="" ;
    
    if (!data ) {
        text = "Parametre Eksik!";
        status = 0;
    }
    else{
        try {

            var katilimLinki:any[]=(await  db.selectQuery({
                katilim_linki:data.link
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
                token = createToken();
                const tempData = {
                    kullanici_isim: data.kullanici_isim,
                    kullanici_soyisim: data.kullanici_soyisim,
                    kullanici_adi:data.kullanici_adi.trim(),
                    kullanici_parola: md5(data.kullanici_parola),
                    kullanici_telefon: data.kullanici_telefon,
                    sube_id: katilimLinki[0].sube_id,
                    firma_id: katilimLinki[0].firma_id,
                    kullanici_token:token,
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
        status: status,
        token
    });
});


router.post('/login',async (req: Request, res: Response) => {
    const data = req.body;
    var text, status=0, auth="", token="" ;
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
            let tempAuth = (await db.getById(user.yetki_id,"yetki_table"));

            token = createToken();
            await db.update({kullanici_token:token},{kullanici_id:user.kullanici_id},"kullanici_table")
            auth = tempAuth.yetki_key;
        }else{
            throw "Kullanıcı Adı veya şifre hatalı! "
        }
        text = "Giriş Yapılıyor!";
        status = 1;
    } catch (error) {
        text=error.message || error
    }
    
    res.send({
        message: text,
        status,
        token,
        auth
    });

});

// router.use('/firmalar', async (req: Request, res: Response) => {
//     const firmalar= await db.selectWithColumn(["firmalar_id","firma_adi"],"firmalar_table");
//     res.json(firmalar);
// });

// router.use('/subeler/:id', async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const subeler= await db.selectWithColumn(["sube_id","sube_adi"],"sube_table",{firma_id:id});
//     res.json(subeler);
// });


/*   session need below   */

// middleware

router.use("/*", async (req: Request, res: Response,next:NextFunction) => {
    const authToken = req.headers.authorization;
    if(!authToken) return res.status(FORBIDDEN).end();

    var users=(await  db.selectQuery({  kullanici_token:authToken},"kullanici_table"));
    if(users && Array.isArray(users) && users.length>0){
        let user = users[0];
        let auth = (await db.getById(user.yetki_id,"yetki_table"));
        req.session.user = user;
        req.session.auth = auth.yetki_key;
        next(); 
    }else{
        return res.status(FORBIDDEN).end(); 
    }
  
})

router.post('/setPushToken',async (req: Request, res: Response) => {
    const data = req.body;
    var text, status=0 ;
    try {
       
        await db.update({kullanici_push_token:data.pushToken},{kullanici_id:req.session.user.kullanici_id},"kullanici_table")
        status = 1;
    } catch (error) {
        text=error.message || error
        console.log(error)
    }
    
    res.send({
        message: text,
        status
    });

});

router.use('/subeTeknikPersonelleri', async (req: Request, res: Response) => {
    let teknikPersoneller:any=await db.queryObject(`SELECT g.kullanici_id,g.kullanici_isim,g.kullanici_soyisim FROM ${global.databaseName}.kullanici_table as g 
    inner join ${global.databaseName}.yetki_table as yetki on yetki.yetki_id=g.yetki_id
    where g.sube_id=:subeId and yetki.yetki_key='teknik' and g.silindi_mi = 0 and g.kullanici_id != :id;`
    ,{subeId:req.session.user.sube_id,id:req.session.user.kullanici_id});
    res.json(teknikPersoneller)
});

router.use('/subeBinalari', async (req: Request, res: Response) => {
    let binalar:any=await db.queryObject(`SELECT g.bina_id,g.bina_adi FROM ${global.databaseName}.bina_table as g 
    where g.sube_id=:subeId and g.silindi_mi = 0;`
    ,{subeId:req.session.user.sube_id});
    res.json(binalar)
});


router.use('/yonlendirmeTalepleri', async (req: Request, res: Response) => {
    let talepler:any=await db.queryObject(`SELECT g.*,bina.*,il.*,ilce.*,durum.* FROM ${global.databaseName}.is_emri_table as g 
    inner join ${global.databaseName}.is_emri_yonlendirme_table as yonlendirme on yonlendirme.is_emri_id=g.is_emri_id 
    inner join ${global.databaseName}.bina_table as bina on bina.bina_id = g.bina_id
    inner join ${global.databaseName}.is_emri_durum_table as durum on durum.is_emri_durum_id=g.is_emri_durum_id
    inner join ${global.databaseName}.iller_table as il on il.il_id=bina.il_id
    inner join ${global.databaseName}.ilceler_table as ilce on ilce.ilce_id=bina.ilce_id 
    where  durum.is_emri_durum_key!="success" and g.yonlendirme_talebi='1' and yonlendirme.durum = ''   and yonlendirme.yonlendirilen_kullanici_id=:yonlendirilen_kullanici_id and g.silindi_mi = 0;`
    ,{yonlendirilen_kullanici_id:req.session.user.kullanici_id});
    res.json(talepler)
});


router.post('/isEmiriYonlendir/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    var text, status=1;

    try {
        const temp =await db.selectOneQuery({is_emri_id:id,yonlendirilen_kullanici_id:data.yonlendirilen_kullanici_id},'is_emri_yonlendirme_table');
        if(temp){
            text = "Böyle bir istek daha önceden oluşturulmuş!";
            status = 0;
        }else{
            await db.update({yonlendirme_talebi:'1'},{is_emri_id:id,is_emri_giden_kullanici_id:req.session.user.kullanici_id},'is_emri_table')
            await db.insert({is_emri_id:id,yonlendirilen_kullanici_id:data.yonlendirilen_kullanici_id},'is_emri_yonlendirme_table')

            const yonlendirilenKullanici = await db.selectOneQuery({kullanici_id:data.yonlendirilen_kullanici_id},'kullanici_table');
        
            if(yonlendirilenKullanici && yonlendirilenKullanici.kullanici_push_token){
                
                global.sendNotification(yonlendirilenKullanici.kullanici_push_token,"Yeni İş Emri Transfer Talebi","İş Emri Numarası : "+id);

            } 
        }
        
    } catch (error) {
        logger.err(error, true);
        text = "Birşeyler ters gitti!";
        status = 0;
    }
    
    return res.status(OK).send({
        message: text,
        status: status,
    });
});
router.use('/yonlendirmeTalepCevap/:id', async (req: Request, res: Response) => {
    const data = req.body;
    const { id } = req.params;
    var text, status=1;
    
    try {
        if( data.status == '1'){
            const isEmri = await db.selectOneQuery({is_emri_id:id},'is_emri_table')
            if(isEmri.yonlendirme_talebi == '1'){
                await db.update({is_emri_giden_kullanici_id:req.session.user.kullanici_id,guncellenme_zamani:currentTimestamp(),yonlendirme_talebi:'0'},{is_emri_id:id},'is_emri_table')
                await db.update({durum:'1',yonelendirme_date:currentTimestamp()},{is_emri_id:id,yonlendirilen_kullanici_id:req.session.user.kullanici_id},'is_emri_yonlendirme_table')
                await db.setSilindi({durum:'',is_emri_id:id},'is_emri_yonlendirme_table')
                await db.setSilindi({durum:'0',is_emri_id:id},'is_emri_yonlendirme_table')
                refreshTable();
                
            }

        }else if( data.status == '0' ){
            await db.update({durum:'0',yonelendirme_date:currentTimestamp()},{is_emri_id:id,yonlendirilen_kullanici_id:req.session.user.kullanici_id},'is_emri_yonlendirme_table')
        }
    } catch (error) {
        logger.err(error, true);
        text = "Birşeyler ters gitti!";
        status = 0;
    }
    
    return res.status(OK).send({
        message: text,
        status: status,
    });
});

router.use('/isEmirleri', async (req: Request, res: Response) => {
    let isEmirleri:any=await db.queryObject(`SELECT teklif.*,g.*,bina.*,il.*,ilce.*,durum.* FROM ${global.databaseName}.is_emri_table as g 
    inner join ${global.databaseName}.bina_table as bina on bina.bina_id = g.bina_id
    inner join ${global.databaseName}.is_emri_durum_table as durum on durum.is_emri_durum_id=g.is_emri_durum_id
    inner join ${global.databaseName}.iller_table as il on il.il_id=bina.il_id
    inner join ${global.databaseName}.ilceler_table as ilce on ilce.ilce_id=bina.ilce_id 
    left join ${global.databaseName}.is_emri_teklif_table as teklif on teklif.is_emri_teklif_id=g.destek_talebi_id 
    where  durum.is_emri_durum_key="open" and g.is_emri_giden_kullanici_id=:is_emri_giden_kullanici_id and g.silindi_mi = 0;`
    ,{is_emri_giden_kullanici_id:req.session.user.kullanici_id});
    res.json(isEmirleri)
});
router.use('/tamamlananisEmirleri', async (req: Request, res: Response) => {
    let isEmirleri:any=await db.queryObject(`SELECT g.*,bina.*,il.*,ilce.*,durum.* FROM ${global.databaseName}.is_emri_table as g 
    inner join ${global.databaseName}.bina_table as bina on bina.bina_id = g.bina_id
    inner join ${global.databaseName}.is_emri_durum_table as durum on durum.is_emri_durum_id=g.is_emri_durum_id
    inner join ${global.databaseName}.iller_table as il on il.il_id=bina.il_id
    inner join ${global.databaseName}.ilceler_table as ilce on ilce.ilce_id=bina.ilce_id 
    where  durum.is_emri_durum_key="success" and g.is_emri_giden_kullanici_id=:is_emri_giden_kullanici_id and g.silindi_mi = 0;`
    ,{is_emri_giden_kullanici_id:req.session.user.kullanici_id});
    res.json(isEmirleri)
});





router.post('/servisIstegiTalebi/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    var text, status=1;

    try {
        const transferDurumu = await db.selectOneQuery({is_emri_durum_key:'support'},'is_emri_durum_table');
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            await db.insert({firma_adi:element.firmaAdi,aciklama:element.aciklama,firma_iletisim:element.iletisim,fiyat:element.fiyat,is_emri_id:id},"is_emri_teklif_table")
            
        }
        await db.update({is_emri_durum_id:transferDurumu.is_emri_durum_id,guncellenme_zamani:currentTimestamp()},{is_emri_id:id,is_emri_giden_kullanici_id:req.session.user.kullanici_id},'is_emri_table');
        refreshTable();
    } catch (error) {
        logger.err(error, true);
        text = "Birşeyler ters gitti!";
        status = 0;
    }
    
    return res.status(OK).send({
        message: text,
        status: status,
    });
});
router.use('/taskOlustur/', async (req: Request, res: Response) => {
    const data = req.body;

    var text, status=1;

    try {
        const transferDurumu = await db.selectOneQuery({is_emri_durum_key:'open'},'is_emri_durum_table');
        const insertId=(await db.insert({
            is_emri_aciklama:data.is_emri_aciklama,
            is_emri_durum_id:transferDurumu.is_emri_durum_id,
            firma_id:req.session.user.firma_id,
            bina_id:data.bina_id,
            is_emri_giden_kullanici_id:req.session.user.kullanici_id
          },"is_emri_table")).insertId;

        if(data && data.files){
            for (let index = 0; index < data.files.length; index++) {
                const item = data.files[index];
                await db.insert({firma_id:req.session.user.firma_id,dosya_adi:item,is_emri_id:insertId,type:0},"firma_dosya_table")
            }
            
        }
        refreshTable();
    } catch (error) {
        logger.err(error, true);
        text = "Birşeyler ters gitti!";
        status = 0;
    }
    
    return res.status(OK).send({
        message: text,
        status: status,
    });
});

router.use('/isEmiriTamamla/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    var text, status=1;

    try {
        const transferDurumu = await db.selectOneQuery({is_emri_durum_key:'success'},'is_emri_durum_table');
        if(data && data.files){
            for (let index = 0; index < data.files.length; index++) {
                const item = data.files[index];
                await db.insert({firma_id:req.session.user.firma_id,dosya_adi:item,is_emri_id:id,type:1},"firma_dosya_table")
            }
            
        }
        await db.update({is_emri_sonuc_aciklama:data.aciklama,is_emri_durum_id:transferDurumu.is_emri_durum_id,guncellenme_zamani:currentTimestamp()},{is_emri_id:id,is_emri_giden_kullanici_id:req.session.user.kullanici_id},'is_emri_table');
        refreshTable();
    } catch (error) {
        logger.err(error, true);
        text = "Birşeyler ters gitti!";
        status = 0;
    }
    
    return res.status(OK).send({
        message: text,
        status: status,
    });
});

const refreshTable = () => { 
    const io: SocketIO.Server = global.socketio;
    io.emit("update","refreshTable");
}

/* #region  multer  */

var storageFile = multer.diskStorage({
    destination: function (req, file, cb) {
      var ext=file.originalname.substr(file.originalname.lastIndexOf("."));
      if(ext==".pdf"){
        //path.join(__dirname, '../public/firmaFiles/')
        cb(null, 'src/public/firmaFiles/'+req.session?.user?.firma_id+"/");
      }
      else {
        //path.join(__dirname, '../public/firmaFiles/')
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
  
  const accessFiles=['jpg', 'png', 'pdf','jpeg','mov','mp4'];
  
  var uploadFile = multer({ storage: storageFile, limits: { fileSize: 30 * 1024 * 1024 /*10MB*/ ,files: 10 } ,
    fileFilter: function (req, file, cb) {
    var obj=file.originalname;
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
