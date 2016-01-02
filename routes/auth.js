var express = require('express');
var router = express.Router();

var User = require('../modules/user');
var fs = require('fs');
//var appdata = require('../data.json');
/*
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
*/

//module.exports = function(app, passport) {
module.exports = function( passport ) {

	// all paths are relative to /login
	//-----------------------------------------

	router.get('/', function(req, res) {

		res.render('./auth/login.ejs', { message: req.flash('loginMessage'), username:req.flash('loginUsername'), title:'login'});
	});


	router.post('/', passport.authenticate('local-login', {

		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true
	}));


	router.get('/signup', function(req, res){

		res.render('./auth/signup.ejs', { message: req.flash('signupMessage'), title:'new user', username:req.flash('loginUsername') });
	});


	router.post('/signup', passport.authenticate('local-signup', {

		successRedirect: '/login',
		failureRedirect: '/login/signup',
		failureFlash: true 
	}));
/*
	router.get('/', isLoggedIn, function(req, res) {

		var db = req.db;
  		var collection = db.get('rouxmeet');
  		collection.find({ $and : [{art_no: {$ne: 0.0}}, {art_no: {$ne: "0"}}]}, {sort: {art_no: 1}}, function(e, articles) {

			res.render('index', { user: req.user, title: 'Home', articles_list: articles, artwork: myArtwork, page: 'home' });
		});
	});


	function isLoggedIn(req, res, next) {

		if( req.isAuthenticated() )	return next();
		res.redirect('/login');
	}

	function requireAuth(req, res, next){

	  // check if the user is logged in
	  if(!req.isAuthenticated()){
	    req.session.messages = "You need to login to view this page";
	    res.redirect('/login');
	  }
	  next();
	}
*/
	router.get('/logout', function(req, res){

		req.logout();
		req.session.user = null;
		res.redirect('/');
	})

	return router;
};

