export default {
    icon:"icon-speedometer",
    title:"Firma Dosya",
    columns:[ "firma_dosya_id","firma_id", "dosya_adi", "dosya_tipi", "dosya_aciklama"],
    turkce:["#","Firma","Adı","Tipi","Açıklama"],
    defaultSize:3,
    props:{
        "dosya_aciklama":{ size:12 ,t:"textarea"},
        "firma_id":{f:"firma",k:"tam_unvan",q:"f",t:"search"},
    },
    sql: `SELECT f.tam_unvan,g.* FROM ${global.databaseName}.firma_dosya_table as g 
    left join ${global.databaseName}.firma_table as f on g.firma_id=f.firma_id 
    where g.silindi_mi=0 :srcTxt`,
}