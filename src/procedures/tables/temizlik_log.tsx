export default{
    icon:"icon-envelope",
    title:"Temizlik Kayıtları",
    check_firma_id:true,
    columns:["temizlik_log_id", "kullanici_id","bina_id","temizlik_log_durum_id","guncellenme_zamani"],
    turkce:["#","Kullanıcı","Bina Adı","Durum","Tarih"],
    defaultSize:6,
    props:{
        "bina_id":{f:"bina",k:"bina_adi",q:"b",t:"search"},
        "guncellenme_zamani":{ t:"date"},
        "kullanici_id":{f:"kullanici",k:["kullanici_isim","kullanici_soyisim"],q:"gk",t:"search",extra:"sube_id"},
        "temizlik_log_durum_id":{f:"temizlik_log_durum",k:"temizlik_log_durum_adi",q:"d",t:"select", color:"temizlik_log_durum_key"},
    },
    sql: `SELECT gk.kullanici_isim,d.temizlik_log_durum_adi,temizlik_log_durum_key,gk.kullanici_soyisim,b.bina_adi,g.* FROM ${global.databaseName}.temizlik_log_table as g 
    left join ${global.databaseName}.bina_table as b on g.bina_id=b.bina_id
    left join ${global.databaseName}.kullanici_table as gk on g.kullanici_id=gk.kullanici_id 
    left join ${global.databaseName}.temizlik_log_durum_table as d on g.temizlik_log_durum_id=d.temizlik_log_durum_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId  :srcTxt`,
    auth_write:["admin"],
    auth_read:["admin","sube","onay"],
    custom:"temizlik_log",
    extra:[{
        key:"files",
        sql:`SELECT f.* FROM ${global.databaseName}.firma_dosya_table as f 
        left join ${global.databaseName}.temizlik_log_table as g on g.temizlik_log_id=f.temizlik_log_id 
        where g.silindi_mi=0 and g.firma_id=:firmaId and g.temizlik_log_id=:id`
    }
    ]
    //link:false
}
