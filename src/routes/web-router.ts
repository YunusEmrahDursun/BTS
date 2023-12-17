import StatusCodes from 'http-status-codes';
import { Request, Response, Router,NextFunction } from 'express';
import SocketIO from 'socket.io';
import { ParamMissingError } from '@shared/errors';
import { formatTarih } from '@shared/functions';
import db from '@database/manager';
import path from 'path';
import Procedures from '@procedures/index';
const router = Router();
const { CREATED, OK, NO_CONTENT,FORBIDDEN } = StatusCodes;
const moment = require('moment');
const viewsDir = path.join(__dirname, 'views');
import logger from 'jet-logger';

/*// index page
router.use('/', (req: Request, res: Response) => {
    return res.sendFile('game.html', {root: viewsDir});
});
*/


router.use('/login', (req: Request, res: Response) => {
    if(req.session.user){
        res.redirect('/web/dashboard');
        return;
    }
    res.render('pages/login',{title:"BTS | Giriş"});
});

router.use('/register',async (req: Request, res: Response) => {
    if(req.session.user){
        res.redirect('/web/dashboard');
        return;
    }
  
    res.render('pages/register',{title:"BTS | Kayıt Ol" });
});

// router.use('/register/:id?',async (req: Request, res: Response) => {
//     if(req.session.user){
//         res.redirect('/web/dashboard');
//         return;
//     }
//     let { id } = req.params;
//     let abonelik_id=1; 
//     if ( !id ) {
//         id="1";
//     }
//     const restTable=Procedures.tables["register"];
//     let s={};
//     if(restTable && restTable.props){
//         for (let key in restTable.props ) {
//             let item=restTable.props[key]
//             if(item.f && item.t) s[item.f]=await db.selectAll(item.f+"_table");
//         }
//     }
//     let abonelik=(await db.getById(id,"abonelik_table")) || {};
//     //if( result ) abonelik_id=result.abonelik_id
//     res.render('pages/register',{title:"BTS | Kayıt Ol",abonelik ,data:{
//         table:"register",
//         static:s,
//         ...restTable
//     },targetData:{}});
// });

/*   session need below   */

// middleware

router.use("/*", async (req: Request, res: Response,next:NextFunction) => {
    if(!req.session.user){
        res.redirect('/web/login');
        return;
    }
    
    res.locals.menu = Procedures.menu;
    res.locals.tables = Procedures.tables;
    res.locals.session=req.session.user;
    res.locals.auth = req.session.auth;
    const transferDurumu = await db.selectOneQuery({is_emri_durum_key:'support'},'is_emri_durum_table');
    res.locals.notif = await db.selectQuery({is_emri_durum_id:transferDurumu.is_emri_durum_id,firma_id:req.session.user.firma_id},"is_emri_table")
    next(); 
})


// end points

router.get('/exit', async (req: Request, res: Response) => {
    req.session.destroy(function(error){ if(error) logger.err(error, true);})
    res.redirect('/web/login');
});

