import React, { useState } from 'react';
import { Bell, X, Settings, Trash2, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    dailyLimit: '',
    monthlyLimit: '',
    enableNotifications: true
  });

  const {
    notifications,
    unreadCount,
    budgetSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    saveBudgetSettings
  } = useNotifications();

  // Initialize settings form
  React.useEffect(() => {
    setSettingsForm({
      dailyLimit: budgetSettings.dailyLimit || '',
      monthlyLimit: budgetSettings.monthlyLimit || '',
      enableNotifications: budgetSettings.enableNotifications
    });
  }, [budgetSettings]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  React.useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleSettingsSave = () => {
    const settings = {
      dailyLimit: settingsForm.dailyLimit ? parseFloat(settingsForm.dailyLimit) : null,
      monthlyLimit: settingsForm.monthlyLimit ? parseFloat(settingsForm.monthlyLimit) : null,
      enableNotifications: settingsForm.enableNotifications
    };
    
    saveBudgetSettings(settings);
    setShowSettings(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-container">
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={togglePanel}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-backdrop" onClick={togglePanel}></div>
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                <button
                  className="action-btn"
                  onClick={() => setShowSettings(!showSettings)}
                  title="Budget Settings"
                >
                  <Settings size={16} />
              </button>
              <button
                className="action-btn"
                onClick={clearAllNotifications}
                title="Clear All"
              >
                <Trash2 size={16} />
              </button>
              <button
                className="action-btn close-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="budget-settings">
              <h4>Budget Settings</h4>
              <div className="setting-group">
                <label>Daily Limit (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={settingsForm.dailyLimit}
                  onChange={(e) => setSettingsForm(prev => ({ 
                    ...prev, 
                    dailyLimit: e.target.value 
                  }))}
                />
              </div>
              <div className="setting-group">
                <label>Monthly Limit (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={settingsForm.monthlyLimit}
                  onChange={(e) => setSettingsForm(prev => ({ 
                    ...prev, 
                    monthlyLimit: e.target.value 
                  }))}
                />
              </div>
              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settingsForm.enableNotifications}
                    onChange={(e) => setSettingsForm(prev => ({ 
                      ...prev, 
                      enableNotifications: e.target.checked 
                    }))}
                  />
                  Enable budget notifications
                </label>
              </div>
              <div className="settings-actions">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleSettingsSave}
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div 
                    className="notification-content"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <button
                    className="notification-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    title="Delete notification"
                  >
                    <X size={14} />
                  </button>
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;