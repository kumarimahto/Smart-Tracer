import React, { useState, useEffect } from 'react';
import { Moon, Sun, Plus, BarChart3, List, Brain, Settings, IndianRupee, Calendar, Zap, TrendingUp, Wallet } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Dashboard from './components/Dashboard';
import AIInsights from './components/AIInsights';
import NotificationPanel from './components/NotificationPanel';
import AuthUI from './components/AuthUI';
import { healthCheck } from './services/api';
import './App.css';

function AppContent() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [serverStatus, setServerStatus] = useState({ isOnline: null, checking: true });

  // Check server health on mount
  useEffect(() => {
    const checkServer = async () => {
      setServerStatus({ isOnline: null, checking: true });
      const result = await healthCheck();
      setServerStatus({ 
        isOnline: result.success, 
        checking: false,
        error: result.error 
      });
    };

    checkServer();
    
    // Check server health every 30 seconds
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner-large"></div>
        <p>Loading Smart Tracer...</p>
      </div>
    );
  }

  // Show auth UI if user is not logged in
  if (!user) {
    return <AuthUI />;
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleCloseExpenseForm = () => {
    setIsExpenseFormOpen(false);
    setEditingExpense(null);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'expenses', label: 'Expenses', icon: List },
    { id: 'insights', label: 'AI Insights', icon: Brain },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onEditExpense={handleEditExpense} onViewAllExpenses={() => setCurrentView('expenses')} />;
      case 'expenses':
        return <ExpenseList onEditExpense={handleEditExpense} />;
      case 'insights':
        return <AIInsights />;
      default:
        return <Dashboard onEditExpense={handleEditExpense} onViewAllExpenses={() => setCurrentView('expenses')} />;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <div className="logo-primary-icon">💰</div>
              <div className="logo-secondary-icon">📊</div>
            </div>
            <div className="logo-text">
              <h1>ExpenseTracker</h1>
              <span className="logo-subtitle">Smart Finance</span>
            </div>
          </div>
          
          {/* Server Status Indicator */}
          <div className={`server-status ${serverStatus.checking ? 'checking' : serverStatus.isOnline ? 'online' : 'offline'}`}>
            <div className="status-dot"></div>
            <span>
              {serverStatus.checking 
                ? 'Checking...' 
                : serverStatus.isOnline 
                  ? 'Server Online' 
                  : 'Server Offline'
              }
            </span>
          </div>
        </div>

        <div className="header-right">
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">
              {user?.initials}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button onClick={logout} className="logout-btn" title="Logout">
              Logout
            </button>
          </div>
          
          {/* Notifications */}
          <NotificationPanel />
          
          {/* Add Expense Button */}
          <button
            onClick={() => setIsExpenseFormOpen(true)}
            className="add-expense-btn"
            disabled={!serverStatus.isOnline}
            title={serverStatus.isOnline ? 'Add new expense' : 'Server is offline'}
          >
            <Plus size={20} />
            Add Expense
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={32} /> : <Moon size={32} />}
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* Navigation Sidebar */}
        <nav className="app-nav">
          <div className="nav-items">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="app-main">
          {/* Server Offline Warning */}
          {!serverStatus.checking && !serverStatus.isOnline && (
            <div className="server-warning">
              <div className="warning-content">
                <h3>⚠️ Server Connection Lost</h3>
                <p>
                  Cannot connect to the backend server. Make sure MongoDB is running and 
                  the backend server is started with <code>npm run server:dev</code>
                </p>
                {serverStatus.error && (
                  <details>
                    <summary>Error Details</summary>
                    <pre>{serverStatus.error}</pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Current View Content */}
          <div className={`view-content ${!serverStatus.isOnline ? 'server-offline' : ''}`}>
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isExpenseFormOpen}
        onClose={handleCloseExpenseForm}
        expense={editingExpense}
        onSubmit={() => {
          // Form will handle success and close itself
          console.log('Expense saved successfully');
        }}
      />
    </div>
  );
}

// Main App Component with Providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ExpenseProvider>
            <AppContent />
          </ExpenseProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
