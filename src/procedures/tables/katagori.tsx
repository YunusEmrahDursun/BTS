export default{
    icon:"icon-speedometer",
    title:"Katagori",
    columns:[ "katagori_id","katagori_adi", "katagori_aciklama"],
    props:{
        "katagori_aciklama":{ size:12 ,t:"textarea"},
    },
    defaultSize:6,
    turkce:["#","Ad","Açıklama"],
    sql:`SELECT g.* FROM ${global.databaseName}.${"katagori"}_table as g 
    where g.silindi_mi=0 :srcTxt`
}
