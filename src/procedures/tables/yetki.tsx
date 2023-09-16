export default{
    icon:"icon-speedometer",
    title:"Yetki",
    columns:[ "yetki_id","yetki_adi", "yetki_aciklama"],
    turkce:["#","Ad","Açıklama"],
    defaultSize:6,
    props:{
        "yetki_aciklama":{  size:12 ,t:"textarea"},
    },
    sql:`SELECT g.* FROM ${global.databaseName}.${"yetki"}_table as g 
    where g.silindi_mi=0 :srcTxt`
}