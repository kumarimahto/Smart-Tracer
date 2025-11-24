import React, { createContext, useContext, useState, useEffect } from 'react';
import { useExpenses } from './ExpenseContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  // Get expenses from ExpenseContext - this will be empty initially
  const expenseContext = useExpenses();
  const expenses = expenseContext?.expenses || [];
  
  const [notifications, setNotifications] = useState([]);
  const [budgetSettings, setBudgetSettings] = useState({
    dailyLimit: null,
    monthlyLimit: null,
    enableNotifications: true
  });

  // Load saved budget settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('budgetSettings');
    if (savedSettings) {
      setBudgetSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save budget settings to localStorage
  const saveBudgetSettings = (settings) => {
    setBudgetSettings(settings);
    localStorage.setItem('budgetSettings', JSON.stringify(settings));
  };

  // Add new notification
  const addNotification = (message, type = 'warning') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Also save to localStorage for persistence
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    savedNotifications.unshift(newNotification);
    localStorage.setItem('notifications', JSON.stringify(savedNotifications.slice(0, 50))); // Keep only latest 50
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );

    // Update localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = savedNotifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Update localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = savedNotifications.map(notification => 
      ({ ...notification, read: true })
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Check budget limits
  const checkBudgetLimits = (newExpenseAmount = 0, expenseDate = new Date()) => {
    if (!budgetSettings.enableNotifications) return;

    // Use expenses from context, fallback to localStorage if not available
    const availableExpenses = expenses.length > 0 ? expenses : JSON.parse(localStorage.getItem('expenses') || '[]');
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayStr = today.toDateString();

    // Calculate today's spending
    const todaySpending = availableExpenses
      .filter(expense => new Date(expense.date).toDateString() === todayStr)
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate monthly spending
    const monthlySpending = availableExpenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Check daily limit
    if (budgetSettings.dailyLimit && todaySpending > budgetSettings.dailyLimit) {
      const excess = todaySpending - budgetSettings.dailyLimit;
      addNotification(
        `🚨 Daily Budget Exceeded! Your daily limit was ₹${budgetSettings.dailyLimit.toLocaleString()} but you've spent ₹${todaySpending.toLocaleString()}. That's ₹${excess.toLocaleString()} extra!`,
        'error'
      );
    } else if (budgetSettings.dailyLimit && todaySpending > budgetSettings.dailyLimit * 0.8) {
      addNotification(
        `⚠️ Daily Budget Warning: You're near your ₹${budgetSettings.dailyLimit.toLocaleString()} limit. Current spending: ₹${todaySpending.toLocaleString()}`,
        'warning'
      );
    }

    // Check monthly limit
    if (budgetSettings.monthlyLimit && monthlySpending > budgetSettings.monthlyLimit) {
      const excess = monthlySpending - budgetSettings.monthlyLimit;
      addNotification(
        `📊 Monthly Budget Exceeded! Your monthly limit was ₹${budgetSettings.monthlyLimit.toLocaleString()} but you've spent ₹${monthlySpending.toLocaleString()}. That's ₹${excess.toLocaleString()} over budget!`,
        'error'
      );
    } else if (budgetSettings.monthlyLimit && monthlySpending > budgetSettings.monthlyLimit * 0.8) {
      addNotification(
        `📊 Monthly Budget Warning: You're near your ₹${budgetSettings.monthlyLimit.toLocaleString()} limit. Current spending: ₹${monthlySpending.toLocaleString()}`,
        'warning'
      );
    }
  };

  // Check budget limits after expense deletion
  const recheckBudgetAfterDelete = () => {
    if (!budgetSettings.enableNotifications) return;

    const availableExpenses = expenses.length > 0 ? expenses : JSON.parse(localStorage.getItem('expenses') || '[]');
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayStr = today.toDateString();

    // Calculate current spending after deletion
    const todaySpending = availableExpenses
      .filter(expense => new Date(expense.date).toDateString() === todayStr)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const monthlySpending = availableExpenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Add success notification if back under limits
    if (budgetSettings.dailyLimit && todaySpending <= budgetSettings.dailyLimit) {
      addNotification(
        `✅ Great! You're back under your daily budget. Current spending: ₹${todaySpending.toLocaleString()} / ₹${budgetSettings.dailyLimit.toLocaleString()}`,
        'success'
      );
    }

    if (budgetSettings.monthlyLimit && monthlySpending <= budgetSettings.monthlyLimit) {
      addNotification(
        `✅ Good news! You're back under your monthly budget. Current spending: ₹${monthlySpending.toLocaleString()} / ₹${budgetSettings.monthlyLimit.toLocaleString()}`,
        'success'
      );
    }
  };

  // Load saved notifications on mount
  useEffect(() => {
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(savedNotifications);
  }, []);

  const value = {
    notifications,
    unreadCount,
    budgetSettings,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    checkBudgetLimits,
    recheckBudgetAfterDelete,
    saveBudgetSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};