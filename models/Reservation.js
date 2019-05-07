const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const reservationSchema = new Schema({
	_user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	food: { type: String, required: true },
	date: {
		type: Date,
		default: Date.now
	},
	address: {
		street: String,
		city: String,
		state: String,
		zip: Number
	}
});

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;
