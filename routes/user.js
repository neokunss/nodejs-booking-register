const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Users = mongoose.model("Users");
const Reservation = mongoose.model("Reservation");
const InvoiceReceipt = mongoose.model("InvoiceReceipt");
const nodemailer = require("nodemailer");
// const Address = mongoose.model("Address");
// const Reservation = mongoose.model("Reservation");
var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");
// var flash = require("express-flash");

const crypto = require("crypto");
const { check, validationResult } = require("express-validator/check");
const { matchedData, sanitize } = require("express-validator/filter");

router.get("/", function(req, res) {
	if (req.isAuthenticated()) {
		res.redirect("/user/payment_profile");
	} else {
		res.render("page-user-login", {
			message: req.flash(),
			title: "Login"
		});
	}
});

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
		failureFlash: true
	})(req, res, next);
});

router.get("/logout", ensureLoggedIn, (req, res) => {
	req.logout();
	req.session.destroy();
	res.redirect("/user/login");
});

router.post("/register", function(req, res, next) {
	passport.authenticate("local-signup", {
		successRedirect: "/user/payment_profile",
		failureRedirect: "/user/register?full_name",
		failureFlash: true
	})(req, res, next);
	console.log(req.body.full_name);
});

router.get("/register", function(req, res) {
	// res.body.full_name
	res.render("page-user-register", {
		title: "Registration",
		messages: res.locals.messages,
		success_msg: res.locals.success_msg,
		error_msg: res.locals.error_msg,
		error: res.locals.error,
		info: res.locals.info

		// data: req.user
	});
	// sendVerifyEmail("kun.srithaporn@gmail.com", "/user/verification");
});

router.get("/verification", ensureLoggedIn, function(req, res) {
	var verificationLinkUrl =
		req.protocol +
		"://" +
		req.get("host") +
		"/user/verification/" +
		req.user.id;
	// console.log(req.user.email, verificationLinkUrl);
	sendVerifyEmail(req.user.email, verificationLinkUrl);
	res.render("page-user-verification", {
		title: "Confirm your email address",
		messages: res.locals.messages,
		success_msg: res.locals.success_msg,
		error_msg: res.locals.error_msg,
		error: res.locals.error,
		info: res.locals.info,
		verificationLink: verificationLinkUrl
		// data: req.user
	});
});

router.get("/verification/:userid", function(req, res) {
	const userid = req.params.userid;
	console.log(userid);
	Users.findOne({ _id: userid, isVerification: false }).exec((err, user) => {
		console.log(user);
		user.isVerification = true;
		user.save(function(err) {
			if (err) {
				console.error("ERROR!");
			} else {
				req.flash("success_msg", "Verification completed, Thank you.");
				res.redirect("/user/payment_profile");
			}
		});
	});
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
			req.flash("success", "Article Updated");
			// res.json({
			// 	message: "Data saved successfully.",
			// 	status: "success"
			// });
			res.redirect("/user/reservation");
		}
	});
});

router.get("/payment_profile", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	// console.log(req.url, req.user._id);
	console.log(JSON.stringify(req.user.paymentProfile));
	res.render("page-user-payment_profile", {
		title: "Payment Profile & Billing Information",
		message: req.flash(),
		data: req.user
	});
});

router.get("/reservation", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	// console.log(JSON.stringify(req.user));
	Reservation.findOne({ _user: req.user.id }).exec((err, doc) => {});
	res.render("page-user-reservation", {
		title: "Reserve your tickets",
		message: req.flash(),
		user: req.user
	});
});

router.post("/reservation", function(req, res, next) {
	let query = { _id: req.user.id };
	// console.log(data);
	var newvalues = {
		paymentProfile: req.body
	};

	console.log(JSON.stringify(req.body));

	// var user = Users.findById(pms.post_id);
	// query.populate('references').exec(function(err, object){
	// console.log(req.body);

	// Users.update(query, newvalues, function(err) {
	// 	if (err) {
	// 		console.log(err);
	// 		return;
	// 	} else {
	// 		req.flash("success", "Article Updated");
	// 		// res.json({
	// 		// 	message: "Data saved successfully.",
	// 		// 	status: "success"
	// 		// });
	// 		res.redirect("/user/reservation");
	// 	}
	// });
	res.redirect("/user/reservation");
});

// router.get("/4", ensureLoggedInVerification, function(req, res, next) {
// 	res.render("page-register-4", { title: "Thank you!" });
// });
router.get("/invoice/:invoiceID", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	res.render("page-user-invoice", {
		title: "Invoice",
		address: req.user.paymentProfile
	});
});
router.get("/invoice", ensureLoggedInVerification, function(req, res, next) {
	InvoiceReceipt.findOne({ _user: req.user.id }).exec((err, data) => {
		console.log(data.orderID);
		// const invoice = data;
	});

	res.render("page-user-invoice", {
		title: "Invoice",
		user: req.user,
		address: req.user.paymentProfile
		// invoice: invoicereceipt
	});
});

router.get("/receipt/:receiptID", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	res.render("page-user-invoice", { title: "Receipt" });
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

//route middleware to ensure user is logged in
function ensureLoggedInVerification(req, res, next) {
	if (req.isAuthenticated()) {
		if (req.user.isVerification) {
			return next();
		} else res.redirect("/user/verification");
	} else res.redirect("/user/login");
}

function genHash(password, salt) {
	const hash = crypto
		.pbkdf2Sync(password, salt, 10000, 512, "sha512")
		.toString("hex");
	return hash;
}

function sendVerifyEmail(toEmail, content) {
	let transporter = nodemailer.createTransport({
		// host: process.env.NODEMAILER_HOST,
		// port: process.env.NODEMAILER_PORT,
		// secureConnection: "false",
		// tls: {
		// 	ciphers: "SSLv3"
		// },
		service: process.env.NODEMAILER_SERVICE,
		auth: {
			user: process.env.NODEMAILER_USER,
			pass: process.env.NODEMAILER_PASS
		}
	});

	let mailOptions = {
		from: process.env.NODEMAILER_USER, // sender
		to: toEmail, // list of receivers
		subject: "Verify you email from DTCC Booking System", // Mail subject
		html:
			"A verification link <a href='" +
			content +
			"'> Click to verify your Email </a>"
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			return console.log(error);
		}
		console.log("Message sent: " + info.response);
	});
}
