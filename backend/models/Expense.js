const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // IN = Income, OUT = Paid Out
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
      default: "OUT",
    },

    category: {
      type: String,
      enum: [
        "FOOD",
        "ACCOMMODATION",
        "SHOPPING",
        "PERSONAL_CARE",
        "TRAVEL",
        "SALARY",
        "OTHER_INCOME",
      ],
      required: true,
    },

    paymentMode: {
      type: String,
      enum: ["CASH", "CREDIT_CARD", "BANK_TRANSFER"],
      required: true,
    },

    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Expense", expenseSchema);
