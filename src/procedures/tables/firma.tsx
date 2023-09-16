export default{
    icon:"icon-speedometer",
    title:"Firma",
    columns:[ "firma_id","firma_logo_url","tam_unvan", "adres", "il_id","ilce_id", "telefon", "eposta", "web", "vergi_dairesi", "vergi_no", "mernis", "sektor_id", "yetkili_isim", "yetkili_soyisim", "yetkili_tel", "yetkili_eposta"],
    turkce:["#","Logo","Ünvan","Adres","İl","İlçe","Telefon","E-posta","Web","Vergi Dairesi","Vergi No","Mernis","Sektör","Y. İsim","Y. Soyisim","Y. Tel","Y. E-posta"],
    design:[ {size:3,start:2,end:2} ,{size:9,start:3} ],
    defaultSize:4,
    props:{
        "telefon":{ t:"phone"},
        "il_id":{f:"iller",k:"il_adi",q:"i",t:"search",size:2},
        "ilce_id":{k:"ilce_adi",q:"c",f:"ilceler",t:"search",size:2},
        "sektor_id":{k:"sektor_adi",q:"s"},
        "kayit_tarihi":{ t:"date"},
        "firma_logo_url":{t:"picture",size:12},
        "adres":{size:8},
        "tam_unvan":{size:8},
        "vergi_dairesi":{size:2},
        "vergi_no":{size:2},
        "mernis":{size:2},
        "eposta":{size:2},
        "faks":{size:2},
        "yetkili_isim":{size:2},
        "yetkili_soyisim":{size:2},
        "yetkili_eposta":{size:2},
        "web":{size:2},
    },
    sql: `SELECT s.sektor_adi,i.il_adi,c.ilce_adi,g.* FROM ${global.databaseName}.firma_table as g 
    left join ${global.databaseName}.iller_table as i on g.il_id=i.il_id 
    left join ${global.databaseName}.ilceler_table as c on g.ilce_id=c.ilce_id 
    left join ${global.databaseName}.sektor_table as s on g.sektor_id=s.sektor_id 
    where g.silindi_mi=0 :srcTxt`,
}