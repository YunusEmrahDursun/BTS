$(function() {
    //menu
    $(`a[href="${location.pathname}"]`).parent().addClass("active").parent().parent().find("a").eq(0).click();
    try {
        //Date
        $('.date').inputmask('dd/mm/yyyy', { placeholder: '__/__/____' });
        //Time
        $('.time12').inputmask('hh:mm t', { placeholder: '__:__ _m', alias: 'time12', hourFormat: '12' });
        $('.time24').inputmask('hh:mm', { placeholder: '__:__ _m', alias: 'time24', hourFormat: '24' });
        //Date Time
        $('.datetime').inputmask('d/m/y h:s', { placeholder: '__/__/____ __:__', alias: "datetime", hourFormat: '24' });
        //Mobile Phone Number
        $('.mobile-phone-number').inputmask('+99 (999) 999-99-99', { placeholder: '+__ (___) ___-__-__' });
        //Phone Number
        $('.phone-number').inputmask('+99 (999) 999-99-99', { placeholder: '+__ (___) ___-__-__' });
        //Dollar Money
        $('.money-dollar').inputmask('99,99 $', { placeholder: '__,__ $' });
        //IP Address
        $('.ip').inputmask('999.999.999.999', { placeholder: '___.___.___.___' });
        //Credit Card
        $('.credit-card').inputmask('9999 9999 9999 9999', { placeholder: '____ ____ ____ ____' });
        //Email
        $('.email').inputmask({ alias: "email" });
        //Serial Key
        $('.key').inputmask('****-****-****-****', { placeholder: '____-____-____-____' });

    } catch (error) {
        
    }
    
   
});

function maskOpen(){
    $(".page-loader-wrapper").css("display", "block");
}
function maskClose(){
    $(".page-loader-wrapper").css("display", "none");
} 

$("[fire-target]").on("click",function(e){
    e.preventDefault()
   var target=$(this).attr("fire-target");
   if(target && target!=""){
       $(target).click();
   }
})
$("[display-target]").on("change",function(){
    var targetId=$(this).attr("display-target");
    var target=`[display-id=${targetId}]`;
    readURL(this,target);
})
function readURL(input,target) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
        $(target).attr('src', e.target.result);
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

function toLink(url){
    setTimeout(function(){location.href=url;},500);
}
function collectData(key,ndata){
    let kdata={};
    $(`[ajax-key=${key}]:visible,[ajax-key=${key}][type='checkbox']`).each(function(){
        var type=$(this).attr("type");
        var name=$(this).attr("name");

        if($(this).attr("hidden-value")!=undefined){
            kdata[name]=$(this).attr("hidden-value");
        }
        else if(type=="radio"){
            kdata[name]=$(`[ajax-key=${key}][name=${name}]:checked`).attr("radio-value");
        }
        else if(type=="checkbox"){
            //var tmpCheckbox=[];
            //$(`[ajax-key=${key}][name=${name}]`).each(function () {
            //    tmpCheckbox.push( $(this).attr("value") );
            //});
            kdata[name]=$(this).is(":checked") ? '1' : '0' ;
        }
        else if(type=="editor"){
            //data[name]=$(this).froalaEditor('html.get', true);
            kdata[name]=$(this).summernote('code');
        }
        else if(type=="multipleSelect"){
            //multipleselect kütüphanesini incele
            kdata[name]=JSON.stringify($(this).val());
        }
        else if(type=="file"){
            Object.keys(this.files).map(x=>{
                formData.append("file",this.files[x],JSON.stringify({ name: this.files[x].name,colName:name}));
            });
            var tmpDefault=$(this).attr("default-value");
            if(tmpDefault && tmpDefault!="" && tmpDefault!='""'){
                kdata[name]=tmpDefault;
            }
            
        }
        else{
            kdata[name]=$(this).val();
        }
    });
    return {kdata,ndata};
}
$(function() {
    $("form").delegate("[type='file']","change",function(){
        var name=$(this).attr("name");
        var callback=$(this).attr("callback");
        var formData = new FormData();
        Object.keys(this.files).map(x=>{
            formData.append("file",this.files[x],JSON.stringify({ name: this.files[x].name,colName:name}));
        });
        $.ajax({
            type: "POST",
            url: "/ajax/fileUpload",
            processData: false,
            contentType: false,
            data: formData,
            success: function (result) {
                window[callback](result)
                console.log(result)
            },
            error: function (jqXHR, exception) {
                maskClose();
                console.log(jqXHR);
                console.log(exception);
            }
        });
    })
});

