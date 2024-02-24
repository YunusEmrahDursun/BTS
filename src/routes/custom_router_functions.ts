import db from '@database/manager';
import logger from 'jet-logger';
import {currentTimestamp} from '@shared/functions';
async function taskCreated(req, data) {
    try {
        if(req.body.ndata){
            for (let index = 0; index < req.body.ndata.length; index++) {
                const item =req.body.ndata[index];
                await db.insert({firma_id:req.session.user.firma_id,dosya_adi:item,is_emri_id:data.id,type:0},"firma_dosya_table")
            }
            
        }
        const yonlendirilenKullanici = await db.selectOneQuery({kullanici_id:data.is_emri_giden_kullanici_id},'kullanici_table');
        
        if(yonlendirilenKullanici && yonlendirilenKullanici.kullanici_push_token){
            
            global.sendNotification(yonlendirilenKullanici.kullanici_push_token,"Yeni İş Emri","İş Emri Numarası : "+data.id);

        } 
    } catch (error) {
        logger.err(error);
    }
}
async function taskUpdated(req, data) {
    try {

        if(req.body.ndata){
            for (let index = 0; index < req.body.ndata.length; index++) {
                const item =req.body.ndata[index];
                await db.insert({firma_id:req.session.user.firma_id,dosya_adi:item,is_emri_id:data.id,type:1},"firma_dosya_table")
            }
            
        }
        const transferDurumu = await db.selectOneQuery({is_emri_durum_key:'success'},'is_emri_durum_table');

        if(transferDurumu.is_emri_durum_id != data.is_emri_durum_id){
            const yonlendirilenKullanici = await db.selectOneQuery({kullanici_id:data.is_emri_giden_kullanici_id},'kullanici_table');

            if(yonlendirilenKullanici && yonlendirilenKullanici.kullanici_push_token){
    
                global.sendNotification(yonlendirilenKullanici.kullanici_push_token,"İş Emri Güncellemesi","İş Emri Numarası : "+data.id);
    
            } 
        }
      

    } catch (error) {
        logger.err(error);
    }
}
async function beforeTaskCreated(req, data) {
    try {
        if(data.is_emri_giden_kullanici_id == "") delete data.is_emri_giden_kullanici_id;
        const durum = await db.selectOneQuery({is_emri_durum_key:'open'},'is_emri_durum_table')
        
        return {...data,is_emri_durum_id:durum.is_emri_durum_id};

    } catch (error) {
        logger.err(error);
    }
}
async function beforeTaskUpdate(req, data) {
    try {

        if(data.is_emri_giden_kullanici_id == "") delete data.is_emri_giden_kullanici_id;
        const transferDurumu = await db.selectOneQuery({is_emri_durum_key:'success'},'is_emri_durum_table');
        if(transferDurumu.is_emri_durum_id == data.is_emri_durum_id){
            return {...data,kapatan_kullanici_id:req.session.user.kullanici_id,is_emri_kapanis_tarihi:currentTimestamp()};
        }else{
            return data;
        }
        

    } catch (error) {
        logger.err(error);
    }
}
async function temizlikDataAddTaskStatus(req, data) {
    try {
        
        const durum = await db.selectOneQuery({temizlik_durum_key:'open'},'temizlik_durum_table')
        
        try {
            const arr = JSON.parse(data.data);
            data.data = JSON.stringify(arr.map(i=> { if(!i.temizlik_durum_id) { return {...i,temizlik_durum_id:durum.temizlik_durum_id} } else return i}))
        } catch (error) {
            
        }
        return data;
    } catch (error) {
        logger.err(error);
    }
}
async function beforeBinaCreatedUpdated(req, data) {
    try {
        
        if(data.il_id == "") delete data.il_id;
        if(data.ilce_id == "") delete data.ilce_id;
        return data;
    } catch (error) {
        logger.err(error);
    }
}
export default {
    taskCreated,
    taskUpdated,
    beforeTaskCreated,
    beforeTaskUpdate,
    beforeBinaCreatedUpdated
}