router.use('/dashboard', async (req: Request, res: Response) => {
    const firmaId=req.session.user.firma_id;
    let degerler:any=await db.queryObject(` SELECT
    (SELECT COUNT(*) FROM ${global.databaseName}.kullanici_table WHERE firma_id=:firmaId and silindi_mi=0) as personelSayisi, 
    (SELECT COUNT(*) FROM ${global.databaseName}.sube_table WHERE firma_id=:firmaId and silindi_mi=0) as subeSayisi,
    (SELECT COUNT(*) FROM ${global.databaseName}.bina_table WHERE firma_id=:firmaId and silindi_mi=0) as binaSayisi,
    (SELECT COUNT(*) FROM ${global.databaseName}.is_emri_table WHERE firma_id=:firmaId and silindi_mi=0) as isEmriSayisi,
    (SELECT COUNT(*) FROM ${global.databaseName}.is_emri_table as is_emri left join ${global.databaseName}.is_emri_durum_table AS durum ON durum.is_emri_durum_id= is_emri.is_emri_durum_id  WHERE firma_id=:firmaId and is_emri.silindi_mi=0 and durum.is_emri_durum_key = "success" ) as kapananIsEmirleri`
    ,{firmaId});
    
    const percent = degerler[0].isEmriSayisi !=0 ? (( 100 * ( degerler[0].kapananIsEmirleri)) / degerler[0].isEmriSayisi).toFixed(0) : 0

    res.render('dashboard/index',{title:"Ana Sayfa",data: { degerler:degerler[0] , percent } });
});
router.use('/report', async (req: Request, res: Response) => {
    const firmaId=req.session.user.firma_id;
    if(!["admin","sube","onay"].includes(req.session.auth)) return res.status(FORBIDDEN).end();
    if(!firmaId) return res.status(FORBIDDEN).end();

    let result:any = await db.queryObject(`SELECT DATE_FORMAT(Months.month, '%Y-%m') AS ay_yil, IFNULL(COUNT(is_emri_olusturma_tarihi), 0) AS toplam, COUNT(durum.is_emri_durum_key) as basarili
        FROM (
            SELECT DATE_ADD(LAST_DAY(NOW() - INTERVAL 12 MONTH), INTERVAL n MONTH) AS month
            FROM (
                SELECT 0 AS n UNION ALL
                SELECT 1 UNION ALL
                SELECT 2 UNION ALL
                SELECT 3 UNION ALL
                SELECT 4 UNION ALL
                SELECT 5 UNION ALL
                SELECT 6 UNION ALL
                SELECT 7 UNION ALL
                SELECT 8 UNION ALL
                SELECT 9 UNION ALL
                SELECT 10 UNION ALL
                SELECT 11 UNION ALL
                SELECT 12
            ) AS numbers
        ) AS Months
        LEFT JOIN ${global.databaseName}.is_emri_table AS is_emri ON DATE_FORMAT(Months.month, '%Y-%m') = DATE_FORMAT(is_emri_olusturma_tarihi, '%Y-%m') AND firma_id = :firmaId and silindi_mi = 0
        LEFT JOIN ${global.databaseName}.is_emri_durum_table AS durum ON durum.is_emri_durum_id= is_emri.is_emri_durum_id and durum.is_emri_durum_key = "success"
        GROUP BY Months.month
        ORDER BY Months.month DESC;`,{firmaId});

    let userCount:any = await db.queryObject(`SELECT count(*) as total FROM ${global.databaseName}.kullanici_table where firma_id = :firmaId and silindi_mi = 0;`,{firmaId});
    let isEmiriCount:any = await db.queryObject(`SELECT count(*) as total FROM ${global.databaseName}.is_emri_table where firma_id = :firmaId and silindi_mi = 0;`,{firmaId}) ; 
    let faaliyetTaskCount:any = await db.queryObject(`
    SELECT count(*)  as total FROM ${global.databaseName}.is_emri_table where firma_id = :firmaId and silindi_mi = 0 and faaliyet_raporunda_gozuksun=1 and  MONTH(is_emri_olusturma_tarihi) = MONTH(CURDATE());`
    ,{firmaId}) ;

    let personel = await db.selectWithColumn(["kullanici_id","kullanici_isim","kullanici_soyisim"],"kullanici_table",{firma_id:firmaId});
    let bina = await db.selectWithColumn(["bina_id","bina_adi"],"bina_table",{firma_id:firmaId});
    res.render('pages/report',{title:"Raporlama Sayfası",data: {
        userCount:userCount[0].total,
        isEmiriCount:isEmiriCount[0].total,
        faaliyetTaskCount:faaliyetTaskCount[0].total,
        personel,
        bina,
        months:result.map(i=> {
            return {
                ...i,
                bitmedi: i.toplam - i.basarili,
                bitmeyenPercent: i.toplam !=0 ? (( 100 * (i.toplam - i.basarili)) / i.toplam).toFixed(0) : 0,
                tarih: formatTarih(i.ay_yil),
                percent: i.toplam !=0 ? (( 100 * i.basarili) / i.toplam).toFixed(0) : 0
            }
        }) 
    }});
});
router.use('/invite', async (req: Request, res: Response) => {
    const firmaId=req.session.user.firma_id;
    if(!["admin","sube","onay"].includes(req.session.auth)) return res.status(FORBIDDEN).end();
    if(!firmaId) return res.status(FORBIDDEN).end();
    var subeler=(await  db.selectQuery({  firma_id:firmaId  },"sube_table"));
    var yetkiler=(await  db.selectAll("yetki_table"));
    res.render('pages/invite',{title:"Davet Linki Oluştur",data: {
        subeler,
        yetkiler
    }});
});
// router.use('/form/firmalar/:id?',async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const table="firmalar";
//     if(!Procedures.checkTable(table) ) {
//         return res.status(NO_CONTENT).end();
//     }
//     const restTable=Procedures.tables[table];
//     let s={};
//     if(restTable.props){
//         for (let key in restTable.props ) {
//             let item=restTable.props[key]
//             if(item.f && item.t && item.t=="select") s[item.f]=await db.selectAll(item.f+"_table");
//         }
//     }
//     let result={};
//     let pug;

