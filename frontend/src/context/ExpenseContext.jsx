import React, { createContext, useContext, useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [filters, setFilters] = useState({
    category: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Fetch expenses with current filters
  const fetchExpenses = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await expenseAPI.getAll(params);
      
      if (response.success) {
        setExpenses(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch expenses');
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.message || 'Failed to fetch expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new expense
  const createExpense = async (expenseData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await expenseAPI.create(expenseData);
      
      if (response.success) {
        // Refresh expenses list
        await fetchExpenses(pagination.currentPage);
        return { success: true, data: response.data };
      } else {
        setError('Failed to create expense');
        return { success: false, error: 'Failed to create expense' };
      }
    } catch (err) {
      console.error('Error creating expense:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create expense';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update existing expense
  const updateExpense = async (id, expenseData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await expenseAPI.update(id, expenseData);
      
      if (response.success) {
        // Update local state
        setExpenses(prev => prev.map(exp => 
          exp._id === id ? response.data : exp
        ));
        return { success: true, data: response.data };
      } else {
        setError('Failed to update expense');
        return { success: false, error: 'Failed to update expense' };
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update expense';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await expenseAPI.delete(id);
      
      if (response.success) {
        // Remove from local state
        setExpenses(prev => prev.filter(exp => exp._id !== id));
        
        // If no items left on current page, go to previous page
        if (expenses.length === 1 && pagination.currentPage > 1) {
          await fetchExpenses(pagination.currentPage - 1);
        } else {
          await fetchExpenses(pagination.currentPage);
        }
        
        return { success: true };
      } else {
        setError('Failed to delete expense');
        return { success: false, error: 'Failed to delete expense' };
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete expense';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: 'all',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  // Fetch expenses when filters change
  useEffect(() => {
    fetchExpenses(1);
  }, [filters]);

  // Clear errors after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value = {
    expenses,
    loading,
    error,
    pagination,
    filters,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    updateFilters,
    clearFilters,
    setError
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};