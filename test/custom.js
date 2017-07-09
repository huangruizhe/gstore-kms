// 清除两边的空格 
String.prototype.trim = function() { 
  return this.replace(/(^\s*)|(\s*$)/g, ''); 
}; 

 function doDelRow(tr) {
    tr.fadeOut('slow',()=>tr.remove());
 }

 function doUpdateRow(tr, title, descritpion) {
    tr.find('td:first-child').text(title);
    tr.find('td:nth-child(2)').text(descritpion);
 }

 var buttonId = undefined;
  
  $(document).ready(function() {
    
        $("#mytable #checkall").click(function () {
            if ($("#mytable #checkall").is(':checked')) {
                $("#mytable input[type=checkbox]").each(function () {
                    $(this).prop("checked", true);
                });

            } else {
                $("#mytable input[type=checkbox]").each(function () {
                    $(this).prop("checked", false);
                });
            }
        });
      
        $("[data-toggle=tooltip]").tooltip();

        $("#delete").on("show.bs.modal", function(e) {    
              buttonId = $(e.relatedTarget).data("id");
            });

        $("#edit").on("show.bs.modal", function(e) {
              buttonId = $(e.relatedTarget).data("id");

              var tr = $("#mytable tr td button.btn-primary[data-id=" + buttonId +"]").parents('tr')
              var titlePlaceholder = tr.find('td:first-child').text();
              var descPlaceholder = tr.find('td:nth-child(2)').text();

              $('#edit-title').attr('placeholder', titlePlaceholder)
              $('#edit-description').attr('placeholder', descPlaceholder)
              $('#edit-title')[0].value = titlePlaceholder
              $('#edit-description')[0].value = descPlaceholder

            });

        $("#confirm-delete").click(function () {
          // console.log("hello");
          // console.log(buttonId);
          var tr = $("#mytable tr td button.btn-danger[data-id=" + buttonId +"]").parents('tr')
          // console.log(tr.html());
          doDelRow(tr);
        });

        $("#confirm-update").click(function () {
          var tr = $("#mytable tr td button.btn-primary[data-id=" + buttonId +"]").parents('tr')
          
          var title = $("#edit-title")[0].value.trim();
          var description = $("#edit-description")[0].value.trim();
          // console.log(title);
          // console.log(description);

         if ($('#edit-title').attr('placeholder') == title 
          && $('#edit-description').attr('placeholder') == description) {
          // console.log('no change');                
        } else {
          // console.log('changed');                
          doUpdateRow(tr, title, description);                
        }

        });

  });