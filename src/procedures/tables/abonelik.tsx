export default {
    icon:"icon-speedometer",
    title:"Abonelik",
    columns:["abonelik_id","abonelik_tip_id","abonelik_adi","abonelik_fiyat","abonelik_aciklama","abonelik_sure","abonelik_musteri_sayisi","abonelik_bolge_sayisi","abonelik_kullanici_sayisi","abonelik_urun_sayisi","abonelik_sikayet_sayisi"],
    turkce:["#","Tip","Adı","Fiyat","Açıklama","Süre","Müşteri Sayısı","Bölge Sayısı","Kullanıcı Sayısı","Ürün Sayısı","Şikayet Sayısı"],
    props:{
        "abonelik_aciklama":{ size:12 ,t:"textarea"},
        "abonelik_tip_id":{f:"abonelik_tip",k:"abonelik_tip_adi",q:"t",t:"select"} 
    },
    sql: `SELECT t.abonelik_tip_adi,g.* FROM ${global.databaseName}.abonelik_table as g 
    inner join ${global.databaseName}.abonelik_tip_table as t on g.abonelik_tip_id=t.abonelik_tip_id  
    where g.silindi_mi=0 :srcTxt`,
}