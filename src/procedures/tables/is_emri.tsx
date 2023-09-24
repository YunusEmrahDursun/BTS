export default{
    icon:"icon-speedometer",
    title:"İş Emri",
    check_firma_id:true,
    columns:["is_emri_id","is_emri_yonlendiren_kullanici_id", "is_emri_giden_kullanici_id", "is_emri_aciklama", "is_emri_olusturma_tarihi", "is_emri_kapanis_tarihi"],
    turkce:["#","Yönlendiren Kullanıcı","Yönlendirilen Kullanıcı","Açıklama","Oluşturulma Tarihi","Kapatılma Tarihi"],
    design:[ {size:12,start:3,end:4}  ],
    props:{
        "is_emri_olusturma_tarihi":{ t:"date"},
        "is_emri_kapanis_tarihi":{ t:"date"},
        "is_emri_aciklama":{ size:12 ,t:"textarea"},
        "is_emri_yonlendiren_kullanici_id":{f:"kullanici",k:"kullanici_isim",q:"yk",t:"search"},
        "is_emri_giden_kullanici_id":{f:"kullanici",k:"kullanici_isim",q:"gk",t:"search"},
    },
    sql: `SELECT yk.kullanici_isim,gk.kullanici_isim,g.* FROM ${global.databaseName}.is_emri_table as g 
    left join ${global.databaseName}.kullanici_table as yk on g.is_emri_yonlendiren_kullanici_id=yk.kullanici_id 
    left join ${global.databaseName}.kullanici_table as gk on g.is_emri_giden_kullanici_id=gk.kullanici_id 
    where g.silindi_mi=0 and g.firma_id=:firmaId  :srcTxt`,
    auth_write:["admin","sube"],
    auth_read:["admin","sube"]
}
