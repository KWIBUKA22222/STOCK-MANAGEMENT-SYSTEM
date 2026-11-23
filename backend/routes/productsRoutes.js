
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET: Kureba products zose
router.get("/", async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.id,
                p.product_name,
                p.sku,
                p.category_id,
                p.supplier_id,
                p.quantity,
                p.unit_price,
                p.created_at,
                c.category_name,
                s.supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.id DESC
        `);

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error("Get Products Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to load products"
        });
    }
});

// POST: Kongeramo product nshya
router.post("/", async (req, res) => {
    try {
        const {
            product_name,
            sku,
            category_id,
            supplier_id,
            quantity,
            unit_price
        } = req.body;

        if (
            !product_name?.trim() ||
            !sku?.trim() ||
            quantity === undefined ||
            unit_price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Product name, SKU, quantity and unit price are required"
            });
        }

        const qty = Number(quantity);
        const price = Number(unit_price);

        if (
            !Number.isInteger(qty) ||
            qty < 0 ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity and unit price must be valid positive numbers"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM products WHERE sku = ?",
            [sku.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This SKU already exists"
            });
        }

        const [result] = await db.query(
            `INSERT INTO products
            (product_name, sku, category_id, supplier_id, quantity, unit_price)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                product_name.trim(),
                sku.trim(),
                category_id || null,
                supplier_id || null,
                qty,
                price
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Add Product Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to add product"
        });
    }
});

// PUT: Guhindura product
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            product_name,
            sku,
            category_id,
            supplier_id,
            quantity,
            unit_price
        } = req.body;

        if (
            !product_name?.trim() ||
            !sku?.trim() ||
            quantity === undefined ||
            unit_price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required product information"
            });
        }

        const qty = Number(quantity);
        const price = Number(unit_price);

        if (
            !Number.isInteger(qty) ||
            qty < 0 ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity or unit price"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM products WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const [duplicate] = await db.query(
            "SELECT id FROM products WHERE sku = ? AND id != ?",
            [sku.trim(), id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This SKU is already used by another product"
            });
        }

        await db.query(
            `UPDATE products SET
                product_name = ?,
                sku = ?,
                category_id = ?,
                supplier_id = ?,
                quantity = ?,
                unit_price = ?
            WHERE id = ?`,
            [
                product_name.trim(),
                sku.trim(),
                category_id || null,
                supplier_id || null,
                qty,
                price,
                id
            ]
        );

        res.json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Update Product Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
});

// DELETE: Gusiba product
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query(
            "SELECT id FROM products WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await db.query(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete Product Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not delete product. It may have stock transaction records."
        });
    }
});

export default router;
