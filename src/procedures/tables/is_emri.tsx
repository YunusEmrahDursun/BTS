export default{
    icon:"icon-envelope",
    title:"İş Emri",
    check_firma_id:true,
    columns:["is_emri_id", "ariza_bildiren_ad_soyad","ariza_bildiren_telefon","is_emri_giden_kullanici_id", "bina_id", "is_emri_aciklama","is_emri_durum_id","faaliyet_raporunda_gozuksun", "is_emri_olusturma_tarihi", "is_emri_kapanis_tarihi","is_emri_sonuc_aciklama"],
    turkce:["#","Arıza Bildirenin Adı Soyadı","Arıza Bildirirenin Telefon Numarası","Atanan Kullanıcı","Bina Adı","Açıklama","Durum","Faaliyet Raporunda Göster","Oluşturulma Tarihi","Kapatılma Tarihi","Sonuç Açıklama"],
    design:[ {size:12,start:2,end:6}  ],
    hideColumn:["is_emri_sonuc_aciklama","is_emri_yonlendiren_kullanici_id","ariza_bildiren_ad_soyad","ariza_bildiren_telefon","is_emri_aciklama","faaliyet_raporunda_gozuksun","is_emri_olusturma_tarihi"],
    required:["bina_id","is_emri_aciklama","ariza_bildiren_ad_soyad","is_emri_durum_id"],
    defaultSize:6,
    beforeCreate:"beforeTaskCreated",
    beforeUpdate:"beforeTaskUpdate",
    create:"taskCreated",
    update:"taskUpdated",
    props:{
        "bina_id":{f:"bina",k:"bina_adi",q:"b",t:"search"},
        "is_emri_olusturma_tarihi":{ t:"date"},
        "ariza_bildiren_telefon":{ t:"phone"},
        "is_emri_kapanis_tarihi":{ t:"date"},
        "is_emri_aciklama":{ size:12 ,t:"textarea"},
        "is_emri_giden_kullanici_id":{f:"kullanici",k:["kullanici_isim","kullanici_soyisim"],q:"gk",t:"search",extra:"sube_id"},
        "faaliyet_raporunda_gozuksun":{size:6,t:"checkbox"},
        "is_emri_durum_id":{f:"is_emri_durum",k:"is_emri_durum_adi",q:"d",t:"select", color:"is_emri_durum_key"},
    },
    sql: `SELECT g.*,s.*,d.is_emri_durum_adi,d.is_emri_durum_key,gk.kullanici_isim,gk.kullanici_soyisim,b.bina_adi,g.is_emri_id FROM ${global.databaseName}.is_emri_table as g 
    left join ${global.databaseName}.bina_table as b on g.bina_id=b.bina_id
    left join ${global.databaseName}.kullanici_table as gk on g.is_emri_giden_kullanici_id=gk.kullanici_id 
    left join ${global.databaseName}.is_emri_durum_table as d on g.is_emri_durum_id=d.is_emri_durum_id 
    left join ${global.databaseName}.is_emri_teklif_table as s on g.destek_talebi_id=s.is_emri_teklif_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId  :srcTxt`,
    extra:[{
        key:"files",
        sql:`SELECT f.* FROM ${global.databaseName}.firma_dosya_table as f 
        left join ${global.databaseName}.is_emri_table as g on g.is_emri_id=f.is_emri_id 
        where g.silindi_mi=0 and g.firma_id=:firmaId and g.is_emri_id=:id`
    },{
        key:"talepler",
        sql:`SELECT s.* FROM ${global.databaseName}.is_emri_teklif_table as s 
        left join ${global.databaseName}.is_emri_table as g on g.is_emri_id=s.is_emri_id 
        where g.silindi_mi=0 and g.firma_id=:firmaId and g.is_emri_id=:id`
    },{
        key:"yonlendirmeler",
        sql:`SELECT s.*,k.* FROM ${global.databaseName}.is_emri_yonlendirme_table as s 
        left join ${global.databaseName}.is_emri_table as g on g.is_emri_id=s.is_emri_id 
        left join ${global.databaseName}.kullanici_table as k on k.kullanici_id=s.yonlendirilen_kullanici_id
        where g.silindi_mi=0 and g.firma_id=:firmaId and g.is_emri_id=:id and s.durum='1' and s.silindi_mi=0`
    },{
        key:"kapatan",
        sql:`SELECT s.* FROM ${global.databaseName}.kullanici_table as s 
        left join ${global.databaseName}.is_emri_table as g on g.kapatan_kullanici_id=s.kullanici_id 
        where g.silindi_mi=0 and g.firma_id=:firmaId and g.is_emri_id=:id and s.silindi_mi=0`
    }
    ],
    auth_write:["admin","sube","onay"],
    auth_read:["admin","sube","onay"],
    custom:"is_emri"
}
