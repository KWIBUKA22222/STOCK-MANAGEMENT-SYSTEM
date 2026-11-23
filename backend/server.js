
import stockTransactionsRoutes from "./routes/stockTransactionsRoutes.js";
import suppliersRoutes from "./routes/suppliersRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();

// MIDDLEWARE
app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// HOME
app.get("/", (req, res) => {
    res.send("STOCK MANAGEMENT SYSTEM API IS RUNNING");
});

// DATABASE HEALTH
app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS database_name"
        );

        res.json({
            success: true,
            message: "Backend and MySQL connected successfully",
            database: rows[0].database_name
        });
    } catch (error) {
        console.error("Database Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/transactions", stockTransactionsRoutes);
// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("-----------------------------------");
    console.log("STOCK MANAGEMENT SYSTEM API");
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Database: stock_management_db");
    console.log("-----------------------------------");
});
