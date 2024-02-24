var data={}
function refresh(c,_this){
  let k,v,e;
  if(_this){
    k=$(_this).closest( ".col-searcher" ).attr("col");
    t=$(_this).attr("type")
    if(t=="checkbox"){
      if(_this.checked) v=1
    }else v=$(_this).val()
    e=$(_this).attr("extra")
  }
  if(c) {
    data.current=c;
  }
  if(k){
    let indx=data.srcTxt.findIndex(x=> x.k==k )
    if(indx>-1) data.srcTxt.splice(indx,1)
    if(v && v!="") {
      if(t){
        if(t=="date"){
          v=convertTime(v)
        }
      }
      data.srcTxt.push({k:k,v:v,e:e})
    }
  }
  var postData={ current:(data.current-1)*30,orderBy:data.orderBy,orderType:data.orderType,srcTxt:data.srcTxt }
  Object.assign(postData, data.sqlData);
  Dynajax(`table/${data.table}`,'x',table,null,false,postData);
  window.scroll(0,findPos(document.querySelector(".table")));
}
function table(result){
  try{
    $(".table>tbody").html("");
    if(result.d && result.d[0]?.length){
      result.d[0].forEach(row=> {
        let tdExtra=""

        if (data.checkbox || data.customNotifyText  ){
          tdExtra+=`<td class="notify center"  onclick="notify(${row.id},this)"> 
                      <div class="form-check">
                        <label class="form-check-label" for="cb${row.id}">
                          <input class="form-check-input" id="cb${row.id}" type="checkbox" name="cb" onclick="event.stopPropagation();" ${row.notify && row.notify==1 ? "checked" : "" }><span class="form-check-sign"></span>
                        </label>
                      </div>
                    </td>`
        }
        if(data.skip){
          tdExtra+=`<td class="center" >
                <button class="btn btn-danger btn-icon btn-sm" type='button' rel='tooltip' onclick='skip(${row.id})'>
                <i class="fa fa-times"></i>
                </button> 
              </td>`
        }
        if(data.checker){
          if(row.adi){
            tdExtra+=`<td class="checker center" onclick="checker(${row.id},this)"> 
                <div class="form-check">
                  <label class="form-check-label" for="ccb${row.id}">
                    <input class="form-check-input" id="ccb${row.id}" type="checkbox" name="cb" onclick="event.stopPropagation();" ${row.checker && row.checker==1 ? "checked" : "" }><span class="form-check-sign"></span>
                  </label>
                </div>
              </td>`
          }else{
            tdExtra+=`<td class="center" >
                <i class="fa fa-times"></i>
              </td>`
          }
        }
        if(data.customCheckbox!=undefined){
          let check=customCheckboxRender(row.id)  
          if( $("[row-id='"+row.id+"']").length==0 )
          tdExtra+=`<td class="center" ${data.customCheckbox}  onclick="customCheckbox(${row.id},this)"> 
                      <div class="form-check">
                        <label class="form-check-label" for="cu${row.id}">
                          <input class="form-check-input" id="cu${row.id}" type="checkbox" name="cb" onclick="event.stopPropagation();" ${check  ? "checked" : "" }><span class="form-check-sign"></span>
                        </label>
                      </div>
                    </td>`
        }
        let tr=`
          <tr class="tdata rowData" row-id="${row[data.idColName]}" rowId=${row.id} link=${data.link} >
              ${data.tableHead.map((key,index)=>{
                
                if(data.hideColumn && data.hideColumn.includes(data.tableHead[index])){ return "" }

                let td;
                if(!data.dateIndex) data.dateIndex=[]
                if(data.dateIndex.some(dt=>dt-1==index  )){
                  let tmp = row[key].substring(0,10).split("-")
                  td= tmp[2]+"-"+tmp[1]+"-"+tmp[0]
                }else if(data.props[key]?.t=="picture"){
                  if(row[key]){
                    td=`<img class="w35 h35 rounded" src='/firmaImages/default/image_placeholder.jpg' onerror="this.onerror=null; this.src='/firmaImages/default/image_placeholder.jpg'"> `
                  }
                  else{
                    td=`<img class="w35 h35 rounded" src='/firmaImages/default/image_placeholder.jpg'>`
                  }
                }else if(data.props[key]?.color){

                  let special= data.props[key] || {}
                  let tdValue;
                  if(special.k) tdValue=row[special.k] || ""
                  else tdValue= row[key] || ""

                  td=`<span class="badge badge-${row[data.props[key].color]} ml-0 mr-0">${tdValue}</span>`
                  
                }
                else{
                  let special= data.props[key] || {}
                  if(special.k){

                    if(typeof special.k == 'string'){
                      td=row[special.k] || ""
                    }else{
                      td=special.k.map(i=> row[i]).join(' ')
                    }
                  }
                  else td= row[key] || ""
                }
                return "<td>"+ td +"</td>"
              }).join("")}   

              ${tdExtra}    

          </tr>`
        $(".table>tbody").append(tr)
        $(".rowData").on("click",function(e)  {rowData(e);return false})
      })
      $(".rowData").on("click",function(e)  {rowData(e);return false})
      //pager
      var max ; 
      if(result.d[1][0].max)
      max = result.d[1][0].max;
      else max=99999
      $(".total").text(`Toplam Sayfa Sayısı:${Math.ceil(max / 30)}`)
      data.max = max < 30 ? 1 : Math.ceil(max / 30);
      var pager="";
      var tmpUrl= (data.pageLink!=null ? data.pageLink : data.link) + (data.table!=null ? data.table : "table/")
      if (data.current!=1){
        pager+=`<li class="page-item"><a class="page-link" onclick="data.current=${ parseInt(data.current-1) };refresh()" href="javascript:void(0);">«</a></li>`
      }
      var i = 3,j=1; 
      while (i>0){
        if (data.current-i > 0){
          pager+=`<li class="page-item"><a class="page-link" onclick="data.current=${ parseInt(data.current-i) };refresh()" href="javascript:void(0);">${data.current-i}</a></li>`
        }
        i--
      }
      pager+= `<li class="page-item active"><a class="page-link" href="javascript:void(0);">${data.current}</a></li>`
      while (j<4){
        if (data.current+j <= data.max){
          pager+=`<li class="page-item"><a class="page-link" onclick="data.current=${ parseInt(data.current+j) };refresh()" href="javascript:void(0);">${data.current+j}</a></li>`
          
        }
        j++
      }
      if(data.current<data.max){
        pager+=`<li class="page-item"><a class="page-link" onclick="data.current=${ parseInt(data.current+1) };refresh()" href="javascript:void(0);">»</a></li>`
      }
      $(".pagination").html(pager)
    }else{
      $(".table>tbody").append(`<div>Tabloda veri yok.</div>`)
      $(".pagination").html("")
      $(".total").text("")
    }

  }catch(error){
    console.log(error)
  }
}


