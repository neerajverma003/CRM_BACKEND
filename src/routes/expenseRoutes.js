import express from "express";
import { createExpense, getAllCheque, getExpenseBill } from "../controller/expenseController.js";

const router = express.Router();

// POST /expense/expense
router.post("/", createExpense);

// GET all expenses
router.get("/all", getAllCheque);
router.get("/expense/:id/bill", getExpenseBill);
export default router;
