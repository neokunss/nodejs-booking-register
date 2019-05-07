const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Users = mongoose.model("Users");
const Reservation = mongoose.model("Reservation");
// const Address = mongoose.model("Address");
// const Reservation = mongoose.model("Reservation");

var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");

const crypto = require("crypto");
const { check, validationResult } = require("express-validator/check");
const { matchedData, sanitize } = require("express-validator/filter");

// `router.post(
// 	"/signup",
// 	passport.authenticate("local-signup", {
// 		successRedirect: "/auth/profile",
// 		failureRedirect: "auth/signup"
// 	})
// );

// router.post(
// 	"/login",
// 	passport.authenticate("local-login", {
// 		successRedirect: "/auth/profile",
// 		failureRedirect: "auth/login"
// 	})
// );
// router.get("/profile", ensureLoggedIn, (req, res) => {
// 	res.status(200).json(req.user);
// });
// router.get("/logout", ensureLoggedIn, (req, res) => {
// 	req.logout();
// 	res.status(200).json({
// 		message: "successfully logout"
// 	});
// });`

router.get("/login", function(req, res) {
	if (req.isAuthenticated()) {
		res.redirect("/user/payment_profile");
	} else {
		res.render("page-user-login", {
			message: req.flash(),
			title: "Login"
		});
	}
});

router.post("/login", function(req, res, next) {
	passport.authenticate("local-login", {
		successRedirect: "/user/payment_profile",
		failureRedirect: "/user/login",
		failureFlash: true,
		message: req.flash()
	})(req, res, next);
});

router.post("/register", function(req, res, next) {
	passport.authenticate("local-signup", {
		successRedirect: "/user/payment_profile",
		failureRedirect: "/user/register",
		failureFlash: true,
		message: req.flash()
	})(req, res, next);
});

router.get("/logout", ensureLoggedIn, (req, res) => {
	req.logout();
	req.session.destroy();
	res.redirect("/user/login");
});

router.get("/register", function(req, res, next) {
	res.render("page-user-register", { title: "Registration" });
});

// /* POST user registration page. */
// router.post(
// 	"/registerss",
// 	[
// 		check("full_name", "Name cannot be left blank").isLength({ min: 1 }),

// 		check("email")
// 			.isEmail()
// 			.withMessage("Please enter a valid email address")
// 			.trim()
// 			.custom(value => {
// 				return findUserByEmail(value).then(User => {
// 					//if user email already exists throw an error
// 				});
// 			}),

// 		check("password")
// 			.withMessage("Password must be at least 5 chars long")
// 			.withMessage("Password must contain one number")
// 			.custom((value, { req, loc, path }) => {
// 				if (value !== req.body.cpassword) {
// 					// throw error if passwords do not match
// 					throw new Error("Passwords don't match");
// 				} else {
// 					return value;
// 				}
// 			}),
// 		// check("dob", "Date of birth cannot be left blank").isLength({ min: 1 }),
// 		check("terms", "Please accept our terms and conditions").equals("yes")
// 	],
// 	function(req, res, next) {
// 		const errors = validationResult(req);
// 		// console.log(json({ errors: errors.array() }));
// 		if (!errors.isEmpty()) {
// 			req.flash("err", "errors"); //test
// 			res.json({
// 				message: errors,
// 				status: "error"
// 			});
// 		} else {
// 			const salt_key = crypto.randomBytes(16).toString("hex");
// 			const hash_key = genHash(req.body.password, salt_key);

// 			var document = {
// 				full_name: req.body.full_name,
// 				email: req.body.email,
// 				password: req.body.password,
// 				salt: salt_key,
// 				hash: hash_key
// 			};
// 			var user = new Users(document);

// 			user.save(function(error) {
// 				console.log(user);
// 				if (error) {
// 					throw error;
// 				}
// 				// res.flash("Data saved successfully.");
// 				req.flash("success_msg", "Data saved successfully.");
// 				res.json({ message: "Data saved successfully.", status: "success" });
// 			});
// 		}
// 	}
// );

router.post("/payment_profile", function(req, res, next) {
	let query = { _id: req.user.id };

	// console.log(data);
	var newvalues = {
		paymentProfile: req.body
	};
	Users.update(query, newvalues, function(err) {
		if (err) {
			console.log(err);
			return;
		} else {
			// req.flash("success", "Article Updated");
			// res.json({
			// 	message: "Data saved successfully.",
			// 	status: "success"
			// });
			res.redirect("/user/reservation");
		}
	});
});

router.get("/payment_profile", ensureLoggedIn, function(req, res, next) {
	// console.log(req.url, req.user._id);
	console.log(JSON.stringify(req.user.paymentProfile));

	res.render("page-user-payment_profile", {
		title: "Payment Profile & Billing Information",
		message: req.flash(),
		data: req.user
	});
});

router.get("/reservation", ensureLoggedIn, function(req, res, next) {
	// console.log(JSON.stringify(req.user));
	Reservation.findOne({ _user: req.user.id }).exec((err, doc) => {});
	res.render("page-user-reservation", {
		title: "Reserve your tickets",
		user: req.user
	});
});

router.get("/4", ensureLoggedIn, function(req, res, next) {
	res.render("page-register-4", { title: "Thank you!" });
});

router.get("/invoice", ensureLoggedIn, function(req, res, next) {
	res.render("page-user-invoice", { title: "Thank you!" });
});

function findUserByEmail(email) {
	if (email) {
		return new Promise((resolve, reject) => {
			Users.findOne({ email: email }).exec((err, doc) => {
				if (err) return reject(err);
				if (doc)
					return reject(
						new Error("This email already exists. Please enter another email.")
					);
				else return resolve(email);
			});
		});
	}
}

module.exports = router;

//route middleware to ensure user is logged in
function ensureLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else res.redirect("/user/login");
}

function genHash(password, salt) {
	const hash = crypto
		.pbkdf2Sync(password, salt, 10000, 512, "sha512")
		.toString("hex");
	return hash;
}
