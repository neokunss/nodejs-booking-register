const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
var passport = require("passport");
const crypto = require("crypto");
const async = require("async");
const SMTPServer = require("smtp-server").SMTPServer;
// const server = new SMTPServer(options);

const Users = mongoose.model("Users");
const Reservations = mongoose.model("Reservations");
const Invoicereceipts = mongoose.model("Invoicereceipts");
const paypal = require("paypal-rest-sdk");

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
	res.render("api/index", {
		title: "API Examples"
	});
};

/**
 * POST /api/paypal
 * List of API examples.
 */
exports.postPayPal = (req, res) => {
	const data = req.body;
	console.log("dsdsd: ", process.env.PAYPAL_ID, process.env.PAYPAL_SECRET);

	paypal.configure({
		mode: "sandbox",
		client_id: process.env.PAYPAL_ID,
		client_secret: process.env.PAYPAL_SECRET
	});

	var paymentDetails = {
		intent: "sale",
		redirect_urls: {
			return_url: process.env.PAYPAL_RETURN_URL,
			cancel_url: process.env.PAYPAL_CANCEL_URL
		},
		payer: {
			payment_method: "paypal",
			payer_info: {
				tax_id_type: "BR_CPF",
				tax_id: "Fh618775690"
			}
		},
		transactions: [
			{
				amount: {
					total: data.invoicereceipts.amount,
					currency: "THB",
					details: {
						subtotal: data.invoicereceipts.amount,
						tax: "0",
						shipping: "0",
						handling_fee: "0",
						shipping_discount: "0",
						insurance: "0"
					}
				},
				description: "This is the payment transaction description.",
				invoice_number: "48787589677",
				payment_options: {
					allowed_payment_method: "INSTANT_FUNDING_SOURCE"
				},
				soft_descriptor: "ECHI5786786",
				item_list: {
					items: [],
					shipping_address: {
						recipient_name:
							req.user.paymentProfile.firstName +
							" " +
							req.user.paymentProfile.lastName,
						line1: req.user.paymentProfile.address,
						line2: req.user.paymentProfile.address,
						city: req.user.paymentProfile.addressCity,
						country_code: req.user.paymentProfile.addressProvince,
						postal_code: req.user.paymentProfile.addressPostalCode,
						phone: req.user.paymentProfile.mobile
					}
				}
			}
		]
	};

	console.log(paymentDetails.transactions[0].item_list);

	const resultdata = paymentDetails.transactions[0].item_list;

	// for (const reservation of data.Reservations) {
	// 	const people = {
	// 		name: "1 Reservation Seat(s)",
	// 		description:
	// 			"Reservation Seat for " +
	// 			reservation.firstName +
	// 			" " +
	// 			reservation.lastName +
	// 			" " +
	// 			reservation.email,
	// 		quantity: "1",
	// 		price: "4300",
	// 		sku: "dtcc-booking-01",
	// 		currency: "THB"
	// 	};
	// 	resultdata.items.push(people);
	// 	console.log(resultdata);
	// }

	// resultdata = JSON.stringify(resultdata);
	// resultdata = JSON.parse(resultdata);

	// console.log(JSON.parse(resultdata));

	// console.log(paymentDetails.transactions[0].item_list.items.isArray);
	// resultdata = paymentDetails.transactions[0].item_list;
	// resultdata = paymentDetails.transactions[0].item_list;
	// resultdata.items.push(people);
	// console.log(resultdata);
};

/**
 * GET /api/paypal
 * PayPal SDK example.
 */
