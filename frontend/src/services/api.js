import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('Server error occurred');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to server. Make sure the backend is running on port 3001');
    }
    
    return Promise.reject(error);
  }
);

// Expense API functions
export const expenseAPI = {
  // Get all expenses with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  // Get single expense by ID
  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create new expense
  create: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Update existing expense
  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Delete expense
  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get monthly summary
  getMonthlySummary: async (year, month) => {
    const response = await api.get(`/expenses/summary/monthly/${year}/${month}`);
    return response.data;
  },

  // Get spending trends
  getSpendingTrends: async (months = 6) => {
    const response = await api.get('/expenses/trends/spending', { 
      params: { months } 
    });
    return response.data;
  },

  // Get dashboard analytics
  getDashboardAnalytics: async () => {
    const response = await api.get('/expenses/analytics/dashboard');
    return response.data;
  }
};

// AI API functions
export const aiAPI = {
  // Categorize expense using AI
  categorizeExpense: async (title, description, amount) => {
    const response = await api.post('/ai/categorize', {
      title,
      description,
      amount
    });
    return response.data;
  },

  // Get monthly summary with AI insights
  getAISummary: async (year, month) => {
    const response = await api.get(`/ai/summary/${year}/${month}`);
    return response.data;
  },

  // Get budgeting tips
  getBudgetingTips: async (months = 3) => {
    const response = await api.get('/ai/budgeting-tips', { 
      params: { months } 
    });
    return response.data;
  },

  // Bulk categorize expenses
  bulkCategorize: async (expenses) => {
    const response = await api.post('/ai/bulk-categorize', { expenses });
    return response.data;
  },

  // Get spending insights
  getSpendingInsights: async (period = 6) => {
    const response = await api.get('/ai/spending-insights', { 
      params: { period } 
    });
    return response.data;
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      isServerDown: error.code === 'ECONNREFUSED' || error.response?.status >= 500
    };
  }
};

export default api;