/* function uploadFile(key=""){
    var formData = new FormData();
    $(`[ajax-key=${key}]`).each(function(){
        var type=$(this).attr("type");
        var name=$(this).attr("name");
        if(type=="file"){
            Object.keys(this.files).map(x=>{
                formData.append("file",this.files[x],JSON.stringify({ name: this.files[x].name,colName:name}));
            });
        }
    });
    console.log(formData.getAll("file"))
    $.ajax({
        type: "POST",
        url: "/ajax/fileUpload",
        processData: false,
        contentType: false,
        data: formData,
        success: function (result) {
            console.log(result)
        },
        error: function (jqXHR, exception) {
            maskClose();
            console.log(jqXHR);
            console.log(exception);
        }
    });
} */

/* #region  zorunlu alan kontrolu */
function enforcedControl() {
    var result = false;
    $("[enforced]:visible").each(function () {
        if ($(this).val() == "" || $(this).val() == undefined || $(this).val() == null) {
            result = true;
            if( $(this).hasClass("select2") ){
                $(this).next().css("border-bottom", "2px solid red");
            }else{
                $(this).css("border-bottom", "2px solid red");
            }
        }
    });
    if (result)
    showNotification("Zorunlu alanları doldurmanız gerekmektedir!", 'error');
    return result;
}
$("body").delegate("[enforced]", "change keyup paste", function () {
    if ($(this).val() != "" && $(this).val() != undefined && $(this).val() != null){

        if( $(this).hasClass("select2") ){
            $(this).next().css("border-bottom", "");
        }else{
            $(this).css("border-bottom", "");
        }
        

    }
});
/* #endregion */

/* #region  bütün kontroller */
function controls() {
    return (enforcedControl() )
}
/* #endregion */

//function Dynajax(link,key="",callback,data,This=null,ask=false,async=true,clear=true)
function Dynajax(link,key="",callback,This=null,checkControls=true,data,ask=false,async=true,clear=true){
    
    if(key==""){
        throw "Key Bulunamadı!"
    }
    if(checkControls){
        if(controls()) {
            maskClose();    
            return;
        }
    }
    var answer;
    var _ajax={
        type: "POST",
        url: "/ajax/"+link,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(collectData(key,data)),
        success: function (result) {
            if(!result){
                showNotification('birhatameydanageldi','error');
                return;
            }
            if (result.status){
                if(result.message) showNotification(result.message,"success" );
                if(callback && typeof(callback)=="function") {
                    if(clear) $(`[ajax-key=${key}]:visible`).val("");
                    callback(result,This);
                }
            } 
            else {
                showNotification(result.message,"error" );
                if(This!=null){
                    if(callback && typeof(callback)=="function") {
                        callback(result,This);
                    }
                }
            }
            answer=result;
            maskClose();
        },
        error: function (jqXHR, exception) {
            maskClose();
            console.log(jqXHR);
            console.log(exception);
        }
    }
    if(!async){
        _ajax.async=false;
    }
    if (ask) {
        try {
            $.confirm({
                content: "",
                theme: 'material',
                type: 'red',
                title: 'Eminmisiniz?',
                draggable: false,
                buttons: {
                    confirm: {
                    btnClass: 'btn-red',
                    text: 'Evet',
                    action: function () {
                        maskOpen();
                        $.ajax(_ajax);
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
        } catch (error) {
            
        }

    } else {
        maskOpen();
        $.ajax(_ajax);
        
    }
    if(!async){
        return answer;
    }
}
function showNotification(text,renk,from='top',align='right'){
    $context = renk;
    $message = text;
    $position = align;

    if ($context === '') {
        $context = 'info';
    }

    if ($position === '') {
        $positionClass = 'toast-bottom-right';
    } else {
        $positionClass = 'toast-'+from +'-'+ align;
    }

    toastr.remove();
    toastr[$context]($message, '', {
        positionClass: $positionClass
    });
}
function findPos(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    return [curtop];
    }
}
