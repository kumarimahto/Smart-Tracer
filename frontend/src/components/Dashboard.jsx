import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, Calendar, BarChart3, AlertCircle, ChevronDown } from 'lucide-react';
import { CategoryChart, TrendsChart, CategoryBarChart } from './Charts';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { expenseAPI } from '../services/api';
import { formatCurrency, formatDate, getCurrentMonthRange } from '../utils/formatters';
import './Dashboard.css';

const Dashboard = ({ onEditExpense, onViewAllExpenses, onAddExpense }) => {
  const { isDarkMode } = useTheme();
  const { expenses } = useExpenses();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.period-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch dashboard analytics
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [analyticsResponse, trendsResponse] = await Promise.all([
          expenseAPI.getDashboardAnalytics(),
          expenseAPI.getSpendingTrends(6)
        ]);

        if (analyticsResponse.success && trendsResponse.success) {
          setDashboardData({
            analytics: analyticsResponse.data,
            trends: trendsResponse.data
          });
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [expenses]); // Re-fetch when expenses change

  // Calculate average based on selected period
  const calculatePeriodAverage = (total, period) => {
    const currentDate = new Date();
    let divisor = 1;
    
    switch (period) {
      case 'daily':
        divisor = currentDate.getDate();
        break;
      case 'weekly':
        // Number of weeks in current month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const weeksPassed = Math.ceil((currentDate.getDate() + firstDay.getDay()) / 7);
        divisor = weeksPassed || 1;
        break;
      case 'monthly':
        divisor = currentDate.getMonth() + 1; // Months passed in year
        break;
      default:
        divisor = currentDate.getDate();
    }
    
    return total / divisor;
  };
  
  // Get period label and subtitle
  const getPeriodInfo = (period) => {
    switch (period) {
      case 'daily':
        return { label: 'Daily Average', subtitle: 'Based on current month' };
      case 'weekly':
        return { label: 'Weekly Average', subtitle: 'Based on current month' };
      case 'monthly':
        return { label: 'Monthly Average', subtitle: 'Based on current year' };
      default:
        return { label: 'Daily Average', subtitle: 'Based on current month' };
    }
  };

  // Create sample data for charts when no real data
  const createSampleData = () => {
    return [
      { category: 'Food & Dining', amount: 15000 },
      { category: 'Transportation', amount: 8000 },
      { category: 'Shopping', amount: 12000 },
      { category: 'Bills & Utilities', amount: 6000 },
      { category: 'Entertainment', amount: 4000 }
    ];
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <AlertCircle size={48} />
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const { analytics, trends } = dashboardData || {};
  const currentMonth = analytics?.currentMonth || {};
  const comparison = analytics?.comparison || {};
  const recentExpenses = analytics?.recentExpenses || [];

  // Prepare chart data
  const chartExpenses = expenses.length > 0 ? expenses : createSampleData();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome back! Here's your spending overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <IndianRupee size={24} />
          </div>
          <div className="stat-content">
            <h3>This Month</h3>
            <div className="stat-value">{formatCurrency(currentMonth.total || 0)}</div>
            <div className={`stat-change ${comparison.percentageChange >= 0 ? 'positive' : 'negative'}`}>
              <TrendingUp size={16} />
              {Math.abs(comparison.percentageChange || 0)}% from last month
            </div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>Transactions</h3>
            <div className="stat-value">{currentMonth.transactionCount || 0}</div>
            <div className="stat-subtitle">This month</div>
          </div>
        </div>

        <div className="stat-card tertiary">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>Top Category</h3>
            <div className="stat-value">
              {currentMonth.breakdown?.[0]?._id || 'No data'}
            </div>
            <div className="stat-subtitle">
              {currentMonth.breakdown?.[0] && formatCurrency(currentMonth.breakdown[0].totalAmount)}
            </div>
          </div>
        </div>

        <div className="stat-card quaternary">
          <div className="stat-icon">
            <IndianRupee size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-header-with-dropdown">
              <div className="period-dropdown">
                <button 
                  className="dropdown-trigger"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{getPeriodInfo(selectedPeriod).label}</span>
                  <ChevronDown size={16} className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <button 
                      className={`dropdown-item ${selectedPeriod === 'daily' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPeriod('daily');
                        setIsDropdownOpen(false);
                      }}
                    >
                      Daily Average
                    </button>
                    <button 
                      className={`dropdown-item ${selectedPeriod === 'weekly' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPeriod('weekly');
                        setIsDropdownOpen(false);
                      }}
                    >
                      Weekly Average
                    </button>
                    <button 
                      className={`dropdown-item ${selectedPeriod === 'monthly' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPeriod('monthly');
                        setIsDropdownOpen(false);
                      }}
                    >
                      Monthly Average
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="stat-value">
              {formatCurrency(calculatePeriodAverage(currentMonth.total || 0, selectedPeriod))}
            </div>
            <div className="stat-subtitle">{getPeriodInfo(selectedPeriod).subtitle}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {expenses.length === 0 && (
          <div className="empty-charts-state">
            <div className="empty-state-content">
              <div className="empty-state-icon">📊</div>
              <h3>No Expense Data Yet</h3>
              <p>Add your first expense to see beautiful charts and analytics</p>
              <button 
                onClick={onAddExpense}
                className="add-first-expense-btn"
              >
                Add Your First Expense
              </button>
            </div>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Expense Distribution</h3>
              <p>Breakdown by category</p>
            </div>
            <div className="chart-container">
              <CategoryChart expenses={chartExpenses} isDarkMode={isDarkMode} />
            </div>
          </div>
        )}

        {trends && trends.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Spending Trends</h3>
              <p>Last 6 months</p>
            </div>
            <div className="chart-container">
              <TrendsChart trends={trends} isDarkMode={isDarkMode} />
            </div>
          </div>
        )}

        {currentMonth.breakdown && currentMonth.breakdown.length > 0 && (
          <div className="chart-card full-width">
            <div className="chart-header">
              <h3>Category Comparison</h3>
              <p>Current month breakdown</p>
            </div>
            <div className="chart-container">
              <CategoryBarChart summary={currentMonth.breakdown} isDarkMode={isDarkMode} />
            </div>
          </div>
        )}
      </div>

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <div className="recent-expenses-section">
          <div className="section-header">
            <h3>Recent Expenses</h3>
            <button 
              onClick={() => onViewAllExpenses && onViewAllExpenses()}
              className="view-all-btn"
            >
              View All
            </button>
          </div>
          <div className="recent-expenses-grid">
            {recentExpenses.slice(0, 2).map((expense) => (
              <div key={expense._id} className="expense-item">
                <div className="expense-item-main">
                  <div className="expense-item-title">{expense.title}</div>
                  <div className="expense-item-amount">{formatCurrency(expense.amount)}</div>
                </div>
                <div className="expense-item-details">
                  <span className="expense-item-category">{expense.category}</span>
                  <span className="expense-item-date">{formatDate(expense.date, 'short')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;