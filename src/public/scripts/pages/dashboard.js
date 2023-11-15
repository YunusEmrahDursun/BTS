function getDasboardTableData(){
    Dynajax('isEmirleri','x',table,null,false);
  }
  function table(result){
    try{
        $(".table>tbody").html("");
        if(result.d && result.d.length){
          result.d.forEach(row=> {
            let color = "";
            if( row.is_emri_durum_key == "open"){
              color = 'danger';
            }else if( row.is_emri_durum_key == "success" ){
              color = 'success';
            }else if( row.is_emri_durum_key == "transfer" ){
              color = 'warning';
            }else if( row.is_emri_durum_key == "support" ){
              color = 'info';
            }else{
              color = 'primary';
            }
            let tr=`
              <tr class="tdata" row-id="${row.is_emri_id}" onclick="${`window.open('/web/form/is_emri/${row.is_emri_id}', '_self');`}">
                 <td><span>${row.is_emri_id} </span></td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="ml-3"><a href="javascript:void(0);" title="">${ row.kullanici_isim + ' ' + row.kullanici_soyisim }</a>
                        <p class="mb-0">${row.is_emri_aciklama}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p class="mb-0">${ moment(row.guncellenme_zamani).format('Do MMMM YYYY, HH:mm') }</p>
                  </td>
                  <td><span class="badge badge-${color} ml-0 mr-0">${row.is_emri_durum_adi}</span></td>
              </tr>`
            $(".table>tbody").append(tr)
          })
        
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
    moment.locale('tr');
    getDasboardTableData();
  });
