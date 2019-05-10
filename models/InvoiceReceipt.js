const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const invoicereceiptSchema = new Schema({
	_user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
	docID: { type: String, required: true },
	orderID: { type: String, required: true },
	isInvoice: { type: Boolean, default: false },
	isReceipt: { type: Boolean, default: false },
	date: { type: Date, default: Date.now }
});

const InvoiceReceipt = mongoose.model("InvoiceReceipt", invoicereceiptSchema);

module.exports = InvoiceReceipt;
