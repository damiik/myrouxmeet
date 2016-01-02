var express = require('express');
var router = express.Router();
var fs = require('fs');
var appdata = require('../data.json');
//var User = require('../modules/user');


//--------------------------- Main Router -----------------------------------------

/*
POST /user
fname=John&lname=Doe&age=25     <---------------- create new data on server

The server responds:

200 OK
Location: /user/123

In the future, you can then retrieve the user information:

GET /user/123                   <---------------- get data from server

The server responds:

200 OK
<fname>John</fname><lname>Doe</lname><age>25</age>

To update:

PUT /user/123                   <---------------- update data on server (PATCH)
fname=Johnny

*/

// read all pictures from doc_directory and put *_tn.jpg files to myArtwork
var myArtwork = [];
var doc_directory =  './public/images/artwork';
var f_list = fs.readdirSync( doc_directory );
f_list.forEach(function( file ) {
  
  var path_file = doc_directory + '/' + file
  var stat = fs.statSync( path_file )
  if (stat && stat.isDirectory() == false && file.substring(file.length - 7) == "_tn.jpg" ) {

    myArtwork = myArtwork.concat( file )
    //console.log( file.substring(0, file.length - 10) );
  }
});


/*
Everything will happen in the order that they appear. 
------------------------------------------------------
This means that if you place your middleware after a route, then the route will happen before 
the middleware and the request will end there. Your middleware will not run at that point.

Keep in mind that you can use route middleware for many things. You can use it to check that a user 
is logged in in the session before letting them continue.
*/
// route middleware that will happen on every request
router.use(function(req, res, next) {

    // log each request to the console
    console.log(req.method, req.url);

    // continue doing what we were doing and go to the route
    next(); 
});


function isLoggedIn(req, res, next) {

  if( req.isAuthenticated() ) return next();
  //res.redirect('/login');
  //req.flash('success', 'Musisz być zalogowany żeby edytować treść.')
  res.render('./auth/login.ejs', { message: 'Musisz być zalogowany żeby wejść na tą stronę..', username:'', title:'Autentykacja..'});
  //req.flash('success', 'Musisz być zalogowany żeby edytować treść.');
}

// GET from server
//------------------------------------------------------------------------------------------------------------


// render index.ejs
router.get('/', function(req, res) {

  var db = req.db;
  var collection = db.get('rouxmeet');
  //collection.find({ $and : [{art_no: {$ne: 0.0}}, {art_no: {$ne: "0"}}]}, {sort: {art_no: 1}}, function(e, articles) {
  var username = req.session.user ? req.session.user.name : 'all';
  collection.find({

      $and : [
        //{$or : [{read_list: new RegExp( reg_ex )} , {read_list: /(^|([^0-9|a-z|A-Z]+))(all)(([^0-9|a-z|A-Z]+.*)|$)/}]},
        {$or : [{read_list: username} , {read_list: 'all'}]},
        {art_no: {$ne: 0.0}}, 
        {art_no: {$ne: "0"}}
      ]
    }, {sort: {art_no: 1}}, function(e, articles) {
    res.render('index', {

      title: 'Home',
      artwork: myArtwork,
      articles_list: articles,
      page: 'home',
      username: req.session.user ? req.session.user.name : null
    });
  });
});



// render speakers.ejs
router.get('/speakers', function(req, res) {

  var db = req.db;
  var collection = db.get('rouxmeet');
  var username = req.session.user ? req.session.user.name : 'all';
  //var reg_ex = '(^|([^0-9|a-z|A-Z]+))(' + username + ')(([^0-9|a-z|A-Z]+.*)|$)'

  var find_query = (username === "admin") ? {} : {

     $and : [
      //{$or : [{read_list: new RegExp( reg_ex )} , {read_list: /(^|([^0-9|a-z|A-Z]+))(all)(([^0-9|a-z|A-Z]+.*)|$)/}]},
      {$or : [{read_list: username} , {read_list: 'all'}]},
      {art_no: {$ne: 0.0}}, 
      {art_no: {$ne: "0"}}
    ]};

  collection.find(find_query, {sort: {art_no: 1}}, function(e, articles) {

    res.render('speakers', {
      title: 'Speakers',
      artwork: myArtwork,
      articles_list: articles,
      page: 'articlesList',
      username: req.session.user ? req.session.user.name : null
    });
  });
});



