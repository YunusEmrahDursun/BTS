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

  function deleteForm(){
    let id = $("#id").attr("data");
    let table = $("#table").attr("data");
    Http.Delete(`/api/${table}/delete/${id}`,formBasarili)
  }
  $(function() {
    $("#form").on("submit",function(e)  {formValitdate(e);return false})
    $("#deleteForm").on("click",function()  {deleteForm();return false})
    
  });
