const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: { type: String, enum: ["IN", "OUT"] },
  category: {
    type: String,
    enum: ["FOOD", "ACCOMMODATION", "SHOPPING", "PERSONAL_CARE"]
  },
  paymentMode: {
    type: String,
    enum: ["CREDIT_CARD", "BANK_TRANSFER"]
  },
  entryDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", expenseSchema);
