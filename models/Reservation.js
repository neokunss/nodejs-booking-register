const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const reservationsSchema = new Schema(
	{
		_user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users"
		},
		_transactionid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Invoicereceipts"
		},
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true },
		food: { type: String, required: true },
		address: {
			street: String,
			city: String,
			state: String,
			zip: Number
		}
	},
	{ timestamps: true }
);

reservationsSchema.plugin(require("mongoose-autopopulate"));

const Reservations = mongoose.model("Reservations", reservationsSchema);

module.exports = Reservations;