// render speakers.ejs for one speaker
router.get('/speakers/:shortname', function(req, res) {
  
  var db = req.db;
  var collection = db.get('rouxmeet');
  //collection.find({'shortname':req.params.shortname }, function(e, articles) {
  var username = req.session.user ? req.session.user.name : 'all';
  //var reg_ex = '(^|([^0-9|a-z|A-Z]+))(' + username + ')(([^0-9|a-z|A-Z]+.*)|$)'


  var find_query = (username === "admin") ? {

    $and : [
      //{$or : [{read_list: new RegExp( reg_ex )} , {read_list: /(^|([^0-9|a-z|A-Z]+))(all)(([^0-9|a-z|A-Z]+.*)|$)/}]},
      {'shortname':req.params.shortname },
      {art_no: {$ne: 0.0}}, 
      {art_no: {$ne: "0"}}
    ]} : {

    $and : [
      //{$or : [{read_list: new RegExp( reg_ex )} , {read_list: /(^|([^0-9|a-z|A-Z]+))(all)(([^0-9|a-z|A-Z]+.*)|$)/}]},
      {'shortname':req.params.shortname },
      {$or : [{read_list: username} , {read_list: 'all'}]},
      {art_no: {$ne: 0.0}}, 
      {art_no: {$ne: "0"}}
    ]};

  collection.find(find_query, {sort: {art_no: 1}}, function(e, articles) {

    req.app.set('curr_article_id', articles[0] ? articles[0]._id : null);  //in curr_article_id id of article have to strored
    //res.curr_article_id = articles[0] ? articles[0]._id : null;
    // read all files from galery directory and checkout file name if starts from shortname
    var myArtwork_speaker = [];
    myArtwork.forEach(function( item ) { //*_tn.jpg files from './public/images/artwork'
      
      if (item.substring(0, item.length - 10) == req.params.shortname) {

        myArtwork_speaker = myArtwork_speaker.concat( item );
        console.log(item);
      }
    });

    res.render('speakers', {

      title: 'Speakers',
      artwork: myArtwork_speaker,
      articles_list: articles,
      page: 'artistDetail',
      username: req.session.user ? req.session.user.name : 'all'
    });
  });
});



// generated when "Edit Article" button is pressed on some article page
// /speakers?_id PUT generate GET for /addart?_id with id from curr_article_id which is set by GET /speakers/article_name
router.put('/speakers', function(req, res, next) {

    var collection = req.db.get('rouxmeet');
    var curr_article_id = req.app.get('curr_article_id'); //in curr_article_id id of article have to strored
    //var curr_article_id = res.curr_article_id

    if( curr_article_id ) {

      console.log("PUT speakers ---> Find article by current ID: " + curr_article_id);
      var promise = collection.findById(curr_article_id, function(err, doc) {

        if( err ) { console.log(err.message); }
      });

      promise.on('success', function(doc) {

        console.log('ID finded..');
        console.log(JSON.stringify(doc, null, 4));

        res.statusCode = 201;//302 nie działa - musi być 201
        //redirest generates GET for /addart
        //res.redirect('/addart?_id=' + curr_article_id); 
        res.send({redirect: '/addart?_id=' + curr_article_id});// You can't make a redirection after an AJAX. You need to do it yourself in Javascript.
      });
    }
    else {

      console.log("PUT speakers ---> Can't find article by current ID, curr_article_id is corrupt");
    }
});




