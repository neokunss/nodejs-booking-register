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
const errorHandler = require("errorhandler");
const Users = mongoose.model("Users");
const Reservations = mongoose.model("Reservations");
const Invoicereceipts = mongoose.model("Invoicereceipts");

const myfn = require(`./myfunction`);



router.get("/", myfn.ensureLoggedIn, function(req, res) {
	console.log(req.body);
	// res.body.full_name
	res.render("page-welcome", {
		title: "Welcome",
	});
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

router.get("/email", myfn.ensureLoggedIn, function (req, res, next) {
	// let email = 'christa.lund.herum@gmail.com';
	email = "kun.srithaporn@gmail.com"
	// let link = getVerifyUrl(req, res, '5cebba61c77152103c400a51');
	// link = getVerifyUrl(req, res, '5cd667cfa68c2f184c82ec7f');
	// emailComplete("kun.srithaporn@gmail.com", req.user, req.params);
  // emailVerify(email, req.user, req.params, link);

	avoidAdminCompletePP("kun.srithaporn@gmail.com", req.user, '5ce7891e9bc0702aa0da2cd4');
	res.send("Kun Test");
});

router.delete("/:id", function(req, res) {
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

router.post("/", function(req, res) {
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






function getVerifyUrl(req, res, userid) {
	let verificationLinkUrl = "https://danishthaigala.dadriba.com" + "/user/verification/" + userid;
		// req.protocol + "s://" + req.get("host") + "/user/verification/" + userid;


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
	const transporter = getTransporter();

	const thisUser = user;

	let file = path.join(__dirname, "../email/templete-1.html");
	let htmlData = fs.readFileSync(file, "utf8");
	// data = data.toString();
	htmlData = htmlData.replace(/##verificationLinkUrl/gi, verificationLinkUrl);

	// send mail with defined transport object
	const info = transporter.sendMail({
		from: '"DTCC Booking System" <' + process.env.NODEMAILER_USER + ">", // sender address
		to: userEmail, // list of receivers
		cc: process.env.DEV_EMAIL,
		subject: "Verify you email from DTCC Booking System.", // Mail subject
		html: htmlData // html body
	});
	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	// emailVerify(userEmail, user, params, verificationLinkUrl);
}

// async..await is not allowed in global scope, must use a wrapper
function emailComplete(userEmail, user, params) {
	// create reusable transporter object using the default SMTP transport
	const transporter = getTransporter();

	const thisUser = user;

	const file = path.join(__dirname, "../email/templete-4.html");
	let htmlData = fs.readFileSync(file, "utf8");
	// data = data.toString();
	htmlData = htmlData
		.replace(/##firstname/gi, thisUser.paymentProfile.firstName)
		.replace(/##lastname/gi, thisUser.paymentProfile.lastName)
		.replace(/##email/gi, thisUser.email);
	// send mail with defined transport object
	let info = transporter.sendMail({
		from: '"DTCC Booking System" <' + process.env.NODEMAILER_USER + ">", // sender address
		to: userEmail, // list of receivers
		// cc: process.env.DEV_EMAIL,
		subject: "Thank you for your reservation for the Danish-Thai Gala.", // Mail subject
		html: htmlData // html body
	});
	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	// emailComplete(userEmail, user, params).catch(console.error);
}

// async..await is not allowed in global scope, must use a wrapper
function avoidAdminCompletePP(userEmail, user, params) {
	// create reusable transporter object using the default SMTP transport
	// console.log(params);
	const transporter = getTransporter();
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
			let htmlData = fs.readFileSync(file, "utf8");
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

			const info = transporter.sendMail({
				from: '"DTCC Booking System" <' + process.env.NODEMAILER_USER + ">", // sender address
				to: [`kun.srithaporn@gmail.com`, `ks@bang-olufsenth.com`],
				// cc: process.env.DEV_EMAIL,
				subject: "New reservation on your system - Danish-Thai Gala.", // Mail subject
				html: htmlData // html body
			});
			console.log("Message sent: %s", info.messageId);
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
	// console.log(transactionid);
	const thisUser = user;
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
					"</td><td><a href='" +
					reservation.email +
					"'>Emal</a>" +
					"</td><td>" +
					reservation.food +
					"</td></tr>";
			});

			// let deteilreservation = htmlreserves.join("");
			// console.log(htmlreserve);
			const file = path.join(__dirname, "../email/templete-4-admin-bank.html");
			let htmlData = fs.readFileSync(file, "utf8");
			// data = data.toString();
			htmlData = htmlData
				.replace(/##firstname/gi, thisUser.paymentProfile.firstName)
				.replace(/##lastname/gi, thisUser.paymentProfile.lastName)
				.replace(/##email/gi, thisUser.email)
				.replace(/##detailreservation/gi, htmlreserve);

			// send mail with defined transport object
			let towho;
			if (process.env.ENV_VARIABLE === "development") {
				towho = process.env.NODEMAILER_NODEMAILER_DEV_EMAIL_ADMINEMAIL_ADMIN;
			} else {
				towho = process.env.NODEMAILER_EMAIL_ADMIN;
			}
			console.log(process.env.ENV_VARIABLE, towho);
			let info = transporter.sendMail({
				from: '"DTCC Booking System" <' + process.env.NODEMAILER_USER + ">", // sender address
				to: towho,
				// cc: process.env.DEV_EMAIL,
				subject: "New reservation on your system - Danish-Thai Gala.", // Mail subject
				html: htmlData // html body
			});
			console.log("Message sent: %s", info.messageId);
			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
			// avoidAdminComplete(userEmail, user, params).catch(console.error);
		}
	});
}

module.exports = router;