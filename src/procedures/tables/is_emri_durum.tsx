export default{
    icon:"icon-speedometer",
    title:"İş Emri Durumu",
    columns:[ "is_emri_durum_id","is_emri_durum_adi","is_emri_durum_key"],
    turkce:["#","Ad","Anahtar Kelime"],
    defaultSize:6,
    sql:`SELECT g.* FROM ${global.databaseName}.${"is_emri_durum"}_table as g 
    where g.silindi_mi=0 :srcTxt`
}

