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
mongoose
	.connect("mongodb://localhost/dbusers")
	.then(() => console.log("MongoDB Connected"))
	.catch(err => console.log(err));

require("./models/Users");

let index = require("./routes/index");
let user = require("./routes/user");
let auth = require("./routes/auth");

var app = express();
var sessionStore = new session.MemoryStore();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser("keyboard cat"));
app.use(
	session({
		cookie: {
			maxAge: 60000,
			secure: true
		},
		store: sessionStore,
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true
	})
);

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
	// res.locals.success_msg = req.flash("success_msg");
	// res.locals.error_msg = req.flash("error_msg");
	// res.locals.error = req.flash("error");
	// next();
	res.locals.sessionFlash = req.session.sessionFlash;
	delete req.session.sessionFlash;
	next();
});

//routes
app.use("/", index);
app.use("/user", user);
app.use("/auth", auth);

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
