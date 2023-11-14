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
export default {
    taskCreated,
    taskUpdated,
    beforeTaskCreated,
    temizlikDataAddTaskStatus
}