// some report with list of articles
router.get('/arts', function(req, res) {

  var db = req.db;
  var collection = db.get('rouxmeet');
  collection.find({}, {sort: {art_no: 1}}, function(e, articles) {

    var list_of_arts = [];
    var list_of_arts_s = "Articles:<ul>";
    articles.forEach(function( item ) {

      //var art_item = [];
      //art_item = art_item.concat( item.title );
      //art_item = art_item.concat( item.art_no );
      //list_of_arts = list_of_arts.concat( art_item );
      list_of_arts_s += "<li>" + item.art_no  + " " + item.title + " - " + item.shortname ;
    });
    list_of_arts_s += "</ul>"
    res.send( list_of_arts_s );
  });
});



// render addart.ejs
// THIS ROUTER SERVES PAGE FROM PATH LIKE: /addart?_id=56424995c7637fe953d15a00
router.get('/addart', isLoggedIn, function(req, res) {

    // jeżeli jest coś w req.body to szukam artykułu
    var db = req.db;
    var collection = db.get('rouxmeet');


    var j_data = {

        art_no: "9999.0",
        description: "treść artykułu..",
        name: "Art..",
        shortname: "Artykuł_Artykuł",
        summary: "Krótki opis..",
        title: "Art..",
        read_list: ['all'],
        write_list: ['all']
      };


    if(req.query._id) {

      console.log("GET addart ---> Find Artcle by ID: " + req.query._id ); 

      var promise = collection.findById(req.query._id, function(err, doc) {

        if( err ) { console.log(err.message); }
      });

      promise.on('success', function(doc) {

        req.app.set('curr_article_id', doc ? doc._id : null);  //in curr_article_id id of article have to strored
        //res.curr_article_id = doc ? doc._id : null;

        if(doc === null) doc = j_data
        else console.log('ID finded..');

        console.log(JSON.stringify(doc, null, 4));


        //if(req.session.user && doc.write_list.findIndex(function(username) { username == req.session.user.name; }) !== -1) {
        if(req.session.user && (doc.write_list.indexOf( req.session.user.name ) !== -1 || req.session.user.name === 'admin')) {

          res.render('addart', {

            title: 'New Art',
            /*artwork: {},*/
            articles_list: {},
            page: 'addart',
            article:doc,
            article_read_list: function(){var arl = ''; for(i = 0; i < doc.read_list.length; i++) { arl = arl + (i===0? '' : ', ') + doc.read_list[ i ]; } return arl;}(),
            article_write_list: function(){var awl = ''; for(i = 0; i < doc.write_list.length; i++) { awl = awl + (i===0? '' : ', ') + doc.write_list[ i ]; } return awl;}(),
            username: req.session.user ? req.session.user.name : 'all'
          });
        }
        else {

            res.render('./auth/login.ejs', {title:'Autentykacja..', username:req.session.user.name, message: 'Użytkownicy którzy mogą edytować ten artykuł: [' + function(){var awl = ''; for(i = 0; i < doc.write_list.length; i++) { awl = awl + (i===0? '' : ', ') + doc.write_list[ i ]; } return awl;}() + ']'});
        }
      });

      promise.on('error', function(err) {

        console.log('ERROR: ID not finded..');
      });
    }
    else {  // wywołano addart bez _id artykułu, tworzę nowy artykuł

      res.statusCode = 201;
      res.render('addart', {

        title: 'New Art',
        /*artwork: {},*/
        articles_list: {},
        page: 'addart',
        article:j_data,
        article_read_list: ['all'],
        article_write_list: [req.session.user ? req.session.user.name : 'all'],
        username: req.session.user ? req.session.user.name : 'all'
      });
    }
});


