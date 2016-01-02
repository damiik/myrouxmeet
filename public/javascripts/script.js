// Userlist data array for filling in info box
// var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() { // here you don't know what document is ready but if you read some element of body you will know this..


    var datatable = $('#usertable').dataTable(  {      

      // "ajax": {
      //     // "type": "POST",
      //     // "url": "https://test.com/api/db/select",
      //     // "data": [],
      //     // "contentType": "application/json; charset=utf-8",
      //     // "dataType": "json",
      //     // "dataSrc": "Data",
      //     //"processData": true,
      //   }
        //dom: 'Bfrtip',
        //className: 'select-checkbox'
        columnDefs: [

          { targets: [3], width: "30px"},
          { targets: [4], width: "100px"},
          { targets: [5,6], visible: true, searchable:false, sortable:false //, render: function (data, type, full, meta) {

              //return '<input type="checkbox">';
           // }
          }
        ],
        buttons: ['copy', 'excel', 'pdf' ]
      });
      //datatable.buttons().container().appendTo( $('.table', datatable.table().container() ) );

      $('#cbx_R_select_all').click(function() {

          if( this.checked ) {

            $(":checkbox").each(function() {

              if(this.name == 'cbx_user_read_access') this.checked = true;
            })
          }
          else {

            $(":checkbox").each(function() {

              if(this.name == 'cbx_user_read_access') this.checked = false;
            })
          }
      });

      $('#cbx_W_select_all').click(function() {

          if( this.checked ) {

            $(":checkbox").each(function() {

              if(this.name == 'cbx_user_edit_access') this.checked = true;
            })
          }
          else {

            $(":checkbox").each(function() {

              if(this.name == 'cbx_user_edit_access') this.checked = false;
            })
          }
      });

      // DataTable     
      datatable = $('#usertable').DataTable();


    //$(document).ready(function() {     // Setup - add a text input to each footer cell   
 
      $("#usertable tfoot th[name=user_access_table_search]").each( function () {   

        var title = $('#usertable thead th').eq( $(this).index() ).text();    
        $(this).html( '<input type="text" style= "text-align:center;  font-size: 80%;width: 100%; height: 120%;  padding: 0; margin: 0;" placeholder="'+title+'?" />' );    //if(this.class === 'user_access_table_search') 
      });   

      datatable.columns.adjust().draw();

      // Apply the search    
      datatable.columns().every( function () {         

        var that = this;           
        $('input', this.footer()).on('keyup change', function() {   

          that.search( this.value ).draw();         
        });     
      }); 

    //});﻿


    // $('#usertable tbody').on( 'click', 'tr', function () {

    //     alert( datatable.row( this ).data() );
    // } );



    // $('#button').click( function () {
    //     var hidden = table.fnGetHiddenNodes();
    //     alert( hidden.length +' nodes were returned' );
    // } );

    // new $.fn.dataTable.Buttons( datatable, {
    // buttons: [
    //     'copy', 'excel', 'pdf'
    //   ]
    // } );

    var el = document.getElementById('btn_edit_users_access_save');
    if( el !== null) el.addEventListener("click", function editUserAccess( event ) {

      event.preventDefault();

      var datatable = $('#usertable').DataTable();

      //read_list = ""; 
      //write_list = "";
      read_list = [];
      write_list = [];

      datatable.$("input:checked", {"page": "all"}).each(function(index, elem) {

        // alert("name:" + $(elem).attr( "name") + ", val:" + $(elem).val());

        //if($( elem ).attr( "name" ) === "cbx_user_read_access") read_list += (read_list ? ", " : "") + $( elem ).val(); //read_list.push( $( elem ).val() );
        //if($( elem ).attr( "name" ) === "cbx_user_edit_access") write_list += (write_list ? ", " : "") + $( elem ).val(); //write_list.push( $( elem ).val() );
        if($( elem ).attr( "name" ) === "cbx_user_read_access") read_list.push( $( elem ).val() );
        if($( elem ).attr( "name" ) === "cbx_user_edit_access") write_list.push( $( elem ).val() );
      });

      // tak się nie da bo nie istnieje element którego szukasz, musisz wyświetlić stronę
      // alert( read_list + "***" + write_list)

      $.ajax({

        url: '/editusers',
        type: 'PUT',
        data: {

          read_list: read_list, 
          write_list: write_list
        },
        success: function(data, textStatus, jqXHR) {

          //if(typeof data.redirect == 'string') window.location.href = data.redirect;
          window.history.back();
        }
      });

      sessionStorage.setItem('read_list', read_list);
      sessionStorage.setItem('write_list', write_list);
      sessionStorage.setItem('read_list_valid', 'valid');
      sessionStorage.setItem('write_list_valid', 'valid');
    });


    // var el = document.getElementById('read_list');
    // if( el !== null && sessionStorage.getItem('read_list_valid') === 'valid') {

    //   el.value = sessionStorage.getItem('read_list');
    //   sessionStorage.setItem('read_list_valid', '');
    // }


    // var el = document.getElementById('write_list');
    // if( el !== null && sessionStorage.getItem('write_list_valid') === 'valid') {

    //   el.value = sessionStorage.getItem('write_list');
    //   sessionStorage.setItem('write_list_valid', '');
    // }








    var el = document.getElementById('btn_edit_users_access_cancel');
    if( el !== null) el.addEventListener("click", function deleteArticle( event ) {

      event.preventDefault();
      datatable.rows().iterator( 'row', function ( context, index ) {

          $( this.row( index ).node() ).addClass( 'lowlight' );
      } );

      window.history.back();
    });




    var el_nav = document.querySelector('.navigation');
    var el_top = el_nav.offsetTop;  //var el_top = el_nav.offset().top; --> jquery version

    var stickyNav = function() {

        //var scrollTop = -(window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        if(window.pageYOffset > el_top) AddClass(el_nav, 'sticky')
        else 
          RemoveClass(el_nav, 'sticky')
    };
    stickyNav();
    $(window).scroll(function() { stickyNav(); } );




    //$(document).on('click', '.btnDeleteArticle', function deleteArticle(event) {
    //var el = document.querySelector('#btnDeleteArticle');
    var el = document.getElementById('btnDeleteArticle');
    if( el !== null) el.addEventListener("click", function deleteArticle( event ) {

      event.preventDefault();

      // Get the URL specified in the form
      //var url = e.target.parentElement.action; // if button is in form with action = "http://somelink"
      //window.location = url;

      var confirmation = confirm('Are you sure you want to delete this article?');

      // Check and make sure the user confirmed
      if (confirmation === true) {

        $.ajax({
          url: '/addart',
          type: 'DELETE',
          data: {

            '_id' : $('#_id').val(),
            'art_no' :-1              // info that article have to be deleted
          },
          //dataType: 'JSON',
          success: function(data, textStatus, jqXHR) {

            if(typeof data.redirect == 'string') window.location.href = data.redirect;
          }
        });
      }
    });



    //$(document).on('click', '.btnUpdateArticle', function updateArticle(event) {
    //var el = document.querySelector('#btnUpdateArticle');
    var el = document.getElementById('btnUpdateArticle');
    if( el !== null) el.addEventListener("click", function updateArticle( event ) {

        $.ajax({
          url: '/addart',
          type: 'PUT',
          data: {

            '_id' : $('#_id').val(),
            'art_no' : $('#art_no').val(),
            'shortname' : $('#shortname').val(),
            'name' : $('#name').val(),
            'title' : $('#title').val(),
            'summary' : $('#summary').val(), 
            'description' : tinyMCE.get('description').getContent() ////$('#description').val() 
              .replace(/&nbsp;/ig, '<br>'),
            'read_list': $('#read_list').val(), 
            'write_list': $('#write_list').val()
              //.replace(//"/ig, '/'');       
          },
          //dataType: 'JSON',

          success: function(data, textStatus, jqXHR) {

            if(typeof data.redirect == 'string') window.location.href = data.redirect;
          }
        });
    });



    //$(document).on('click', '.btnNewArticle', function newArticle(event) {
    //var el = document.querySelector('#btnNewArticle');
    var el = document.getElementById('btnNewArticle');
    if( el !== null) el.addEventListener("click", function newArticle( event ) {

        $.ajax({
          url: '/addart',
          type: 'POST',
          data: {

            '_id' : '',
            'art_no' : '',
            'shortname' : $('#shortname').val(),
            'name' : $('#name').val(),
            'title' : $('#title').val(),
            'summary' : $('#summary').val(), 
            'description' : tinyMCE.get('description').getContent() ////$('#description').val() 
              .replace(/&nbsp;/ig, '<br>'),
            'read_list': $('#read_list').val(), 
            'write_list': $('#write_list').val()
          },
          //dataType: 'JSON',

          success: function(data, textStatus, jqXHR) {

            if(typeof data.redirect == 'string') window.location.href = data.redirect;
          }
        });
    });



    //var el = document.querySelector('#btnEditUsers');
    var el = document.getElementById('btnEditUsers');
    if( el !== null) el.addEventListener("click", function editUsers( event ) {


        // var write_text_el = document.getElementById('write_list'); // do usunięcia, 
        // var read_text_el = document.getElementById('read_list'); // do usunięcia, 
        // if( read_text_el !== null && write_text_el !== null) {

          // $.ajax({

          //   url: '/editusers',
          //   type: 'PUT',
          //   data: {write_text_el: write_text_el.value, read_text_el: read_text_el.value
          //   },
          //   success: function(data, textStatus, jqXHR) {

          //     if(typeof data.redirect == 'string') window.location.href = data.redirect;
          //   }
          // });

          window.location.href = '/editusers'; // generate GET /editusers request

          // $.ajax({
          //     url: '/editusers',
          //     method: 'GET',
          //     success: function(data, textStatus, jqXHR) {

          //       if(typeof data.redirect == 'string') window.location.href = data.redirect;
          //     }
          //     // done: function(xhr){
          //     //     console.log('done: ');
          //     //     console.log(xhr);
          //     // },
          //     // fail: function(err){
          //     //     console.log('failed: ');
          //     //     console.log(err);
          //     // }
          // });

        // }
    });



    var el = document.getElementById('edit_article_a');
    if(el !== null) el.addEventListener("click", function changeHref( event ) {

      event.preventDefault();

      $.ajax({
        url: '/speakers',//?' + el_edit_bt.getAttribute('data-button'),
        type: 'PUT',
        success: function(data, textStatus, jqXHR) {

          if(typeof data.redirect == 'string') window.location.href = data.redirect;
        }
      });
    });
});



