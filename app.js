/* eslint-disable no-tabs */
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
const session = require(`express-session`);
const MongoStore = require('connect-mongo')(session);
// const sessionStore = new session.MemoryStore();
// const recaptcha = new Recaptcha(`SITE_KEY`, `SECRET_KEY`, { callback: `cb` });
const app = express();



console.log(app.get(`env`));
if (app.get(`env`) == 'development') {
	const resultDotenv = require(`dotenv`).config();
	if (resultDotenv.error) throw resultDotenv.error;
}
else {
	const resultiisnode = require(`iisnode-env`).config();
	if (resultiisnode.error) throw resultiisnode.error;
}
// Configure Mongoose
const options = {
	user: process.env.MONGO_USER,
	pass: process.env.MONGO_PASS
};
mongoose.promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
mongoose.connection.on(`error`, err => {
	console.error(err);
	console.log(
		`%s MongoDB connection error. Please make sure MongoDB is running.`,
		chalk.red(`✗`)
	);
	process.exit();
});
mongoose.set(`useNewUrlParser`, false);
mongoose.set(`useFindAndModify`, false);
mongoose.set(`useCreateIndex`, true);
mongoose.set(`bufferCommands`, false);
mongoose.set(`debug`, false);

/**
 * Model (model handlers).
 */
require(`./models/Users`);
require(`./models/Reservation`);
require(`./models/InvoiceReceipt`);

/**
 * API keys and Passport configuration.
 */
require(`./config/passport`)(passport, LocalStrategy);
// app.use(require('./routes'));

/**
 * Controllers (route handlers).
 */
const user = require(`./routes/user`);
const apiController = require(`./routes/api`);
const homeController = require("./routes/index");
// const paypal = require(`./routes/paypal`);

// const sessionStore = new session.MemoryStore();
// view engine setup
app.set(`views`, path.join(__dirname, `views`));
app.set(`email`, path.join(__dirname, `email`));
app.set(`view engine`, `pug`);

app.use(logger(`dev`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(session({
  resave: process.env.SESSION_RESAVE,
  saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGO_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet.frameguard({ action: `sameorigin` }));
// Connect flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(function(req, res, next) {
	res.locals.messages = require(`express-messages`)(req, res);
	res.locals.success_msg = req.flash(`success_msg`);
	res.locals.error_msg = req.flash(`error_msg`);
	res.locals.error = req.flash(`error`);
	res.locals.info = req.flash(`info`);
	res.locals.app = app;
	next();
});

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, `public/assets`, `favicon.ico`), { maxAge: 31557600000 }));
app.use(express.static(path.join(__dirname, `public`), { maxAge: 31557600000 }));
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/static', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

//routes index
app.get(`/`, homeController.index);
app.get(`/pugtest/:pageName`, homeController.pugtest);
//routes user
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
	res.render("pugtest/page-error");
});

module.exports = app;