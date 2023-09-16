/*
q sql deki inner join için 
c number text vs için

*/
import * as Tables from './tables/index';
export default { 
    menu:[
        { title: "Abone İşlemleri" , list : ["abonelik","abonelik_tip","firma_abone"]},
        { title: "Firma İşlemleri" , list : ["firma","firmalar","firma_tip","firma_abone","firma_dosya","sektor"]},
        { title: "Adres" , list : ["ilceler","iller","bolge"]},
        { title: "Kategoriler" , list : ["alt_kategori","katagori"]},
        { title: "Cihazlar" , list : ["cihaz","cihaz_musteri","cihaz_model","problem_cihaz","yedek_parca"]},
        { title: "Müşteri İşlemleri" , list : ["siparis","randevu_durum","randevu","sikayet"]},
        { title: "Teknisyen İşlemleri" , list : ["is_emri","is_emri_durum","problem","siparis_durum","siparis_parca"]},
        { title: "Sistem İşlemleri" , list : ["yetki","kullanici"]},
    ],
    tables:{
        //custom ekranlar
        "register":{
            columns:["firmaKayıtBilgileri","tam_unvan","adres","il_id","ilce_id","vergi_dairesi","vergi_no","sektor_id","eposta","telefon","faks","web","yöneticiKayıtBilgileri","yetkili_isim","yetkili_soyisim","yetkili_tel","yetkili_eposta","kullanici_parola","re_kullanici_parola"],
            turkce:["Firma Kayıt Bilgileri (Fatura İçin)","Firma Tam Ünvan","Adres","İl","İlçe","Firma Vergi Dairesi","Firma Vergi No","Sektör","Firma E-posta","Telefon","Firma Faks","Web Adresi","Yönetici Kayıt Bilgileri (Sistem Girişi İçin)","Yetkili isim","Yetkili Soyisim","Y. Telefon","Yetkili E-posta","Parola","Parola Tekrar"],
            design:[ {size:12,start:1,end:2} ,{size:8,start:3,end:3},{size:4,start:4,end:5},{size:12,start:6} ],
            props:{
                "firmaKayıtBilgileri":{size:12,t:"title"},
                "yöneticiKayıtBilgileri":{size:12,t:"title"},
                "tam_unvan":{size:12},
                "adres":{t:"textarea"},
                "telefon":{ t:"phone"},
                "yetkili_tel":{ t:"phone"},
                "il_id":{k:"il_adi",f:"iller",t:"search"},
                "ilce_id":{k:"ilce_adi",f:"ilceler",t:"search",connect:"il_id"},
                "sektor_id":{k:"sektor_adi",t:"select",f:"sektor"},
            },
            noId:true,
            round:true,
            defaultSize:3,
            placeholderMood:true,
        },
        // veritabanı tabloları
        "abonelik": Tables.abonelik,
        "abonelik_tip":Tables.abonelik_tip,
        "alt_kategori":Tables.alt_kategori,
        "bolge":Tables.bolge,
        "firma_abone":Tables.firma_abone,
        "firma_dosya":Tables.firma_dosya,
        "firma":Tables.firma,
        "firma_tip":Tables.firma_tip,
        "firmalar":Tables.firmalar,
        "ilceler":Tables.ilceler,
        "iller":Tables.iller,
        "is_emri_durum":Tables.is_emri_durum,
        "is_emri":Tables.is_emri,
        "katagori":Tables.katagori,
        "kullanici":Tables.kullanici,
        "problem_cihaz":Tables.problem_cihaz,
        "problem":Tables.problem,
        "sikayet":Tables.sikayet,
        "yetki":Tables.yetki
    },
    getPaths:function(){
        const paths={
            get: '/all',
            add: '/add',
            update: '/update/:id',
            delete: '/delete/:id',
            getOne:'/get/:id'
        }
        Object.keys(paths).forEach(k=> paths[k]='/:table'+paths[k] );
        return paths;
    },
    getSql:function(tableName){
        return this.tables[tableName].sql;
    },
    checkTable:function(tableName){
        return this.tables[tableName]!=undefined;
    },
    checkAuth:function(tableName,usr){
        return true;
    },
    //gereksiz dataları siler
    checkData:function(arr,obj){
        Object.keys(obj).forEach(k=>{
            if(!arr.includes(k)) delete  obj[k];
        })
        return obj;
    },
    getColumnsWithoutId:function(tableName){
        let index=this.tables[tableName].id;
        if(index==undefined) index=0;
        return this.tables[tableName].columns.filter(function(value, arrIndex) {
            return index !== arrIndex;
        });
    },
    getTableIdColumnName:function(tableName){
        return this.tables[tableName].id!=undefined ? this.tables[tableName].columns[this.tables[tableName].id] : this.tables[tableName].columns[0];
    },
    checkColumn:function(tableName,colName){ 
        return this.tables[tableName].columns.includes(colName);
    },
    

}