exports.getPayPal = (req, res, next) => {

	console.log(process.env.PAYPAL_ID);
	paypal.configure({
		mode: "sandbox",
		client_id: process.env.PAYPAL_ID,
		client_secret: process.env.PAYPAL_SECRET
	});

	const paymentDetails = {
		intent: "sale",
		redirect_urls: {
			return_url: process.env.PAYPAL_RETURN_URL,
			cancel_url: process.env.PAYPAL_CANCEL_URL
		},
		payer: {
			payment_method: "paypal",
			payer_info: {
				email: req.user.email,
				first_name: req.user.paymentProfile.firstName,
				last_name: req.user.paymentProfile.lastName,
				tax_id_type: "BR_CPF",
				tax_id: req.user.paymentProfile.companyTaxId,
				shipping_address: {
					recipient_name: "Brian Robinson",
					line1: req.user.paymentProfile.address,
					line2: req.user.paymentProfile.addressStreet,
					city: req.user.paymentProfile.addressCity,
					country_code: "TH",
					postal_code: req.user.paymentProfile.addressPostalCode
				}
			}
		},
		transactions: [
			{
				amount: {
					total: 0,
					currency: "THB",
					details: {
						subtotal: 0,
						tax: "0",
						shipping: "0",
						handling_fee: "0",
						shipping_discount: "0",
						insurance: "0"
					}
				},
				description: "This is the payment transaction description.",
				// custom: "EBAY_EMS_90048630024435",
				// invoice_number: "48787589677",
				payment_options: {
					allowed_payment_method: "INSTANT_FUNDING_SOURCE"
				},
				// soft_descriptor: "ECHI5786786",
				item_list: {
					items: []
				}
			}
		],
		application_context: {
				shipping_preference: 'NO_SHIPPING'
		}
	};

	const resultdata = paymentDetails.transactions[0].item_list.items;
	let price = 0;
	req.user.invoicereceipts[0].reservations.forEach(function (reservation) {
		const people = {
				name: "1 Reservation Seat(s)",
				description:
					"Reservation Seat for " +
					reservation.firstName +
					" " +
					reservation.lastName +
					" " +
					reservation.email,
				quantity: "1",
				price: "4300",
				sku: "dtcc-booking-01",
				currency: "THB"
			};
		resultdata.push(people);
		// price = price + Number(process.env.PRODUCT_PRICE);
		paymentDetails.transactions[0].amount.total = Number(paymentDetails.transactions[0].amount.total) + Number(process.env.PRODUCT_PRICE);
		paymentDetails.transactions[0].amount.details.subtotal = paymentDetails.transactions[0].amount.details.subtotal + Number(process.env.PRODUCT_PRICE);
	});


	// console.log(paymentDetails.transactions[0].amount);

	const tttt = JSON.stringify(paymentDetails);

	paypal.payment.create(tttt, (err, payment) => {
		if (err) {
			console.log(err);
			return next(err);
		}
		console.log('payment: '+ JSON.stringify(payment));
		const { links, id } = payment;
		req.session.paymentId = id;
		for (let i = 0; i < links.length; i++) {
			if (links[i].rel === "approval_url") {
				res.render("api/paypal", {
					approvalUrl: links[i].href
				});
			}
		}
	});
};

/**
 * GET /api/paypal/success
 * PayPal SDK example.
 */
exports.getPayPalSuccess = (req, res) => {
	const { paymentId } = req.session;
	const paymentDetails = { payer_id: req.query.PayerID };
	paypal.payment.execute(paymentId, paymentDetails, err => {
		res.render("api/paypal", {
			result: true,
			success: !err
		});
	});
};

/**
 * GET /api/paypal/cancel
 * PayPal SDK example.
 */
exports.getPayPalCancel = (req, res) => {
	req.session.paymentId = null;
	res.render("api/paypal", {
		result: true,
		canceled: true
	});
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
	res.render("api/upload", {
		title: "File Upload"
	});
};

exports.postFileUpload = (req, res) => {
	req.flash("success", { msg: "File was uploaded successfully." });
	res.redirect("/api/upload");
};

// exports.getGoogleMaps = (req, res) => {
// 	res.render("api/google-maps", {
// 		title: "Google Maps API",
// 		google_map_api_key: process.env.GOOGLE_MAP_API_KEY
// 	});
// };
