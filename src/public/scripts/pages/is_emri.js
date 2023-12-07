const uploadedFiles=[];

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
            Http.Put(`/api/${table}/update/${id}`,{...collectData("f"),ndata:uploadedFiles},formBasarili)

        }else{
            Http.Post(`/api/${table}/add`,{...collectData("f"),ndata:uploadedFiles},formBasarili)

        }

    }
    }catch(e){
      console.log(e);
    }
    
} 
function binaAdd(){
  const data = Dynajax("binaAdd","b",()=>{},null,true,null,false,false)
  if(data.d.bina_id){
    showNotification('Başarıyla Eklendi','success');
    return true;
  }else{
    showNotification('Bir Hata Meydana Geldi!','error');
    return false;
  }
}
function fastBina(){
  $("#openBinaModal").click();
}
$(function() {
  $("#form").on("submit",function(e)  {formValitdate(e);return false})
  $("#deleteForm").on("click",function()  {deleteForm();return false})
  $("#fastBina").on("click",function()  {fastBina();return false})
  $("#binaAdd").on("click",function()  {return binaAdd();})
  $(".teklif").on("click",function(e)  {teklif(e);return false})
  $("body").delegate("#fileUpload","change",function(event){
    compressImage(event, true,this)
  })
});


function teklif(e){
  $.confirm({
    content: "",
    theme: 'material',
    type: 'yellow',
    title: 'Eminmisiniz?',
    draggable: false,
    buttons: {
        confirm: {
        btnClass: 'btn-green',
        text: 'Evet',
        action: function () {
            maskOpen();
            const  id = $("#id").attr("data");
            const dataId = $(e.currentTarget).attr("data");
            Http.Post(`/ajax/teklifiKabulEt`,{id,dataId},formBasarili)
         
        }

        },
        cancel: {
        btnClass: 'btn-default',
        text: 'Hayır',
        action: function () {
            maskClose();
        }
        }
    }
}); 
}

function compressImage (event, useWebWorker,e) {
  if(!event.target.files[0]) return
  var file = event.target.files[0]
  maskOpen();

  imageCompression.getExifOrientation(file).then(function (o) {
    // console.log('ExifOrientation', o)
  })
  var options = {
    useWebWorker: useWebWorker,
  }
  imageCompression(file, options).then(function (output) {
      return imgSender(e,output)
  })
}
function imgSender(e,output){
  var formData = new FormData();
  formData.append("file",output,JSON.stringify({ name: output.name}));
  $.ajax({
        type: "POST",
        url: "/ajax/fileUpload",
        processData: false,
        contentType: false,
        data: formData,
        success: function (result) {
            if(result.status == 1){
              uploadedFiles.push(result.message[0].pathName);
              showNotification("Dosya Yüklendi","success");
              let firma = $("#firma").attr("data");
              const files = uploadedFiles.map((file,index)=>{
                return `<div><span>Dosya ${(index+1)}</span><a href="/firmaImages/${firma}/${file}" target="_blank">  Görüntüle</a></div>`

              }).join('')

              $("#uploadedFiles").html(
                `<div class="col-md-12">
                  <div class="form-group"> <span>-- Yüklünen Dosyalar </span>
                    <div style="margin-top: 10px;"> 
                      ${files}
                    </div>
                  </div>
                </div>`
              )
            }else{
              showNotification('Bir Hata Meydana Geldi','error');
            }
            maskClose()
        },
        error: function (jqXHR, exception) {
            console.log(jqXHR);
            console.log(exception);
              maskClose()
              showNotification('Bir Hata Meydana Geldi','error');
        }
    })
}
function deleteForm(){
  let id = $("#id").attr("data");
  let table = $("#table").attr("data");
  Http.Delete(`/api/${table}/delete/${id}`,formBasarili)
}