function formValitdate(e){
    e.preventDefault();
    var form = $(e.currentTarget);
    form.parsley().validate();
    if(form.parsley().isValid()){
        Dynajax( 'login', 'l', ()=>{toLink("/web/dashboard")} )
    }
}

function goRegister(){
    location.href='register'
}
$(function() {
    $("#goRegister").on("click",()=> {goRegister();return false;})
    $("#form").on("submit",function(e)  {formValitdate(e);return false})
  });