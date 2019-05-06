const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Users = mongoose.model("Users");

passport.use(
	new LocalStrategy(
		{
			usernameField: "user[email]",
			passwordField: "user[password]"
		},
		(email, password, done) => {
			Users.findOne({ email })
				.then(user => {
					if (!user || !user.validatePassword(password)) {
						return done(null, false, {
							errors: { "email or password": "is invalid" }
						});
					}

					return done(null, user);
				})
				.catch(done);
		}
	)
);

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});
