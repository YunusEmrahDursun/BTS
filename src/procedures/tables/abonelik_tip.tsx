export default { 
    icon:"icon-speedometer",
    title:"Abonelik Tip",
    columns:[ "abonelik_tip_id","abonelik_tip_adi"],
    defaultSize:12,
    turkce:["#","Adı"],
    sql: `SELECT g.* FROM ${global.databaseName}.${"abonelik_tip"}_table as g 
    where g.silindi_mi=0 :srcTxt`
}