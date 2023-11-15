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
function addNode(e){
  $(e.currentTarget).parent().parent().after(`
    <div class="row col-md-12 mb-3 bina">
      <div class="col-md-4">
        <div class="form-group"> 
          <label>Bina </label>
          <select class="select2" name="bina_id" tabindex="-1" >
            <option value="" selected="">Seçiniz</option>
          </select>
        </div>
      </div>
      <div class="col-md-4">
        <button class="btn btn-success btn-round mt-4 addNode" type="button" >Yeni Ekle</button>
        <button class="btn btn-danger btn-round mt-4 deleteNode" type="button" >Sil</button>
      </div>
    </div>
  `);
  $(".addNode").on("click",function(e)  {addNode(e);return false})
  $(".deleteNode").on("click",function(e)  {deleteNode(e);return false})
  initSelect2();
}
function deleteNode(e){
  if($("#binaListArea .bina").length != 1)
  $(e.currentTarget).parent().parent().remove()
}

  function formValitdate(e){
    let id = $("#id").attr("data");
    let table = $("#table").attr("data");
    if(id){
        try { 
            if(!controls()){
              var binaArr=[];
              document.querySelectorAll("#binaListArea .bina").forEach(i=>  {
    
                  if(i.querySelector("[name='bina_id']").value){
                    const obj = {}
                    try{ obj["bina_id"] = i.querySelector("[name='bina_id']").value }catch(error){}
                    try{ obj["temizlik_durum_id"] = i.querySelector("[name='temizlik_durum_id']").value }catch(error){}
                    binaArr.push(obj)
                  }
              
              })
              Http.Put(`/api/${table}/update/${id}`,{kdata:{...collectData("f").kdata,data:JSON.stringify(binaArr)}},formBasarili)
            }
          }catch(e){
            console.log(e);
          }
    }else{
        try {
            if(!controls()){
              var binaArr=[];
              document.querySelectorAll("#binaListArea .bina").forEach(i=>  {
                  const value=i.querySelector("[name='bina_id']").value;
                  if( value )  
                    binaArr.push(value)
              })
              Http.Post(`/api/${table}/add`,{kdata:{...collectData("f").kdata,data:JSON.stringify(binaArr)}},formBasarili)
            }
          }catch(e){
            console.log(e);
          }
    }
  
        
      
  } 

  function deleteForm(){
    let id = $("#id").attr("data");
    let table = $("#table").attr("data");
    Http.Delete(`/api/${table}/delete/${id}`,formBasarili)
  }
  
  $(function() {
    $("#form").on("submit",function(e)  {formValitdate(e);return false})
    $("#deleteForm").on("click",function()  {deleteForm();return false})
    $(".addNode").on("click",function(e)  {addNode(e);return false})
    $(".deleteNode").on("click",function(e)  {deleteNode(e);return false})
  });
