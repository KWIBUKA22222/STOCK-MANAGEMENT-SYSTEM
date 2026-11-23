
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET DASHBOARD STATISTICS
router.get("/stats", async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT COUNT(*) AS total FROM products"
        );

        const [categories] = await db.query(
            "SELECT COUNT(*) AS total FROM categories"
        );

        const [suppliers] = await db.query(
            "SELECT COUNT(*) AS total FROM suppliers"
        );

        const [transactions] = await db.query(
            "SELECT COUNT(*) AS total FROM stock_transactions"
        );

        const [stock] = await db.query(
            "SELECT COALESCE(SUM(quantity), 0) AS total FROM products"
        );

        const [lowStock] = await db.query(
            "SELECT COUNT(*) AS total FROM products WHERE quantity <= 5"
        );

        res.json({
            success: true,
            stats: {
                totalProducts: products[0].total,
                totalCategories: categories[0].total,
                totalSuppliers: suppliers[0].total,
                totalTransactions: transactions[0].total,
                totalStock: stock[0].total,
                lowStock: lowStock[0].total
            }
        });

    } catch (error) {
        console.error("DASHBOARD ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard statistics"
        });
    }
});

// GET RECENT TRANSACTIONS
router.get("/recent-transactions", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                st.id,
                p.product_name,
                st.transaction_type,
                st.quantity,
                st.reference,
                st.created_at
            FROM stock_transactions st
            LEFT JOIN products p ON st.product_id = p.id
            ORDER BY st.created_at DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            transactions: rows
        });

    } catch (error) {
        console.error("RECENT TRANSACTIONS ERROR:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to load recent transactions"
        });
    }
});

export default router;
