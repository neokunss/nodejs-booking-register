var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var validateEmail = function(email) {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email);
};

const userSchema = new Schema(
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
		dob: { type: Date, required: [true, "Date of birth must be provided"] },
		salt: { type: String },
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

const User = mongoose.model("User", userSchema);
const Address = mongoose.model("Address", addressSchema);
const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = mongoose.model("Users", userSchema);
