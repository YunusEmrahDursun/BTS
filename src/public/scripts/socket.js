let notifCount=0;
function newNotification(obj){
   const data=obj.data;
    $("#notifs").prepend(`
        <li>
            <a href="/web/form/is_emri/${data.is_emri_id}" target="_blank">
                <div class="feeds-left bg-orange">
                    <i class="fa fa-warning"></i>
                </div>
                <div class="feeds-body">
                    <h4 class="title text-warning">Yeni Ödeme Talebi 
                        <small class="float-right text-muted">${moment(data.guncellenme_zamani).format('HH:mm')}</small>
                    </h4>
                    <div>
                        <small>${data.is_emri_aciklama || "Açıklama Bulunamadı!"}</small>
                        <small class="float-right text-muted">İş Emri : ${data.is_emri_id}</small>
                    </div>

                </div>
            </a>
        </li>
    `)

    if(notifCount == 0){
        notifCount = parseInt($("#notifCount").text())
    }
    notifCount++;
    $("#notifCount").text(notifCount);
    $("#notifHeader").text( notifCount + " Adet Yeni Bildirim Var")
}

(function() {
    // Setup socket-io main connection
    const socket = io(location.origin);
    socket.on('connect', () => {
        socketIo = socket;
        socket.on('update', (result) => {
            const obj = JSON.parse(result);
            console.log(obj.msg)
            if(obj.msg == "refreshTable"){
                try {
                    getDasboardTableData()
                } catch (error) {
                    console.log(error)
                }
            }else if(obj.msg == "newNotif"){
                newNotification(obj)
            }
        });
       
    });
})();

