export default{
    icon:"fa fa-building-o",
    title:"Bina",
    check_firma_id:true,
    columns:[ "bina_id","bina_adi", "sube_id","il_id","ilce_id","adres","yonetici_ad_soyad","yonetici_tel","yonetici_daire","qr_code"],
    turkce:["#","Ad","Şube","İl","İlçe","Adres","Yönetici Ad Soyad", "Yönetici Tel","Yönetici Dairesi","QR Kod"],
    defaultSize:4,
    hideColumn:["yonetici_ad_soyad","yonetici_tel","yonetici_daire","adres","qr_code"],
    props:{
        "bina_adi":{size:12},
        "adres":{t:"textarea",size:12},
        "yonetici_tel":{t:"phone"},
        "sube_id":{k:"sube_adi",q:"s",f:"sube",t:"search"},
        "il_id":{k:"il_adi",q:"i",f:"iller",t:"search"},
        "ilce_id":{k:"ilce_adi",q:"c",f:"ilceler",t:"search",connect:"il_id"},
    },
    sql: `SELECT i.il_adi,c.ilce_adi,s.sube_adi,g.* FROM ${global.databaseName}.bina_table as g 
    left join ${global.databaseName}.iller_table as i on g.il_id=i.il_id
    left join ${global.databaseName}.ilceler_table as c on g.ilce_id=c.ilce_id
    left join ${global.databaseName}.sube_table as s on g.sube_id=s.sube_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId :srcTxt`,
}
