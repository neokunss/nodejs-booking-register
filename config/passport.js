const mongoose = require("mongoose");
const passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

const Users = mongoose.model("Users");

var crypto = require("crypto");

module.exports = function(passport, LocalStrategy) {
	//passport session setup
	//persistent login sessions
	//passport needs ability to serialize and unserialize users out of sessions

	//use to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	//deserialize user
	passport.deserializeUser(function(id, done) {
		Users.findById(id, function(err, user) {
			// console.log(user);
			done(err, user);
		});
	});
	//local signup
	//using named strategies one for login and one for signup
	//by default if there was no name it would be called 'local'
	passport.use(
		"local-signup",
		new LocalStrategy(
			{
				// by default, local strategy uses username and password, we will override with email
				usernameField: "email",
				passwordField: "password",
				passReqToCallback: true // allows us to pass back the entire request to the callback
			},
			function(req, email, password, done) {
				console.log(email, password, done);
				// asynchronous
				// Users.findOne wont fire unless data is sent back
				process.nextTick(function() {
					Users.findOne({ email: email }, function(err, user) {
						console.log("err");
						if (err) return done(err);
						if (user) {
							return done(
								null,
								false,
								req.flash("error_msg", "That email is already taken.")
							);
						} else {
							const salt_key = crypto.randomBytes(16).toString("hex");
							const hash_key = genHash(password, salt_key);

							var document = {
								full_name: req.body.full_name,
								email: req.body.email,
								password: req.body.password,
								salt: salt_key,
								hash: hash_key
							};

							var newUser = new Users(document);
							console.log(newUser);

							newUser.save(function(error, user) {
								console.log("New user : " + user);
								console.log("Error : " + error);
								if (error) throw error;
								req.flash("success_msg", "Data saved successfully.");
								return done(null, user);
							});
						}
					});
				});
			}
		)
	);

	passport.use(
		"local-login",
		new LocalStrategy(
			{
				// by default, local strategy uses username and password, we will override with email
				usernameField: "email",
				passwordField: "password",
				passReqToCallback: true // allows us to pass back the entire request to the callback
			},
			function(req, email, password, done) {
				// callback with email and password from our form
				// find a user whose email is the same as the forms email
				// we are checking to see if the user trying to login already exists
				Users.findOne({ email: email }, function(err, user) {
					// // if there are any errors, return the error before anything else
					// console.log(password, user.password);
					if (err) return done(err);
					// if no user is found, return the message
					if (!user)
						return done(null, false, req.flash("error_msg", "No user found.")); // req.flash is the way to set flashdata using connect-flash
					// if the user is found but the password is wrong					console.log(!user.validatePassword(password));
					console.log(!user.validatePassword(password));
					if (!user.validatePassword(password))
						return done(
							null,
							false,
							req.flash("error_msg", "Oops! Wrong password.")
						);
					// // create the loginMessage and save it to session as flashdata
					// // all is well, return successful user
					return done(null, user);
				});
			}
		)
	);
};
function genHash(password, salt) {
	const hash = crypto
		.pbkdf2Sync(password, salt, 10000, 512, "sha512")
		.toString("hex");
	return hash;
}
