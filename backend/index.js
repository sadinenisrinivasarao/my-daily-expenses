require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./lib/db");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", async (req, res) => {
  await connectDB();
  res.json({ status: "OK", service: "Expense Tracker Backend" });
});

// API routes
app.use("/api/expenses", async (req, res, next) => {
  await connectDB();
  next();
}, expenseRoutes);

// IMPORTANT
module.exports = app;
