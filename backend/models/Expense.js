const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  type: { type: String, enum: ["IN", "OUT"] },
  entryDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", expenseSchema);
