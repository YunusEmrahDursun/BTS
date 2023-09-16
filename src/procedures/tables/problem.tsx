export default{
    icon:"icon-speedometer",
    title:"Problem",
    columns:[ "problem_id","problem_adi", "problem_aciklama"],
    turkce:["#","Ad","Açıklama"],
    defaultSize:6,
    props:{
        "problem_aciklama":{  size:12 ,t:"textarea"},
    },
    sql:`SELECT g.* FROM ${global.databaseName}.${"problem"}_table as g 
    where g.silindi_mi=0 :srcTxt`
}