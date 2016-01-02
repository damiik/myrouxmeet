var bcrypt = require('bcrypt');
var monk = require('monk');

var db = monk('damii:damii86@ds037185.mongolab.com:37185/damii');

//var redis = require('redis');
//var db = redis.createClient();

module.exports = User;

// For example, new User({ name: 'Tobi' }) creates an object 
// and sets the object’s name property to Tobi.

function User( obj ) {

	for( var key in obj ) {

		this[ key ] = obj[ key ];
	}
}

/*
// Generates hash using bCrypt
var createHash = function(password) {

  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
*/
/*
var isValidPassword = function(user, password) {

  return bCrypt.compareSync(password, user.password);
}
*/

User.prototype.save = function( fn ) {

  var collection_users = db.get('users');

	if( this.id ) this.update( fn ); // user already exists
 	else {

 		// new user will be created if user.name will be not finded in database
		var user = this;
		user.id = collection_users.id();
		user.hashPassword( function( err ) {					// hash password

		    collection_users.findAndModify({

		          "query": { "name": user.name }, 
		          "update": { "$set": { 

		              "pass": user.pass,
		              "salt": user.salt,
		              "age" : user.age,
		              "id"  : user.id,
		              "email": user.email,
		              "phone":user.phone
		          }}
		        },
		        { "new": true, "upsert": true },
		        function(err, doc) {

					if(err) return fn(err);
					fn(null, doc);
				}
			);
		});
	}
};



// save user properties
User.prototype.update = function( fn ) {  // update by user db id

	var user = this;
	var collection_users = db.get('users');

	user.hashPassword( function( err ) {					//hash password

	    collection_users.findAndModify({

	          "query": { "_id": user.id }, 
	          "update": { "$set": { 

	              "name": user.name,
	              "pass": user.pass,
	              "salt": user.salt,
	              "age" : user.age,
	              "id"  : user.id,
	              "email": user.email,
	              "phone":user.phone
	          }}
	        },
	        { "new": true, "upsert": true },
	        function(err, doc) {

				if(err) return fn(err);
			}
		);
	});
};


User.prototype.hashPassword = function( fn ) {

	var user = this;
	bcrypt.genSalt(12, function(err, salt) {

		if(err) return fn(err);
		user.salt = salt;
		bcrypt.hash(user.pass, salt, function(err, hash) {

			if(err) return fn(err);
			user.pass= hash;
			fn();
		});
	});
};



// ------------------------------------ Test functions -----------------------------------
/*
var tobi = new User({
	name:'damii',
	pass:'freedom',
	age:'44'
});

tobi.save(function(err){
	if(err)throw err;
	console.log('userid%d', tobi.id);
});
*/



// return new user object created from data extracted from db of users by user name.
User.getByName = function(name, fn) {

	var collection_users = db.get('users');
	var promise = collection_users.findOne({$query: { "name": name }});

	promise.on('success', function ( user ) {

		//console.log("user found in base:" + name);

		if( user ) fn(null, new User( user ));
		else fn(null, null);
		//else fn("users.FindOne:Can't find user with name [" + name + "]"); // no user in database but this is not an error
	});

	promise.on('error', function( err ) {

		console.log('ERROR: User.getByName error');
		return fn( err );
	});
};



// ------------------------------------ Test functions -----------------------------------
/*
User.getByName("Tobi Senior2", function(err, user) {

	if( err ) throw err;
	if( user ) console.log("User " + user.name + ", age:" + user.age);
	else  // if user not finded err=null and this not stops application (only message appears)
	  console.log("Can't find user");
});

User.getByName("Tobi Senior", function(err, user) {

	if( err ) throw err;
	if( user ) console.log("User " + user.name + ", age:" + user.age);
	else  // if user not finded err=null and this not stops application (only message appears)
	  console.log("Can't find user");
});
*/

// return fn(null, user) if password is correct, fn(err) with error if not or fn(null) if no user
User.authenticate = function(name, pass, fn) {

	User.getByName(name, function(err, user) {

		if( err ) return fn( err );
		if( !user ) return fn();

		console.log("User.authenticate:"+name+" with password:"+pass);

		bcrypt.hash(pass, user.salt, function(err, hash) {

			if( err ) return fn( err );
			if(hash == user.pass) return fn(null, user);
			else
			  fn();
		});
	});
};

// ------------------------------------ Test functions -----------------------------------
/*
User.authenticate("Tobi Senior", "ima freeedom", function(err, user) {

	if( err ) throw err;
	if( user ) console.log("User authenticated! " + user.name + ", age:" + user.age);
	else  // if user not finded err=null and this not stops application (only message appears)
	  console.log("Wrong password or wrong user name.");
});
*/






/*
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = mongoose.Schema({

	local: {
		username: String,
		password: String
	}
});


userSchema.methods.generateHash = function( password ) {

	return bcrypt.hashSync(password, bcrypt.genSaltSync( 9 ));
}


userSchema.methods.validPassword = function( password ) {

	return bcrypt.compareSync(password, this.local.password);
}


module.exports = mongoose.model('User', userSchema);
*/