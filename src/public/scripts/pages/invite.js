function generateLink(){
    const data = Dynajax("createLink","f",null,null,true,null,false,false);
    if(data)
    $("#createdLink").val(data.d)

  }
  async function copyToClipboard(textToCopy) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
            
        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
            
        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    }
}
function copyIt(){
    let copyText = document.querySelector('#createdLink')
    // copyText.select();
    // navigator.clipboard.writeText(copyText.value);
    copyToClipboard(copyText.value)
}

$(function() {
  $("#copyIt").on("click",()=> {copyIt();return false;})
  $("#generateLink").on("click",()=>{generateLink();return false;})
});