//     if(id){
//         let arr=await db.formProcedure(table,id);
//         if(Array.isArray(arr) && arr.length){
//             result=arr[0];
//         }
//         pug='firmalar/edit';
//     }else{
//         pug='firmalar/new';
//     }

//     res.render(pug,{title:restTable.title,data:{
//         table:table,
//         static:s,
//         idColName:Procedures.getTableIdColumnName(table),
//         ...restTable
//     },targetData:result});
// });



router.use('/table/:table',async (req: Request, res: Response) => {
    const { table } = req.params;
    const initSearch = req.query;
    if(!Procedures.checkTable(table) ) return res.status(NO_CONTENT).end();
    if(!Procedures.checkAuth(table,req.session.auth,"read")) return res.status(FORBIDDEN).end();
    const restTable=Procedures.tables[table];
    let s={};
    if(restTable.props){
        for (let key in restTable.props ) {
            let item=restTable.props[key]
            if(item.f && item.t && item.t=="select") s[item.f]=await db.selectAll(item.f+"_table");
        }
    }
    res.render('dynamic-pages/table',{title:restTable.title,data:{
        initSearch,
        srcTxt:Object.keys(initSearch).map(key=> { return { k:key,v:initSearch[key] } }),
        table:table,
        tableHead:restTable.columns,
        hideColumn:restTable.hideColumn,
        turkce:restTable.turkce,
        static:s,
        props:restTable.props || {} ,
        idColName:Procedures.getTableIdColumnName(table),
        link:restTable.link
    }});
});

router.use('/form/:table/:id?',async (req: Request, res: Response) => {
    const { table,id } = req.params;
    if(!Procedures.checkTable(table) )  return res.status(NO_CONTENT).end(); 
    if(!Procedures.checkAuth(table,req.session.auth,"write")) return res.status(FORBIDDEN).end();
    const restTable=Procedures.tables[table];
    let s={};
    if(restTable.props){
        for (let key in restTable.props ) {
            let item=restTable.props[key]
            if(item.f && item.t && item.t=="select") s[item.f]=await db.selectAll(item.f+"_table");
        }
    }
    let extraData={};
    if(restTable.extra){
        const firmaId=req.session.user.firma_id;
        for (let item of restTable.extra ) {
            extraData[item.key] = await db.queryObject(item.sql,{id:id,firmaId:firmaId});
        }
    }
    let result={};
    if(id){
        const firmaId=req.session.user.firma_id;
        let arr=await db.formProcedure(table,id,firmaId);//await db.getById(id,table+"_table");
        if(Array.isArray(arr) && arr.length){
            result=arr[0];
        }
    }
    let pug='dynamic-pages/form';
    if(restTable.custom){
        pug='dynamic-pages/'+restTable.custom;
    }
    res.render(pug,{title:restTable.title,data:{
        table:table,
        static:s,
        extraData,
        idColName:Procedures.getTableIdColumnName(table),
        ...restTable
    },targetData:result});
});


router.use('/test', async (req: Request, res: Response) => {
    //res.json(await db.getById(1,"abonelik_table")).end()
    //res.json(req.session).end()
    //console.log(req.session)
    //console.log(req.sessionID)
    // const io: SocketIO.Server = global.socketio;
    // //const io: SocketIO.Server = req.app.get('socketio');
    // const msg = JSON.stringify({msg:"refreshTable"})
    // io.emit("update",msg);
    // const io: SocketIO.Server = global.socketio;
    // const data = await db.selectOneQuery({is_emri_id:20},'is_emri_table');
    // const msg = JSON.stringify({msg:"newNotif",data})
    // io.emit("update",msg);
    const firmaId=req.session.user.firma_id;

    let index = 0;
    let temizlik:any=await  db.selectOneQuery({  firma_id:firmaId,temizlik_giden_kullanici_id:req.session.user.kullanici_id},"temizlik_table");

    let temizlikLog:any=await db.queryObject(`SELECT g.* FROM ${global.databaseName}.temizlik_log_table as g 
    where g.gun=:gun and g.silindi_mi = 0 and g.kullanici_id = :kullanici_id ORDER BY g.sira desc;`
    ,{gun:moment().format("DDMMYYYY"),kullanici_id:req.session.user.kullanici_id});
    
    if(temizlikLog[0]){
        index = parseInt(temizlikLog[0].index) + 1;
    }
    const dayIndex = moment().day() - 1;
    const temizlikArr = JSON.parse(temizlik.data);
    const binaId= temizlikArr[dayIndex][index];
    let bina=null;
    if(binaId){
        bina=await  db.selectOneQuery({  bina_id:binaId},"bina_table");

    }

    res.json(bina).end()
    //res.json({}).end()
});



export default router;
