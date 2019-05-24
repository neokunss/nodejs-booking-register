/* eslint-disable no-tabs */
require(`dotenv`).config();
const express = require(`express`);
const path = require(`path`);
const favicon = require(`serve-favicon`);
// const fs = require(`fs`);
const logger = require(`morgan`);

const mongoose = require(`mongoose`);
const helmet = require(`helmet`);

const cookieParser = require(`cookie-parser`);
const bodyParser = require(`body-parser`);

const flash = require(`connect-flash`);

const passport = require(`passport`);
const LocalStrategy = require(`passport-local`).Strategy;
const multer = require(`multer`);
const upload = multer({ dest: path.join(__dirname, `uploads`) });
const chalk = require("chalk");
const emoji = require("node-emoji");

// const recaptcha = new Recaptcha(`SITE_KEY`, `SECRET_KEY`, { callback: `cb` });

const session = require(`express-session`);
const result = require(`iisnode-env`).config();
if (result.error) throw result.error;

console.log(process.env.KUN);
mongoose.promise = global.Promise;

const app = express();
const sessionStore = new session.MemoryStore();
// view engine setup
app.set(`views`, path.join(__dirname, `views`));
app.set(`email`, path.join(__dirname, `email`));
app.set(`view engine`, `pug`);

//Configure Mongoose
// const options = {
// 	user: process.env.MONGO_USER,
// 	pass: process.env.MONGO_PASS
// };

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

mongoose.connection.on(`error`, err => {
	console.error(err);
	console.log(
		`%s MongoDB connection error. Please make sure MongoDB is running.`,
		chalk.red(`✗`)
	);
	process.exit();
});
// mongoose.set(`useNewUrlParser`, true);
mongoose.set(`useFindAndModify`, false);
mongoose.set(`useCreateIndex`, true);
mongoose.set(`bufferCommands`, false);
mongoose.set(`debug`, true);

/**
 * Model (model handlers).
 */
require(`./models/Users`);
require(`./models/Reservation`);
require(`./models/InvoiceReceipt`);
require(`./config/passport`)(passport, LocalStrategy);
// app.use(require('./routes'));

/**
 * Controllers (route handlers).
 */
const index = require(`./routes/index`);
const user = require(`./routes/user`);
const apiController = require(`./routes/api`);
// const paypal = require(`./routes/paypal`);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, `public`, `favicon.ico`)));
app.use(logger(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, `public`)));
app.use(helmet.frameguard({ action: `sameorigin` }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(
	session({
		store: sessionStore,
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true
	})
);

// Connect flash
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
	res.locals.messages = require(`express-messages`)(req, res);
	res.locals.success_msg = req.flash(`success_msg`);
	res.locals.error_msg = req.flash(`error_msg`);
	res.locals.error = req.flash(`error`);
	res.locals.info = req.flash(`info`);
	res.locals.app = app;
	next();
});

//routes
app.use(`/`, index);
app.use(`/user`, user);

//routes api
app.get(`/api`, apiController.getApi);
app.get(`/api/paypal`, apiController.getPayPal);
app.post(`/api/paypal`, apiController.postPayPal);
app.get(`/api/paypal/success`, apiController.getPayPalSuccess);
app.get(`/api/paypal/cancel`, apiController.getPayPalCancel);
app.get(`/api/upload`, apiController.getFileUpload);
app.post(`/api/upload`, upload.single(`myFile`), apiController.postFileUpload);
// app.get(`/api/google-maps`, apiController.getGoogleMaps);
// app.use(`/auth`, auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error(`Not Found`);
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get(`env`) === `development` ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render(`error`);
});
module.exports = app;
