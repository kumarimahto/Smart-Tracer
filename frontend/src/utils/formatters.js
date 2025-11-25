/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  try {
    // Always use Indian Rupee format without $ symbol
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `₹${amount}`;
  }
};

/**
 * Format date for display
 * @param {string|Date} date - The date to format
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const options = {
      short: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      },
      medium: {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      },
      long: {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      },
      time: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      },
      datetime: {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    };

    return dateObj.toLocaleDateString('en-IN', options[format] || options.medium);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toString();
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 30) {
      return formatDate(date, 'short');
    } else if (diffDays > 0) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffMinutes > 0) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return formatDate(date, 'short');
  }
};

/**
 * Format number with Indian number system
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  try {
    return num.toLocaleString('en-IN');
  } catch (error) {
    console.error('Error formatting number:', error);
    return num.toString();
  }
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  try {
    return `${value.toFixed(decimals)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value}%`;
  }
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Invalid Month';
};

/**
 * Get short month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Short month name
 */
export const getShortMonthName = (month) => {
  const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return shortMonths[month - 1] || 'Invalid';
};

/**
 * Get date range for current month
 * @returns {object} Start and end dates of current month
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

/**
 * Get date range for last N days
 * @param {number} days - Number of days
 * @returns {object} Start and end dates
 */
export const getLastNDaysRange = (days = 30) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};