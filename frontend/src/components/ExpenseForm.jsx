import React, { useState } from 'react';
import { X, IndianRupee, Calendar, Tag, FileText, CreditCard, Repeat } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useNotifications } from '../context/NotificationContext';
import { aiAPI } from '../services/api';
import './ExpenseForm.css';

const ExpenseForm = ({ isOpen, onClose, expense = null, onSubmit }) => {
  const { createExpense, updateExpense } = useExpenses();
  const { checkBudgetLimits } = useNotifications();
  const isEditing = Boolean(expense);

  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || 'Other',
    description: expense?.description || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paymentMethod: expense?.paymentMethod || 'Cash',
    isRecurring: expense?.isRecurring || false,
    tags: expense?.tags?.join(', ') || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Groceries',
    'Personal Care',
    'Home & Garden',
    'Insurance',
    'Investments',
    'Gifts & Donations',
    'Business',
    'Other'
  ];

  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAICategoriztion = async () => {
    if (!formData.title.trim()) {
      setErrors({ title: 'Please enter a title first for AI categorization' });
      return;
    }

    setIsAIProcessing(true);
    try {
      const response = await aiAPI.categorizeExpense(
        formData.title,
        formData.description,
        formData.amount
      );

      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          category: response.data.category
        }));
        
        // Show AI confidence as a brief notification
        console.log(`AI categorized as "${response.data.category}" with ${Math.round(response.data.confidence * 100)}% confidence`);
      }
    } catch (error) {
      console.error('AI categorization failed:', error);
      // Fallback to manual category selection
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      let result;
      if (isEditing) {
        result = await updateExpense(expense._id, expenseData);
      } else {
        result = await createExpense(expenseData);
      }

      if (result.success) {
        onSubmit?.(result.data);
        
        // Check budget limits after adding expense with a small delay
        if (!isEditing) {
          // Only check budget for new expenses
          setTimeout(() => {
            checkBudgetLimits(expenseData.amount, expenseData.date);
          }, 100);
        }
        
        onClose();
        // Reset form
        setFormData({
          title: '',
          amount: '',
          category: 'Other',
          description: '',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
          isRecurring: false,
          tags: ''
        });
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to save expense. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="expense-form-overlay">
      <div className="expense-form-modal">
        <div className="expense-form-header">
          <h2>
            <IndianRupee size={24} />
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button 
            type="button" 
            className="close-button" 
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">
                <FileText size={16} />
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Lunch at restaurant"
                disabled={isLoading}
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="amount">
                <IndianRupee size={16} />
                Amount (₹) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isLoading}
                className={errors.amount ? 'error' : ''}
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                <Tag size={16} />
                Category
              </label>
              <div className="category-input-group">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={isLoading || isAIProcessing}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ai-categorize-btn"
                  onClick={handleAICategoriztion}
                  disabled={isLoading || isAIProcessing || !formData.title.trim()}
                  title="Use AI to categorize this expense"
                >
                  {isAIProcessing ? '🤖' : '✨'} AI
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date">
                <Calendar size={16} />
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                disabled={isLoading}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <FileText size={16} />
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional details about this expense..."
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentMethod">
                <CreditCard size={16} />
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags">
                <Tag size={16} />
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="tag1, tag2, tag3"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <Repeat size={16} />
              This is a recurring expense
            </label>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isAIProcessing}
              className="submit-btn"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;