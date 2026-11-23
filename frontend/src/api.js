
const API_URL = "http://localhost:5000/api/auth";
const DASHBOARD_URL = "http://localhost:5000/api/dashboard";
const PRODUCTS_URL = "http://localhost:5000/api/products";
const CATEGORIES_URL = "http://localhost:5000/api/categories";
const SUPPLIERS_URL = "http://localhost:5000/api/suppliers";
const TRANSACTIONS_URL = "http://localhost:5000/api/transactions";

// ===============================
// AUTHENTICATION
// ===============================

export async function registerUser(userData) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    return data;
}

export async function loginUser(userData) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}

// ===============================
// DASHBOARD
// ===============================

export async function getDashboardStats() {
    const response = await fetch(`${DASHBOARD_URL}/stats`);
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load dashboard statistics");
    }

    return data;
}

export async function getRecentTransactions() {
    const response = await fetch(`${DASHBOARD_URL}/recent-transactions`);
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load recent transactions");
    }

    return data;
}

// ===============================
// PRODUCTS
// ===============================

export async function getProducts() {
    const response = await fetch(PRODUCTS_URL);
    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load products");
    }

    return data;
}

export async function addProduct(productData) {
    const response = await fetch(PRODUCTS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to add product");
    }

    return data;
}

export async function updateProduct(id, productData) {
    const response = await fetch(`${PRODUCTS_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update product");
    }

    return data;
}

export async function deleteProduct(id) {
    const response = await fetch(`${PRODUCTS_URL}/${id}`, {
        method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete product");
    }

    return data;
}

// ===============================
// CATEGORIES
// ===============================

export async function getCategories() {
    const response = await fetch(CATEGORIES_URL);
    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load categories");
    }

    return data;
}

export async function addCategory(categoryData) {
    const response = await fetch(CATEGORIES_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(categoryData)
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to add category");
    }

    return data;
}

export async function updateCategory(id, categoryData) {
    const response = await fetch(`${CATEGORIES_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(categoryData)
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update category");
    }

    return data;
}

export async function deleteCategory(id) {
    const response = await fetch(`${CATEGORIES_URL}/${id}`, {
        method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete category");
    }

    return data;
}

// ===============================
// SUPPLIERS
// ===============================

export async function getSuppliers() {
    const response = await fetch(SUPPLIERS_URL);
    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load suppliers");
    }

    return data;
}

export async function addSupplier(supplierData) {
    const response = await fetch(SUPPLIERS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(supplierData)
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to add supplier");
    }

    return data;
}

export async function updateSupplier(id, supplierData) {
    const response = await fetch(`${SUPPLIERS_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(supplierData)
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update supplier");
    }

    return data;
}

export async function deleteSupplier(id) {
    const response = await fetch(`${SUPPLIERS_URL}/${id}`, {
        method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete supplier");
    }

    return data;
}

// ===============================
// STOCK TRANSACTIONS
// ===============================

// GET ALL TRANSACTIONS
export async function getStockTransactions() {
    const response = await fetch(TRANSACTIONS_URL);
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load transactions");
    }

    return data.transactions || [];
}

// ADD STOCK TRANSACTION
export async function addStockTransaction(transactionData) {
    const response = await fetch(TRANSACTIONS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transactionData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save transaction");
    }

    return data;
}
