
import express from "express";
import db from "../config/db.js";

const router = express.Router();

// GET: Kureba categories zose
router.get("/", async (req, res) => {
    try {
        const [categories] = await db.query(
            "SELECT * FROM categories ORDER BY id DESC"
        );

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load categories"
        });
    }
});

// POST: Kongeramo category nshya
router.post("/", async (req, res) => {
    try {
        const { category_name, description } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM categories WHERE category_name = ?",
            [category_name.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This category already exists"
            });
        }

        const [result] = await db.query(
            "INSERT INTO categories (category_name, description) VALUES (?, ?)",
            [category_name.trim(), description || null]
        );

        res.status(201).json({
            success: true,
            message: "Category added successfully",
            categoryId: result.insertId
        });
    } catch (error) {
        console.error("Add category error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add category"
        });
    }
});

// PUT: Guhindura category
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM categories WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const [duplicate] = await db.query(
            "SELECT id FROM categories WHERE category_name = ? AND id != ?",
            [category_name.trim(), id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This category name is already used"
            });
        }

        await db.query(
            "UPDATE categories SET category_name = ?, description = ? WHERE id = ?",
            [category_name.trim(), description || null, id]
        );

        res.json({
            success: true,
            message: "Category updated successfully"
        });
    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update category"
        });
    }
});

// DELETE: Gusiba category
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query(
            "SELECT id FROM categories WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        await db.query(
            "DELETE FROM categories WHERE id = ?",
            [id]
        );

        res.json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        console.error("Delete category error:", error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message: "This category is used by products and cannot be deleted"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete category"
        });
    }
});

export default router;
