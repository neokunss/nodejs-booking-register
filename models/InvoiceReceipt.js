const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const invoicereceiptsSchema = new Schema(
	{
		_user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users"
		},
		_reserves: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Reservations"
			}
		],
		docID: { type: String, required: true },
		orderID: { type: String, required: true },
		isInvoice: { type: Boolean, default: false },
		isReceipt: { type: Boolean, default: false },
		amount: { type: Number, required: true },
		seat: { type: Number, required: true }
	},
	{ timestamps: true }
);

invoicereceiptsSchema.plugin(require("mongoose-autopopulate"));

const Invoicereceipts = mongoose.model(
	"Invoicereceipts",
	invoicereceiptsSchema
);

module.exports = Invoicereceipts;
