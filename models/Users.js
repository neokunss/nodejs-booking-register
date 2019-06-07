const mongoose = require("mongoose");
const crypto = require("crypto");
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
		hash: { type: String, required: true },
		salt: { type: String, required: true },
		isVerification: { type: Boolean, default: false },
		isAdmin: { type: Boolean, default: false },
		role: { type: String, default: 'user'},
		paymentProfile: {
			isBusiness: { type: Boolean, default: false },
			firstName: String,
			lastName: String,

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
				autopopulate: { maxDepth: 2 }
			}
		]
		// reservations: [
		// 	{
		// 		type: mongoose.Schema.Types.ObjectId,
		// 		ref: "Reservations",
		// 		autopopulate: { maxDepth: 2 }
		// 	}
		// ]
	},
	{ timestamps: true }
);
usersSchema.plugin(require("mongoose-autopopulate"));
usersSchema.plugin(require("mongoose-unique-validator"));

// Equivalent to calling `pre()` on `find`, `findOne`, `findOneAndUpdate`.
usersSchema.pre(`/^find/`, function(next) {
	console.log(this.getQuery());
});

// Equivalent to calling `pre()` on `find`, `findOne`, `findOneAndUpdate`.

usersSchema.methods.getFullname = function() {
	return this.paymentProfile.firstName + " " + this.paymentProfile.lastName;
};

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

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
