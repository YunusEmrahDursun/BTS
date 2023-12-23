var mymap = L.map('map').setView([39.9334, 32.8597], 6); // Centered on Turkey

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { }).addTo(mymap);
let kullanıcılar =JSON.parse( $("#kullanıcılar").attr("data"))
kullanıcılar.forEach(item => {

    if(item.kullanici_konum){

        const konum = JSON.parse(item.kullanici_konum);
        var marker = L.marker([konum.latitude, konum.longitude]).addTo(mymap); 

        marker.bindPopup(`<b>${item.kullanici_isim} ${item.kullanici_soyisim}</b>`).openPopup();
    }
 
});

