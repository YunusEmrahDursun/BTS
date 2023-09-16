export default{
    icon:"icon-speedometer",
    title:"Firma Abone",
    columns:[ "firma_abone_id","firma_id", "abonelik_id", "baslangic_tarihi", "bitis_tarihi"],
    turkce:["#","Firma","Abonelik","Başlanguç Tarihi","Bitiş Tarihi"],
    defaultSize:3,
    props:{
        "firma_id":{f:"firma",k:"tam_unvan",q:"f",t:"search"},
        "abonelik_id":{k:"abonelik_adi",q:"a"},
        "baslangic_tarihi":{ t:"date"},
        "bitis_tarihi":{ t:"date"},
    },
    sql: `SELECT a.abonelik_adi,f.tam_unvan,g.* FROM ${global.databaseName}.firma_abone_table as g 
    left join ${global.databaseName}.firma_table as f on g.firma_id=f.firma_id 
    left join ${global.databaseName}.abonelik_table as a on g.abonelik_id=a.abonelik_id 
    where g.silindi_mi=0 :srcTxt`,
}