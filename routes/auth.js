var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

//User Model
var User = mongoose.model("Users");
// const passport = require('passport');
var crypto = require("crypto"),
	hmac,
	signature;
const { check, validationResult } = require("express-validator/check");
const { matchedData, sanitize } = require("express-validator/filter");

/* GET users listing. */
router.get("/", function(req, res, next) {
	res.render("index", { title: "Nodejs user registration" });
});

// Login TO DB==================================================================
router.post(
	"/auth",
	[
		check("email")
			.isEmail()
			.withMessage("Please enter a valid email address")
			.trim()
			.normalizeEmail()
			.custom(value => {
				return value;
			}),

		check("password")
			.isLength({ min: 5 })
			.withMessage("Password must be at least 5 chars long")
			.matches(/\d/)
			.withMessage("Password must contain one number")
			.custom(value => {
				return value;
			})
	],
	function(req, res, next) {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.json({ status: "error", message: errors.array() });
		} else {
			hmac = crypto.createHmac("sha1", "auth secret");
			var encpassword = "";

			if (req.body.password) {
				hmac.update(req.body.password);
				encpassword = hmac.digest("hex");
			}
			var document = {
				email: req.body.email,
				password: encpassword
			};

			User.findOne({ email: req.body.email }, function(error, data) {
				if (error) {
					throw error;
				} else {
					if (data.password == encpassword) {
						res.json({
							message: "Data saved successfully.",
							status: "success"
						});
						// return res.redirect('/register/2');
					} else {
						res.json({ message: "Password wrong.", status: "error" });
					}
				}
			});
		}
	}
);
// //register to DB================================================================
// app.post('/regiterToDb',urlencodedParser,function(req,res){
// var obj = JSON.stringify(req.body);
// var jsonObj = JSON.parse(obj);
//     res.render('profile',{loginData:req.body});
//  });

// //register profile to MongoDB================================================================
//  app.post('/completeprofile',urlencodedParser,function(req,res){
//   var obj = JSON.stringify(req.body);
//   console.log("Final reg Data : "+obj);
//   var jsonObj = JSON.parse(obj);
//      MongoClient.connect(url, function(err, db) {
//      db.collection("userprofile").insertOne(jsonObj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     db.close();
//      });
//       res.render('completeprofile',{profileData:req.body});
//      });
//    });
// });

// logout
router.get("/logout", function(req, res) {
	req.logout();
	req.flash("success", "You are logged out");
	res.redirect("/users/login");
});

function userExist(req, res, next) {
	User.count(
		{
			username: req.body.username
		},
		function(err, count) {
			if (count === 0) {
				next();
			} else {
				req.session.error = "User Exist";
				res.redirect("/signup");
			}
		}
	);
}

function findUserByEmail(email) {
	if (email) {
		return new Promise((resolve, reject) => {
			User.findOne({ email: email }).exec((err, doc) => {
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

module.exports = router;
