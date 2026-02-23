import axios from 'axios';

// Auto detect environment
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3001/api"
    : "https://smart-tracer-1.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 ${config.method?.toUpperCase()} → ${API_BASE_URL}${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ← ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);

    if (error.response?.status === 500) {
      console.error("Server error occurred");
    } else if (error.response?.status === 404) {
      console.error("Resource not found");
    } else if (error.code === "ECONNREFUSED") {
      console.error("Backend not running on localhost:3001");
    }

    return Promise.reject(error);
  }
);

/* ===============================
   EXPENSE API
================================= */

export const expenseAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/expenses", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (expenseData) => {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  },

  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getMonthlySummary: async (year, month) => {
    const response = await api.get(`/expenses/summary/monthly/${year}/${month}`);
    return response.data;
  },

  getSpendingTrends: async (months = 6) => {
    const response = await api.get("/expenses/trends/spending", {
      params: { months },
    });
    return response.data;
  },

  getDashboardAnalytics: async () => {
    const response = await api.get("/expenses/analytics/dashboard");
    return response.data;
  },
};

/* ===============================
   AI API
================================= */

export const aiAPI = {
  categorizeExpense: async (title, description, amount) => {
    const response = await api.post("/ai/categorize", {
      title,
      description,
      amount,
    });
    return response.data;
  },

  getAISummary: async (year, month) => {
    const response = await api.get(`/ai/summary/${year}/${month}`);
    return response.data;
  },

  getBudgetingTips: async (months = 3) => {
    const response = await api.get("/ai/budgeting-tips", {
      params: { months },
    });
    return response.data;
  },

  bulkCategorize: async (expenses) => {
    const response = await api.post("/ai/bulk-categorize", { expenses });
    return response.data;
  },

  getSpendingInsights: async (period = 6) => {
    const response = await api.get("/ai/spending-insights", {
      params: { period },
    });
    return response.data;
  },
};

/* ===============================
   HEALTH CHECK
================================= */

export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      isServerDown:
        error.code === "ECONNREFUSED" || error.response?.status >= 500,
    };
  }
};

export default api;