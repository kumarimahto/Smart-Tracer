import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, AlertTriangle, Calendar, IndianRupee } from 'lucide-react';
import { aiAPI } from '../services/api';
import { formatCurrency, getMonthName, getCurrentMonthRange } from '../utils/formatters';
import './AIInsights.css';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [budgetingTips, setBudgetingTips] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch AI insights for selected month
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const [summaryResponse, tipsResponse] = await Promise.all([
          aiAPI.getAISummary(selectedMonth.year, selectedMonth.month),
          aiAPI.getBudgetingTips(3)
        ]);

        if (summaryResponse.success) {
          setInsights(summaryResponse.data);
        }

        if (tipsResponse.success) {
          setBudgetingTips(tipsResponse.data);
        }
      } catch (err) {
        console.error('AI insights fetch error:', err);
        setError('Failed to load AI insights');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [selectedMonth]);

  const handleMonthChange = (direction) => {
    setSelectedMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  if (loading) {
    return (
      <div className="ai-insights">
        <div className="insights-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Generating AI insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-insights">
        <div className="insights-error">
          <AlertTriangle size={48} />
          <h3>Failed to load AI insights</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const monthlyInsights = insights?.aiInsights || {};
  const expenseSummary = insights?.expenses || [];

  return (
    <div className="ai-insights">
      <div className="insights-header">
        <div className="header-content">
          <h2>
            <Brain size={32} />
            AI Insights & Recommendations
          </h2>
          <p>Smart analysis of your spending patterns powered by Gemini AI</p>
        </div>

        {/* Month Navigation */}
        <div className="month-selector">
          <button 
            onClick={() => handleMonthChange(-1)}
            className="month-nav-btn"
          >
            ←
          </button>
          <div className="selected-month">
            <Calendar size={18} />
            <span>{getMonthName(selectedMonth.month)} {selectedMonth.year}</span>
          </div>
          <button 
            onClick={() => handleMonthChange(1)}
            className="month-nav-btn"
            disabled={selectedMonth.year === new Date().getFullYear() && selectedMonth.month === new Date().getMonth() + 1}
          >
            →
          </button>
        </div>
      </div>

      {/* Summary Section */}
      {insights && (
        <div className="insights-summary">
          <div className="summary-card">
            <h3>Monthly Overview</h3>
            <div className="summary-stats">
              <div className="summary-stat">
                <IndianRupee size={20} />
                <span>Total Spent: {formatCurrency(expenseSummary.reduce((sum, exp) => sum + exp.totalAmount, 0))}</span>
              </div>
              <div className="summary-stat">
                <TrendingUp size={20} />
                <span>Categories: {expenseSummary.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generated Insights */}
      {monthlyInsights.summary && (
        <div className="insights-section">
          <div className="section-header">
            <h3>
              <Brain size={24} />
              AI Analysis
            </h3>
          </div>

          <div className="insights-grid">
            {/* Summary */}
            <div className="insight-card summary-card">
              <h4>Summary</h4>
              <p>{monthlyInsights.summary}</p>
              <div className="rating">
                <span>Financial Health: </span>
                <span className={`rating-value ${monthlyInsights.overallRating?.toLowerCase()}`}>
                  {monthlyInsights.overallRating || 'Good'}
                </span>
              </div>
            </div>

            {/* Top Categories */}
            {monthlyInsights.topCategories && monthlyInsights.topCategories.length > 0 && (
              <div className="insight-card">
                <h4>Top Spending Categories</h4>
                <div className="category-list">
                  {monthlyInsights.topCategories.slice(0, 3).map((category, index) => (
                    <div key={category} className="category-item">
                      <span className="category-rank">{index + 1}</span>
                      <span className="category-name">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {monthlyInsights.insights && monthlyInsights.insights.length > 0 && (
              <div className="insight-card full-width">
                <h4>Key Insights</h4>
                <div className="insights-list">
                  {monthlyInsights.insights.map((insight, index) => (
                    <div key={index} className="insight-item">
                      <Lightbulb size={18} />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts */}
            {monthlyInsights.alerts && monthlyInsights.alerts.length > 0 && (
              <div className="insight-card alert-card">
                <h4>Alerts</h4>
                <div className="alerts-list">
                  {monthlyInsights.alerts.map((alert, index) => (
                    <div key={index} className="alert-item">
                      <AlertTriangle size={18} />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budgeting Tips */}
      {budgetingTips && (
        <div className="insights-section">
          <div className="section-header">
            <h3>
              <TrendingUp size={24} />
              Budgeting Recommendations
            </h3>
          </div>

          <div className="budgeting-grid">
            {/* Tips */}
            {budgetingTips.tips && budgetingTips.tips.length > 0 && (
              <div className="budgeting-card">
                <h4>💡 Smart Tips</h4>
                <div className="tips-list">
                  {budgetingTips.tips.map((tip, index) => (
                    <div key={index} className="tip-item">
                      <span className="tip-number">{index + 1}</span>
                      <span className="tip-text">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Savings Opportunities */}
            {budgetingTips.savingsOpportunities && budgetingTips.savingsOpportunities.length > 0 && (
              <div className="budgeting-card">
                <h4>💰 Savings Opportunities</h4>
                <div className="opportunities-list">
                  {budgetingTips.savingsOpportunities.map((opportunity, index) => (
                    <div key={index} className="opportunity-item">
                      <IndianRupee size={16} />
                      <span>{opportunity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Allocation */}
            {budgetingTips.budgetAllocation && (
              <div className="budgeting-card allocation-card">
                <h4>📊 Recommended Budget Allocation</h4>
                <div className="allocation-grid">
                  <div className="allocation-item">
                    <span className="allocation-label">Needs</span>
                    <span className="allocation-value">{budgetingTips.budgetAllocation.needs}</span>
                  </div>
                  <div className="allocation-item">
                    <span className="allocation-label">Wants</span>
                    <span className="allocation-value">{budgetingTips.budgetAllocation.wants}</span>
                  </div>
                  <div className="allocation-item">
                    <span className="allocation-label">Savings</span>
                    <span className="allocation-value">{budgetingTips.budgetAllocation.savings}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Generated Tips for Current Month */}
      {monthlyInsights.budgetingTips && monthlyInsights.budgetingTips.length > 0 && (
        <div className="insights-section">
          <div className="section-header">
            <h3>
              <Lightbulb size={24} />
              Monthly Recommendations
            </h3>
          </div>

          <div className="monthly-tips">
            {monthlyInsights.budgetingTips.map((tip, index) => (
              <div key={index} className="monthly-tip-card">
                <div className="tip-icon">
                  <Lightbulb size={20} />
                </div>
                <div className="tip-content">
                  <p>{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!insights?.expenses || insights.expenses.length === 0 ? (
        <div className="no-insights">
          <div className="no-insights-content">
            <Brain size={64} />
            <h3>No data available for AI analysis</h3>
            <p>Start adding expenses to get personalized insights and recommendations from our AI.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AIInsights;