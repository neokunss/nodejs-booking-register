const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Users = mongoose.model("Users");
const Reservation = mongoose.model("Reservation");
const InvoiceReceipt = mongoose.model("InvoiceReceipt");
const nodemailer = require("nodemailer");
const EmailTemplate = require("email-templates").EmailTemplate;
const Email = require("email-templates");

const cachePugTemplates = require("cache-pug-templates");
const redis = require("redis");

var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var flash = require("connect-flash");
// var flash = require("express-flash");

const crypto = require("crypto");
const { check, validationResult } = require("express-validator/check");
const { matchedData, sanitize } = require("express-validator/filter");

let transporter = nodemailer.createTransport({
	service: "Outlook365",
	auth: {
		user: "kun.srithaporn@gmail.com",
		pass: "killopop!3651"
	}
});

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
	const userid = req.user.id;
	let verificationLinkUrl =
		req.protocol +
		"://" +
		req.get("host") +
		"/user/verification/email/" +
		userid;

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

router.get("/verification/email/:userid", function(req, res) {
	const userid = req.user.id;
	let verificationLinkUrl =
		req.protocol +
		"://" +
		req.get("host") +
		"/user/verification/email/" +
		userid;

	let mailOptions = {
		from: process.env.NODEMAILER_USER, // sender
		to: req.user.email, // list of receivers
		subject: "Verify you email from DTCC Booking System", // Mail subject
		html:
			"<h</h1>Confirm registration e-mail</h1>" +
			"<br>Now you are just one step away from activating your account to take part in Danish - Thai gala !" +
			"<br>Click the link below and start reserving your tickets." +
			"<br><a href='" +
			verificationLinkUrl +
			"'>Verify link</a>"
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) return console.log(error);
		console.log("Message sent: " + info.response);
	});

	// var sendConfirm = transporter.templateSender(
	// 	new EmailTemplate("email/mars"),
	// 	{
	// 		from: "ks@bang-olufsenth.com",
	// 		to: req.user.email, // list of receivers
	// 		subject: "Verify you email from DTCC Booking System" // Mail subject
	// 	}
	// );

	// var context = {
	// 	email: req.user.email,
	// 	name: req.user.email,
	// 	link: verificationLinkUrl
	// };

	// send(sendConfirm, context, function(error, info) {
	// 	if (error) return console.log(error);
	// 	console.log("Message sent: " + info.response);
	// });});

	// send mail with defined transport object

	res.redirect("/user/verification");
});

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
			res.redirect("/verification");
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
	let query = { _id: req.user.id };
	// let query = { _id: "5cd667cfa68c2f184c82ec7f" };
	Reservation.findOne(query).exec((err, doc) => {});
	res.render("page-user-reservation", {
		title: "Reserve your tickets",
		message: req.flash(),
		user: req.user
	});
});

router.post("/reservation", function(req, res, next) {
	let query = { _id: req.user.id };
	// const query = { _id: "5cd667cfa68c2f184c82ec7f" };

	const reserve = JSON.stringify(req.body);
	var newvalues = {
		reservations: req.body
	};

	var wwwww = JSON.parse(reserve);
	console.log(wwwww);
	// let reserveObj = JSON.parse(newvalues.reservations);
	// const reservations = newvalues.reservations;
	// console.log(req.body);
	// console.log(reserveObj);
	// $.each(xxxx, function(key, value) {
	// 	console.log(xxxx.length);
	// 	// $.each(reserveObj[key], function(k, v) {});
	// });

	// Reservation.findOne(query)
	// 	.populate("Users")
	// 	.exec(function(error, user) {
	// 		console.log(user);
	// 		Reservation.update(
	// 			{ title: "MongoDB Overview" },
	// 			{ $set: newvalues.reservations },
	// 			{ multi: true }
	// 		);
	// 	});
	res.redirect("/user/reservation");
});

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

router.get(
	"/paypal-transaction-complete/email",
	ensureLoggedInVerification,
	function(req, res, next) {
		let mailOptions = {
			from: process.env.NODEMAILER_USER, // sender
			to: req.user.email, // list of receivers
			subject: "Verify you email from DTCC Booking System", // Mail subject
			html: "ssssss"
		};

		const email = new Email({
			transport: transporter,
			send: true,
			preview: false
		});
		cachePugTemplates(redisClient, email.config.views.root);
		email
			.send({
				template: "email/transaction-complete",
				message: {
					from: process.env.NODEMAILER_USER, // sender
					to: req.user.email
				},
				locals: {
					fname: "John",
					lname: "Snow"
				}
			})
			.then(() => console.log("email has been sent!"));

		res.redirect("/user/paypal-transaction-complete");
	}
);

router.get("/paypal-transaction-complete", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	// InvoiceReceipt.findOne({ _user: req.user.id }).exec((err, data) => {
	// 	console.log(data.orderID);
	// 	// const invoice = data;
	// });
	res.render("page-user-complete", {
		title: "Transaction completed",
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

module.exports = router;
