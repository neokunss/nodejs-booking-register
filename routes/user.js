const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const passport = require("passport");
const crypto = require("crypto");
const async = require("async");
const emoji = require("node-emoji");

const Users = mongoose.model("Users");
const Reservations = mongoose.model("Reservations");
const Invoicereceipts = mongoose.model("Invoicereceipts");

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

router.get("/kun", ensureLoggedIn, function(req, res, next) {
	// emailComplete("kun.srithaporn@gmail.com", req.user, req.params);
	// emailVerify("kun.srithaporn@gmail.com", req.user, req.params, getVerifyUrl());
	avoidAdminCompletePP("kun.srithaporn@gmail.com", req.user, req.params);
	res.send("ssssss");
});

router.delete("/kun/:id", function(req, res) {
	let query = { _id: req.params.id };

	Users.update(req.user, {
		$unset: { "Users.invoicereceipts.$": "" }
	});
	Invoicereceipts.deleteOne(query, function(err) {
		if (err) throw err;
		console.log("delete: req.body: " + JSON.stringify(req.body));
		Reservations.deleteMany({ _transactionid: req.params.id }, function(err) {
			res.status(200).json({
				message: "Deleted Invoicereceipts"
				// reservations: dataObj.reservations,
				// invoicereceipts: inv
				// obj2: simpleData
			});
		});

		// res.end("Deleted customer: \n" + JSON.stringify(deleteCustomer, null, 4));
	});
});

router.post("/kun", function(req, res) {
	// const json_reservations = {
	// 	invoicereceipts: {
	// 		seat: "3",
	// 		amount: "12900"
	// 	},
	// 	reservations: {
	// 		"0": {
	// 			firstName: "Kun",
	// 			lastName: "Srithaporn",
	// 			email: "kun.srithaporn@gmail.com",
	// 			food: "Meat"
	// 		},
	// 		"1": {
	// 			firstName: "rwqrwq",
	// 			lastName: "rqwrqwr",
	// 			email: "h",
	// 			food: "Fish"
	// 		}
	// 	},
	// 	userID: "5cd667cfa68c2f184c82ec7f"
	// };
	// var dataObj = JSON.parse(JSON.stringify(json_reservations));
	// const query = { _id: "5ce2deba988fde31086aab18" };

	// Invoicereceipts.findOne(query, function(err, inv) {
	// 	if (err) {
	// 		console.log(err);
	// 		return;
	// 	}
	// 	async.forEach(dataObj.reservations, function(reservation, callback) {
	// 		const reserve = new Reservations(reservation);
	// 		reserve._user = inv._user;
	// 		reserve._transactionid = inv._id;
	// 		reserve.save(function(err, user) {
	// 			inv.reservations.push(user);
	// 			inv.save(function(err, inv) {
	// 				return inv;
	// 			});
	// 		});
	// 		// console.log(reserve._user, reserve._transactionid);
	// 	});

	res.status(200).json({
		message: "Welcome to the project-name api",
		// reservations: dataObj.reservations,
		invoicereceipts: inv
		// obj2: simpleData
	});
	// });
});

// router.get("/kun", function(req, res) {
// 	let query = { _id: req.user.id };
// 	// const query = { _id: "5cd667cfa68c2f184c82ec7f" };
// 	Users.findOne(query).exec(function(err, person) {
// 		if (err) throw err;
// 		// console.log(person);
// 		Invoicereceipts.find({ _user: person._id }, function(err, invs) {
// 			if (err) throw err;
// 			// console.log(invs);
// 			Reservations.find({ _user: person._id }, function(err, peoples) {
// 				if (err) throw err;
// 				// console.log(invs);
// 				res.render("page-user-reservation", {
// 					title: "Reserve your tickets",
// 					message: req.flash(),
// 					user: person,
// 					invoicereceipts: invs,
// 					reservations: peoples
// 				});
// 			});
// 		});
// 	});
// });

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
	console.log(emoji.emojify("I :unknown_emoji: :star: :another_one:"));
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
		successRedirect: "/user/register/verification/email/",
		failureRedirect: "/user/register",
		failureFlash: true
	})(req, res, next);
});

