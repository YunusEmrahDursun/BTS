
function formBasarili(obj){
  let table = $("#table").attr("data");
  if(obj.status==1){
    setTimeout(()=>{
        showNotification(obj.message,"success");
        location.href=`/web/table/${table}`;
    },200)
  }else{
    showNotification(obj.message,"error");
  }

}
   
function formValitdate(e){
    try { 

    if(!controls()){
        let id = $("#id").attr("data");
        let table = $("#table").attr("data");

        if(id){
            Http.Put(`/api/${table}/update/${id}`,collectData("f"),formBasarili)

        }else{
            Http.Post(`/api/${table}/add`,collectData("f"),formBasarili)

        }

    }
    }catch(e){
      console.log(e);
    }
    
} 

function qrCodeIndir(){
  let id = $("#id").attr("data");

  var pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [40, 40]
  });


  let base64Image = $('#qr_code img').attr('src');

  pdf.addImage(base64Image, 'png', 0, 0, 40, 40);
  pdf.save(id+'-bina.pdf');
}

function isemirleriniGoster(){
  let bina_adi = $("#bina_adi").attr("data");
  location.href=`/web/table/is_emri?bina_id=`+bina_adi;
  
}

$(function() {
  let id = $("#id").attr("data");
  new QRCode("qr_code", {
    text: md5(id+"-bts"),
    width: 128,
    height: 128,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
  $("#form").on("submit",function(e)  {formValitdate(e);return false})
  $("#deleteForm").on("click",function()  {deleteForm();return false})
  $("#qrCodeIndir").on("click",function()  {return qrCodeIndir();})
  $("#isemirleriniGoster").on("click",function()  {return isemirleriniGoster();})
 
});



function deleteForm(){
  let id = $("#id").attr("data");
  let table = $("#table").attr("data");
  Http.Delete(`/api/${table}/delete/${id}`,formBasarili)
}