const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("Users");
// const passport = require('passport');
let crypto = require("crypto"),
	hmac,
	signature;
const { check, validationResult } = require("express-validator/check");
const { matchedData, sanitize } = require("express-validator/filter");

/* GET users listing. */
router.get("/", function(req, res) {
	res.redirect("/user/login");
});

/* GET users listing. */
router.get("/login", function(req, res) {
	res.render("page-user-login", { title: "Login" });
});

router.get("/register", function(req, res, next) {
	res.render("page-user-register", { title: "Registration" });
});

router.get("/payment_profile", function(req, res, next) {
	console.log(req.url, "Kun Srithaporn");
	res.render("page-user-payment_profile", {
		title: "Payment Profile & Billing Information"
	});
});

router.get("/reservation", function(req, res, next) {
	res.render("page-user-reservation", { title: "Reserve your tickets" });
});

router.get("/4", function(req, res, next) {
	res.render("page-register-4", { title: "Thank you!" });
});

router.get("/invoice", function(req, res, next) {
	res.render("page-user-invoice", { title: "Thank you!" });
});

/* POST user registration page. */
router.post(
	"/register",
	[
		check("full_name", "Name cannot be left blank").isLength({ min: 1 }),

		check("email")
			.isEmail()
			.withMessage("Please enter a valid email address")
			.trim()
			.normalizeEmail()
			.custom(value => {
				return findUserByEmail(value).then(User => {
					//if user email already exists throw an error
				});
			}),

		check("password")
			.isLength({ min: 5 })
			.withMessage("Password must be at least 5 chars long")
			.matches(/\d/)
			.withMessage("Password must contain one number")
			.custom((value, { req, loc, path }) => {
				if (value !== req.body.cpassword) {
					// throw error if passwords do not match
					throw new Error("Passwords don't match");
				} else {
					return value;
				}
			}),
		check("dob", "Date of birth cannot be left blank").isLength({ min: 1 }),
		check("terms", "Please accept our terms and conditions").equals("yes")
	],
	function(req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			req.flash("error_msg", "Please log in to view that resource");
			res.json({ status: "error", message: errors.array() });
		} else {
			hmac = crypto.createHmac("sha1", "auth secret");
			var encpassword = "";

			if (req.body.password) {
				hmac.update(req.body.password);
				encpassword = hmac.digest("hex");
			}

			var document = {
				full_name: req.body.full_name,
				email: req.body.email,
				password: encpassword,
				dob: req.body.dob,
				salt: req.body.salt
			};

			var user = new User(document);
			user.save(function(error) {
				console.log(user);
				if (error) {
					throw error;
				}
				// res.flash("Data saved successfully.");
				res.json({ message: "Data saved successfully.", status: "success" });
			});
		}
	}
);

router.post("/payment_profile", function(req, res, next) {
	console.log(req.body, "Kun Srithaporn");
	res.render("page-user-payment_profile", {
		title: "Payment Profile & Billing Information"
	});
});
// router.post('/register', function (req, res) {
//   const { full_name, email, password, password2 } = req.body;
//   let errors = [];
//   if ( !full_name || !email || !password || !password || !dob) {}

// });

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
