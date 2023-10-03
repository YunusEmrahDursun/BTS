export default{
    icon:"icon-direction",
    title:"İller",
    columns:["il_id", "il_adi", "plaka_no", "tel_kod"],
    turkce:["#","Ad","Plaka No","Tel Kodu"],
    required:["il_adi","plaka_no"],
    sql:`SELECT g.* FROM ${global.databaseName}.${"iller"}_table as g 
    where g.silindi_mi=0 :srcTxt`
}

