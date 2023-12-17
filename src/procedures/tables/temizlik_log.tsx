export default{
    icon:"icon-envelope",
    title:"Temizlik Kayıtları",
    check_firma_id:true,
    columns:["temizlik_log_id", "kullanici_id","bina_id","guncellenme_zamani"],
    turkce:["#","Kullanıcı","Bina Adı","Tarih"],
    defaultSize:6,
    props:{
        "bina_id":{f:"bina",k:"bina_adi",q:"b",t:"search"},
        "guncellenme_zamani":{ t:"date"},
        "kullanici_id":{f:"kullanici",k:["kullanici_isim","kullanici_soyisim"],q:"gk",t:"search",extra:"sube_id"},
    },
    sql: `SELECT gk.kullanici_isim,gk.kullanici_soyisim,b.bina_adi,g.* FROM ${global.databaseName}.temizlik_log_table as g 
    left join ${global.databaseName}.bina_table as b on g.bina_id=b.bina_id
    left join ${global.databaseName}.kullanici_table as gk on g.kullanici_id=gk.kullanici_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId  :srcTxt`,
    auth_write:["admin","sube","onay"],
    auth_read:["admin","sube","onay"],
    link:false
}
