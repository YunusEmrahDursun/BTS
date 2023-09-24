import StatusCodes from 'http-status-codes';
import { Request, Response, Router,NextFunction } from 'express';

import { ParamMissingError } from '@shared/errors';
import Procedures from '@procedures/index';
import db from '@database/manager';

import logger from 'jet-logger';

const router = Router();
const {  OK, NO_CONTENT,BAD_REQUEST } = StatusCodes;


let p:any = Procedures.getPaths();

// middleware

router.use("/:table/*", async (req: Request, res: Response,next:NextFunction) => {
    const { table } = req.params;
    if(!Procedures.checkTable(table)) {
        return res.status(NO_CONTENT).end();
    }
    /*if(await db.checkAuth(req.session.user.id,8 ) == false ){
        throw "Yetkiniz Yok!"
    }*/
    next(); 
})

// end points

router.get(p.get, async (req: Request, res: Response) => {
    const { table } = req.params;
    const restTable=Procedures.tables[table]; 
    let text, status=1 ,result:any[]=[]; 
    if(!Procedures.checkAuth(table,req.session.user,"read")){
        text = "Yetkiniz Bulunmamaktadır!";
        status = 0;
    }else{
        try {
            result=(await db.selectWithColumn(restTable.columns,table+"_table")) as any[]
        } catch (error) {
            logger.err(error, true);
            text = "Birşeyler ters gitti!";
            status = 0;
        }
    }
    
    return res.status(OK).json({
        message: text,
        status: status,
        data:result
    });
});


router.post(p.add, async (req: Request, res: Response) => {
    const data = req.body.kdata;
    const { table } = req.params;   
    var text, status=1 ;
    if (!data ) {
        text = "Parametre Eksik!";
        status = 0;
    }else if(!Procedures.checkAuth(table,req.session.user,"write")){
        text = "Yetkiniz Bulunmamaktadır!";
        status = 0;
    }else{
        try {
            const tempData = Procedures.checkData(Procedures.getColumnsWithoutId(table),data);
            if(Procedures.tables[table].check_firma_id){ tempData.firma_id = req.session.user.firma_id; }
            await db.insert(tempData,table+"_table");
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


router.put(p.update, async (req: Request, res: Response) => {
    const data = req.body.kdata;
    const { table,id } = req.params;
    var text, status=1 ;
    if (!data || !id) {
        text = "Parametre Eksik!";
        status = 0;
    }
    else if(!Procedures.checkAuth(table,req.session.user,"write")){
        text = "Yetkiniz Bulunmamaktadır!";
        status = 0;
    }
    else{
        try {
            await db.update(Procedures.checkData(Procedures.getColumnsWithoutId(table),data),{[Procedures.getTableIdColumnName(table)]:id},table+"_table");
            text = "Güncelleme İşlemi Başarılı!";
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


router.delete(p.delete, async (req: Request, res: Response) => {
    const { table,id } = req.params;
    var text, status=1 ;
    if (!id ) {
        text = "Parametre Eksik!";
        status = 0;
    }
    else if(!Procedures.checkAuth(table,req.session.user,"write")){
        text = "Yetkiniz Bulunmamaktadır!";
        status = 0;
    }
    else{
        try {
            await db.remove({[Procedures.getTableIdColumnName(table)]:id},table+"_table")
            text = "Silme İşlemi Başarılı!";
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

router.get(p.getOne, async (req: Request, res: Response) => {
    const { table,id } = req.params;
    let text, status=1 ,result:any[]=[];
    if (!id ) {
        text = "Parametre Eksik!";
        status = 0;
    }
    else if(!Procedures.checkAuth(table,req.session.user,"read")){
        text = "Yetkiniz Bulunmamaktadır!";
        status = 0;
    }
    else{
        try {
            const restTable=Procedures.tables[table];
            result=(await db.selectWithColumn(restTable.columns,table+"_table",{[Procedures.getTableIdColumnName(table)]:id})) as any[]
        } catch (error) {
            logger.err(error, true);
            text = "Birşeyler ters gitti!";
            status = 0;
        }
    }
    return res.status(OK).json({
        message: text,
        status: status,
        data:result
    });
});

router.use("*", async (req: Request, res: Response) => {
    return res.status(BAD_REQUEST).end(); 
})

export default router;