var noname = function() {
    
    function centerImage( theImage ) {

        var myDifX = (window.innerWidth - theImage.width) / 2, myDifY = (window.innerHeight - theImage.height) / 2;
        return theImage.style.top = myDifY + "px", theImage.style.left = myDifX + "px", theImage;
    }


    //zostanie zwrócony pierwszy element w dokumencie zawierający klasę "pixgrid":
    var myNode = document.querySelector(".pixgrid"); // pixgrid css class used in artworklist.ejs


    if(myNode !== null) myNode.addEventListener("click", function( e ) {

        if (e.target.tagName === "IMG") {

            var myOverlay = document.createElement("div");
            myOverlay.id = "overlay", 
            document.body.appendChild( myOverlay ), 
            myOverlay.style.position = "absolute", 
            myOverlay.style.top = 0, 
            myOverlay.style.backgroundColor = "rgba(0,0,0,0.7)", 
            myOverlay.style.cursor = "pointer", 
            myOverlay.style.width = window.innerWidth + "px", 
            myOverlay.style.height = window.innerHeight + "px", 
            myOverlay.style.top = window.pageYOffset + "px", 
            myOverlay.style.left = window.pageXOffset + "px";

            var imageSrc = e.target.src, 
            largeImage = document.createElement("img");
            largeImage.id = "largeImage", 
            largeImage.src = imageSrc.substr(0, imageSrc.length - 7) + ".jpg", 
            largeImage.style.display = "block", 
            largeImage.style.position = "absolute", 
            largeImage.addEventListener("load", function() {

                this.height > window.innerHeight && (this.ratio = window.innerHeight / this.height, 
                this.height = this.height * this.ratio, this.width = this.width * this.ratio), this.width > window.innerWidth && (this.ratio = window.innerWidth / this.width, 
                this.height = this.height * this.ratio, this.width = this.width * this.ratio), centerImage(this), 
                myOverlay.appendChild(largeImage);
            }), 

            largeImage.addEventListener("click", function() {
                myOverlay && (
                    window.removeEventListener("resize", window, !1), 
                    window.removeEventListener("scroll", window, !1), 
                    myOverlay.parentNode.removeChild( myOverlay )
                );
            }, !1), 

            window.addEventListener("scroll", function() {
                myOverlay && (
                    myOverlay.style.top = window.pageYOffset + "px", 
                    myOverlay.style.left = window.pageXOffset + "px"
                );
            }, !1), 

            window.addEventListener("resize", function() {
                myOverlay && (
                    myOverlay.style.width = window.innerWidth + "px", 
                    myOverlay.style.height = window.innerHeight + "px", 
                    myOverlay.style.top = window.pageYOffset + "px", 
                    myOverlay.style.left = window.pageXOffset + "px", 
                    centerImage( largeImage )
                );
            }, !1);
        }
    }, !1);
}();



