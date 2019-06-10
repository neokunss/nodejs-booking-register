/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const reservationsSchema = new Schema(
	{
		_user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: `Users`,
			autopopulate: { maxDepth: 1 }
			// eslint-disable-next-line indent
		},
		_transactionid: {
			type: mongoose.Schema.Types.ObjectId,
			ref: `Invoicereceipts`,
			autopopulate: { maxDepth: 1 }
		},
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true },
		food: { type: String, required: true },
		status: { type: String, required: true, default: `Wait for Confirm` },
		address: {
			street: String,
			city: String,
			state: String,
			zip: Number
		}
	},
	{ timestamps: true }
);

reservationsSchema.plugin(require(`mongoose-autopopulate`));

// Equivalent to calling `pre()` on `find`, `findOne`, `findOneAndUpdate`.

reservationsSchema.methods.getFullname = function() {
	return this.firstName + " " + this.lastName;
};

reservationsSchema.methods.getFullnamesft = function () {
	if (this.firstName != '' && this.lastName != '') {
		return this.firstName + " " + this.lastName;
	}
	return 'No Name';
};

const Reservations = mongoose.model(`Reservations`, reservationsSchema);

module.exports = Reservations;
