const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const flash = require("connect-flash");

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/dbusers");
require("./models/Users");

let index = require("./routes/index");
let register = require("./routes/register");
// var register_profile = require('./routes/register-profile');
let user = require("./routes/user");
let auth = require("./routes/auth");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
	session({
		secret: "secret",
		resave: true,
		saveUninitialized: true,
		cookie: { secure: true }
	})
);

//conect flash
app.use(flash());
app.use(function(req, res, next) {
	res.locals.success_meg = req.flash("success_msg");
	res.locals.error_meg = req.flash("error_meg");
	next();
});

// rounres
app.use("/", index);
app.use("/register", register);
// app.use('/register-profile', register_profile);
app.use("/user", users);
app.use("/login", auth);

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
