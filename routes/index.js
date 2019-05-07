var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

/* GET users listing. */
// router.get('/', function(req, res, next) {
//    res.render('index', { title: 'Nodejs user registration'});
// });

/* GET users listing. */
router.get("/", function(req, res, next) {
	console.log(req.user);
	// res.render("page-welcome", {
	// 	title: "Nodejs user registration",
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

module.exports = router;
