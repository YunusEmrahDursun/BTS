import db from '@database/manager';
async function taskCreated(req, data) {
    try {
        const yonlendirilenKullanici = await db.selectOneQuery({kullanici_id:data.is_emri_giden_kullanici_id},'kullanici_table');
        if(yonlendirilenKullanici.kullanici_push_token) global.sendNotification(yonlendirilenKullanici.kullanici_push_token,"Yeni İş Emri");
    } catch (error) {
        
    }
}
async function taskUpdated(req, data) {
    try {
        const yonlendirilenKullanici = await db.selectOneQuery({kullanici_id:data.is_emri_giden_kullanici_id},'kullanici_table');
        if(yonlendirilenKullanici.kullanici_push_token) global.sendNotification(yonlendirilenKullanici.kullanici_push_token,"Yeni İş Emri");
    } catch (error) {
        
    }
}
export default {
    taskCreated,
    taskUpdated
}