// POST /addart       ----> 
//                    <---- SEND redirect: /speakers/' + req.body.shortname
// GET /speakers/name ---->
router.post('/addart', function newArticle(req, res) {

  if( req.body.shortname ) {

    console.log("POST addart ---> New Artcle, shortname:" + req.body.shortname + " and title:" + req.body.title); 
    //console.log(req.body.description)
  }

  var db = req.db;
  var collection = db.get('rouxmeet');

  if(req.body._id === null || "abc" + req.body._id  === "abc") { // new article

    req.body.art_no = 1000000; // for new article
    collection.findOne({$query: {}, $orderby: {art_no: -1}}).on('success', function (doc) { // find article with last art_no

      req.body.art_no = doc.art_no + 1; // set art_no as last + 1
    });
    collection.findOne({$query: {shortname:req.body.shortname}}).on('success', function (doc) {

      req.body.shortname += '_C'
      req.body._id = collection.id();
      //var arl = req.body.read_list ? eq.body.read_list.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/) : [],
      //    awl = req.body.write_list ? eq.body.write_list.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/) : [];

      collection.findAndModify({

          "query": { "_id": req.body._id }, // generates new _id if is empty (for new artcle)
          "update": { "$set": { 

              "art_no": parseInt(req.body.art_no),
              "shortname": req.body.shortname,
              "name": req.body.name,
              "title": req.body.title,
              "summary": req.body.summary, 
              "description": req.body.description,
              "write_list": [req.session.user ? req.session.user.name : 'all'],
              "read_list": ['all']
          }}
        },
        { "new": true, "upsert": true },
        function(err,doc) {

          if (err) throw err;
          console.log("Article generated.");
          res.statusCode = 201;//302 nie działa - musi być 201
          res.send({redirect: '/speakers/' + req.body.shortname});
      });
    });

    console.log("New article will be generated with id:" + req.body._id + ", shortname:" + req.body.shortname + ", art_no:"+ req.body.art_no);      
  }
});



// DELETE /addart ----> 
//                <---- SEND redirect: /
// GET /          ---->
router.delete('/addart', function deleteArticle(req, res) {

  if( req.body.shortname ) {

    console.log("DELETE addart ---> Delete artcle with id:["+ req.body._id + "], shortname:" + req.body.shortname + " and title:" + req.body.title); 
    //console.log(req.body.description)
  }

  var db = req.db;
  var collection = db.get('rouxmeet');
  //collection.findOne({ shortname: req.body.shortname }).on('success', function (doc) {});

  if(req.body.art_no == -1) { // delete article

    collection.remove({ "_id": req.body._id }, function (err) {

      if (err) throw err;

      console.log("Article was deleted, id:" + req.body._id);    

      res.statusCode = 201;
      res.send({redirect: '/'}); 
    });
  }
});



// PUT /addart        ----> 
//                    <---- SEND redirect: /speakers/ + req.body.shortname
// GET /speakers/name ---->
router.put('/addart', function updateArticle(req, res) {

  if( req.body.shortname ) {

    console.log("PUT addart ---> Update Artcle with id:["+ req.body._id + "], shortname:" + req.body.shortname + " and title:" + req.body.title); 
    //console.log(req.body.description)
  }

  var db = req.db;
  var collection = db.get('rouxmeet');
  //collection.findOne({ shortname: req.body.shortname }).on('success', function (doc) {});

  //var arl = req.body.read_list ? req.body.read_list.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/) : [],
  //    awl = req.body.write_list ? req.body.write_list.replace(/^\s*|\s*$/g,'').split(/\s*,\s*/) : [];
  //console.log(arl);
  //console.log(awl);
  collection.findAndModify({

      "query": { "_id": req.body._id }, // generates new _id if is empty (for new artcle)
      "update": { "$set": { 

          "art_no": parseInt(req.body.art_no),
          "shortname": req.body.shortname,
          "name": req.body.name,
          "title": req.body.title,
          "summary": req.body.summary, 
          "description": req.body.description
          //"write_list": awl,
          //"read_list": arl
      }}
    },
    { "new": true, "upsert": true },
    function(err,doc) {

      if (err) throw err;
      //console.log( doc );
      //res.statusCode = 201;
      console.log("Article updated.");

      res.statusCode = 201;//302 nie działa - musi być 201
      //redirest generates GET for /addart
      //res.redirect('/addart?_id=' + req.body._id); //You can't make a redirection after an AJAX. You need to do it yourself in Javascript.
      //res.send({redirect: '/addart?_id=' + req.body._id}); ///speakers/Asia_Asia
      res.send({redirect: '/speakers/' + req.body.shortname});
  });
});



