export default {
    icon:"icon-speedometer",
    title:"Alt Kategori",
    columns:["alt_kategori_id","kategori_id", "alt_kategori_adi", "alt_kategori_aciklama"],
    turkce:["#","Kategori","Adı","Açıklama"],
    props:{
        "alt_kategori_aciklama":{ size:12 ,t:"textarea"},
        "katagori_id":{k:"katagori_adi",q:"k"}
    },
    sql: `SELECT k.katagori_adi,g.* FROM ${global.databaseName}.alt_kategori_table as g 
    inner join ${global.databaseName}.katagori_table as k on g.kategori_id=k.katagori_id  
    where g.silindi_mi=0 :srcTxt`,
}