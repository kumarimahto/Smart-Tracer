import express from 'express';
import geminiAIService from '../services/geminiAI.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// POST /api/ai/categorize - Categorize expense using AI
router.post('/categorize', async (req, res) => {
  try {
    const { title, description, amount } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required for categorization'
      });
    }

    const result = await geminiAIService.categorizeExpense(title, description, amount);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI categorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to categorize expense',
      error: error.message
    });
  }
});

// GET /api/ai/summary/:year/:month - Generate monthly summary with AI insights
router.get('/summary/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // Get monthly expense summary from database
    const expenses = await Expense.getMonthlySummary(parseInt(year), parseInt(month));
    
    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No expenses found for this month',
        data: {
          summary: 'No expenses recorded for this month',
          insights: ['Start tracking your expenses to get insights'],
          budgetingTips: ['Begin by recording your daily expenses'],
          overallRating: 'No Data'
        }
      });
    }

    // Generate AI insights
    const monthYear = new Date(year, month - 1).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    const aiSummary = await geminiAIService.generateMonthlySummary(expenses, monthYear);

    res.status(200).json({
      success: true,
      data: {
        period: { year: parseInt(year), month: parseInt(month), monthYear },
        expenses,
        aiInsights: aiSummary
      }
    });
  } catch (error) {
    console.error('AI summary generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI summary',
      error: error.message
    });
  }
});

// GET /api/ai/budgeting-tips - Get personalized budgeting tips
router.get('/budgeting-tips', async (req, res) => {
  try {
    const { months = 3 } = req.query;
    
    // Get recent expenses for analysis
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const recentExpenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    if (recentExpenses.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          tips: [
            "Start tracking your daily expenses",
            "Set monthly spending limits for different categories",
            "Review your expenses weekly"
          ],
          savingsOpportunities: [
            "Begin with small savings goals",
            "Track your income and expenses"
          ],
          budgetAllocation: {
            needs: "50-60%",
            wants: "20-30%",
            savings: "20%"
          }
        }
      });
    }

    // Generate AI budgeting tips
    const budgetingTips = await geminiAIService.getBudgetingTips(recentExpenses);

    res.status(200).json({
      success: true,
      data: budgetingTips
    });
  } catch (error) {
    console.error('Budgeting tips generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate budgeting tips',
      error: error.message
    });
  }
});

// POST /api/ai/bulk-categorize - Bulk categorize expenses
router.post('/bulk-categorize', async (req, res) => {
  try {
    const { expenses } = req.body;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expenses array is required'
      });
    }

    const results = [];
    
    // Process expenses in batches to avoid rate limiting
    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      
      try {
        const result = await geminiAIService.categorizeExpense(
          expense.title, 
          expense.description, 
          expense.amount
        );
        
        results.push({
          index: i,
          originalExpense: expense,
          categorization: result
        });
        
        // Add small delay to respect rate limits
        if (i < expenses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        results.push({
          index: i,
          originalExpense: expense,
          error: error.message,
          categorization: {
            category: 'Other',
            confidence: 0.3,
            reasoning: 'Failed to categorize due to error'
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        processed: results.length,
        results
      }
    });
  } catch (error) {
    console.error('Bulk categorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk categorize expenses',
      error: error.message
    });
  }
});

// GET /api/ai/spending-insights - Get general spending insights
router.get('/spending-insights', async (req, res) => {
  try {
    const { period = '6' } = req.query; // Default to 6 months
    
    // Get spending trends
    const trends = await Expense.getSpendingTrends(parseInt(period));
    
    if (trends.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          insights: ['Start tracking expenses to see spending trends'],
          recommendations: ['Begin recording your daily expenses']
        }
      });
    }

    // Simple insights based on trends (could be enhanced with AI)
    const totalSpending = trends.reduce((sum, trend) => sum + trend.totalAmount, 0);
    const avgMonthlySpending = totalSpending / trends.length;
    const lastMonthSpending = trends[trends.length - 1]?.totalAmount || 0;
    
    let insights = [];
    let recommendations = [];

    if (lastMonthSpending > avgMonthlySpending * 1.2) {
      insights.push('Your spending increased significantly last month');
      recommendations.push('Review your recent expenses for any unusual purchases');
    } else if (lastMonthSpending < avgMonthlySpending * 0.8) {
      insights.push('Your spending decreased compared to your average');
      recommendations.push('Great job on controlling expenses this month!');
    }

    insights.push(`Your average monthly spending is ₹${avgMonthlySpending.toFixed(2)}`);
    recommendations.push('Set monthly budgets based on your spending patterns');

    res.status(200).json({
      success: true,
      data: {
        period: `${period} months`,
        trends,
        analytics: {
          totalSpending,
          avgMonthlySpending,
          lastMonthSpending
        },
        insights,
        recommendations
      }
    });
  } catch (error) {
    console.error('Spending insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate spending insights',
      error: error.message
    });
  }
});

export default router;