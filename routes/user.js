const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
var passport = require("passport");
const crypto = require("crypto");
const SMTPServer = require("smtp-server").SMTPServer;
// const server = new SMTPServer(options);

const Users = mongoose.model("Users");
const Reservations = mongoose.model("Reservations");
const InvoiceReceipt = mongoose.model("InvoiceReceipt");

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

	const file = path.join(__dirname, "../email/templete-2.html");
	var htmlData = fs.readFileSync(file, "utf8");
	// data = data.toString();
	htmlData = htmlData.replace(/##firstname/gi, "Pongnarong Jingjamikorn");
	htmlData = htmlData.replace(/##verificationLinkUrl/gi, verificationLinkUrl);

	emailVerify(email, htmlData).catch(console.error);
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
		"s://" +
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
	const userid = req.user.id || req.params.userid;
	let verificationLinkUrl =
		req.protocol + "s://" + req.get("host") + "/user/verification/" + userid;

	const file = path.join(__dirname, "../email/templete-2.html");
	var htmlData = fs.readFileSync(file, "utf8");
	// data = data.toString();
	htmlData = htmlData.replace(
		/##firstname/gi,
		req.user.paymentProfile.firstName + " " + req.user.paymentProfile.lastName
	);
	htmlData = htmlData.replace(/##verificationLinkUrl/gi, verificationLinkUrl);

	emailVerify(req.user.email, htmlData).catch(console.error);

	res.redirect("/user/verification");
});

router.post("/payment_profile", function(req, res, next) {
	let query = { _id: req.user.id };
	// console.log(data);
	var newvalues = {
		paymentProfile: req.body
	};
	Users.update(query, newvalues, function(err, user) {
		if (err) {
			console.log(err);
			return;
		} else {
			req.flash("success", "Payment Profile Updated");
			// res.json({
			// 	message: "Data saved successfully.",
			// 	status: "success"
			// });
			console.log(user);
			res.redirect("/user/reservation");
		}
	});
});

router.get("/payment_profile", ensureLoggedInVerification, function(req, res) {
	// console.log(req.url, req.user._id);
	console.log(JSON.stringify(req.user.paymentProfile));
	res.render("page-user-payment_profile", {
		title: "Payment Profile & Billing Information",
		message: req.flash(),
		data: req.user
	});
});

router.get("/reservation", ensureLoggedInVerification, function(req, res) {
	let query = { _id: req.user.id };
	// const query = { _id: "5cd667cfa68c2f184c82ec7f" };
	Reservations.find(query).exec((err, doc) => {
		if (!err) {
			res.render("page-user-reservation", {
				title: "Reserve your tickets",
				message: req.flash(),
				user: req.user,
				data: doc
			});
		} else {
			return console.log(err);
		}
	});
});

router.post("/reservation", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	let query = { _id: req.user.id };
	// const query = { _id: "5cd667cfa68c2f184c82ec7f" };
	console.log(req.user.id);

	const reserve = JSON.stringify(req.body);
	let reserveObj = JSON.parse(reserve);

	const reservations = [];
	// console.log(req.body.reservation["0"]["firstName"]);

	for (var i = 0; i < reserveObj["reservations[email][]"].length; i++) {
		let reservation = {
			_user: req.user.id,
			firstName: reserveObj["reservations[firstName][]"][i],
			lastName: reserveObj["reservations[lastName][]"][i],
			email: reserveObj["reservations[email][]"][i],
			food: reserveObj["reservations[food][]"][i]
		};
		if (
			reserveObj["reservations[firstName][]"][i] != "" &&
			reserveObj["reservations[lastName][]"][i] != "" &&
			reserveObj["reservations[email][]"][i] != "" &&
			reserveObj["reservations[food][]"][i] != ""
		) {
			reservations.push(reservation);
		}
	}

	var newvalues = {
		seat: reserveObj.seat
	};
	console.log(reservations);

	Users.update(query, { $set: newvalues }, function(err, user) {
		if (err) {
			console.log(err);
			return;
		} else {
			console.log(reservations.length);
			for (var i = 0; i < reservations.length; i++) {
				var newUser = new Reservations(reservations[i]);
				console.log(reservations[i]);
				newUser.save(function(error) {
					console.log(user);
					if (err) throw err;
					res.redirect("/user/reservation");
					req.flash("success_msg", "Data saved successfully.");

					// return done(null, newUser);
				});
			}
			// Reservations.insertMany(reservations, function(error, reservation) {
			// 	req.flash("success", "Reservation Updated");
			// 	// res.json({
			// 	// 	message: "Data saved successfully.",
			// 	// 	status: "success"
			// 	// });
			// 	console.log(user);
			// 	res.redirect("/user/reservation");
			// });
		}
	});
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

	emailComplete(req.user.email, htmlData).catch(console.error);
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
		} else res.redirect("/user/verification/");
	} else res.redirect("/user/login");
}

function genHash(password, salt) {
	const hash = crypto
		.pbkdf2Sync(password, salt, 10000, 512, "sha512")
		.toString("hex");
	return hash;
}

module.exports = router;

// async..await is not allowed in global scope, must use a wrapper
async function emailVerify(userEmail, html, data) {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: "smtpout.secureserver.net",
		port: 465,
		secure: true,
		auth: {
			user: process.env.NODEMAILER_USER, // generated ethereal user
			pass: process.env.NODEMAILER_PASS // generated ethereal password
		}
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"DTCC Booking System 👻" <' + process.env.NODEMAILER_USER + ">", // sender address
		to: userEmail, // list of receivers
		subject: "Verify you email from DTCC Booking System.", // Mail subject
		html: html // html body
	});
	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

	// main(email, htmlData).catch(console.error);
}

// async..await is not allowed in global scope, must use a wrapper
async function emailComplete(userEmail, html, data) {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: "smtpout.secureserver.net",
		port: 465,
		secure: true,
		auth: {
			user: process.env.NODEMAILER_USER, // generated ethereal user
			pass: process.env.NODEMAILER_PASS // generated ethereal password
		}
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"DTCC Booking System 👻" <' + process.env.NODEMAILER_USER + ">", // sender address
		to: userEmail, // list of receivers
		subject: "Thank you for your reservation for the Danish-Thai Gala.", // Mail subject
		html: html // html body
	});
	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

	// emailComplete(email, htmlData).catch(console.error);
}
