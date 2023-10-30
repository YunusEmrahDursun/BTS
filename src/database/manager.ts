const mysql = require( 'mysql' );
import Config from '@database/config';
import Procedures from '@procedures/index';
import logger from 'jet-logger';
class Database {
    

    databaseName:string;
    pool:any;
    procedures:any;

    constructor(config) {
        this.databaseName = config.databaseName;
        this.pool = mysql.createPool( config.databaseServer );
    }

    storedProcedurePdf = async (procedure,values) => {
        let selectedProcedure;

        try {
            selectedProcedure=JSON.parse(JSON.stringify(this.procedures[procedure]))
         } catch (error) {
            logger.err(error, true);
            throw "Procedure not converted!"
         }

         const temp = {
            data:await this.queryObject(selectedProcedure.pdf,values),
            col:selectedProcedure.pdfcol
         }

         return temp;
    }

    tableProcedure = async (table,values,firmaId) => {
        const resTable=Procedures.tables[table];
        if(! resTable.sql) throw "Sql not found!"
        let sql=resTable.sql;
        sql=sql.replace("SELECT ","SELECT SQL_CALC_FOUND_ROWS ") + " :orderBy LIMIT :current,30; SELECT FOUND_ROWS() AS max;"
        //search
        if(values.srcTxt ){
            try {
                var tmp="";
                for(let x of values.srcTxt ){
                    try {
                        if(x.v && x.v!=""){
                            let prop = resTable.props && resTable.props[x.k] ;
                            let f;
                            if(prop){
                                f={
                                    k: (prop.t!="select" && prop.k) || x.k,
                                    q: prop.q || "g",
                                    t: prop.t=="select" || Procedures.getTableIdColumnName(table)==x.k ? "number" : "text"
                                }
                            }else if( Procedures.checkColumn(table,x.k) ){
                                f={
                                    k:x.k,
                                    q:"g",
                                    t:Procedures.getTableIdColumnName(table)==x.k ? "number" : "text"
                                }
                            }
                            else{
                                return;
                            }   
                            
                            switch (f.t) {
                                case "text":
                                    tmp+=` and ${f.q}.${f.k} like `+ this.pool.escape(`%${x.v}%`) +" "
                                    break;
                                case "select":    
                                case "number":
                                    tmp+=` and ${f.q}.${f.k} = `+ this.pool.escape(`${x.v}`) +" "
                                    break;
                                case "check":
                                    tmp+=` and ${f.q}.${f.k} is not null` +" "
                                    break;    
                                case "date":
                                    if(x.e=="max")
                                    tmp+=` and ${f.q}.${f.k} < ${ this.pool.escape( x.v )} ` +" "
                                    if(x.e=="min")
                                    tmp+=` and ${f.q}.${f.k} > ${ this.pool.escape(x.v )} ` +" "
                                    break;     
                                default:
                                    break;
                            }
                        }
                    } catch (error) {
                        logger.err(error, true);
                    }
                }
                if(tmp!=""){
                    sql=sql.replace(":srcTxt",tmp)
                }
            } catch (error) {
                logger.err(error, true);
                throw "hata"
            }
            delete values.srcTxt;
        }
        //orderby
        if(values.orderBy && Procedures.checkColumn(table,values.orderBy)  ){
            sql=sql.replace(":orderBy",  "ORDER BY "+ values.orderBy + (values.orderType=="A" ? " ASC" : " DESC") )
            delete values.orderBy;
            delete values.orderType;
        }else{
            sql=sql.replace(":orderBy","")
        }
        if(! values.current) sql=sql.replace(":current","0")
        
        sql=sql.replace(":firmaId",firmaId)

        return await this.queryObject(sql,values)
    }
    query = async ( sql, args:any = null ): Promise<any> => {
        return new Promise( ( resolve, reject ) => {
            this.pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query( sql, args, ( err, rows ) => {
                    connection.release();;
                    if ( err )  {
                        var rejected={message:"Veri tabanı hatası!" };
                        console.log(err);
                        reject( rejected );
                    }
                    resolve( rows );
                } );
            });
        } );
    }
    formProcedure = async (table,value,firmaId) => {
        const resTable=Procedures.tables[table];
        if(! resTable.sql) throw "Sql not found!"
        let sql=resTable.sql;
        sql=sql.replace(":firmaId",firmaId);
        sql=sql.replace(":srcTxt",` and g.${Procedures.getTableIdColumnName(table)} = `+ this.pool.escape(`${value}`) +" ");

        return await this.query(sql)
    }
    //anti sql injection
    queryObject = (q,o) => {
        const pool = this.pool;
        var query= q.replace(/\:(\w+)/g, function (txt, key) {
          if (o.hasOwnProperty(key)) {
            return pool.escape(o[key]);
          }
          return "";
        }.bind(this));
        return this.query(query);
    }
 
    checkAuth = async (userId,authId) => {
        if(userId==null || authId==null) return false;
        try {
            //var result=await this.selectQuery({authId:authId,groupId:groupId},"Authority_Group")
            var result = await this.query(`SELECT a.* FROM coda.User_Grup g inner join coda.Authority_Group a on g.groupId=a.groupId and a.authId=${authId} and g.userId=${userId} and g.silindi_mi=0 and a.silindi_mi=0;`);
            if ( result && Array.isArray(result) &&result.length > 0  ){
                return true;
            }else{
                return false;
            }
        } catch (error) {
            return false;
        }
       
    }
    updateUserNavigateValue = async (req) => {
        var q="UPDATE coda.Users SET  navigate= navigate + 1, lastview= :date WHERE id = "+req.session.user.id
        var dt = new Date();
        let dtNow=`${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}  ${(dt.getMonth()+1).toString().padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')}/${dt.getFullYear().toString().padStart(4, '0')}`;
        this.queryObject(q,{ date: dtNow })
        //return this.query("UPDATE coda.Users SET  navigate= navigate + 1, lastview= "+new Date() +" WHERE id = "+req.session.user.id)
    }
    selectAll = async (tableName,extra="",countRow=false,databaseName=this.databaseName) => {
        if(extra==null){
            extra="";
        }
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        var query=`SELECT ${ countRow ? "SQL_CALC_FOUND_ROWS" : "" } * FROM ${databaseName}.${tableName} WHERE silindi_mi=0 ${extra};${ countRow ? "SELECT FOUND_ROWS() AS max;" : "" }`;
        return this.query(query);
    }
    selectQuery = async (where={},tableName,mode:"AND" | "OR" ="AND",extra="",countRow=false,databaseName=this.databaseName) => {
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if(Object.keys(where).length==0){
            throw "sorgualanieksik";
        }
        var query="";
        query=selectQueryConverter(tableName,databaseName,where,mode,extra,countRow);
        if(query==""){
            throw "sorgubulunamadi";
        }
        return this.query(query,Object.keys(where).map(y=> where[y]));
    }
    selectOneQuery = async (where={},tableName,mode:"AND" | "OR" ="AND",extra="",countRow=false,databaseName=this.databaseName) => {
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if(Object.keys(where).length==0){
            throw "sorgualanieksik";
        }
        var query="";
        query=selectQueryConverter(tableName,databaseName,where,mode,extra,countRow);
        if(query==""){
            throw "sorgubulunamadi";
        }
        const rows = await this.query(query,Object.keys(where).map(y=> where[y]));

        return rows[0];
         
    }
    getById = async (id,tableName,databaseName=this.databaseName)=>{
        let where={ [tableName.split("_")[0]+"_id"] :id};
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if(!id){
            throw "idbulunamadi";
        }
        var query=selectQueryConverter(tableName,databaseName,where,"AND","",false);
        if(query==""){
            throw "sorgubulunamadi";
        }
        var result=await this.query(query,Object.keys(where).map(y=> where[y]));
        if(Array.isArray(result) && result.length){
            return result[0];
        }
        return null;
    }
    selectLike = async (tableName,where={},mode:"AND" | "OR" ="AND",extra="",countRow=false,databaseName=this.databaseName) => {
        //var a=await new db().selectWithColumn(["id","a"],"test");
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        
        var query="";
        query=selectLikeConverter(tableName,databaseName,where,mode,extra,countRow);
        if(query==""){
            throw "sorgubulunamadi";
        }
        return this.query(query,Object.keys(where).map(y=> "%"+where[y]+"%"));
    }
    selectLikeWithColumn = async (colNameS:string[]=[],tableName,where={},mode:"AND" | "OR" ="AND",extra,extraData,databaseName=this.databaseName) => {
        //var a=await new db().selectWithColumn(["id","a"],"test");
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if(colNameS.length==0){
            throw "kolonisimlerieksik";
        }
        var query="";
        query=selectLikeWithColumnConverter(tableName,databaseName,colNameS,where,mode,extra);
        if(query==""){
            throw "sorgubulunamadi";
        }
        return this.query(query,Object.keys(where).map(y=> "%"+where[y]+"%").concat(extraData));
    }
    selectWithColumn = async (colNameS:string[]=[],tableName,where={},mode:"AND" | "OR" ="AND",databaseName=this.databaseName) => {
        //var a=await db.selectWithColumn(["id","a"],"test");
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if(colNameS.length==0){
            throw "kolonisimlerieksik";
        }
        var query="";
        query=selectWithColumnConverter(tableName,databaseName,colNameS,where,mode);
        if(query==""){
            throw "sorgubulunamadi";
        }
        return this.query(query,Object.keys(where).map(y=> where[y]));
    }
    insert = async (data={},tableName,databaseName=this.databaseName) => {
        //await new db().insert({ a:"azxzcxzxczsol",b:"1231"},"test")
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if(Object.keys(data).length==0){
            throw "veribulunamadi";
        }
        else if(typeof(data)=="object"){
            var query="";
            query=insertConverter(tableName,databaseName,data);
            if(query==""){
                throw "sorgubulunamadi";
            }
            return this.query(query,[ [ Object.keys(data).map(y=> data[y]) ] ]);
        }
        else{
            throw "veritipihatali";
        }
       
    }
    remove = async (where={},tableName,mode:"AND" | "OR" ="AND",databaseName=this.databaseName) => {
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if( Object.keys(where).length==0){
            throw "sorgualanieksik";
        }
        var query="";
        query=removeConverter(tableName,databaseName,where,mode);
        if(query==""){
            throw "sorgubulunamadi";
        }
        return this.query(query,Object.keys(where).map(y=> where[y]));
    }
    update = async (data={},where={},tableName,mode:"AND" | "OR" ="AND",databaseName=this.databaseName) => {
        //var a=await new db().update({a:"a",b:"b"},{b:"b"},"test");
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if(Object.keys(where).length==0){
            throw "sorgualanieksik";
        }
        if(Object.keys(data).length==0){
            throw "veribulunamadi";
        }
        var query="";
        query=updateConverter(tableName,databaseName,data,where,mode);
        if(query==""){
            throw "sorgubulunamadi";
        }
        var arr1=Object.keys(data).map(y=> data[y])
        var arr2=Object.keys(where).map(y=> where[y])
        var concat= arr1.concat(arr2);
        return this.query(query,Object.keys(concat).map(y=> concat[y]));
    }
    selectIn = async (colName,data=[],tableName,not=false,extra="",countRow=false,databaseName=this.databaseName) => {
        //data [1,2,3,4] şeklinde olmalı
        //var a=await new db().selectIn("id",[1,2],"sayfalar");
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if(data.length==0){
            throw "veribulunamadi";
        }
        if(!colName){
            throw "kolonadibulanamadi";
        }
        let _not:"NOT"| "" =""
        if(not){
            _not="NOT"
        }
        var query="";
        query=selectInConverter(tableName,databaseName,colName,extra,countRow,_not);
        if(query==""){
            throw "sorgubulunamadi";
        }
        return this.query(query,[data]);
    
    }
    setSilindi = async (where={},tableName,mode:"AND" | "OR" ="AND",databaseName=this.databaseName) => {
        //await new db().setSilindi({a:"azxzcxzxczsol"},"test");
        if(!tableName || tableName==""){
            throw "tabloismibulunamadi";
        }
        if( Object.keys(where).length==0){
            throw "sorgualanieksik";
        }
        var query="";
        query=setSilindiConverter(tableName,databaseName,where,mode);
        if(query==""){
            throw "sorgubulunamadi";
        }
        return this.query(query,Object.keys(where).map(y=> where[y]));
    }
}


