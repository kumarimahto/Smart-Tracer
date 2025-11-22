import React, { useState, useEffect } from 'react';
import { Moon, Sun, Plus, BarChart3, List, Brain, Settings, DollarSign } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ExpenseProvider } from './context/ExpenseContext';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Dashboard from './components/Dashboard';
import AIInsights from './components/AIInsights';
import { healthCheck } from './services/api';
import './App.css';

function AppContent() {
  const { isDarkMode, toggleTheme } = useTheme();
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
        return <Dashboard onEditExpense={handleEditExpense} />;
      case 'expenses':
        return <ExpenseList onEditExpense={handleEditExpense} />;
      case 'insights':
        return <AIInsights />;
      default:
        return <Dashboard onEditExpense={handleEditExpense} />;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <DollarSign size={32} />
            <h1>Smart Expense Tracker</h1>
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
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
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
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </ThemeProvider>
  );
}

export default App;
