const router = require("express").Router();
const Expense = require("../models/Expense");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

/* CREATE */
router.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const body = { ...req.body };

    // If a file is uploaded keep metadata (file buffer is in `req.file.buffer`).
    if (req.file) {
      body.receiptOriginalName = req.file.originalname;
    }

    if (body.amount) body.amount = Number(body.amount);
    if (body.entryDate) body.entryDate = new Date(body.entryDate);
    // Ensure owner/email is set on the expense (expect client to provide `email`)
    if (!body.email && !body.owner) {
      return res.status(400).json({ error: "Missing owner/email" });
    }

    // normalize to `owner`
    body.owner = body.owner || body.email;

    const expense = new Expense(body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* READ */
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { email } = req.query;
    let filter = {};

    if (email) {
      filter.owner = email;
    }

    if (startDate && endDate) {
      filter.entryDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(filter).sort({ entryDate: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* READ BY ID */
/* SUMMARY */
router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate, email } = req.query;

    const pipeline = [];

    const match = {};

    if (startDate && endDate) {
      match.entryDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (email) {
      match.owner = email;
    }

    if (Object.keys(match).length) {
      pipeline.push({ $match: match });
    }

    pipeline.push({ $group: { _id: "$type", total: { $sum: "$amount" } } });

    const agg = await Expense.aggregate(pipeline);

    let totalIn = 0;
    let totalOut = 0;

    agg.forEach((g) => {
      if (g._id === "IN") totalIn = g.total || 0;
      if (g._id === "OUT") totalOut = g.total || 0;
    });

    const balance = (totalIn || 0) - (totalOut || 0);

    res.json({ totalIn, totalOut, balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* UPDATE */
router.put("/:id", async (req, res) => {
  try {
    const { email } = req.query;

    const existing = await Expense.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Expense not found" });

    if (email && existing.owner !== email) {
      return res.status(403).json({ error: "Not authorized to update this expense" });
    }

    // Prevent owner change via update
    if (req.body.owner) delete req.body.owner;

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE */
router.delete("/:id", async (req, res) => {
  try {
    const { email } = req.query;

    const existing = await Expense.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Expense not found" });

    if (email && existing.owner !== email) {
      return res.status(403).json({ error: "Not authorized to delete this expense" });
    }

    const deleted = await Expense.findByIdAndDelete(req.params.id);

    res.json({ message: "Expense deleted successfully", expense: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
