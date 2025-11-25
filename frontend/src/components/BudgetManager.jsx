import React, { useState, useEffect } from 'react';
import { Calendar, IndianRupee, Target, TrendingUp, Save, Pencil } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import './BudgetManager.css';

const BudgetManager = () => {
  const { isDarkMode } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBudget, setCurrentBudget] = useState({
    dailyAmount: '',
    monthlyAmount: '',
    month: new Date().toISOString().slice(0, 7) // Current month in YYYY-MM format
  });
  const [currentExpenses, setCurrentExpenses] = useState(0); // Track current month expenses

  // Load budgets from localStorage on component mount
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    
    // Load current month expenses (this would normally come from your expense API)
    const savedExpenses = localStorage.getItem('currentMonthExpenses');
    if (savedExpenses) {
      setCurrentExpenses(parseFloat(savedExpenses));
    }
  }, []);

  // Check if current expenses exceed budget and show alert
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentBudget = budgets.find(budget => budget.month === currentMonth);
    
    if (currentBudget && currentExpenses > currentBudget.monthlyAmount) {
      alert(`⚠️ Budget Alert!\n\nYou have exceeded your monthly budget!\n\nBudget: ₹${currentBudget.monthlyAmount}\nSpent: ₹${currentExpenses}\nOver-spent: ₹${(currentExpenses - currentBudget.monthlyAmount).toFixed(2)}`);
    }
  }, [currentExpenses, budgets]);

  // Save budgets to localStorage
  const saveBudgets = (newBudgets) => {
    setBudgets(newBudgets);
    localStorage.setItem('budgets', JSON.stringify(newBudgets));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentBudget.dailyAmount || !currentBudget.monthlyAmount) return;

    const newBudget = {
      id: Date.now(),
      dailyAmount: parseFloat(currentBudget.dailyAmount),
      monthlyAmount: parseFloat(currentBudget.monthlyAmount),
      month: currentBudget.month,
      spent: currentExpenses, // Current month expenses
      createdAt: new Date().toISOString()
    };

    const updatedBudgets = [...budgets.filter(b => b.month !== currentBudget.month), newBudget];
    saveBudgets(updatedBudgets);

    // Reset form
    setCurrentBudget({
      dailyAmount: '',
      monthlyAmount: '',
      month: new Date().toISOString().slice(0, 7)
    });
    setIsEditing(false);
  };

  const handleEdit = (budget) => {
    setCurrentBudget({
      dailyAmount: budget.dailyAmount.toString(),
      monthlyAmount: budget.monthlyAmount.toString(),
      month: budget.month
    });
    setIsEditing(true);
  };

  const handleDelete = (budgetId) => {
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
    saveBudgets(updatedBudgets);
  };

  const calculateProgress = (spent, monthlyBudget) => {
    return Math.min((spent / monthlyBudget) * 100, 100);
  };

  // Function to simulate adding expense (for testing)
  const addTestExpense = (amount) => {
    const newExpenses = currentExpenses + amount;
    setCurrentExpenses(newExpenses);
    localStorage.setItem('currentMonthExpenses', newExpenses.toString());
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#ef4444'; // red
    if (percentage >= 75) return '#f97316'; // orange
    if (percentage >= 50) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  return (
    <div className="budget-manager">
      <div className="budget-header">
        <h2>Budget Management</h2>
        <p>Set and track your monthly spending limits by category</p>
      </div>

      {/* Budget Form */}
      <div className="budget-form-section">
        <div className="section-header">
          <h3>{isEditing ? 'Edit Budget' : 'Create New Budget'}</h3>
          {isEditing && (
            <button 
              onClick={() => {
                setIsEditing(false);
                setCurrentBudget({
                  dailyAmount: '',
                  monthlyAmount: '',
                  month: new Date().toISOString().slice(0, 7)
                });
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="budget-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dailyAmount">Daily Budget Limit (₹)</label>
              <input
                type="number"
                id="dailyAmount"
                value={currentBudget.dailyAmount}
                onChange={(e) => setCurrentBudget({...currentBudget, dailyAmount: e.target.value})}
                placeholder="Enter daily limit"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="monthlyAmount">Monthly Budget Limit (₹)</label>
              <input
                type="number"
                id="monthlyAmount"
                value={currentBudget.monthlyAmount}
                onChange={(e) => setCurrentBudget({...currentBudget, monthlyAmount: e.target.value})}
                placeholder="Enter monthly limit"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="month">Month</label>
              <input
                type="month"
                id="month"
                value={currentBudget.month}
                onChange={(e) => setCurrentBudget({...currentBudget, month: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              <Save size={20} />
              {isEditing ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>

      {/* Budget List */}
      <div className="budget-list-section">
        <h3>Your Budgets</h3>
        
        {budgets.length === 0 ? (
          <div className="empty-state">
            <Target size={48} />
            <h4>No budgets set yet</h4>
            <p>Set your first daily and monthly budget limits to start tracking</p>
          </div>
        ) : (
          <div className="budget-grid">
            {budgets.map(budget => {
              const progress = calculateProgress(budget.spent, budget.monthlyAmount);
              const progressColor = getProgressColor(progress);
              const currentMonth = new Date().toISOString().slice(0, 7);
              const isCurrentMonth = budget.month === currentMonth;
              
              return (
                <div key={budget.id} className={`budget-card ${isCurrentMonth ? 'current-month' : ''}`}>
                  <div className="budget-card-header">
                    <div className="budget-info">
                      <h4>Budget for {new Date(budget.month + '-01').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}</h4>
                      {isCurrentMonth && <span className="current-badge">Current Month</span>}
                    </div>
                    <div className="budget-actions">
                      <button 
                        onClick={() => handleEdit(budget)}
                        className="edit-btn"
                        title="Edit budget"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(budget.id)}
                        className="delete-btn"
                        title="Delete budget"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="budget-amounts">
                    <div className="amount-item">
                      <span className="amount-label">Daily Limit</span>
                      <span className="amount-value">{formatCurrency(budget.dailyAmount)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Monthly Budget</span>
                      <span className="amount-value">{formatCurrency(budget.monthlyAmount)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Spent This Month</span>
                      <span className="amount-value spent">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Remaining</span>
                      <span className={`amount-value ${budget.monthlyAmount - budget.spent >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(budget.monthlyAmount - budget.spent)}
                      </span>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Monthly Progress</span>
                      <span className={progress > 100 ? 'over-budget' : ''}>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: progressColor
                        }}
                      ></div>
                    </div>
                    {progress > 100 && (
                      <div className="over-budget-warning">
                        ⚠️ Budget exceeded by {formatCurrency(budget.spent - budget.monthlyAmount)}
                      </div>
                    )}
                  </div>

                  {isCurrentMonth && (
                    <div className="test-section">
                      <h5>Test Expense Addition</h5>
                      <div className="test-buttons">
                        <button onClick={() => addTestExpense(100)} className="test-btn">
                          Add ₹100 Expense
                        </button>
                        <button onClick={() => addTestExpense(500)} className="test-btn">
                          Add ₹500 Expense
                        </button>
                        <button onClick={() => setCurrentExpenses(0)} className="reset-btn">
                          Reset Expenses
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;