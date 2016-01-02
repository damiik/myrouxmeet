var LocalStrategy = require('passport-local').Strategy;


var User = require('./user');

module.exports = function( passport ) {


	passport.serializeUser(function(user, done) {

		done(null, user.name);    // name instead id here
	});

	passport.deserializeUser(function(id, done) {

	    User.getByName(id, function(err, user) { done(err, user); });    // name instead id here
	});


	passport.use('local-signup', new LocalStrategy({

		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, done) {

		process.nextTick(function() {

			//User.findOne({'local.username': username}, function(err, user) {
			User.getByName(username, function(err, user) {

				if( err ) return done( err );
				if( user ) return done(null, false, req.flash('signupMessage', 'Użytkownik ' + username + ' już istnieje..'));
				else {

					var tobi = new User({
						name:username,
						pass:password,
						phone:req.body.phone,
						email:req.body.email
					});

					tobi.save(function( err ) {

						if(err) throw err;

						// save data for view templates etc..
						req.session.user = user;

						console.log('userid%d', tobi.id);
						return done(null, tobi);
					});
				}
			});
		});
	}));

	passport.use('local-login', new LocalStrategy({

			usernameField: 'username',
			passwordField: 'password',
			passReqToCallback: true
		},
		function(req, username, password, done) {

			process.nextTick(function() {

				//User.findOne({ 'local.username': username}, function(err, user) {
				User.authenticate(username, password, function(err, user) {

					if( err )	return done( err );
					//if( !user )	return done(null, false, req.flash('loginMessage', 'No User found'));
					if( !user )	return done(null, false, req.flash('loginMessage', 'Użytkownik ' + username + ' nie istnieje lub hasło jest nieprawidłowe.'));
					
					// save data for view templates etc..
					req.session.user = user;
					//if( !user.validPassword( password ) ) {

					//	return done(null, false, req.flash('loginMessage', 'invalid password'));
					//}
					
					return done(null, user);
				});
			});
		}
	));
};