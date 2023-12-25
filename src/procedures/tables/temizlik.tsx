export default{
    icon:"icon-envelope",
    title:"Temizlik",
    check_firma_id:true,
    columns:["temizlik_id", "temizlik_giden_kullanici_id","data"],
    turkce:["#","Atanan Kullanıcı","Veri"],
    design:[ {size:12,start:2,end:2}  ],
    hideColumn:["data"],
    required:["temizlik_giden_kullanici_id"],
    defaultSize:6,
    props:{
        "bina_id":{f:"bina",k:"bina_adi",q:"b",t:"search"},
        "temizlik_zaman":{ t:"date"},
        "temizlik_giden_kullanici_id":{f:"kullanici",k:"kullanici_isim",q:"gk",t:"search",extra:"sube_id",connectSql:{table:"yetki_table",column:"yetki_id",whereColumn:"yetki_key",whereValue:"temizlik",connect:"yetki_id"}},
    },
    sql: `SELECT gk.kullanici_isim,g.* FROM ${global.databaseName}.temizlik_table as g 
    left join ${global.databaseName}.kullanici_table as gk on g.temizlik_giden_kullanici_id=gk.kullanici_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId  :srcTxt`,
    
    auth_write:["admin","sube","onay"],
    auth_read:["admin","sube","onay"],
    custom:"temizlik"
}
