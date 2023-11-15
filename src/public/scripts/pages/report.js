function faaliyetRapor(){
    const data = Dynajax("pdf-faaliyetRaporu","z",null,null,false,null,false,false)
    excelDownload( ["#","İsim","Soyİsim","is_emri_aciklama","Oluşturulma Tarihi","Güncelleme Tarihi","Durum"],data.d.map(i=> Object.values(i)) ,"Faaliyet-raporu")
  }
  function thisMonthClosedTasks(){
    const data = Dynajax("pdf-thisMonthClosedTasks","z",null,null,false,null,false,false)
    excelDownload( ["#","İsim","Soyİsim","is_emri_aciklama","Oluşturulma Tarihi","Güncelleme Tarihi","Durum"], data.d.map(i=> Object.values(i)) ,"Tamamlanmış-İş-Emirleri-" + moment().format("MMMM") )
  }
  function thisMonthOpenTasks(){
    const data = Dynajax("pdf-thisMonthOpenTasks","z",null,null,false,null,false,false)
    excelDownload( ["#","İsim","Soyİsim","is_emri_aciklama","Oluşturulma Tarihi","Güncelleme Tarihi","Durum"], data.d.map(i=> Object.values(i)) ,"Açık-İş-Emirleri-" + moment().format("MMMM") )
  }
  function users(){
    const data = Dynajax("pdf-users","z",null,null,false,null,false,false)
    excelDownload( ["İsim","Soyİsim","Telefon","Kayıt Defteri"], data.d.map(i=> Object.values(i)) ,"Personeller")
  }
  function allTask(){
    const data = Dynajax("pdf-all-taks","z",null,null,false,null,false,false)
    excelDownload( ["#","İsim","Soyİsim","is_emri_aciklama","Oluşturulma Tarihi","Güncelleme Tarihi","Durum"],data.d.map(i=> Object.values(i)) ,"Bütün-iş-emirleri")
  }
  function month(e){
    month=$(e.currentTarget).attr("data")
    const data = Dynajax("pdf-month/" + month,"z",null,null,false,null,false,false)
    excelDownload(["#","İsim","Soyİsim","is_emri_aciklama","Oluşturulma Tarihi","Güncelleme Tarihi","Durum"],data.d.map(i=> Object.values(i)) ,"Aylık-İş-Emirleri-" )
  }

  $(function() {
    $("#faaliyetRapor").on("click",function(e)  {faaliyetRapor(e);return false})
    $("#thisMonthClosedTasks").on("click",function(e)  {thisMonthClosedTasks(e);return false})
    $("#thisMonthOpenTasks").on("click",function(e)  {thisMonthOpenTasks(e);return false})
    $("#users").on("click",function(e)  {users(e);return false})
    $("#allTask").on("click",function(e)  {allTask(e);return false})
    $(".month").on("click",function(e)  {month(e);return false})
  });