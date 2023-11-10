export default{
    icon:"icon-envelope",
    title:"İş Emri",
    check_firma_id:true,
    columns:["is_emri_id", "ariza_bildiren_ad_soyad","ariza_bildiren_telefon","is_emri_giden_kullanici_id", "bina_id", "is_emri_aciklama","is_emri_durum_id","faaliyet_raporunda_gozuksun", "is_emri_olusturma_tarihi", "is_emri_kapanis_tarihi"],
    turkce:["#","Arıza Bildirenin Adı Soyadı","Arıza Bildirirenin Telefon Numarası","Atanan Kullanıcı","Bina Adı","Açıklama","Durum","Faaliyet Raporunda Gözüksün mü?","Oluşturulma Tarihi","Kapatılma Tarihi"],
    design:[ {size:12,start:2,end:6}  ],
    hideColumn:["is_emri_yonlendiren_kullanici_id","ariza_bildiren_ad_soyad","ariza_bildiren_telefon","is_emri_aciklama","faaliyet_raporunda_gozuksun","is_emri_olusturma_tarihi","is_emri_kapanis_tarihi"],
    required:["bina_id","is_emri_aciklama","ariza_bildiren_ad_soyad","is_emri_durum_id"],
    defaultSize:6,
    beforeCreate:"beforeTaskCreated",
    create:"taskCreated",
    update:"taskUpdated",
    props:{
        "bina_id":{f:"bina",k:"bina_adi",q:"b",t:"search"},
        "is_emri_olusturma_tarihi":{ t:"date"},
        "is_emri_kapanis_tarihi":{ t:"date"},
        "is_emri_aciklama":{ size:12 ,t:"textarea"},
        "is_emri_giden_kullanici_id":{f:"kullanici",k:"kullanici_isim",q:"gk",t:"search"},
        "faaliyet_raporunda_gozuksun":{size:6,t:"checkbox"},
        "is_emri_durum_id":{f:"is_emri_durum",k:"is_emri_durum_adi",q:"d",t:"select"},
    },
    sql: `SELECT d.is_emri_durum_adi,gk.kullanici_isim,b.bina_adi,g.*,s.* FROM ${global.databaseName}.is_emri_table as g 
    left join ${global.databaseName}.bina_table as b on g.bina_id=b.bina_id
    left join ${global.databaseName}.kullanici_table as gk on g.is_emri_giden_kullanici_id=gk.kullanici_id 
    left join ${global.databaseName}.is_emri_durum_table as d on g.is_emri_durum_id=d.is_emri_durum_id 
    left join ${global.databaseName}.destek_talebi_table as s on g.destek_talebi_id=s.destek_talebi_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId  :srcTxt`,
    extra:[{
        key:"files",
        sql:`SELECT f.* FROM ${global.databaseName}.firma_dosya_table as f 
        left join ${global.databaseName}.is_emri_table as g on g.is_emri_id=f.is_emri_id 
        where g.silindi_mi=0 and g.firma_id=:firmaId and g.is_emri_id=:id`
    }],
    auth_write:["admin","sube"],
    auth_read:["admin","sube"],
    custom:"is_emri"
}