// PUT /editusers ----> 
//                <---- SEND redirect: '/editusers'
// GET /editusers ---->
router.put('/editusers', isLoggedIn, function(req, res) {

  // req.app.set('write_text_el', req.body.write_text_el);  
  // req.app.set('read_text_el', req.body.read_text_el);  
  // res.statusCode = 201;
  // res.send({redirect: '/editusers'});

  //save data.write_list and data.read_list to article access
  var collection = req.db.get('rouxmeet');
  var curr_article_id = req.app.get('curr_article_id'); //in curr_article_id id of article have to strored

  if( curr_article_id ) {

    console.log("PUT editusers ---> Find article by current ID: " + curr_article_id);
    collection.findAndModify({

      "query": { "_id": curr_article_id }, // generates new _id if is empty (for new artcle)
      "update": { "$set": { 

          "write_list": req.body.write_list,
          "read_list": req.body.read_list
      }}
    },
    { "new": true, "upsert": true },
    function(err, doc) {

      if( err ) {

        console.log( err.message );
        throw err;
      }
      console.log("Article updated.");
      res.statusCode = 201;//302 nie działa - musi być 201
      res.send({});
      //res.send({redirect: '/speakers/' + req.body.shortname});
    });
  }
});



// GET /editusers ----> 
//                <---- render './auth/users'
router.get('/editusers', isLoggedIn, function(req, res) {


    var collection = req.db.get('rouxmeet');
    var collection_users = req.db.get('users');
    var curr_article_id = req.app.get('curr_article_id'); //in curr_article_id id of article have to strored
    //var curr_article_id = res.curr_article_id


    //var article_read_list = req.app.get('read_text_el') ? req.app.get('read_text_el').replace(/^\s*|\s*$/g,'').split(/\s*,\s*/) : [];
    //var article_write_list = req.app.get('write_text_el') ? req.app.get('write_text_el').replace(/^\s*|\s*$/g,'').split(/\s*,\s*/) : [];

    if( curr_article_id ) {

      console.log("GET editusers ---> Find article by current ID: " + curr_article_id);
      var promise = collection.findById(curr_article_id, function(err, doc) {

        if( err ) { console.log(err.message); }
      });


      promise.on('success', function(doc) {

        // "name": user.name,
        // "pass": user.pass,
        // "salt": user.salt,
        // "age" : user.age,
        // "id"  : user.id,
        // "email": user.email,
        // "phone":user.phone

        collection_users.find({}, {sort: {name: 1}}, function(e, users) {

          console.log('ID finded..');
          res.statusCode = 201;//302 nie działa - musi być 201
          res.render('./auth/users', {

            title: 'Users Access',
            page: 'home',
            article: doc,
            users: users,
            //article_read_list: article_read_list,
            //article_write_list: article_write_list,
            article_read_list: [],
            article_write_list: [],
            username: req.session.user ? req.session.user.name : 'all'
          });
        });
      });
    }
    else {

      console.log("GET editusers ---> Can't find article by current ID, curr_article_id is corrupt");
    }
});



router.get('/chatroom', isLoggedIn, function(req, res) {
  
  res.statusCode = 201;
  res.render('chatroom', {
  
    title: 'Chat Room',
    /*artwork: {},*/
    articles_list: {},
    page: 'chatroom',
    username: req.session.user ? req.session.user.name : 'all'
  });  
});



