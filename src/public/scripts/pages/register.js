function checkLink(){
    const data = Dynajax("checkJoinLink","l",null,null,true,null,false,false);
    if(data && data.status == 1){
      $("#tab1").hide();
      $("#tab2").show();
    }
  }
  function register(){
    Dynajax( 'register/'+$("#link").val(), 'r', ()=>{toLink("/web/login")} )
  }
  function goLogin(){
    location.href='login'
}
  $(function() {
    $("#goLogin").on("click",()=> {goLogin();return false;})
    $("#checkLink").on("click",()=>{checkLink();return false;})
    $("#register").on("click",()=>{register();return false;})
    $("#form").on("submit",function(e)  {formValitdate(e);return false})
  });