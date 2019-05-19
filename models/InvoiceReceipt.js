const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const invoicereceiptsSchema = new Schema(
	{
		_user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
			required: true
		},
		_reserves: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Reservations",
				required: true
			}
		],
		docID: { type: String, required: true },
		orderID: { type: String, required: true },
		isInvoice: { type: Boolean, default: false },
		isReceipt: { type: Boolean, default: false },
		amount: { type: Boolean, default: false },
		seat: { type: Boolean, default: false }
	},
	{ timestamps: true }
);
const Invoicereceipts = mongoose.model(
	"Invoicereceipts",
	invoicereceiptsSchema
);

module.exports = Invoicereceipts;
