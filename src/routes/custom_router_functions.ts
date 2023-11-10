import db from '@database/manager';
import logger from 'jet-logger';

async function taskCreated(req, data) {
    try {
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
        const yonlendirilenKullanici = await db.selectOneQuery({kullanici_id:data.is_emri_giden_kullanici_id},'kullanici_table');

        if(yonlendirilenKullanici && yonlendirilenKullanici.kullanici_push_token){

            global.sendNotification(yonlendirilenKullanici.kullanici_push_token,"İş Emri Güncellemesi","İş Emri Numarası : "+data.id);

        } 

    } catch (error) {
        logger.err(error);
    }
}
async function beforeTaskCreated(req, data) {
    try {
        
        const durum = await db.selectOneQuery({is_emri_durum_key:'open'},'is_emri_durum_table')
        
        return {...data,is_emri_durum_id:durum.is_emri_durum_id};

    } catch (error) {
        logger.err(error);
    }
}
export default {
    taskCreated,
    taskUpdated,
    beforeTaskCreated
}
