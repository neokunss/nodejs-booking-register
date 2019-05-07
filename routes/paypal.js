// https//:www.npmjs.com / package / paypal - express - checkout;
// Credential Signature

// API Username
// media_api1.dancham.or.th

// API Password
// FXWPYV2RFJ2H45FY

// Signature
// A6sbiQUl25UcbsF7EfcLxaUl3BJAA5FRGhyA2-F4haZ2H7piZVw9oCKg
var Paypal = require("paypal-express-checkout");
// debug = optional, defaults to false, if true then paypal's sandbox url is used
// paypal.init('some username', 'some password', 'signature', 'return url', 'cancel url', debug);
var paypal = Paypal.init(
	"media_api1.dancham.or.th",
	"FXWPYV2RFJ2H45FY",
	"A6sbiQUl25UcbsF7EfcLxaUl3BJAA5FRGhyA2-F4haZ2H7piZVw9oCKg",
	"http://booing.dadriba.com/user/invoice",
	"http://www.example.com/user/reservation",
	true
);

// Localization (OPTIONAL): https://developer.paypal.com/docs/classic/api/locale_codes/
// paypal.locale = 'SK';
// or
paypal.locale = "en_US";

// checkout
// requireAddress = optional, defaults to false
// paypal.pay('Invoice number', amount, 'description', 'currency', requireAddress, customData, callback);
// paypal.pay('20130001', 123.23, 'iPad', 'EUR', function(err, url) {
// or with "requireAddress": true
paypal.pay("1110001", 4000, "Seat", "THB", true, ["custom", "data"], function(
	err,
	url
) {
	if (err) {
		console.log(err);
		return;
	}

	// redirect to paypal webpage
	response.redirect(url);
});

// result in GET method
// paypal.detail('token', 'PayerID', callback);
// or
// paypal.detail(totaljs.controller, callback);

paypal.detail("EC-788441863R616634K", "9TM892TKTDWCE", function(
	err,
	data,
	invoiceNumber,
	price,
	custom_data_array
) {
	// custom_data_array {String Array} - supported in +v1.6.3

	if (err) {
		console.log(err);
		return;
	}

	// data.success == {Boolean}

	if (data.success) console.log("DONE, PAYMENT IS COMPLETED.");
	else console.log("SOME PROBLEM:", data);

	/*
    data (object) =
    { TOKEN: 'EC-35S39602J3144082X',
      TIMESTAMP: '2013-01-27T08:47:50Z',
      CORRELATIONID: 'e51b76c4b3dc1',
      ACK: 'Success',
      VERSION: '52.0',
      BUILD: '4181146',
      TRANSACTIONID: '87S10228Y4778651P',
      TRANSACTIONTYPE: 'expresscheckout',
      PAYMENTTYPE: 'instant',
      ORDERTIME: '2013-01-27T08:47:49Z',
      AMT: '10.00',
      TAXAMT: '0.00',
      CURRENCYCODE: 'EUR',
      PAYMENTSTATUS: 'Pending',
      PENDINGREASON: 'multicurrency',
      REASONCODE: 'None' };
    */
});