//Converters
const insertConverter = (_tableName:string,_databaseName:string,_object:object) => {
    return `INSERT INTO ${_databaseName}.${_tableName} (${Object.keys(_object).toString()}) VALUES  ?`; 
}
const removeConverter = (_tableName:string,_databaseName:string,_where:object,_mode:"AND" | "OR" ) => {
    return `DELETE FROM ${_databaseName}.${_tableName} WHERE ${Object.keys(_where).map(x=> x+"= ? ").join(_mode+" ")}`; 
}
const selectQueryConverter = (_tableName:string,_databaseName:string,_where:object,_mode:"AND" | "OR",_extra:string,_countRow:boolean) => {
    return `SELECT ${ _countRow ? "SQL_CALC_FOUND_ROWS" : "" } * FROM ${_databaseName}.${_tableName} as g WHERE ( ${Object.keys(_where).map(x=> "g."+x+"= ? ").join(_mode+" ")} ) AND g.silindi_mi=0 ${_extra} ; ${ _countRow ? "SELECT FOUND_ROWS() AS max;" : "" }`;
}
const selectLikeConverter = (_tableName:string,_databaseName:string,_where:object,_mode:"AND" | "OR",_extra:string,_countRow:boolean) => {
    return `SELECT ${ _countRow ? "SQL_CALC_FOUND_ROWS" : "" } * FROM ${_databaseName}.${_tableName} WHERE ( ${ _where && Object.keys(_where).length != 0 ? Object.keys(_where).map(x=> x+" LIKE ? ").join(_mode+" "):"1=1" } ) AND silindi_mi=0 ${_extra} ; ${ _countRow ? "SELECT FOUND_ROWS() AS max;" : "" }`;
}
const selectLikeWithColumnConverter = (_tableName:string,_databaseName:string,_colNameS:string[],_where:object,_mode:"AND" | "OR",_extra:string) => {
    return `SELECT ${_colNameS} FROM ${_databaseName}.${_tableName} WHERE ( ${ _where && Object.keys(_where).length != 0 ? Object.keys(_where).map(x=> x+" LIKE ? ").join(_mode+" "):"1=1" } ) AND silindi_mi=0 ${_extra}`;
}
const selectWithColumnConverter = (_tableName:string,_databaseName:string,_colNameS:string[],_where:object,_mode:"AND" | "OR") => {
    return `SELECT ${_colNameS} FROM ${_databaseName}.${_tableName} WHERE ( ${ _where && Object.keys(_where).length != 0 ? Object.keys(_where).map(x=> x+"= ? ").join(_mode+" "):"1=1" } ) AND silindi_mi=0`;
}
const updateConverter = (_tableName:string,_databaseName:string,_object:object,_where:object,_mode:"AND" | "OR") => {
    return `UPDATE ${_databaseName}.${_tableName} SET ${Object.keys(_object).map(x=> x+"= ? ").toString()} WHERE ${Object.keys(_where).map(x=> x+"= ? ").join(_mode+" ")}`;
}
const selectInConverter = (_tableName:string,_databaseName:string,_colName:string,_extra:string,_countRow :boolean,_not:"NOT"| "" ) => {
    return `SELECT ${ _countRow ? "SQL_CALC_FOUND_ROWS" : "" } * FROM ${_databaseName}.${_tableName} WHERE ${_colName} ${_not} IN (?) AND silindi_mi=0 ${_extra} ; ${ _countRow ? "SELECT FOUND_ROWS() AS max;" : "" }`;
}
const setSilindiConverter = (_tableName:string,_databaseName:string,_where:object,_mode:"AND" | "OR") => {
    return `UPDATE ${_databaseName}.${_tableName} SET silindi_mi=1 WHERE ${Object.keys(_where).map(x=> x+"= ? ").join(_mode+" ")}`;
}

export default new Database(Config);