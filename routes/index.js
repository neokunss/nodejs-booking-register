const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");

/**
 * GET /bootstrap/1
 */
exports.index = (req, res) => {
	res.redirect("/user/login");
	// res.render("index", { title: "Nodejs user registration" });
};
/**
 * GET /bootstrap/1
 */
exports.pugtest = (req, res) => {
	res.render("pugtest/"+req.params.pageName, { title: req.params.pageName });
};

// /* GET Email templete viwer. */
// router.get("/email/:emailid", function(req, res, next) {
// 	res.sendFile(
// 		path.join(__dirname, "../email/templete-" + req.params.emailid + ".html")
// 	);
// });

// /* GET users listing. */
// router.get("/email/admin/:emailid", function(req, res, next) {
// 	res.sendFile(
// 		path.join(
// 			__dirname,
// 			"../email/templete-" + req.params.emailid + "-admin.html"
// 		)
// 	);
// });
// module.exports = router;
