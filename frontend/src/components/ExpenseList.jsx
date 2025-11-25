import React, { useState } from 'react';
import { Edit2, Trash2, Calendar, Tag, CreditCard, IndianRupee } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate, formatCurrency } from '../utils/formatters';
import './ExpenseList.css';

const ExpenseList = ({ onEditExpense }) => {
  const { 
    expenses, 
    loading, 
    error, 
    pagination, 
    fetchExpenses, 
    deleteExpense, 
    filters, 
    updateFilters 
  } = useExpenses();
  
  const { recheckBudgetAfterDelete } = useNotifications();
  const { isDarkMode } = useTheme();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Apply client-side sorting to ensure title sorting works correctly
  const sortedExpenses = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return expenses;

    const sorted = [...expenses];

    if (filters.sortBy === 'title') {
      sorted.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        
        if (filters.sortOrder === 'asc') {
          return titleA.localeCompare(titleB);
        } else {
          return titleB.localeCompare(titleA);
        }
      });
    }

    return sorted;
  }, [expenses, filters.sortBy, filters.sortOrder]);

  const categories = [
    'all', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Travel', 'Education', 'Groceries',
    'Personal Care', 'Home & Garden', 'Insurance', 'Investments', 
    'Gifts & Donations', 'Business', 'Other'
  ];

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value });
  };

  const handleDelete = async (id) => {
    const result = await deleteExpense(id);
    if (result.success) {
      setDeleteConfirm(null);
      // Recheck budget after deletion
      recheckBudgetAfterDelete();
    }
  };

  const handlePageChange = (page) => {
    fetchExpenses(page);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': '#FF6B6B',
      'Transportation': '#4ECDC4',
      'Shopping': '#45B7D1',
      'Entertainment': '#96CEB4',
      'Bills & Utilities': '#FECA57',
      'Healthcare': '#FF9FF3',
      'Travel': '#54A0FF',
      'Education': '#5F27CD',
      'Groceries': '#00D2D3',
      'Personal Care': '#FF9F43',
      'Home & Garden': '#26DE81',
      'Insurance': '#A55EEA',
      'Investments': '#2ED573',
      'Gifts & Donations': '#FFA502',
      'Business': '#3742FA',
      'Other': '#747D8C'
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="expense-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-list-container">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => fetchExpenses(1)} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list-container">
      {/* Filters */}
      <div className="expense-filters">
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="start-date">From:</label>
          <input
            id="start-date"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="end-date">To:</label>
          <input
            id="end-date"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">Sort by:</label>
          <select
            id="sort-by"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              updateFilters({ sortBy, sortOrder });
            }}
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Expense List */}
      {sortedExpenses.length === 0 ? (
        <div className="no-expenses">
          <div className="no-expenses-icon">💰</div>
          <h3>No expenses found</h3>
          <p>Start tracking your expenses to see them here.</p>
        </div>
      ) : (
        <>
          <div className="expenses-grid">
            {sortedExpenses.map((expense) => (
              <div key={expense._id} className="expense-card">
                <div className="expense-header">
                  <div className="expense-title">
                    <h3>{expense.title}</h3>
                    <div className="expense-amount">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                  <div className="expense-actions">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="action-btn edit-btn"
                      title="Edit expense"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(expense._id)}
                      className="action-btn delete-btn"
                      title="Delete expense"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="expense-details">
                  <div className="detail-item">
                    <Tag size={14} />
                    <span 
                      className="category-badge"
                      style={{ 
                        backgroundColor: `${getCategoryColor(expense.category)}20`,
                        color: getCategoryColor(expense.category)
                      }}
                    >
                      {expense.category}
                    </span>
                  </div>

                  <div className="detail-item">
                    <Calendar size={14} />
                    <span>{formatDate(expense.date)}</span>
                  </div>

                  <div className="detail-item">
                    <CreditCard size={14} />
                    <span>{expense.paymentMethod}</span>
                  </div>
                </div>

                {expense.description && (
                  <div className="expense-description">
                    <p>{expense.description}</p>
                  </div>
                )}

                {expense.tags && expense.tags.length > 0 && (
                  <div className="expense-tags">
                    {expense.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {expense.isRecurring && (
                  <div className="recurring-badge">
                    🔄 Recurring
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
              >
                ← Previous
              </button>

              <div className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
                <span className="total-items">
                  ({pagination.totalItems} total items)
                </span>
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Expense</h3>
            <p>Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="delete-confirm-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;