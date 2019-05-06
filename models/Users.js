const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

var Schema = mongoose.Schema;

var validateEmail = function(email) {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email);
};

const usersSchema = new Schema(
	{
		full_name: { type: String, required: [true, "Full name must be provided"] },
		email: {
			type: String,
			Required: "Email address cannot be left blank.",
			validate: [validateEmail, "Please fill a valid email address"],
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please fill a valid email address"
			],
			index: { unique: true, dropDups: true }
		},
		password: {
			type: String,
			required: [true, "Password cannot be left blank"]
		},
		hash: { type: String },
		salt: { type: String },
		dob: { type: Date, required: [true, "Date of birth must be provided"] },
		paymentProfile: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Address"
		},
		reservation: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Reservation"
		}
	},
	{ timestamps: true }
);

const addressSchema = new mongoose.Schema({
	user: { type: Schema.Types.ObjectId, ref: "User" },
	isBusiness: { type: Boolean, default: false },
	firstName: String,
	lastName: String,
	company: {
		name: String,
		taxId: String,
		office: Number,
		fax: Number
	},
	address: {
		address: String,
		street: String,
		city: String,
		province: String,
		postalCode: Number
	},
	phone: {
		mobile: Number,
		home: Number
	}
});

const reservationSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	food: String,
	email: String
});

const User = mongoose.model("User", usersSchema);
const Address = mongoose.model("Address", addressSchema);
const Reservation = mongoose.model("Reservation", reservationSchema);

usersSchema.methods.setPassword = function(password) {
	this.salt = crypto.randomBytes(16).toString("hex");
	this.hash = crypto
		.pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
		.toString("hex");
};

usersSchema.methods.validatePassword = function(password) {
	const hash = crypto
		.pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
		.toString("hex");
	return this.hash === hash;
};

usersSchema.methods.generateJWT = function() {
	const today = new Date();
	const expirationDate = new Date(today);
	expirationDate.setDate(today.getDate() + 60);

	return jwt.sign(
		{
			email: this.email,
			id: this._id,
			exp: parseInt(expirationDate.getTime() / 1000, 10)
		},
		"secret"
	);
};

usersSchema.methods.toAuthJSON = function() {
	return {
		_id: this._id,
		email: this.email,
		token: this.generateJWT()
	};
};

module.exports = mongoose.model("Users", usersSchema);