router.get("/register", function(req, res) {
	// console.log(req.body);
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

router.get("/register/verification/email", ensureLoggedIn, function(
	req,
	res,
	next
) {
	const userid = req.user.id;
	// emailVerify(userEmail, user, req.params.userid, verificationLinkUrl);

	res.redirect("/user/verification/email/" + userid);
});

router.get("/verification", ensureLoggedIn, function(req, res) {
	let verificationLinkUrl = getVerifyUrl(req, res, req.user.id);

	res.render("page-user-verification", {
		title: "Confirm your email address",
		messages: res.locals.messages,
		success_msg: res.locals.success_msg,
		error_msg: res.locals.error_msg,
		error: res.locals.error,
		info: res.locals.info,
		verificationLink: verificationLinkUrl,
		data: req.user.id
	});
});

router.get("/verification/:userid", function(req, res) {
	const userid = req.params.userid;
	// console.log(userid);
	Users.findOneAndUpdate(
		{ _id: userid, isVerification: false },
		{ $set: { isVerification: true } },
		function(err, user) {
			if (err) {
				console.error("ERROR!");
			} else {
				req.flash("success_msg", "Verification completed, Thank you.");
				res.redirect("/user/payment_profile");
			}
		}
	);
});

router.get("/verification/email/:userid", ensureLoggedIn, function(req, res) {
	// const userid = req.user.id;
	emailVerify(
		req.user.email,
		req.user,
		req.params.userid,
		getVerifyUrl(req, res, req.params.userid)
	);

	res.redirect("/user/verification");
});

router.post("/payment_profile", ensureLoggedIn, function(req, res, next) {
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
			// console.log(user);
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
	Users.findOne(query).exec(function(err, person) {
		if (err) throw err;
		// console.log(person);
		Invoicereceipts.find({ _user: person._id }, function(err, invs) {
			if (err) throw err;
			// console.log(invs);
			Reservations.find({ _user: person._id }, function(err, peoples) {
				if (err) throw err;
				// console.log(invs);
				res.render("page-user-reservation", {
					title: "Reserve your tickets",
					message: req.flash(),
					user: person,
					invoicereceipts: invs,
					reservations: peoples
				});
			});
		});
	});
});

router.post("/reservation/paypal", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	const data = req.body.data;
	const paypalData = req.body.paypalData;
	const paypalDetails = req.body.paypalDetails;
	const submitPaypal = req.body.submitPaypal;
	// console.log(data, paypalData, paypalDetails, submitPaypal);
	// console.log(data.userID);

	const query = { _id: data.userID };
	Users.findOne(query, function(err, user) {
		if (err) throw err;
		const json_invoicereceipts = {
			_user: data.userID,
			bookID: 1001,
			isInvoice: false,
			isReceipt: false,
			amount: data.invoicereceipts.amount,
			seat: data.invoicereceipts.seat,
			paypalDocID: "",
			paypalPayerID: paypalData.payerID,
			paypalOrderID: paypalData.orderID,
			paypalJson: JSON.parse(JSON.stringify(paypalDetails)),
			submitPaypal: submitPaypal,
			status: "Wait for comfirm"
		};
		// const reservationObj = JSON.parse(JSON.stringify(json_reservations));

		const invoice = new Invoicereceipts(json_invoicereceipts);
		invoice.setNext("bookID_counter", function(err, invoice) {
			if (err) console.log("Cannot increment the rank because ", err);
		});
		invoice.save(function(err, inv) {
			if (err) throw err;
			user.invoicereceipts = inv;
			user.save(function(err, user) {
				return user;
			});
			let thisid = inv._id;
			async.forEach(data.reservations, function(reservation, callback) {
				const reserve = new Reservations(reservation);
				reserve._user = inv._user;
				reserve._transactionid = inv._id;
				reserve.save(function(err, people) {
					inv.reservations.push(people);
					inv.save(function(err, inv) {
						return inv;
					});
				});
				// console.log(reserve._user, reserve._transactionid);
			});
			emailComplete(user.email, req.user);
			avoidAdminCompletePP(user.email, req.user, thisid);
			// inv.reservations;
			res.status(200).json({
				message: "Welcome to the project-name api",
				obj1: user
				// obj2: simpleData
			});
		});
	});
});

router.post(
	"/reservation/bank/:invoicereceiptid",
	ensureLoggedInVerification,
	function(req, res) {
		let query = { _id: req.user.id };

		res.render("page-user-reservation-bank", {
			title: "Bank Transfers Approve",
			message: req.flash(),
			params: req.params,
			user: req.user,
			invoicereceipts: req.user.invoicereceipts,
			reservations: req.user.invoicereceipts.reservations
		});
	}
);

router.post("/reservation/bank", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	const data = req.body;

	const query = { _id: data.userID };
	Users.findOne(query, function(err, user) {
		if (err) throw err;

		const json_invoicereceipts = {
			_user: data.userID,
			bookID: "",
			isInvoice: true,
			isReceipt: false,
			amount: data.invoicereceipts.amount,
			seat: data.invoicereceipts.seat,
			status: "upload"
		};
		// const reservationObj = JSON.parse(JSON.stringify(json_reservations));

		const invoice = new Invoicereceipts(json_invoicereceipts);

		invoice.setNext("bookID_counter", function(err, wwinr) {
			if (err) console.log("Cannot increment the rank because ", err);
		});

		invoice.save(function(err, inv) {
			if (err) throw err;
			user.invoicereceipts = inv;
			user.save(function(err, user) {
				return user;
			});
			let thisid = inv.id;
			console.log(inv.id);
			async.forEach(data.reservations, function(reservation, callback) {
				const reserve = new Reservations(reservation);
				reserve._user = inv._user;
				reserve._transactionid = inv._id;
				reserve.save(function(err, people) {
					inv.reservations.push(people);
					inv.save(function(err, inv) {
						return inv;
					});
				});
				// console.log(reserve._user, reserve._transactionid);
			});

			emailComplete(user.email, req.user);
			avoidAdminCompleteBank(user.email, req.user, thisid);
			inv.reservations;
			res.status(200).json({
				message: "Welcome to the project-name api",
				obj1: user
				// obj2: simpleData
			});
		});
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
	req.flash("success_msg", "Data saved successfully.");
	res.redirect("/user/paypal-transaction-complete");
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
	Invoicereceipts.findOne({ _user: req.user.id }).exec((err, data) => {
		// console.log(data.orderID);
		// const invoice = data;
	});
	res.render("page-user-invoice", {
		title: "Invoice",
		user: req.user,
		address: req.user.paymentProfile
		// invoice: invoicereceipt
	});
});

router.get("/paypal-transaction-complete/email", function(req, res, next) {});

router.get("/paypal-transaction-complete", ensureLoggedInVerification, function(
	req,
	res,
	next
) {
	// Invoicereceipts.findOne({ _user: req.user.id }).exec((err, data) => {
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

function getVerifyUrl(req, res, userid) {
	let verificationLinkUrl =
		req.protocol + "s://" + req.get("host") + "/user/verification/" + userid;
	return verificationLinkUrl;
}

function getTransporter() {
	let transporter = nodemailer.createTransport({
		host: "smtpout.secureserver.net",
		port: 465,
		secure: true,
		auth: {
			user: process.env.NODEMAILER_USER, // generated ethereal user
			pass: process.env.NODEMAILER_PASS // generated ethereal password
		}
	});
	return transporter;
}

// async..await is not allowed in global scope, must use a wrapper
function emailVerify(userEmail, user, params, verificationLinkUrl) {
	// create reusable transporter object using the default SMTP transport
	let transporter = getTransporter();

	let thisUser = user;

	let file = path.join(__dirname, "../email/templete-1.html");
	let htmlData = fs.readFileSync(file, "utf8");
	// data = data.toString();
	htmlData = htmlData
		.replace(/##firstname/gi, thisUser.paymentProfile.firstName)
		.replace(/##lastname/gi, thisUser.paymentProfile.lastName)
		.replace(/##email/gi, thisUser.email)
		.replace(/##verificationLinkUrl/gi, verificationLinkUrl);

	// send mail with defined transport object
	if (process.env.DEV_SENDMAIL) {
		let info = transporter.sendMail({
			from: '"DTCC Booking System 👻" <' + process.env.NODEMAILER_USER + ">", // sender address
			to: userEmail, // list of receivers
			cc: process.env.DEV_EMAIL,
			subject: "Verify you email from DTCC Booking System.", // Mail subject
			html: htmlData // html body
		});
		console.log("Message sent: %s", info.messageId);
	}
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	// emailVerify(userEmail, user, params, verificationLinkUrl);
}

// async..await is not allowed in global scope, must use a wrapper
function emailComplete(userEmail, user, params) {
	// create reusable transporter object using the default SMTP transport
	let transporter = getTransporter();

	let thisUser = user;

	const file = path.join(__dirname, "../email/templete-4.html");
	var htmlData = fs.readFileSync(file, "utf8");
	// data = data.toString();
	htmlData = htmlData
		.replace(/##firstname/gi, thisUser.paymentProfile.firstName)
		.replace(/##lastname/gi, thisUser.paymentProfile.lastName)
		.replace(/##email/gi, thisUser.email);
	// send mail with defined transport object
	if (process.env.DEV_SENDMAIL) {
		let info = transporter.sendMail({
			from: '"DTCC Booking System 👻" <' + process.env.NODEMAILER_USER + ">", // sender address
			to: userEmail, // list of receivers
			cc: process.env.DEV_EMAIL,
			subject: "Thank you for your reservation for the Danish-Thai Gala.", // Mail subject
			html: htmlData // html body
		});

		console.log("Message sent: %s", info.messageId);
	}
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	// emailComplete(userEmail, user, params).catch(console.error);
}

// async..await is not allowed in global scope, must use a wrapper
function avoidAdminCompletePP(userEmail, user, params) {
	// create reusable transporter object using the default SMTP transport
	console.log(params);
	let transporter = getTransporter();
	let transactionid = params;
	let thisUser = user;
	let htmlreserve = "";
	Reservations.find({ _user: thisUser._id }, function(err, persons) {
		if (err) {
			return reject(err);
		} else {
			persons.forEach(reservation => {
				htmlreserve +=
					"<tr><td>" +
					reservation.firstName +
					" " +
					reservation.lastName +
					"</td><td>" +
					reservation.email +
					"</td><td>" +
					reservation.food +
					"</td></tr>";
			});

			// let deteilreservation = htmlreserves.join("");
			// console.log(htmlreserve);
			const file = path.join(__dirname, "../email/templete-4-admin.html");
			var htmlData = fs.readFileSync(file, "utf8");
			// data = data.toString();
			htmlData = htmlData
				.replace(/##firstname/gi, thisUser.paymentProfile.firstName)
				.replace(/##lastname/gi, thisUser.paymentProfile.lastName)
				.replace(/##email/gi, thisUser.email)
				.replace(/##detailreservation/gi, htmlreserve);

			// send mail with defined transport object
			let towho;
			if (process.env.ENV_VARIABLE === "development") {
				towho = process.env.NODEMAILER_DEV_EMAIL_ADMIN;
			} else {
				towho = process.env.NODEMAILER_EMAIL_ADMIN;
			}
			console.log(process.env.ENV_VARIABLE, towho);
			if (process.env.DEV_SENDMAIL) {
				let info = transporter.sendMail({
					from:
						'"DTCC Booking System 👻" <' + process.env.NODEMAILER_USER + ">", // sender address
					to: towho,
					cc: process.env.DEV_EMAIL,
					subject: "New reservation on your system - Danish-Thai Gala.", // Mail subject
					html: htmlData // html body
				});
				console.log("Message sent: %s", info);
			}
			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
			// avoidAdminComplete(userEmail, user, params).catch(console.error);
		}
	});
}

// async..await is not allowed in global scope, must use a wrapper
function avoidAdminCompleteBank(userEmail, user, params) {
	// create reusable transporter object using the default SMTP transport
	const transporter = getTransporter();
	const transactionid = params;
	console.log(transactionid);
	const thisUser = user;
	let htmlreserve = "";
	Reservations.find({ _user: thisUser._id }, function(err, persons) {
		if (err) {
			return reject(err);
		} else {
			console.log("dsadasdasdasdasdasd" + persons);
			persons.forEach(reservation => {
				htmlreserve +=
					"<tr><td>" +
					reservation.firstName +
					" " +
					reservation.lastName +
					"</td><td>" +
					reservation.email +
					"</td><td>" +
					reservation.food +
					"</td></tr>";
			});

			// let deteilreservation = htmlreserves.join("");
			// console.log(htmlreserve);
			const file = path.join(__dirname, "../email/templete-4-admin-bank.html");
			var htmlData = fs.readFileSync(file, "utf8");
			// data = data.toString();
			htmlData = htmlData
				.replace(/##firstname/gi, thisUser.paymentProfile.firstName)
				.replace(/##lastname/gi, thisUser.paymentProfile.lastName)
				.replace(/##email/gi, thisUser.email)
				.replace(/##detailreservation/gi, htmlreserve);

			// send mail with defined transport object
			let towho;
			if (process.env.ENV_VARIABLE === "development") {
				towho = process.env.NODEMAILER_DEV_EMAIL_ADMIN;
			} else {
				towho = process.env.NODEMAILER_EMAIL_ADMIN;
			}

			console.log(process.env.ENV_VARIABLE, towho);
			if (process.env.DEV_SENDMAIL) {
				let info = transporter.sendMail({
					from:
						'"DTCC Booking System 👻" <' + process.env.NODEMAILER_USER + ">", // sender address
					to: towho,
					cc: process.env.DEV_EMAIL,
					subject: "New reservation on your system - Danish-Thai Gala.", // Mail subject
					html: htmlData // html body
				});
				console.log("Message sent: %s", info);
			}
			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
			// avoidAdminComplete(userEmail, user, params).catch(console.error);
		}
	});
}

module.exports = router;
