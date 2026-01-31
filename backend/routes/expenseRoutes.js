const router = require("express").Router();
const Expense = require("../models/Expense");

/* CREATE */
router.post("/", async (req, res) => {
  const expense = new Expense(req.body);
  await expense.save();
  res.json(expense);
});

/* READ (list + date filter) */
router.get("/", async (req, res) => {
  const { startDate, endDate } = req.query;
  let filter = {};

  if (startDate && endDate) {
    filter.entryDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const expenses = await Expense.find(filter).sort({ entryDate: -1 });
  res.json(expenses);
});

/* READ BY ID (IMPORTANT) */
router.get("/:id", async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  res.json(expense);
});

/* UPDATE (THIS FIXES YOUR ERROR) */
router.put("/:id", async (req, res) => {
  const updated = await Expense.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

module.exports = router;
