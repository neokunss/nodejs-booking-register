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
		seat: { type: Number },
		orderID: { type: String },
		paymentProfile: {
			isBusiness: { type: Boolean, default: false },
			firstName: {
				type: String,
				required: [true, "First name cannot be left blank."]
			},
			lastName: {
				type: String,
				required: [true, "Last name cannot be left blank."]
			},

			companyName: String,
			companyTaxId: String,
			companyOffice: String,
			companyFax: String,

			address: String,
			addressStreet: String,
			addressCity: String,
			addressProvince: String,
			addressPostalCode: String,

			mobile: String,
			phone: String
		},
		invoicereceipts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Invoicereceipts",
				required: true
			}
		],
		reservations: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Reservations",
				required: true
			}
		]
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
