export default{
    icon:"icon-speedometer",
    title:"Şube",
    check_firma_id:true,
    columns:[ "sube_id","sube_adi", "il_id","ilce_id","yetkili_ad_soyad","yetkili_tel"],
    turkce:["#","Ad","İl","İlçe","Y. Ad Soyad", "Y. Tel"],
    defaultSize:6,
    props:{
        "sube_adi":{size:6},
        "yetkili_tel":{t:"phone"},
        "il_id":{k:"il_adi",q:"i",f:"iller",t:"search",size:3},
        "ilce_id":{k:"ilce_adi",q:"c",f:"ilceler",t:"search",connect:"il_id",size:3},
    },
    sql: `SELECT i.il_adi,c.ilce_adi,g.* FROM ${global.databaseName}.sube_table as g 
    left join ${global.databaseName}.iller_table as i on g.il_id=i.il_id
    left join ${global.databaseName}.ilceler_table as c on g.ilce_id=c.ilce_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId :srcTxt`,
}
