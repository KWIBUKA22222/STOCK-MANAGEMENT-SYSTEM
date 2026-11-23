
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET ALL SUPPLIERS
router.get("/", async (req, res) => {
    try {
        const [suppliers] = await db.query(
            "SELECT * FROM suppliers ORDER BY id DESC"
        );

        res.json({
            success: true,
            suppliers
        });

    } catch (error) {
        console.error("GET SUPPLIERS:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load suppliers"
        });
    }
});

// ADD SUPPLIER
router.post("/", async (req, res) => {
    try {
        const {
            supplier_name,
            phone,
            email,
            address
        } = req.body;

        if (!supplier_name || !supplier_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Supplier name is required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO suppliers
            (supplier_name, phone, email, address)
            VALUES (?, ?, ?, ?)`,
            [
                supplier_name.trim(),
                phone || null,
                email || null,
                address || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Supplier added successfully",
            supplierId: result.insertId
        });

    } catch (error) {
        console.error("ADD SUPPLIER:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add supplier"
        });
    }
});

// UPDATE SUPPLIER
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            supplier_name,
            phone,
            email,
            address
        } = req.body;

        if (!supplier_name || !supplier_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Supplier name is required"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM suppliers WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        await db.query(
            `UPDATE suppliers
            SET supplier_name = ?,
                phone = ?,
                email = ?,
                address = ?
            WHERE id = ?`,
            [
                supplier_name.trim(),
                phone || null,
                email || null,
                address || null,
                id
            ]
        );

        res.json({
            success: true,
            message: "Supplier updated successfully"
        });

    } catch (error) {
        console.error("UPDATE SUPPLIER:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update supplier"
        });
    }
});

// DELETE SUPPLIER
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query(
            "SELECT id FROM suppliers WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Supplier not found"
            });
        }

        await db.query(
            "DELETE FROM suppliers WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Supplier deleted successfully"
        });

    } catch (error) {
        console.error("DELETE SUPPLIER:", error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({
                success: false,
                message: "This supplier is being used by products and cannot be deleted."
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete supplier"
        });
    }
});

export default router;
