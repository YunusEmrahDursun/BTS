export default{
    icon:"icon-speedometer",
    title:"Problem Cihaz",
    columns:[ "problem_cihaz_id","problem_id", "cihaz_id"],
    turkce:["#","Problem","Cihaz"],
    defaultSize:6,
    props:{
        "problem_id":{k:"problem_adi",q:"p"},
        "cihaz_id":{f:"cihaz",k:"cihaz_adi",q:"c",t:"search"},
    },
    sql:`SELECT p.problem_adi,c.cihaz_adi,g.* FROM ${global.databaseName}.problem_cihaz_table as g 
    left join ${global.databaseName}.problem_table as y on g.problem_id=p.problem_id
    left join ${global.databaseName}.cihaz_table as b on g.cihaz_id=c.cihaz_id  
    where g.silindi_mi=0 :srcTxt`,
}