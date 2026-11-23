
import { useEffect, useMemo, useState } from "react";

import {
    loginUser,
    registerUser,
    getDashboardStats,
    getRecentTransactions,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getStockTransactions,
    addStockTransaction
} from "./api.js";

import "./App.css";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getArray = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
};

const money = (value) =>
    Number(value || 0).toLocaleString("en-US");

const today = () => new Date().toISOString().slice(0, 10);

const LOW_STOCK_LIMIT = 5;

// ==========================================
// MAIN APP
// ==========================================

function App() {
    // AUTHENTICATION
    const [page, setPage] = useState("login");

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("stockUser")) || null;
        } catch {
            return null;
        }
    });

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // NAVIGATION
    const [activePage, setActivePage] = useState("Dashboard");

    // DASHBOARD
    const [stats, setStats] = useState({});
    const [recentTransactions, setRecentTransactions] = useState([]);

    // PRODUCTS
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [productForm, setProductForm] = useState({
        product_name: "",
        sku: "",
        category_id: "",
        supplier_id: "",
        quantity: 0,
        unit_price: 0
    });
    const [editingProduct, setEditingProduct] = useState(null);
    const [productSaving, setProductSaving] = useState(false);

    // CATEGORIES
    const [categories, setCategories] = useState([]);
    const [categoryForm, setCategoryForm] = useState({
        category_name: "",
        description: ""
    });
    const [editingCategory, setEditingCategory] = useState(null);
    const [categorySaving, setCategorySaving] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");

    // SUPPLIERS
    const [suppliers, setSuppliers] = useState([]);
    const [supplierForm, setSupplierForm] = useState({
        supplier_name: "",
        phone: "",
        email: "",
        address: ""
    });
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [supplierSaving, setSupplierSaving] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState("");

    // STOCK TRANSACTIONS
    const [stockTransactions, setStockTransactions] = useState([]);
    const [stockTransactionsLoading, setStockTransactionsLoading] = useState(false);
    const [transactionSaving, setTransactionSaving] = useState(false);

    const [transactionForm, setTransactionForm] = useState({
        product_id: "",
        transaction_type: "IN",
        quantity: 1,
        reference: "",
        notes: ""
    });

    const [transactionSearch, setTransactionSearch] = useState("");

    // REPORTS
    const [reportStartDate, setReportStartDate] = useState("");
    const [reportEndDate, setReportEndDate] = useState("");
    const [reportSearch, setReportSearch] = useState("");

    const [error, setError] = useState("");

    // ==========================================
    // AUTHENTICATION FUNCTIONS
    // ==========================================

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const result = await registerUser({
                full_name: fullName,
                email,
                password
            });

            if (result.success) {
                setMessage("Registration successful. Please login.");
                setPage("login");
                setFullName("");
                setEmail("");
                setPassword("");
            } else {
                setMessage(result.message || "Registration failed.");
            }
        } catch (err) {
            setMessage(err.message || "Registration failed. Check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const result = await loginUser({
                email,
                password
            });

            if (result.success) {
                const loggedInUser = result.user;

                if (!loggedInUser) {
                    throw new Error("Login response does not contain user information.");
                }

                setUser(loggedInUser);

                localStorage.setItem(
                    "stockUser",
                    JSON.stringify(loggedInUser)
                );

                if (result.token) {
                    localStorage.setItem("stockToken", result.token);
                }

                setActivePage("Dashboard");
                setPassword("");
            } else {
                setMessage(result.message || "Invalid email or password.");
            }
        } catch (err) {
            setMessage(err.message || "Login failed. Check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("stockUser");
        localStorage.removeItem("stockToken");

        setUser(null);
        setPage("login");
        setActivePage("Dashboard");
        setPassword("");
        setMessage("");
    };

    // ==========================================
    // LOAD DATA FUNCTIONS
    // ==========================================

    const loadDashboard = async () => {
        try {
            const result = await getDashboardStats();
            setStats(result.stats || result);
        } catch (err) {
            setError(err.message || "Could not load dashboard.");
        }

        try {
            const result = await getRecentTransactions();
            setRecentTransactions(
                getArray(result, "transactions")
            );
        } catch (err) {
            console.error("Recent transactions:", err);
        }
    };

    const loadProducts = async () => {
        try {
            const result = await getProducts();
            setProducts(getArray(result, "products"));
        } catch (err) {
            setError(err.message || "Could not load products.");
        }
    };

    const loadCategories = async () => {
        try {
            const result = await getCategories();
            setCategories(getArray(result, "categories"));
        } catch (err) {
            setError(err.message || "Could not load categories.");
        }
    };

    const loadSuppliers = async () => {
        try {
            const result = await getSuppliers();
            setSuppliers(getArray(result, "suppliers"));
        } catch (err) {
            setError(err.message || "Could not load suppliers.");
        }
    };

    const loadStockTransactions = async () => {
        setStockTransactionsLoading(true);

        try {
            const result = await getStockTransactions();

            setStockTransactions(
                getArray(result, "transactions")
            );
        } catch (err) {
            setError(err.message || "Could not load stock transactions.");
        } finally {
            setStockTransactionsLoading(false);
        }
    };

    // ==========================================
    // LOAD DATA WHEN PAGE CHANGES
    // ==========================================

    useEffect(() => {
        if (!user) return;

        setError("");

        if (activePage === "Dashboard") {
            loadDashboard();
        }

        if (activePage === "Products") {
            loadProducts();
            loadCategories();
            loadSuppliers();
        }

        if (activePage === "Categories") {
            loadCategories();
        }

        if (activePage === "Suppliers") {
            loadSuppliers();
        }

        if (activePage === "Stock Transactions") {
            loadProducts();
            loadStockTransactions();
        }

        if (activePage === "Reports") {
            loadProducts();
            loadCategories();
            loadSuppliers();
            loadStockTransactions();
            loadDashboard();
        }
    }, [activePage, user]);

    // ==========================================
    // PRODUCTS FUNCTIONS
    // ==========================================

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        setProductSaving(true);
        setError("");

        const productData = {
            ...productForm,
            category_id: Number(productForm.category_id),
            supplier_id: productForm.supplier_id
                ? Number(productForm.supplier_id)
                : null,
            quantity: Number(productForm.quantity),
            unit_price: Number(productForm.unit_price)
        };

        try {
            let result;

            if (editingProduct) {
                result = await updateProduct(
                    editingProduct,
                    productData
                );
            } else {
                result = await addProduct(productData);
            }

            if (result.success === false) {
                throw new Error(result.message || "Product operation failed.");
            }

            setProductForm({
                product_name: "",
                sku: "",
                category_id: "",
                supplier_id: "",
                quantity: 0,
                unit_price: 0
            });

            setEditingProduct(null);

            await loadProducts();
            await loadDashboard();

        } catch (err) {
            setError(err.message || "Could not save product.");
        } finally {
            setProductSaving(false);
        }
    };

    const editProduct = (product) => {
        setEditingProduct(product.id);

        setProductForm({
            product_name: product.product_name || "",
            sku: product.sku || "",
            category_id: product.category_id || "",
            supplier_id: product.supplier_id || "",
            quantity: product.quantity || 0,
            unit_price: product.unit_price || 0
        });

        window.scrollTo(0, 0);
    };

    const removeProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            const result = await deleteProduct(id);

            if (result.success === false) {
                throw new Error(result.message || "Could not delete product.");
            }

            await loadProducts();
            await loadDashboard();
        } catch (err) {
            setError(err.message || "Could not delete product.");
        }
    };

    // ==========================================
    // CATEGORIES FUNCTIONS
    // ==========================================

    const handleCategorySubmit = async (e) => {
        e.preventDefault();

        setCategorySaving(true);
        setError("");

        try {
            let result;

            if (editingCategory) {
                result = await updateCategory(
                    editingCategory,
                    categoryForm
                );
            } else {
                result = await addCategory(categoryForm);
            }

            if (result.success === false) {
                throw new Error(result.message || "Category operation failed.");
            }

            setCategoryForm({
                category_name: "",
                description: ""
            });

            setEditingCategory(null);

            await loadCategories();
            await loadDashboard();

        } catch (err) {
            setError(err.message || "Could not save category.");
        } finally {
            setCategorySaving(false);
        }
    };

    const editCategory = (category) => {
        setEditingCategory(category.id);

        setCategoryForm({
            category_name: category.category_name || "",
            description: category.description || ""
        });
    };

    const removeCategory = async (id) => {
        if (!window.confirm("Delete this category?")) return;

        try {
            const result = await deleteCategory(id);

            if (result.success === false) {
                throw new Error(result.message || "Could not delete category.");
            }

            await loadCategories();
            await loadDashboard();
        } catch (err) {
            setError(err.message || "Could not delete category.");
        }
    };

    // ==========================================
    // SUPPLIERS FUNCTIONS
    // ==========================================

    const handleSupplierSubmit = async (e) => {
        e.preventDefault();

        setSupplierSaving(true);
        setError("");

        try {
            let result;

            if (editingSupplier) {
                result = await updateSupplier(
                    editingSupplier,
                    supplierForm
                );
            } else {
                result = await addSupplier(supplierForm);
            }

            if (result.success === false) {
                throw new Error(result.message || "Supplier operation failed.");
            }

            setSupplierForm({
                supplier_name: "",
                phone: "",
                email: "",
                address: ""
            });

            setEditingSupplier(null);

            await loadSuppliers();
            await loadDashboard();

        } catch (err) {
            setError(err.message || "Could not save supplier.");
        } finally {
            setSupplierSaving(false);
        }
    };

    const editSupplier = (supplier) => {
        setEditingSupplier(supplier.id);

        setSupplierForm({
            supplier_name: supplier.supplier_name || "",
            phone: supplier.phone || "",
            email: supplier.email || "",
            address: supplier.address || ""
        });
    };

    const removeSupplier = async (id) => {
        if (!window.confirm("Delete this supplier?")) return;

        try {
            const result = await deleteSupplier(id);

            if (result.success === false) {
                throw new Error(result.message || "Could not delete supplier.");
            }

            await loadSuppliers();
            await loadDashboard();
        } catch (err) {
            setError(err.message || "Could not delete supplier.");
        }
    };

    // ==========================================
    // STOCK TRANSACTIONS FUNCTIONS
    // ==========================================

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();

        if (transactionSaving) return;

        if (!transactionForm.product_id) {
            setError("Please select a product.");
            return;
        }

        if (Number(transactionForm.quantity) <= 0) {
            setError("Quantity must be greater than zero.");
            return;
        }

        if (!user?.id) {
            setError("Please login again. User ID is missing.");
            return;
        }

        setTransactionSaving(true);
        setError("");

        try {
            const transactionData = {
                product_id: Number(transactionForm.product_id),
                user_id: Number(user.id),
                transaction_type: transactionForm.transaction_type,
                quantity: Number(transactionForm.quantity),
                reference: transactionForm.reference,
                notes: transactionForm.notes
            };

            const result = await addStockTransaction(transactionData);

            if (result.success === false) {
                throw new Error(result.message || "Transaction failed.");
            }

            setTransactionForm({
                product_id: "",
                transaction_type: "IN",
                quantity: 1,
                reference: "",
                notes: ""
            });

            await loadStockTransactions();
            await loadProducts();
            await loadDashboard();

        } catch (err) {
            setError(err.message || "Could not save transaction.");
        } finally {
            setTransactionSaving(false);
        }
    };

    // ==========================================
    // FILTERED DATA
    // ==========================================

    const filteredProducts = products.filter((product) =>
        `${product.product_name} ${product.sku}`
            .toLowerCase()
            .includes(productSearch.toLowerCase())
    );

    const filteredCategories = categories.filter((category) =>
        `${category.category_name} ${category.description || ""}`
            .toLowerCase()
            .includes(categorySearch.toLowerCase())
    );

    const filteredSuppliers = suppliers.filter((supplier) =>
        `${supplier.supplier_name} ${supplier.email || ""} ${supplier.phone || ""}`
            .toLowerCase()
            .includes(supplierSearch.toLowerCase())
    );

    const filteredStockTransactions = stockTransactions.filter((transaction) =>
        `${transaction.product_name || ""} ${transaction.transaction_type || ""} ${transaction.reference || ""}`
            .toLowerCase()
            .includes(transactionSearch.toLowerCase())
    );

    // ==========================================
    // REPORT CALCULATIONS
    // ==========================================

    const reportTransactions = useMemo(() => {
        return stockTransactions.filter((transaction) => {
            const transactionDate = transaction.created_at
                ? new Date(transaction.created_at)
                : null;

            const start = reportStartDate
                ? new Date(`${reportStartDate}T00:00:00`)
                : null;

            const end = reportEndDate
                ? new Date(`${reportEndDate}T23:59:59`)
                : null;

            const matchesStart = !start ||
                (transactionDate && transactionDate >= start);

            const matchesEnd = !end ||
                (transactionDate && transactionDate <= end);

            const searchText =
                `${transaction.product_name || ""} ${transaction.transaction_type || ""} ${transaction.reference || ""}`
                    .toLowerCase();

            const matchesSearch = searchText.includes(
                reportSearch.toLowerCase()
            );

            return matchesStart && matchesEnd && matchesSearch;
        });
    }, [
        stockTransactions,
        reportStartDate,
        reportEndDate,
        reportSearch
    ]);

    const totalStockIn = reportTransactions
        .filter((item) => item.transaction_type === "IN")
        .reduce((total, item) => total + Number(item.quantity || 0), 0);

    const totalStockOut = reportTransactions
        .filter((item) => item.transaction_type === "OUT")
        .reduce((total, item) => total + Number(item.quantity || 0), 0);

    const currentStock = products.reduce(
        (total, product) => total + Number(product.quantity || 0),
        0
    );

    const lowStockProducts = products.filter(
        (product) => Number(product.quantity || 0) <= LOW_STOCK_LIMIT
    );

    const totalStockValue = products.reduce(
        (total, product) =>
            total +
            Number(product.quantity || 0) *
            Number(product.unit_price || 0),
        0
    );

    // ==========================================
    // PRINT REPORT
    // ==========================================

    const printReport = () => {
        window.print();
    };

    // ==========================================
    // STYLES
    // ==========================================

    const styles = {
        app: {
            display: "flex",
            minHeight: "100vh",
            background: "#f3f6fb",
            fontFamily: "Arial, sans-serif",
            color: "#263238"
        },
        sidebar: {
            width: "245px",
            background: "#073b74",
            color: "white",
            padding: "22px 15px",
            boxSizing: "border-box",
            flexShrink: 0
        },
        logo: {
            fontSize: "21px",
            fontWeight: "bold",
            marginBottom: "30px",
            textAlign: "center"
        },
        menu: {
            display: "block",
            width: "100%",
            padding: "13px",
            marginBottom: "7px",
            border: "none",
            borderRadius: "7px",
            textAlign: "left",
            cursor: "pointer",
            fontSize: "14px"
        },
        main: {
            flex: 1,
            minWidth: 0,
            padding: "25px",
            boxSizing: "border-box"
        },
        topbar: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            background: "white",
            padding: "17px 22px",
            borderRadius: "10px",
            marginBottom: "25px"
        },
        cardGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "15px",
            marginBottom: "25px"
        },
        card: {
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        },
        panel: {
            background: "white",
            padding: "22px",
            borderRadius: "10px",
            marginBottom: "22px",
            overflowX: "auto"
        },
        input: {
            width: "100%",
            padding: "11px",
            marginBottom: "12px",
            border: "1px solid #ccd4df",
            borderRadius: "6px",
            boxSizing: "border-box"
        },
        button: {
            padding: "10px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            background: "#073b74",
            color: "white",
            marginRight: "7px"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "600px"
        },
        cell: {
            padding: "12px",
            borderBottom: "1px solid #e5eaf0",
            textAlign: "left"
        },
        formGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "10px"
        }
    };

    // ==========================================
    // LOGIN / REGISTER PAGE
    // ==========================================

    if (!user) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#eaf0f8",
                padding: "20px",
                boxSizing: "border-box"
            }}>
                <div style={{
                    width: "100%",
                    maxWidth: "420px",
                    background: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 5px 25px rgba(0,0,0,0.1)"
                }}>
                    <h2 style={{ textAlign: "center", color: "#073b74" }}>
                        STOCK MANAGEMENT SYSTEM
                    </h2>

                    <p style={{ textAlign: "center", color: "#64748b" }}>
                        {page === "login" ? "Login to your account" : "Create a new account"}
                    </p>

                    {message && (
                        <p style={{
                            background: "#fff3cd",
                            padding: "10px",
                            borderRadius: "6px"
                        }}>
                            {message}
                        </p>
                    )}

                    <form onSubmit={
                        page === "login" ? handleLogin : handleRegister
                    }>
                        {page === "register" && (
                            <input
                                style={styles.input}
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        )}

                        <input
                            style={styles.input}
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            style={{ ...styles.button, width: "100%", padding: "13px" }}
                            disabled={loading}
                        >
                            {loading
                                ? "Please wait..."
                                : page === "login"
                                    ? "Login"
                                    : "Register"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "20px" }}>
                        {page === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}

                        <button
                            onClick={() => {
                                setPage(page === "login" ? "register" : "login");
                                setMessage("");
                            }}
                            style={{
                                border: "none",
                                background: "none",
                                color: "#073b74",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            {page === "login" ? " Register" : " Login"}
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN APPLICATION
    // ==========================================

    const menuItems = [
        "Dashboard",
        "Products",
        "Categories",
        "Suppliers",
        "Stock Transactions",
        "Reports"
    ];

    return (
        <div style={styles.app}>

            {/* SIDEBAR */}

            <aside className="sidebar" style={styles.sidebar}>
                <div style={styles.logo}>
                    STOCK SYSTEM
                </div>

                {menuItems.map((item) => (
                    <button
                        key={item}
                        style={{
                            ...styles.menu,
                            background: activePage === item ? "#f4b400" : "transparent",
                            color: activePage === item ? "#073b74" : "white",
                            fontWeight: activePage === item ? "bold" : "normal"
                        }}
                        onClick={() => setActivePage(item)}
                    >
                        {item}
                    </button>
                ))}

                <button
                    style={{
                        ...styles.menu,
                        marginTop: "35px",
                        background: "#b42318",
                        color: "white"
                    }}
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </aside>

            {/* MAIN CONTENT */}

            <main style={styles.main}>

                <header className="topbar" style={styles.topbar}>
                    <div>
                        <h2 style={{ margin: 0 }}>{activePage}</h2>
                        <small style={{ color: "#64748b" }}>
                            Stock Management System
                        </small>
                    </div>

                    <div>
                        Welcome, <strong>{user.full_name || user.email}</strong>
                    </div>
                </header>

                {error && (
                    <div style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: "12px",
                        borderRadius: "7px",
                        marginBottom: "18px"
                    }}>
                        {error}
                        <button
                            onClick={() => setError("")}
                            style={{ float: "right", cursor: "pointer" }}
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* ======================================
                    DASHBOARD
                ====================================== */}

                {activePage === "Dashboard" && (
                    <>
                        <h2>Dashboard Overview</h2>

                        <div style={styles.cardGrid}>
                            {[
                                ["Total Products", stats.totalProducts || 0],
                                ["Total Categories", stats.totalCategories || 0],
                                ["Total Suppliers", stats.totalSuppliers || 0],
                                ["Total Stock", stats.totalStock || 0],
                                ["Low Stock Alerts", stats.lowStock || 0],
                                ["Total Transactions", stats.totalTransactions || 0]
                            ].map(([label, value]) => (
                                <div key={label} style={styles.card}>
                                    <p style={{ color: "#64748b" }}>{label}</p>
                                    <h2 style={{ color: "#073b74", margin: 0 }}>
                                        {money(value)}
                                    </h2>
                                </div>
                            ))}
                        </div>

                        <div style={styles.panel}>
                            <h3>Recent Transactions</h3>

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.cell}>Product</th>
                                        <th style={styles.cell}>Type</th>
                                        <th style={styles.cell}>Quantity</th>
                                        <th style={styles.cell}>Reference</th>
                                        <th style={styles.cell}>Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentTransactions.map((item) => (
                                        <tr key={item.id}>
                                            <td style={styles.cell}>{item.product_name}</td>
                                            <td style={styles.cell}>{item.transaction_type}</td>
                                            <td style={styles.cell}>{item.quantity}</td>
                                            <td style={styles.cell}>{item.reference}</td>
                                            <td style={styles.cell}>
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleDateString()
                                                    : ""}
                                            </td>
                                        </tr>
                                    ))}

                                    {recentTransactions.length === 0 && (
                                        <tr>
                                            <td style={styles.cell} colSpan="5">
                                                No transactions available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ======================================
                    PRODUCTS
                ====================================== */}

                {activePage === "Products" && (
                    <>
                        <h2>Products Management</h2>

                        <div style={styles.panel}>
                            <h3>{editingProduct ? "Update Product" : "Add New Product"}</h3>

                            <form onSubmit={handleProductSubmit}>
                                <div style={styles.formGrid}>
                                    <input
                                        style={styles.input}
                                        placeholder="Product Name"
                                        value={productForm.product_name}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            product_name: e.target.value
                                        })}
                                        required
                                    />

                                    <input
                                        style={styles.input}
                                        placeholder="SKU"
                                        value={productForm.sku}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            sku: e.target.value
                                        })}
                                        required
                                    />

                                    <select
                                        style={styles.input}
                                        value={productForm.category_id}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            category_id: e.target.value
                                        })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.category_name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        style={styles.input}
                                        value={productForm.supplier_id}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            supplier_id: e.target.value
                                        })}
                                    >
                                        <option value="">Select Supplier (Optional)</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.supplier_name}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        style={styles.input}
                                        type="number"
                                        min="0"
                                        placeholder="Quantity"
                                        value={productForm.quantity}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            quantity: e.target.value
                                        })}
                                        required
                                    />

                                    <input
                                        style={styles.input}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Unit Price"
                                        value={productForm.unit_price}
                                        onChange={(e) => setProductForm({
                                            ...productForm,
                                            unit_price: e.target.value
                                        })}
                                        required
                                    />
                                </div>

                                <button style={styles.button} disabled={productSaving}>
                                    {productSaving
                                        ? "Saving..."
                                        : editingProduct
                                            ? "Update Product"
                                            : "Add Product"}
                                </button>

                                {editingProduct && (
                                    <button
                                        type="button"
                                        style={{ ...styles.button, background: "#64748b" }}
                                        onClick={() => {
                                            setEditingProduct(null);
                                            setProductForm({
                                                product_name: "",
                                                sku: "",
                                                category_id: "",
                                                supplier_id: "",
                                                quantity: 0,
                                                unit_price: 0
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </form>
                        </div>

                        <div style={styles.panel}>
                            <h3>Products List</h3>

                            <input
                                style={styles.input}
                                placeholder="Search products..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                            />

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.cell}>Name</th>
                                        <th style={styles.cell}>SKU</th>
                                        <th style={styles.cell}>Category ID</th>
                                        <th style={styles.cell}>Quantity</th>
                                        <th style={styles.cell}>Unit Price</th>
                                        <th style={styles.cell}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td style={styles.cell}>{product.product_name}</td>
                                            <td style={styles.cell}>{product.sku}</td>
                                            <td style={styles.cell}>{product.category_id}</td>
                                            <td style={styles.cell}>{product.quantity}</td>
                                            <td style={styles.cell}>{money(product.unit_price)}</td>
                                            <td style={styles.cell}>
                                                <button
                                                    style={styles.button}
                                                    onClick={() => editProduct(product)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    style={{ ...styles.button, background: "#b42318" }}
                                                    onClick={() => removeProduct(product.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredProducts.length === 0 && (
                                        <tr>
                                            <td style={styles.cell} colSpan="6">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ======================================
                    CATEGORIES
                ====================================== */}

                {activePage === "Categories" && (
                    <>
                        <h2>Categories Management</h2>

                        <div style={styles.panel}>
                            <h3>{editingCategory ? "Update Category" : "Add Category"}</h3>

                            <form onSubmit={handleCategorySubmit}>
                                <input
                                    style={styles.input}
                                    placeholder="Category Name"
                                    value={categoryForm.category_name}
                                    onChange={(e) => setCategoryForm({
                                        ...categoryForm,
                                        category_name: e.target.value
                                    })}
                                    required
                                />

                                <textarea
                                    style={{ ...styles.input, minHeight: "90px" }}
                                    placeholder="Description"
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({
                                        ...categoryForm,
                                        description: e.target.value
                                    })}
                                />

                                <button style={styles.button} disabled={categorySaving}>
                                    {categorySaving
                                        ? "Saving..."
                                        : editingCategory
                                            ? "Update Category"
                                            : "Add Category"}
                                </button>

                                {editingCategory && (
                                    <button
                                        type="button"
                                        style={{ ...styles.button, background: "#64748b" }}
                                        onClick={() => {
                                            setEditingCategory(null);
                                            setCategoryForm({
                                                category_name: "",
                                                description: ""
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </form>
                        </div>

                        <div style={styles.panel}>
                            <h3>Categories List</h3>

                            <input
                                style={styles.input}
                                placeholder="Search categories..."
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                            />

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.cell}>ID</th>
                                        <th style={styles.cell}>Category Name</th>
                                        <th style={styles.cell}>Description</th>
                                        <th style={styles.cell}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id}>
                                            <td style={styles.cell}>{category.id}</td>
                                            <td style={styles.cell}>{category.category_name}</td>
                                            <td style={styles.cell}>{category.description}</td>
                                            <td style={styles.cell}>
                                                <button
                                                    style={styles.button}
                                                    onClick={() => editCategory(category)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    style={{ ...styles.button, background: "#b42318" }}
                                                    onClick={() => removeCategory(category.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredCategories.length === 0 && (
                                        <tr>
                                            <td style={styles.cell} colSpan="4">
                                                No categories found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ======================================
                    SUPPLIERS
                ====================================== */}

                {activePage === "Suppliers" && (
                    <>
                        <h2>Suppliers Management</h2>

                        <div style={styles.panel}>
                            <h3>{editingSupplier ? "Update Supplier" : "Add Supplier"}</h3>

                            <form onSubmit={handleSupplierSubmit}>
                                <div style={styles.formGrid}>
                                    <input
                                        style={styles.input}
                                        placeholder="Supplier Name"
                                        value={supplierForm.supplier_name}
                                        onChange={(e) => setSupplierForm({
                                            ...supplierForm,
                                            supplier_name: e.target.value
                                        })}
                                        required
                                    />

                                    <input
                                        style={styles.input}
                                        placeholder="Phone"
                                        value={supplierForm.phone}
                                        onChange={(e) => setSupplierForm({
                                            ...supplierForm,
                                            phone: e.target.value
                                        })}
                                    />

                                    <input
                                        style={styles.input}
                                        type="email"
                                        placeholder="Email"
                                        value={supplierForm.email}
                                        onChange={(e) => setSupplierForm({
                                            ...supplierForm,
                                            email: e.target.value
                                        })}
                                    />

                                    <input
                                        style={styles.input}
                                        placeholder="Address"
                                        value={supplierForm.address}
                                        onChange={(e) => setSupplierForm({
                                            ...supplierForm,
                                            address: e.target.value
                                        })}
                                    />
                                </div>

                                <button style={styles.button} disabled={supplierSaving}>
                                    {supplierSaving
                                        ? "Saving..."
                                        : editingSupplier
                                            ? "Update Supplier"
                                            : "Add Supplier"}
                                </button>

                                {editingSupplier && (
                                    <button
                                        type="button"
                                        style={{ ...styles.button, background: "#64748b" }}
                                        onClick={() => {
                                            setEditingSupplier(null);
                                            setSupplierForm({
                                                supplier_name: "",
                                                phone: "",
                                                email: "",
                                                address: ""
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </form>
                        </div>

                        <div style={styles.panel}>
                            <h3>Suppliers List</h3>

                            <input
                                style={styles.input}
                                placeholder="Search suppliers..."
                                value={supplierSearch}
                                onChange={(e) => setSupplierSearch(e.target.value)}
                            />

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.cell}>Name</th>
                                        <th style={styles.cell}>Phone</th>
                                        <th style={styles.cell}>Email</th>
                                        <th style={styles.cell}>Address</th>
                                        <th style={styles.cell}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td style={styles.cell}>{supplier.supplier_name}</td>
                                            <td style={styles.cell}>{supplier.phone}</td>
                                            <td style={styles.cell}>{supplier.email}</td>
                                            <td style={styles.cell}>{supplier.address}</td>
                                            <td style={styles.cell}>
                                                <button
                                                    style={styles.button}
                                                    onClick={() => editSupplier(supplier)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    style={{ ...styles.button, background: "#b42318" }}
                                                    onClick={() => removeSupplier(supplier.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredSuppliers.length === 0 && (
                                        <tr>
                                            <td style={styles.cell} colSpan="5">
                                                No suppliers found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ======================================
                    STOCK TRANSACTIONS
                ====================================== */}

                {activePage === "Stock Transactions" && (
                    <>
                        <h2>Stock Transactions</h2>

                        <div style={styles.panel}>
                            <h3>Record Stock IN / OUT</h3>

                            <form onSubmit={handleTransactionSubmit}>
                                <select
                                    style={styles.input}
                                    value={transactionForm.product_id}
                                    onChange={(e) => setTransactionForm({
                                        ...transactionForm,
                                        product_id: e.target.value
                                    })}
                                    required
                                >
                                    <option value="">Select Product</option>

                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.product_name} - Stock: {product.quantity}
                                        </option>
                                    ))}
                                </select>

                                <div style={styles.formGrid}>
                                    <select
                                        style={styles.input}
                                        value={transactionForm.transaction_type}
                                        onChange={(e) => setTransactionForm({
                                            ...transactionForm,
                                            transaction_type: e.target.value
                                        })}
                                    >
                                        <option value="IN">Stock IN</option>
                                        <option value="OUT">Stock OUT</option>
                                    </select>

                                    <input
                                        style={styles.input}
                                        type="number"
                                        min="1"
                                        placeholder="Quantity"
                                        value={transactionForm.quantity}
                                        onChange={(e) => setTransactionForm({
                                            ...transactionForm,
                                            quantity: e.target.value
                                        })}
                                        required
                                    />

                                    <input
                                        style={styles.input}
                                        placeholder="Reference"
                                        value={transactionForm.reference}
                                        onChange={(e) => setTransactionForm({
                                            ...transactionForm,
                                            reference: e.target.value
                                        })}
                                    />
                                </div>

                                <textarea
                                    style={{ ...styles.input, minHeight: "80px" }}
                                    placeholder="Notes"
                                    value={transactionForm.notes}
                                    onChange={(e) => setTransactionForm({
                                        ...transactionForm,
                                        notes: e.target.value
                                    })}
                                />

                                <button
                                    style={styles.button}
                                    disabled={transactionSaving || stockTransactionsLoading}
                                >
                                    {transactionSaving ? "Saving..." : "Save Transaction"}
                                </button>
                            </form>
                        </div>

                        <div style={styles.panel}>
                            <h3>Transaction History</h3>

                            <input
                                style={styles.input}
                                placeholder="Search transactions..."
                                value={transactionSearch}
                                onChange={(e) => setTransactionSearch(e.target.value)}
                            />

                            {stockTransactionsLoading ? (
                                <p>Loading transactions...</p>
                            ) : (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.cell}>Product</th>
                                            <th style={styles.cell}>Type</th>
                                            <th style={styles.cell}>Quantity</th>
                                            <th style={styles.cell}>Reference</th>
                                            <th style={styles.cell}>Notes</th>
                                            <th style={styles.cell}>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredStockTransactions.map((item) => (
                                            <tr key={item.id}>
                                                <td style={styles.cell}>{item.product_name}</td>
                                                <td style={styles.cell}>
                                                    <strong style={{
                                                        color: item.transaction_type === "IN"
                                                            ? "green"
                                                            : "#b42318"
                                                    }}>
                                                        {item.transaction_type}
                                                    </strong>
                                                </td>
                                                <td style={styles.cell}>{item.quantity}</td>
                                                <td style={styles.cell}>{item.reference}</td>
                                                <td style={styles.cell}>{item.notes}</td>
                                                <td style={styles.cell}>
                                                    {item.created_at
                                                        ? new Date(item.created_at).toLocaleDateString()
                                                        : ""}
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredStockTransactions.length === 0 && (
                                            <tr>
                                                <td style={styles.cell} colSpan="6">
                                                    No transactions found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}

                {/* ======================================
                    REPORTS
                ====================================== */}

                {activePage === "Reports" && (
                    <div className="report-content">
                        <h2>Stock Management Reports</h2>

                        <p style={{ color: "#64748b" }}>
                            View stock movement, current stock, low stock and stock value.
                        </p>

                        {/* REPORT FILTERS */}

                        <div className="report-actions" style={styles.panel}>
                            <h3>Filter Reports</h3>

                            <div style={styles.formGrid}>
                                <div>
                                    <label>Start Date</label>
                                    <input
                                        style={styles.input}
                                        type="date"
                                        value={reportStartDate}
                                        onChange={(e) => setReportStartDate(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>End Date</label>
                                    <input
                                        style={styles.input}
                                        type="date"
                                        value={reportEndDate}
                                        onChange={(e) => setReportEndDate(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label>Search</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Product, type or reference..."
                                        value={reportSearch}
                                        onChange={(e) => setReportSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                style={styles.button}
                                onClick={() => {
                                    setReportStartDate("");
                                    setReportEndDate("");
                                    setReportSearch("");
                                }}
                            >
                                Clear Filters
                            </button>

                            <button
                                style={{ ...styles.button, background: "#16803c" }}
                                onClick={printReport}
                            >
                                Print Report
                            </button>
                        </div>

                        {/* REPORT SUMMARY */}

                        <div style={styles.cardGrid}>
                            <div style={styles.card}>
                                <p>Total Products</p>
                                <h2>{products.length}</h2>
                            </div>

                            <div style={styles.card}>
                                <p>Stock IN</p>
                                <h2 style={{ color: "green" }}>
                                    {money(totalStockIn)}
                                </h2>
                            </div>

                            <div style={styles.card}>
                                <p>Stock OUT</p>
                                <h2 style={{ color: "#b42318" }}>
                                    {money(totalStockOut)}
                                </h2>
                            </div>

                            <div style={styles.card}>
                                <p>Current Stock</p>
                                <h2>{money(currentStock)}</h2>
                            </div>

                            <div style={styles.card}>
                                <p>Low Stock Products</p>
                                <h2 style={{ color: "#b45309" }}>
                                    {lowStockProducts.length}
                                </h2>
                            </div>

                            <div style={styles.card}>
                                <p>Total Stock Value</p>
                                <h2>{money(totalStockValue)}</h2>
                            </div>
                        </div>

                        {/* STOCK MOVEMENT REPORT */}

                        <div style={styles.panel}>
                            <h3>Stock Movement Report</h3>

                            <p>
                                Transactions found: <strong>{reportTransactions.length}</strong>
                            </p>

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.cell}>Product</th>
                                        <th style={styles.cell}>Transaction Type</th>
                                        <th style={styles.cell}>Quantity</th>
                                        <th style={styles.cell}>Reference</th>
                                        <th style={styles.cell}>Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {reportTransactions.map((item) => (
                                        <tr key={item.id}>
                                            <td style={styles.cell}>{item.product_name}</td>
                                            <td style={styles.cell}>
                                                {item.transaction_type}
                                            </td>
                                            <td style={styles.cell}>{item.quantity}</td>
                                            <td style={styles.cell}>{item.reference}</td>
                                            <td style={styles.cell}>
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleDateString()
                                                    : ""}
                                            </td>
                                        </tr>
                                    ))}

                                    {reportTransactions.length === 0 && (
                                        <tr>
                                            <td style={styles.cell} colSpan="5">
                                                No transactions found for the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* CURRENT STOCK REPORT */}

                        <div style={styles.panel}>
                            <h3>Current Stock Report</h3>

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.cell}>Product</th>
                                        <th style={styles.cell}>SKU</th>
                                        <th style={styles.cell}>Quantity</th>
                                        <th style={styles.cell}>Unit Price</th>
                                        <th style={styles.cell}>Total Value</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td style={styles.cell}>
                                                {product.product_name}
                                            </td>
                                            <td style={styles.cell}>{product.sku}</td>
                                            <td style={styles.cell}>{product.quantity}</td>
                                            <td style={styles.cell}>
                                                {money(product.unit_price)}
                                            </td>
                                            <td style={styles.cell}>
                                                {money(
                                                    Number(product.quantity || 0) *
                                                    Number(product.unit_price || 0)
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {products.length === 0 && (
                                        <tr>
                                            <td style={styles.cell} colSpan="5">
                                                No products available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* LOW STOCK REPORT */}

                        <div style={styles.panel}>
                            <h3>Low Stock Report</h3>

                            <p>
                                Low stock means quantity is {LOW_STOCK_LIMIT} or below.
                            </p>

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.cell}>Product</th>
                                        <th style={styles.cell}>SKU</th>
                                        <th style={styles.cell}>Available Quantity</th>
                                        <th style={styles.cell}>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {lowStockProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td style={styles.cell}>
                                                {product.product_name}
                                            </td>
                                            <td style={styles.cell}>{product.sku}</td>
                                            <td style={styles.cell}>{product.quantity}</td>
                                            <td style={styles.cell}>
                                                <strong style={{ color: "#b42318" }}>
                                                    LOW STOCK
                                                </strong>
                                            </td>
                                        </tr>
                                    ))}

                                    {lowStockProducts.length === 0 && (
                                        <tr>
                                            <td style={styles.cell} colSpan="4">
                                                No low stock products.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* CATEGORY REPORT */}

                        <div style={styles.panel}>
                            <h3>Categories Report</h3>

                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.cell}>Category ID</th>
                                        <th style={styles.cell}>Category Name</th>
                                        <th style={styles.cell}>Description</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.map((category) => (
                                        <tr key={category.id}>
                                            <td style={styles.cell}>{category.id}</td>
                                            <td style={styles.cell}>
                                                {category.category_name}
                                            </td>
                                            <td style={styles.cell}>
                                                {category.description}
                                            </td>
                                        </tr>
                                    ))}

                                    {categories.length === 0 && (
                                        <tr>
                                            <td style={styles.cell} colSpan="3">
                                                No categories available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <p style={{ color: "#64748b", fontSize: "13px" }}>
                            Report generated on: {new Date().toLocaleString()}
                        </p>
                    </div>
                )}

            </main>

            {/* PRINT STYLES */}

            <style>{`
                @media print {
                    .sidebar,
                    .topbar,
                    .report-actions {
                        display: none !important;
                    }

                    body {
                        background: white !important;
                    }

                    main {
                        padding: 0 !important;
                    }

                    .report-content {
                        width: 100% !important;
                    }

                    table {
                        page-break-inside: auto;
                    }

                    tr {
                        page-break-inside: avoid;
                    }
                }

                @media (max-width: 750px) {
                    .sidebar {
                        width: 170px !important;
                    }
                }
            `}</style>

        </div>
    );
}

export default App;
