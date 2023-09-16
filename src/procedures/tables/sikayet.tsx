export default {
    icon:"icon-speedometer",
    title:"Şikayet",
    columns:[ "sikayet_id","cihaz_musteri_id", "problem_id", "sikayet_aciklama", "sikayet_kayit_tarihi", "sikayet_olusturan_kullanici_id"],
    turkce:["#","Müşrteri","Problem","Açıklama","Kayıt Tarihi","Şikayet Oluşturan"],
    props:{
        "sikayet_kayit_tarihi":{ t:"date"},
        "problem_id":{k:"problem_adi",q:"p"},
        "sikayet_olusturan_kullanici_id":{k:"kullanici_isim",q:"s"},
    },
    sql:`SELECT s.kullanici_isim,p.problem_adi,g.* FROM ${global.databaseName}.sikayet_table as g 
    left join ${global.databaseName}.problem_table as p on g.problem_id=p.problem_id
    left join ${global.databaseName}.problem_table as s on g.sikayet_olusturan_kullanici_id=s.kullanici_id   
    where g.silindi_mi=0 :srcTxt`,
}