/*
// GET: www.webapplog.com/?id=10233
// GET: www.webapplog.com/about/?author=10239
// GET: www.webapplog.com/books/?id=10&ref=201
// However, it’s trivial to write your own middleware. It might look like this:

app.use(function (req, res, next) {

  if (req.query.id) {
  // process the id, then call next() when done
  else if (req.query.author) {

  // same approach as with id
  else if (req.query.id && req.query.ref) {

  // process when id and ref present
  } 
  else {

    next();
  }
});


app.get('/about', function (req, res, next) {

  // this code is executed after the query string middleware
});
*/


/* -- nie używane?
// for find button (not used)
// render addart.ejs
router.put('/addart/:shortname', function(req, res) {

  var shortname = req.params.shortname;
  var db = req.db;
  var collection = db.get('rouxmeet');
  var query = {shortname: shortname};
  console.log("GET addart ---> By artcle path: " + JSON.stringify(query, null, 4));


  collection.find(query, function(err, articles) {


    if( err ) {
        // If it failed, return error
        console.log(err.message);
    }

  //collection.find({shortname: ''+shortname}, {}, function(e, articles) {
    //articles.forEach(function( item ) {

      //var art_item = [];
      //art_item = art_item.concat( item.title );
      //art_item = art_item.concat( item.art_no );
      //list_of_arts = list_of_arts.concat( art_item );
      console.log(JSON.stringify(articles[0], null, 4));
    //});

    // tutaj zwrócić artykuł, json będzie wypełniał formularz
    res.statusCode = 201;//302 nie działa - musi być 201
    res.send({redirect: '/addart?_id=' + articles[0]._id});

  });
});

*/

// POST HAVE TO BE USED FOR UPDATE/NEW WITH INFORMATION FROM FORM IN REQ.BODY
// assuming POST: name=foo&color=red            <-- URL encoding
//
// or       POST: {"name":"foo","color":"red"}  <-- JSON encoding
//server get "POST" with request from client, some response is needed from server
router.post('/addart2', function addArticle (req, res) {

  var db = req.db;
  var collection = db.get('rouxmeet');

  // Get our form values. These rely on the "name" attributes
  var v_art_no = req.body.art_no;
  var v_title = req.body.title;
  var v_name = req.body.name;
  var v_shortname = req.body.shortname;
  var v_summary = req.body.summary;
  var v_description = req.body.description;

  console.log('POST from client is processing on server!');

  if( v_art_no == ""  ) {

    collection.find({}, {sort: {art_no: 1}}, function(e, articles) {

      var next_art_no = 0;
      articles.forEach(function( item ) {

        next_art_no = item.art_no;
      });
      next_art_no += 1;
      collection.insert({ shortname: v_shortname, title: v_title, art_no: next_art_no, summary: v_summary, name: v_name, description: v_description} , function (err, doc) {
          if (err) {
              // If it failed, return error
              res.send("There was a problem adding the information to the database.");
          }
          else {
              // And forward to success page
              res.redirect("/arts");
          }
      });
    });
  }
  else if(v_art_no == -1) {

    collection.remove({shortname: v_shortname}, function( err ) {

          if( err ) {
              // If it failed, return error
              res.send("There was a problem removing the art from the database.");
          }
          else {
              // And forward to success page
              res.redirect("/arts");
          }
    });
  }
  else {

    collection.find({art_no: v_art_no}, {sort: {art_no: 1}}, function(e, articles) {

      var next_art_no = 0;
      articles.forEach(function( item ) {

        next_art_no = item.art_no;
      });
      next_art_no += 1;
      collection.insert({ shortname: v_shortname, title: v_title, art_no: next_art_no, summary: v_summary, name: v_name, description: v_description} , function (err, doc) {
          if (err) {
              // If it failed, return error
              res.send("There was a problem adding the information to the database.");
          }
          else {
              // And forward to success page
              res.redirect("/arts");
          }
      });
    });
  }
});

module.exports = router;
