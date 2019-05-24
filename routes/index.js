const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");
/* GET users listing. */
// router.get('/', function(req, res, next) {
//    res.render('index', { title: 'Nodejs user registration'});
// });

/* GET users listing. */
router.get("/", function(req, res, next) {
	// console.log(req.user);
	// res.render("page-welcome", {
	// 	title: "Booking System Transfer server ....",
	// 	messages: req.flash()
	// });
	res.redirect("/user/login");
});
/* GET users listing. */
router.get("/bootstrap", function(req, res, next) {
	res.render("pugtest/form-components", { title: "Reservation registration" });
});
/* GET users listing. */
router.get("/bootstrap2", function(req, res, next) {
	res.render("pugtest/form-samples", { title: "Reservation registration" });
});

/* GET Email templete viwer. */
router.get("/email/:emailid", function(req, res, next) {
	res.sendFile(
		path.join(__dirname, "../email/templete-" + req.params.emailid + ".html")
	);
});

/* GET users listing. */
router.get("/email/admin/:emailid", function(req, res, next) {
	res.sendFile(
		path.join(
			__dirname,
			"../email/templete-" + req.params.emailid + "-admin.html"
		)
	);
});

module.exports = router;
