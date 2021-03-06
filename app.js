//https://github.com/planetoftheweb
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride  = require("method-override");
var MongoStore = require('connect-mongo')(session);
var monk = require('monk');
var flash = require('connect-flash');
var http = require('http');
//var io = require('socket.io')(http);
//var dt = require( 'datatables.net' );


// SZYBKI START....
// C:\SourceCode\Javascript\express_generator\rouxmeet>node ./bin/www
// mongod --dbpath c:/mongodb/data/webdev

// The Elements 
// * how they interact, connect, relay energy
// * the elements point of view as opposite to structure pov
// * we don't define any structures and don't distinct between structures
// * we concentrate on elements, structures don't have to be defined but rather appears as result of elements 
// * elements are atomic building blocks

// Płynąca woda pozostaje świeża - musisz ciągle płynąć.. - Bruce Lee


//https://www.youtube.com/watch?v=Zao1BWC-RWo
//https://www.youtube.com/watch?v=Zao1BWC-RWo&feature=youtu.be&t=4070

//ctrl+D ctrl+shift+D duplikuje linię 

// lt --port 3000 --subdomain darek
// Script-Fu: Batch Scale/Level/Sharpen   0.08
//C:\SourceCode\Javascript\express_generator\rouxmeet\public\images\artwork\*.jpg

//c:\windows\system32\drivers\etc\hosts


// instalacja na cloud9
// rm -rf /node_modules
// npm install
// CWD - ustawić na katalog projektu
// mongodb - ustawić w programie process.env.IP zamiast localhost




var db = monk('damii:damii86@ds037185.mongolab.com:37185/damii');

// db.rouxmeet.update({shortname:"Introverts"}, {$set:{art_no:4}})
// db.rouxmeet.update({}, {$set:{write_list:['damii']}}, {multi:true} )
// db.rouxmeet.copyTo("rouxmeet_20151128")
// db.rouxmeet.remove({'shortname':'Asia_Asia2'}, {})
// db.createCollection("users", {} )
// db.somecollection.drop()
// db.rouxmeet_20151205.find({shortname:'Asia_Asia'}).limit(1).forEach(function(x){ db.rouxmeet.insert(x)})
// db = db.getSiblingDB("otherdb")  <<<<<< instead of use in script mode
// mongoexport --db test --collection rouxmeet --out articles.json
// mongoimport --drop -d test -c rouxmeet  articles.json

//db.rouxmeet_20151205.find({shortname:'Asia_Asia'}).limit(1).forEach(function(x){ db.rouxmeet.insert(x)})
//db.rouxmeet.insert(db.rouxmeet_20151205.find({shortname:'Asia_Asia'}).limit(1))

// var descript = db.rouxmeet_20151205.findOne({shortname:'Asia_Asia'}).description;
// db.rouxmeet.update({shortname:"Asia_Asia"}, {$set:{description:descript}});
// 
/* json example

[{
    "title" : "Pasieka",
  },{
    "title" : "Krajobrazy",
  },{
    "title" : "Różne",
  },{
    "title" : "HSP",
  }]

*/

app = express(); // witout var app is global now and accesible in routes (if routes are below this line)


require( './modules/passport' )( passport );

var curr_article_id = null;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// would expose to:
// settings.curr_article_id in the view template
// app.locals.settings.curr_article_id
// app.settings.curr_article_id
app.set('curr_article_id', curr_article_id); // var curr_article_id = req.app.get('curr_article_id');

app.disable('etag');

 // morgan for logging information
app.use(logger('dev'));

// Provides req.cookies and req.signedCookies for subse-quent middleware to use.
app.use(cookieParser());

// Provides req.body and req.files with the submitted data for subsequent middle-ware to use.
// The registration form uses the object notation user[name], which translates to req.body.user.name
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Allows you to fake req.method for browsers that can’t use the proper method. Depends on bodyParser.
app.use(methodOverride());


//app.response.some_variable;


// session setup
// ----------------------------------------------------------------------------
/*
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'iloveewelinasomuchandthatsall',
    store: new MongoStore({url: 'mongodb://localhost:27017/test'})
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
*/


app.use(session({secret: 'anystringoftext',
         saveUninitialized: true,
         resave: true})); //store: (in user class)

app.use( passport.initialize() );
app.use( passport.session() ); // persistent login sessions
app.use( flash() ); // use connect-flash for flash messages stored in session



// serve all files from public folder
app.use(express.static(path.join(__dirname, 'public')));


// Make our db accessible to our router
app.use(function(req, res, next) {

    req.db = db;
    next();
});



app.locals.appdata = require('./data.json');

// load the router module in the app (from Express4, multiple routers are possible instead ouf one app router)
var mainRouter = require('./routes/index');   // index.js with 3 pages: home, artistlist, artistdetails
app.use('/', mainRouter);


//require('./routes/auth.js')(app, passport);
var loginRouter = require('./routes/auth')( passport );
app.use('/login', loginRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});





// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
