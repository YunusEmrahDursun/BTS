export default  {
    icon:"icon-speedometer",
    title:"Bölge",
    columns:["bolge_id","firma_id", "bolge_adi", "bolge_aciklama"],
    turkce:["#","Firma","Adı","Açıklama"],
    props:{ 
        "bolge_aciklama":{ size:12 ,t:"textarea"},
        "firma_id":{f:"firma",k:"tam_unvan",q:"f",t:"search"}
    },
    sql: `SELECT f.tam_unvan,g.* FROM ${global.databaseName}.bolge_table as g 
    left join ${global.databaseName}.firma_table as f on g.firma_id=f.firma_id  
    where g.silindi_mi=0 :srcTxt`,
}