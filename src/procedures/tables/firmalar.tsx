export default {
    icon:"icon-speedometer",
    title:"Firmalar",
    columns:[ "firmalar_id", "firma_adi","firma_tip_id", "telefon", "eposta", "yetkili_isim", "yetkili_soyisim","yetkili_eposta", "yetkili_tel", "kayit_tarihi"],
    turkce:["#","Firma Adı","Firma Tipi","Telefon","E-posta","Y. İsim","Y. Soyisim","Y. E-posta","Y. Tel","Kayıt Tarihi"],
    design:[ {size:12,start:2,end:9}  ],
    /*staticSql:{
        firmaDosyalari:"SELECT * FROM ${global.databaseName}.firma_dosya_table where firma_id=:firma_id;",
    },*/
    //upload:true,
    //custom:"firmalar",
    props:{

        "firma_adi":{size:8},
        "firma_tip_id":{k:"firma_tip_adi",q:"t",t:"select",f:"firma_tip",size:4},

        "telefon":{ t:"phone",size:6},
        "eposta":{size:6},
        
        "yetkili_isim":{size:6},
        "yetkili_soyisim":{size:6},

        "yetkili_tel":{ t:"phone",size:6},
        "yetkili_eposta":{size:6},
        
        "kayit_tarihi":{ t:"date"},

    },
    sql: `SELECT t.firma_tip_adi,g.* FROM ${global.databaseName}.firmalar_table as g 
    left join ${global.databaseName}.firma_tip_table as t on g.firma_tip_id=t.firma_tip_id  
    where g.silindi_mi=0 :srcTxt`,
}