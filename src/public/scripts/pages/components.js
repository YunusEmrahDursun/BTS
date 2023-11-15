let select2ConnectWarning;
function initSelect2(){
  let table = $("#table").attr("data");
  $(".select2").select2({
      language: {
         noResults: function () {
          if(select2ConnectWarning){
            return select2ConnectWarning;
          }
          return "Sonuç bulunamadı"; },
         inputTooShort: function (input, min) { var n = min - input.length; return "En az " + n + " karakter daha girmelisiniz"; },
         inputTooLong: function (input, max) { var n = input.length - max; return n + " karakter azaltmalısınız"; },
         loadingMore: function (pageNumber) { return "Daha fazla..."; },
         searching: function () { return "Aranıyor..."; }
      },
      width:"100%",
      ajax: {
        url: `/ajax/dyndata/${table}`,
        dataType: 'json',
        delay: 250,
        data: function (params) {
          var send={
            q: params.term,
            col:$(this).attr("name"),
          }
          select2ConnectWarning=null;
          let target=$(this).attr("connect");
          if(target){
            send.cq=target;
            send.c=$(`[name='${target}']`).val();
            if(!send.c){
              //select2ConnectWarning=$(`[name='${target}']`).find("option[value]").text() + " seçiniz!";
              select2ConnectWarning=$(`[name='${target}']`).parent().find("label").eq(0).text() + " seçiniz!";
            } 
          }
          return send;
        },
        processResults: function (data, params) {
          return {
            results: data,
          };
        },
        cache: true
      },
    });
    $('.select2').each(function(){
      if($(this).attr("initialValue")){

        const data = Dynajax(`dyndata/${table}`,"_",null,null,false,{ id :$(this).attr("initialValue"),col:$(this).attr("name") },false,false);
        $(this).append(`<option selected value="${$(this).attr("initialValue")}">${data.d}</option>`)

      }
    })
}
$(document).ready(function(){
    $(window).keydown(function(event){
      if(event.keyCode == 13) {
        event.preventDefault();
        return false;
      }
    });
    initSelect2();
   
  })  
