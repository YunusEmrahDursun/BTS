import StatusCodes, { FORBIDDEN } from 'http-status-codes';
import { Request, Response, Router,NextFunction } from 'express';
import SocketIO from 'socket.io';
import { ParamMissingError } from '@shared/errors';
import db from '@database/manager';
import path from 'path';
import Procedures from '@procedures/index';
const router = Router();
const { CREATED, OK, NO_CONTENT } = StatusCodes;

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
    res.render('pages/login',{title:"BTS | Giriş Yap"});
});

router.use('/register/:id?',async (req: Request, res: Response) => {
    if(req.session.user){
        res.redirect('/web/dashboard');
        return;
    }
    let { id } = req.params;
    let abonelik_id=1; 
    if ( !id ) {
        id="1";
    }
    const restTable=Procedures.tables["register"];
    let s={};
    if(restTable && restTable.props){
        for (let key in restTable.props ) {
            let item=restTable.props[key]
            if(item.f && item.t) s[item.f]=await db.selectAll(item.f+"_table");
        }
    }
    let abonelik=(await db.getById(id,"abonelik_table")) || {};
    //if( result ) abonelik_id=result.abonelik_id
    res.render('pages/register',{title:"BTS | Kayıt Ol",abonelik ,data:{
        table:"register",
        static:s,
        ...restTable
    },targetData:{}});
});



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
    next(); 
})


// end points

router.get('/exit', async (req: Request, res: Response) => {
    req.session.destroy(function(error){ if(error) logger.err(error, true);})
    res.redirect('/web/login');
});

router.use('/dashboard', async (req: Request, res: Response) => {
    const firmaId=req.session.user.firma_id;
    let s;
    // let s=await db.queryObject(` SELECT
    // (SELECT COUNT(*) FROM ${global.databaseName}.cihaz_table WHERE firma_id=:firmaId and silindi_mi=0) as cihazSayisi, 
    // (SELECT COUNT(*) FROM ${global.databaseName}.bolge_table WHERE firma_id=:firmaId and silindi_mi=0) as bolgeSayisi,
    // (SELECT COUNT(*) FROM ${global.databaseName}.sikayet_table WHERE firma_id=:firmaId and silindi_mi=0) as talepSayisi,
    // (SELECT COUNT(*) FROM ${global.databaseName}.musteri_table WHERE firma_id=:firmaId and silindi_mi=0) as musteriSayisi,
    // (SELECT COUNT(*) FROM ${global.databaseName}.kullanici_table WHERE firma_id=:firmaId and yetki_id=2 and silindi_mi=0) as teknikPersonelSayisi`
    // ,{firmaId});
    //console.log(s)
    res.render('dashboard/index',{title:"Ana Sayfa",data: Array.isArray(s) ? s[0] : {} });
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
        table:table,
        tableHead:restTable.columns,
        hideColumn:restTable.hideColumn,
        turkce:restTable.turkce,
        static:s,
        props:restTable.props || {} ,
        idColName:Procedures.getTableIdColumnName(table)
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
        idColName:Procedures.getTableIdColumnName(table),
        ...restTable
    },targetData:result});
});


router.use('/test', async (req: Request, res: Response) => {
    //res.json(await db.getById(1,"abonelik_table")).end()
    //res.json(req.session).end()
    //console.log(req.session)
    //console.log(req.sessionID)
    const io: SocketIO.Server = req.app.get('socketio');
    io.emit("update","asd")
    res.json({}).end()
});



export default router;
