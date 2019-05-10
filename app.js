const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");

const flash = require("connect-flash");

// var crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const session = require("express-session");

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;
//Configure isProduction variable
const isProduction = process.env.NODE_ENV === "production";

var app = express();
var sessionStore = new session.MemoryStore();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Configure Mongoose
mongoose
	.connect("mongodb://localhost/dbusers")
	.then(() => console.log("MongoDB Connected"))
	.catch(err => console.log(err));
mongoose.set("debug", true);

require("./models/Users");
require("./models/Reservation");
require("./models/InvoiceReceipt");
require("./config/passport")(passport, LocalStrategy);
// app.use(require('./routes'));

const index = require("./routes/index");
const user = require("./routes/user");
const auth = require("./routes/auth");
// const paypal = require("./routes/paypal");

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser(""));
app.use(
	session({
		store: sessionStore,
		secret: "cat keyboard",
		resave: false,
		saveUninitialized: true
	})
);

// Connect flash
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	// req.flash("success_msg", "Successful");
	// req.flash("error_msg", "That email is already taken.");
	// req.flash("error", "Oops something went wrong");

	next();
});

app.use(function(req, res, next) {
	console.log("Called URL:", req.url);
	res.locals.messages = require("express-messages")(req, res);
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	res.locals.info = req.flash("info");
	res.locals.currentUser = req.session.userId;
	// res.locals.sessionFlash = req.session.sessionFlash;
	// delete req.session.sessionFlash;
	next();
});

// app.get("*", function(req, res, next) {
// 	//local variable to hold user info
// 	res.locals.user = req.user || null;
// 	next();
// });

//routes
app.use("/", index);
app.use("/user", user);
// app.use("/paypal", paypal);
// app.use("/auth", auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;

// 0oaj882kt09qJMxC0356

// BsDjmj4PHVQzYAx26AQwWU-orGdk127pbHE0EIoV