$(function() {
  
  data= JSON.parse($("#data").attr("data"));
  data.orderType="D"
  data.orderBy=data.orderBy 
  data.current=1
  if(!data.srcTxt) data.srcTxt=[]
  refresh()
$("thead tr").eq(0).find("th").click(function(){
    var s=$(this).attr("col")
    if(s==data.orderBy){
      data.orderType= data.orderType=="A" ? "D" : "A"
    }else{
      data.orderBy=s
      data.orderType="D"
    }
    $("thead th").removeClass("sorting_desc").removeClass("sorting_asc");
    $(this).removeClass("sorting");
    if(data.orderType=="A"){
      $(this).addClass("sorting_asc");
    }else{
      $(this).addClass("sorting_desc");
    }
    refresh()
})
$("thead .col-searcher input.date").change(function(){
  if($(this).val().length==10){
    refresh(1,this)
  }
})
$("thead .col-searcher select,input[type='checkbox']").change(function(){
  refresh(1,this)
})
$("thead .col-searcher input").keyup(function(e){
    if(e.keyCode == 13)
    { 
      refresh(1,this)
    }
});
$('#search-box>input').keyup(function(e){
    if(e.keyCode == 13)
    { 
        refresh(1,this)
    }
});
function rowData(e){
  let table = $("#table").attr("data");
  let link=$(e.currentTarget).attr("link")
  let row_Id=$(e.currentTarget).attr("row-id")
  let rowId=$(e.currentTarget).attr("rowId")
  if(link && link  != "undefined"){
    window.open(link+rowId, '_self');
  }else if(data.link != false){
    window.open(`/web/form/${table}/${row_Id}`, '_self');
  }
}


function skip(id){
  event.stopPropagation();
  Dynajax('skip','s',function(obj,callbackData){
     if(obj.status){
        showNotification(obj.message,"success");
        $(`[row-id='${id}']`).remove()
    }
  },{id:id},false,{ targetId:parseInt(id) },true);
  event.cancelBubble=true
}
function pdf(result){
  var output=[]
  output.push(result.d.col)
  result.d.data.forEach(x=> {
    let tmp=[]
    result.d.col.forEach(y=> tmp.push(x[y]))
    output.push(tmp)
  })
  download(output)
}

function notify(id,_this){
    if (data.notifyLink){
        var tmpStatus=_this.querySelector("input[type='checkbox']").checked
        Dynajax(data.notifyLink,'l',setChecked,{t:_this,rc:tmpStatus},false,{ status:tmpStatus,id: data.id && data.id!="table" ? data.id  :  "null" ,targetId:parseInt(id)});
        event.stopPropagation();
    }
    else{
        event.stopPropagation();
        var tmpStatus=_this.querySelector("input[type='checkbox']").checked
        Dynajax('setNotify','l',setChecked,{t:_this,rc:tmpStatus},false,{ status:tmpStatus,typeId:  data.typeId ? JSON.stringify(data.typeId)  :  "null" ,targetId:parseInt(id)});
  
    }

}    
function checker(id,_this){
    if (data.checker){
        event.stopPropagation();
        var tmpStatus=_this.querySelector("input[type='checkbox']").checked
        Dynajax('checker','l',setChecked,{t:_this,rc:tmpStatus},false,{ status:tmpStatus,targetId:parseInt(id)});
    }
  
}
});

