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
    <div class="mb-3 bina" style="width: 100%;display:flex;">
      <div style="width: 200px;">
        <div class="form-group"> 
          <label>Bina </label>
          <select class="select2" name="bina_id" tabindex="-1" >
            <option value="" selected="">Seçiniz</option>
          </select>
        </div>
      </div>
      <div style="width: 100px;margin-left:10px">
        <button class="btn btn-success mt-4 addNode" type="button">+</button>
        <button class="btn btn-danger mt-4 deleteNode" type="button">-</button>
      </div>
    </div>
  `);

  initSelect2();
}
function deleteNode(e){
  if($(e.currentTarget).parent().parent().parent().find(".bina").length != 1)
  $(e.currentTarget).parent().parent().remove()
}

  function formValitdate(e){
    let id = $("#id").attr("data");
    let table = $("#table").attr("data");
    if(id){
        try { 
            if(!controls()){
              var binaArr=[[],[],[],[],[],[],[]];
              document.querySelectorAll("#binaListArea .bina").forEach(i=>  {
                const value=i.querySelector("[name='bina_id']").value;
                const indx = i.parentElement.getAttribute("gun")
                if( value )  
                  binaArr[indx].push(value)
            })
              Http.Put(`/api/${table}/update/${id}`,{kdata:{...collectData("f").kdata,data:JSON.stringify(binaArr)}},formBasarili)
            }
          }catch(e){
            console.log(e);
          }
    }else{
        try {
            if(!controls()){
              var binaArr=[[],[],[],[],[],[],[]];
              document.querySelectorAll("#binaListArea .bina").forEach(i=>  {
                  const value=i.querySelector("[name='bina_id']").value;
                  const indx = i.parentElement.getAttribute("gun")
                  if( value )  
                    binaArr[indx].push(value)
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
    $("body").delegate(".addNode", "click", function (e) {
      addNode(e);
    });
    $("body").delegate(".deleteNode", "click", function (e) {
      deleteNode(e);
    });

    $("#form").on("submit",function(e)  {formValitdate(e);return false})
    $("#deleteForm").on("click",function()  {deleteForm();return false})
  });
