export default {
    icon:"icon-speedometer",
    title:"İlçeler",
    columns:[ "ilce_id","il_id", "ilce_adi"],
    turkce:["#","İl","Ad"],
    defaultSize:6,
    props:{
        "il_id":{f:"iller",k:"il_adi",q:"i",t:"search"},
    },
    sql: `SELECT i.il_adi,g.* FROM ${global.databaseName}.ilceler_table as g 
    left join ${global.databaseName}.iller_table as i on g.il_id=i.il_id 
    where g.silindi_mi=0 :srcTxt`,
}