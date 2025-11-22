import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import { CategoryChart, TrendsChart, CategoryBarChart } from './Charts';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { expenseAPI } from '../services/api';
import { formatCurrency, formatDate, getCurrentMonthRange } from '../utils/formatters';
import './Dashboard.css';

const Dashboard = ({ onEditExpense, onViewAllExpenses }) => {
  const { isDarkMode } = useTheme();
  const { expenses } = useExpenses();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

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
            <DollarSign size={24} />
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
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Daily Average</h3>
            <div className="stat-value">
              {formatCurrency((currentMonth.total || 0) / new Date().getDate())}
            </div>
            <div className="stat-subtitle">Based on current month</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Expense Distribution</h3>
            <p>Breakdown by category</p>
          </div>
          <div className="chart-container">
            <CategoryChart expenses={chartExpenses} isDarkMode={isDarkMode} />
          </div>
        </div>

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

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <DollarSign size={20} />
            Add Expense
          </button>
          <button className="action-btn">
            <BarChart3 size={20} />
            View Reports
          </button>
          <button className="action-btn">
            <Calendar size={20} />
            Set Budget
          </button>
          <button className="action-btn">
            <TrendingUp size={20} />
            Analyze Trends
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;