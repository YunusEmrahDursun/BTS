import StatusCodes, { FORBIDDEN } from 'http-status-codes';
import { Request, Response, Router,NextFunction } from 'express';
import SocketIO from 'socket.io';
import db from '@database/manager';
import path from 'path';
import Procedures from '@procedures/index';
import {createToken} from '@shared/functions';
const router = Router();
const { CREATED, OK, NO_CONTENT } = StatusCodes;
const md5 = require('md5');
import logger from 'jet-logger';


router.post('/register', async (req: Request, res: Response) => {
    const data = req.body.kdata;
    var text, status=1 ;
    if (!data ) {
        text = "Parametre Eksik!";
        status = 0;
    }
    else{
        try {
            const tempData = {
                kullanici_isim: data.kullanici_isim,
                kullanici_soyisim: data.kullanici_soyisim,
                kullanici_eposta: data.kullanici_eposta,
                kullanici_parola: md5(data.kullanici_parola),
                kullanici_telefon: data.kullanici_telefon,
                sube_id: data.sube_id,
                firma_id: data.firma_id
            }
            await db.insert(tempData,"kullanici_table_table");
            text = "Ekleme İşlemi Başarılı!";
        } catch (error) {
            logger.err(error, true);
            text = "Birşeyler ters gitti!";
            status = 0;
        }
    }
    
    return res.status(OK).send({
        message: text,
        status: status,
    });
});


router.post('/login',async (req: Request, res: Response) => {
    const data=req.body.kdata;
    var text, status=0, auth="", token="" ;
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
            let tempAuth = (await db.getById(user.yetki_id,"yetki_table"));

            token = createToken();
            await db.update({kullanici_token:token},{kullanici_id:user.kullanici_id},"kullanici_table")
            auth = tempAuth.yetki_key;
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
        status,
        token,
        auth
    });

});

router.use('/firmalar', async (req: Request, res: Response) => {
    const firmalar= await db.selectWithColumn(["firmalar_id","firma_adi"],"firmalar_table");
    res.json(firmalar);
});

router.use('/subeler/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const subeler= await db.selectWithColumn(["sube_id","sube_adi"],"sube_table",{firma_id:id});
    res.json(subeler);
});

router.use('/isEmirleri/:id', async (req: Request, res: Response) => {
});

export default router;
