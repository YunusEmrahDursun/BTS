export default{
    icon:"icon-user",
    title:"Kullanıcı",
    check_firma_id:true,
    columns:[ "kullanici_id", "kullanici_isim", "kullanici_soyisim", "kullanici_telefon", "kullanici_adi","yetki_id","sube_id"],
    turkce:["#","İsim","Soy İsim","Telefon","Kullanıcı Adı","Yetki","Şube"],
    design:[ {size:12,start:2,end:4}  ],
    required:["kullanici_isim","kullanici_adi"],
    props:{
        "yetki_id":{k:"yetki_adi",q:"y",t:"select",f:"yetki"},
        "sube_id":{k:"sube_adi",q:"b",t:"select",f:"sube"},
        "kullanici_telefon":{t:"phone"},
    },
    sql:`SELECT b.sube_adi,y.yetki_adi,g.* FROM ${global.databaseName}.kullanici_table as g 
    left join ${global.databaseName}.yetki_table as y on g.yetki_id=y.yetki_id
    left join ${global.databaseName}.sube_table as b on g.sube_id=b.sube_id  
    where g.silindi_mi=0 and g.firma_id=:firmaId :srcTxt`,
}