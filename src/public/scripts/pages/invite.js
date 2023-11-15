function generateLink(){
    const data = Dynajax("createLink","f",null,null,true,null,false,false);
    if(data)
    $("#createdLink").val(data.d)

  }
function copyIt(){
    let copyText = document.querySelector('#createdLink')
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
}

$(function() {
  $("#copyIt").on("click",()=> {copyIt();return false;})
  $("#generateLink").on("click",()=>{generateLink();return false;})
});