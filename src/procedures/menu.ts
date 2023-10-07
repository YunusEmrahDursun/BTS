    // { title: "test", link:"/web/test", auth:["admin"] }
    const Menu=[
        {
            title:"",
            children:[
                { title: "Ana Sayfa", link:"/web/dashboard",icon:"icon-home" },
                { table:"firmalar",auth : ["admin"] },  
                { table:"firma_tip",auth : ["admin"] },
                { table:"ilceler" ,auth : ["admin"] },  
                { table:"iller",auth : ["admin"] },
                { table:"is_emri" , auth:["sube","admin"] },
                { table:"is_emri_durum" , auth:["admin"] },
                { table:"bina" , auth:["admin","sube"] },
                { table:"sube" , auth:["admin","sube"] },
                { table:"yetki" , auth:["admin"] },  
                { table:"kullanici" , auth:["admin","sube"] },
                { title: "Rapor", link:"/web/report", icon:"icon-pie-chart", auth:["admin","sube"] },
                { title: "Çıkış", link:"/web/exit", icon:"icon-power" }

            ]
        }
    ]

const MenuOld=[
    { title: "Ana Sayfa", link:"/web/dashboard" },
    {
        title :  "Firma İşlemleri",
        auth : ["admin"],
        children : [
            { table:"firmalar" },  { table:"firma_tip" }
        ]
    },
    {
        title :  "Adres",
        auth : ["admin"],
        children : [
            { table:"ilceler" },  { table:"iller" }
        ] 
    },
    {
        title :  "İş Emirleri",
        auth : ["admin","sube"],
        children : [
            { table:"is_emri" , auth:["sube","admin"] },  
            { table:"is_emri_durum" , auth:["admin"] }
        ] 
    },
    {
        title :  "Binalar",
        auth : ["admin","sube"],
        children : [
            { table:"bina" , auth:["admin","sube"] }
        ] 
    },
    {
        title :  "Şubeler",
        auth : ["admin","sube"],
        children : [
            { table:"sube" , auth:["admin","sube"] }
        ] 
    },
    {
        title :  "Sistem İşlemleri",
        auth : ["admin","sube"],
        children : [
            { table:"yetki" , auth:["admin"] },  
            { table:"kullanici" , auth:["admin","sube"] }
        ] 
    },
    { title: "Çıkış", link:"/web/exit" },
   
]
export default Menu;