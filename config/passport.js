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
				console.log(email, password);
				// asynchronous
				// Users.findOne wont fire unless data is sent back
				process.nextTick(function() {
					// create the user
					var newUser = new Users();
					// set the user's local credentials
					newUser.email = email;
					newUser.password = password; //password is hashed on the model layer
					newUser.full_name = req.body.full_name;
					// save the user
					newUser.save(function(err, user) {
						console.log(email, password);
						if (err || !user) {
							//error handling
							if (err.code === 11000) {
								//email taken
								return done(
									null,
									false,
									req.flash(
										"signupMessage",
										"Sorry, the email " + newUser.email + " has been taken"
									)
								);
							} else {
								//its a hacker
								return done(
									null,
									false,
									req.flash("success_msg", JSON.stringify(err))
								);
							}
						} else {
							console.log("fffffffffffffff");
							return done(null, newUser);
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
