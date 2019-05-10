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
			required: [true, "Email address cannot be left blank."]
		},
		password: {
			type: String,
			required: [true, "Password cannot be left blank"]
		},
		hash: { type: String },
		salt: { type: String },
		isVerification: { type: Boolean, default: false },
		isAdmin: { type: Boolean, default: false },
		// dob: { type: Date, required: [true, "Date of birth must be provided"] },
		paymentProfile: {
			isBusiness: { type: Boolean, default: false },
			firstName: String,
			lastName: String,

			companyName: String,
			companyTaxId: String,
			companyOffice: Number,
			companyFax: Number,

			address: String,
			addressStreet: String,
			addressCity: String,
			addressProvince: String,
			addressPostalCode: Number,

			mobile: Number,
			phone: Number
		}
	},
	{ timestamps: true }
);

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

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
