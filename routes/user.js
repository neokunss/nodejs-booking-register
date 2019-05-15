const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
var passport = require("passport");
const crypto = require("crypto");

const Users = mongoose.model("Users");
const Reservation = mongoose.model("Reservation");
const InvoiceReceipt = mongoose.model("InvoiceReceipt");
console.log(process.env.NODEMAILER_SENDGRIDSERVICE);
// const mailset = require('../config/mailsettings.js');
let transporter = nodemailer.createTransport({
	// service: process.env.NODEMAILER_SERVICE,
	// auth: {
	// 	user: process.env.NODEMAILER_USER,
	// 	pass: process.env.NODEMAILER_PASS
	// },
	// debug: true

	service: process.env.NODEMAILER_SENDGRIDSERVICE,
	auth: {
		user: process.env.NODEMAILER_SENDGRID_USER,
		api_key: process.env.NODEMAILER_SENDGRID_API_KEY
	},
	debug: true

	// host: process.env.NODEMAILER_HOST,
	// port: process.env.NODEMAILER_PORT,
	// secure: false,
	// tls: {
	// 	ciphers:'SSLv3'
	// },
	// auth: {
	// 	user: process.env.NODEMAILER_USER,
	// 	pass: process.env.NODEMAILER_PASS
	// },
	// debug: true

	// service: process.env.NODEMAILER_GSERVICE,
	// auth: {
	// 	user: process.env.NODEMAILER_GUSER, // your email
	// 	pass: process.env.NODEMAILER_GPASS // your email password
	// },
	// debug: true
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

router.get("/kun", function(req, res, next) {
	const verificationLinkUrl =
		"https://booking.dadriba.com/user/verification/5cd91277cfd7d20c701b7333";

	const wwwwww = path.join(__dirname, "../email/templete-2.html");
	var data = fs.readFileSync(wwwwww, "utf8");
	// data = data.toString();
	data = data.replace(/##firstname/gi, "Pongnarong Jingjamikorn");
	data = data.replace(/##verificationLinkUrl/gi, verificationLinkUrl);
	let mailOptions = {
		from: "postmaster@sandbox7eb42c5dd2ef4ba484e3388605b2bb96.mailgun.org", // sender
		to: "ks@bang-olufsenth.com", // list of receivers
		subject: "Verify you email from DTCC Booking System.", // Mail subject
		html: "ssssss"
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) return console.log(error);
		console.log("Message sent: " + info.response);
	});
});

https: router.get("/login", function(req, res) {
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
		failureRedirect: "/user/register",
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
	});
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
	Users.findOne({ _id: userid }).exec((err, user) => {
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
	const userid = req.user.id || req.params.userid;
	let verificationLinkUrl =
		req.protocol +
		"://" +
		req.get("host") +
		"/user/verification/email/" +
		userid;

	const wwwwww = path.join(__dirname, "../email/templete-2.html");
	var data = fs.readFileSync(wwwwww, "utf8");
	// data = data.toString();
	data = data.replace(
		/##firstname/gi,
		req.user.paymentProfile.firstName + " " + req.user.paymentProfile.lastName
	);
	data = data.replace(/##verificationLinkUrl/gi, verificationLinkUrl);
	let mailOptions = {
		from: process.env.NODEMAILER_USER, // sender
		to: req.user.email, // list of receivers
		subject: "Verify you email from DTCC Booking System.", // Mail subject
		html: data
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) return console.log(error);
		console.log("Message sent: " + info.response);
	});

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
			req.flash("success", "Payment Profile Updated");
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

router.get("/paypal-transaction-complete/email", function(req, res, next) {
	const wwwwww = path.join(__dirname, "../email/templete-3.html");
	var emaildata = fs.readFileSync(wwwwww, "utf8");
	// data = data.toString();
	emaildata = emaildata.replace(
		/##firstname/gi,
		req.user.paymentProfile.firstName + " " + req.user.paymentProfile.lastName
	);

	let mailOptions = {
		from: process.env.NODEMAILER_USER, // sender
		to: req.user.email, // list of receivers
		subject: "Thank you for your reservation for the Danish-Thai Gala.", // Mail subject
		html: emaildata
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) return console.log(error);
		console.log("Message sent: " + info.response);
	});

	res.redirect("/user/paypal-transaction-complete");
});

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
