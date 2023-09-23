export default{
    icon:"icon-speedometer",
    title:"Firma Tip",
    columns:[ "firma_tip_id","firma_tip_adi"],
    turkce:["#","Ad"],
    defaultSize:12,
    sql:`SELECT g.* FROM ${global.databaseName}.${"firma_tip"}_table as g 
    where g.silindi_mi=0 :srcTxt`,
    auth_write:["admin"],
    auth_read:["admin"]
}
