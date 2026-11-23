import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET ALL STOCK TRANSACTIONS
router.get("/", async (req, res) => {
    try {
        const [transactions] = await db.execute(`
            SELECT
                st.id,
                st.product_id,
                st.user_id,
                st.transaction_type,
                st.quantity,
                st.reference,
                st.notes,
                st.created_at,
                p.product_name,
                p.sku,
                u.full_name
            FROM stock_transactions st
            LEFT JOIN products p ON st.product_id = p.id
            LEFT JOIN users u ON st.user_id = u.id
            ORDER BY st.id DESC
        `);

        res.json({
            success: true,
            transactions
        });

    } catch (error) {
        console.error("Get transactions error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load stock transactions"
        });
    }
});


// ADD STOCK TRANSACTION
router.post("/", async (req, res) => {
    let connection;

    try {
        const {
            product_id,
            user_id,
            transaction_type,
            quantity,
            reference,
            notes
        } = req.body;

        const productId = Number(product_id);
        const userId = Number(user_id);
        const transactionQuantity = Number(quantity);
        const type = String(transaction_type || "").toUpperCase();

        if (
            !Number.isInteger(productId) ||
            productId <= 0 ||
            !Number.isInteger(userId) ||
            userId <= 0 ||
            !Number.isInteger(transactionQuantity) ||
            transactionQuantity <= 0 ||
            !["IN", "OUT"].includes(type)
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter valid product, user, transaction type and quantity"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check product and lock its row
        const [products] = await connection.execute(
            "SELECT id, quantity FROM products WHERE id = ? FOR UPDATE",
            [productId]
        );

        if (products.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check user
        const [users] = await connection.execute(
            "SELECT id FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const currentStock = Number(products[0].quantity);

        if (type === "OUT" && transactionQuantity > currentStock) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Available quantity: ${currentStock}`
            });
        }

        // Update product quantity
        if (type === "IN") {
            await connection.execute(
                "UPDATE products SET quantity = quantity + ? WHERE id = ?",
                [transactionQuantity, productId]
            );
        } else {
            await connection.execute(
                "UPDATE products SET quantity = quantity - ? WHERE id = ?",
                [transactionQuantity, productId]
            );
        }

        // Save transaction
        const [result] = await connection.execute(
            `INSERT INTO stock_transactions
            (product_id, user_id, transaction_type, quantity, reference, notes)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                productId,
                userId,
                type,
                transactionQuantity,
                reference || null,
                notes || null
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: `Stock ${type} transaction saved successfully`,
            transactionId: result.insertId
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Add transaction error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save stock transaction"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

export default router;