// misc non jquery functions
// ------------------------------------------------------------------------------------------------------------------------


function AddClass(el, className) {

  //el.addClass(className); // use only with query $('...') objects

  if( el.classList ) el.classList.add( className );
  else if( el.className ) el.className += ' ' + className;
    else
       el.className = className;
}


function RemoveClass(el, className) {

  //el.removeClass( className ); // use only with query $('...') objects

  if( el.classList ) el.classList.remove( className );
  else 
    if( el.className ) el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}


function getPosition(element) {

  var xPosition = 0;
  var yPosition = 0;

  while(element) {

      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
  }
  return { x: xPosition, y: yPosition };
}






    // sticky top menu
    // --------------------------------------------------
    //var el_nav = $('.navigation');
    //document.querySelectorAll('.navigation');
    //document.getElementsByClassName('navigation');
    //document.getElementsByTagName('ul');
    //document.getElementById('stockings');

    /*
    var myobject = {

      ValueA : '<div>Text A</div>',
      ValueB : '<div>Text B</div>',
      ValueC : '<div>Text C</div>'

    };

    var select = document.getElementById("example-select");

    for(index in myobject) {

        select.options[select.options.length] = new Option(myobject[index], index);
    }
    */


    /*
    var e = document.getElementById("ddlViewBy");
    var strUser = e.options[e.selectedIndex].value;

    Would make strUser be 2. If what you actually want is test2, then do this:

    var e = document.getElementById("ddlViewBy");
    var strUser = e.options[e.selectedIndex].text;


    if($("input:radio[name=googlemaps_area]:checked").val()=="4x"){
    */



