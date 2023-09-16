export default {
    icon:"icon-speedometer",
    title:"Firmalar",
    columns:[ "firmalar_id","firma_logo_url", "tam_unvan", "il_id","ilce_id", "adres", "bolge_id", "sektor_id", "vergi_dairesi", "vergi_no", "mernis", "telefon", "eposta","faks", "yetkili_isim", "yetkili_soyisim","yetkili_eposta", "yetkili_tel", "web","kayit_tarihi","aciklama","firma_tip_id", "bagli_firma_id"],
    turkce:["#","Logo","Ünvan","İl","İlçe","Adres","Bölge","Sektör","Vergi Dairesi","Vergi No","Mernis","Telefon","E-posta","Faks","Y. İsim","Y. Soyisim","Y. E-posta","Y. Tel","Web","Kayıt Tarihi","Firma Açıklama","Firma Tipi","Bağlı Firma"],
    design:[ {size:3,start:2,end:2} ,{size:9,start:3,end:20},{size:12,start:21} ],
    /*staticSql:{
        firmaDosyalari:"SELECT * FROM ${global.databaseName}.firma_dosya_table where firma_id=:firma_id;",
    },*/
    //upload:true,
    //custom:"firmalar",
    props:{
        "il_id":{k:"il_adi",q:"i",size:2,f:"iller",t:"search"},
        "sektor_id":{k:"sektor_adi",q:"s",size:2,t:"select",f:"sektor"},
        "bagli_firma_id":{k:"tam_unvan",q:"f",t:"search",f:"firma"},
        "firma_tip_id":{k:"firma_tip_adi",q:"t",t:"select",f:"firma_tip"},
        "bolge_id":{k:"bolge_adi",q:"b",t:"select",f:"bolge",size:2},
        "telefon":{ t:"phone",size:2},
        "yetkili_tel":{ t:"phone",size:2},
        "kayit_tarihi":{ t:"date",size:2},
        "firma_logo_url":{t:"picture",size:12},
        "tam_unvan":{size:8},
        "ilce_id":{k:"ilce_adi",q:"c",f:"ilceler",t:"search",size:2},
        "adres":{size:8},
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
    sql: `SELECT s.sektor_adi,f.tam_unvan,t.firma_tip_adi,b.bolge_adi,i.il_adi,c.ilce_adi,g.* FROM ${global.databaseName}.firmalar_table as g 
    left join ${global.databaseName}.firma_table as f on g.bagli_firma_id=f.firma_id 
    left join ${global.databaseName}.firma_tip_table as t on g.firma_tip_id=t.firma_tip_id  
    left join ${global.databaseName}.iller_table as i on g.il_id=i.il_id
    left join ${global.databaseName}.ilceler_table as c on g.ilce_id=c.ilce_id 
    left join ${global.databaseName}.bolge_table as b on g.bolge_id=b.bolge_id 
    left join ${global.databaseName}.sektor_table as s on g.sektor_id=s.sektor_id 
    where g.silindi_mi=0 :srcTxt`,
}