export default{
    icon:"icon-speedometer",
    title:"Kullanıcı",
    columns:[ "kullanici_id", "kullanici_isim", "kullanici_soyisim", "kullanici_eposta", "kullanici_telefon", "kullanici_not","yetki_id","bolge_id","firma_id"],
    turkce:["#","İsim","Soy İsim","E-posta","Telefon","Not","Yetki","Bölge","Firma"],
    props:{
        "yetki_id":{k:"yetki_adi",q:"y",t:"select",f:"yetki"},
        "bolge_id":{k:"bolge_adi",q:"b",t:"select",f:"bolge"},
        "firma_id":{f:"firma",k:"tam_unvan",q:"f",t:"search"},
    },
    sql:`SELECT b.bolge_adi,f.tam_unvan,y.yetki_adi,g.* FROM ${global.databaseName}.kullanici_table as g 
    left join ${global.databaseName}.yetki_table as y on g.yetki_id=y.yetki_id
    left join ${global.databaseName}.bolge_table as b on g.bolge_id=b.bolge_id  
    left join ${global.databaseName}.firma_table as f on g.firma_id=f.firma_id  
    where g.silindi_mi=0 :srcTxt`,
}