/*


      // I suppose the simplest scenario would be to add some client-side logic to fetch pieces of html 
      // from the server and update the client. 
      // This is easily achieved using jQuery (put it inside a document ready block to wire up the event):
      $('#button').click(function() {
           $.get('/some/url', {foo: 42}, function(result) {
               $('#target').html(result);
           }
      }


        ajax({
            url: '/get/json',
            method: 'GET',
            done: function(xhr){
                console.log('done: ');
                console.log(xhr);
            },
            fail: function(err){
                console.log('failed: ');
                console.log(err);
            }
        });


      el.addEventListener("click", function goEditArticle( event ) {

      // Prevent the default action (e.g. submit the form)
      event.preventDefault();

      // Get the URL specified in the form
      //var url = e.target.parentElement.action; // if button is in form with action = "http://somelink"
      //window.location = url;

        //$.parseJSON($(this).attr('data-button')); 

        //GO TO  /speakers?_id POST and post generate GET for /addart?_id
        $.ajax({
          url: '/speakers?' + el_edit_bt.attr('data-button'),
          type: 'POST',
          data:  el_edit_bt.attr('data-button'),
          //dataType: 'JSON',
          success: function(data, textStatus, jqXHR) {

            if(typeof data.redirect == 'string') window.location.href = data.redirect;
          }
        });
    });
*/


    /*
    if( el !== null) el.addEventListener("click", function findArticle( event ) {

      event.preventDefault();
         var artData = {
            'art_no' : $('#art_no').val(),
            'shortname' : $('#shortname').val(),
            'name' : $('#name').val(),
            'title' : $('#title').val(),
            'summary' : $('#summary').val()   
        };
          
        $.ajax({

          url: '/addart/' + $('#shortname').val(),
          type: 'PUT',
          data: artData,
          //dataType: 'JSON',
          success: function(data, textStatus, jqXHR) {

            if(typeof data.redirect == 'string') window.location.href = data.redirect;
          }
        });   
    });
*/

/*
    var b = document.getElementById("delete_article_id");
    if(b !== null) b.addEventListener("click", function( e ) {
        
            console.log('button Delete Article');
    });

    b = document.getElementById("update_article_id");
    if(b !== null) b.addEventListener("click", function( e ) {
        
            console.log('button Update Article');
    });
*/


/*
    //$(document).on('click', '.btnEditArticle', function goEditArticle(event) {
    var el = document.querySelector('.btnEditArticle');
    if( el !== null) el.addEventListener("click", function goEditArticle( event ) {

      // Prevent the default action (e.g. submit the form)
      event.preventDefault();

      // Get the URL specified in the form
      //var url = e.target.parentElement.action; // if button is in form with action = "http://somelink"
      //window.location = url;

        //$.parseJSON($(this).attr('data-button')); 

        //GO TO  /speakers?_id POST and post generate GET for /addart?_id
        $.ajax({
          url: '/speakers', //url: '/speakers?' + $(this).attr('data-button'),
          type: 'PUT',
          success: function(data, textStatus, jqXHR) {

            if(typeof data.redirect == 'string') window.location.href = data.redirect;
          }
        });
    });
*/