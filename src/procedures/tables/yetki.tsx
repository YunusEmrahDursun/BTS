export default{
    icon:" icon-flag",
    title:"Yetki",
    columns:[ "yetki_id","yetki_adi","yetki_key"],
    turkce:["#","Ad","Anahtar Kelime"],
    defaultSize:6,
    sql:`SELECT g.* FROM ${global.databaseName}.${"yetki"}_table as g 
    where g.silindi_mi=0 :srcTxt`
}