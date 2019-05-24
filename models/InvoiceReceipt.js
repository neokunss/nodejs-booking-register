const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const countersSchema = new Schema({
	id: { type: String, required: true, unique: true },
	seq: { type: Number, default: 1 }
});

const invoicereceiptsSchema = new Schema(
	{
		_user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
			autopopulate: { maxDepth: 1 }
		},
		reservations: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Reservations",
				autopopulate: { maxDepth: 1 }
			}
		],
		bookID: { type: Number },
		isInvoice: { type: Boolean, default: false },
		isReceipt: { type: Boolean, default: false },
		amount: { type: Number, required: true },
		seat: { type: Number, required: true },
		paypalDocID: { type: String, required: false },
		paypalPayerID: { type: String, required: false },
		paypalOrderID: { type: String, required: false },
		paypalJson: { type: Object },
		status: { type: String, required: true, default: "Waiting" }
	},
	{ timestamps: true }
);

invoicereceiptsSchema.plugin(require("mongoose-autopopulate"));
invoicereceiptsSchema.plugin(require("mongoose-unique-validator"));
invoicereceiptsSchema.plugin(require("mongoose-sequence")(mongoose), {
	id: "bookID_counter",
	inc_field: "bookID",
	disable_hooks: true
});

// invoicereceiptsSchema.pre("save", function(next) {
// 	var doc = this;
// 	Counters.findByIdAndUpdate(
// 		{ id: "bookID_counter" },
// 		{ $inc: { seq: 1 } },
// 		{ new: true },
// 		function(error, counter) {
// 			if (error) return next(error);
// 			doc.bookID = counter.seq;
// 			next();
// 		}
// 	);
// });

// invoicereceiptsSchema.setNext("bookID_counter", function(err, user) {});

const Invoicereceipts = mongoose.model(
	"Invoicereceipts",
	invoicereceiptsSchema
);

const Counters = mongoose.model("Counters", countersSchema);

module.exports = Counters;
module.exports = Invoicereceipts;
