export default{
    icon:"icon-speedometer",
    title:"İş Emri",
    columns:["is_emri_id", "sikayet_id", "is_emri_yonlendiren_kullanici", "is_emri_giden_kullanici", "is_emri_aciklama", "is_emri_olusturma_tarihi", "is_emri_kapanis_tarihi"],
    turkce:["#","Şikayet","Yönlendiren Kullanıcı","Yönlendirilen Kullanıcı","Açıklama","Oluşturulma Tarihi","Kapatılma Tarihi"],
    props:{
        "is_emri_olusturma_tarihi":{ t:"date"},
        "is_emri_kapanis_tarihi":{ t:"date"},
        "is_emri_aciklama":{ size:12 ,t:"textarea"},
        "is_emri_yonlendiren_kullanici":{f:"kullanici",k:"kullanici_isim",q:"yk",t:"search"},
        "is_emri_giden_kullanici":{f:"kullanici",k:"kullanici_isim",q:"gk",t:"search"},
    },
    sql: `SELECT yk.kullanici_isim,gk.kullanici_isim,g.* FROM ${global.databaseName}.is_emri_table as g 
    left join ${global.databaseName}.kullanici_table as yk on g.is_emri_yonlendiren_kullanici=yk.kullanici_id 
    left join ${global.databaseName}.kullanici_table as gk on g.is_emri_giden_kullanici=gk.kullanici_id 
    where g.silindi_mi=0 :srcTxt`,
}
