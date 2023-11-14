export default{
    icon:"icon-envelope",
    title:"Temizlik",
    check_firma_id:true,
    columns:["temizlik_id", "temizlik_giden_kullanici_id","temizlik_zaman","data"],
    turkce:["#","Atanan Kullanıcı","Tarih","Veri"],
    design:[ {size:12,start:2,end:3}  ],
    hideColumn:["data"],
    defaultSize:6,
    beforeCreate:"temizlikDataAddTaskStatus",
    beforeUpdate:"temizlikDataAddTaskStatus",
    props:{
        "bina_id":{f:"bina",k:"bina_adi",q:"b",t:"search"},
        "temizlik_zaman":{ t:"date"},
        "temizlik_giden_kullanici_id":{f:"kullanici",k:"kullanici_isim",q:"gk",t:"search"},
        "temizlik_durum_id":{f:"temizlik_durum",k:"temizlik_durum_adı",q:"d",t:"select"},
    },
    sql: `SELECT gk.kullanici_isim,g.* FROM ${global.databaseName}.temizlik_table as g 
    left join ${global.databaseName}.kullanici_table as gk on g.temizlik_giden_kullanici_id=gk.kullanici_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId  :srcTxt`,
  
    auth_write:["admin","sube"],
    auth_read:["admin","sube"],
    custom:"temizlik"
}