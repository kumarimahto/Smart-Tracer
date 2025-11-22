import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

// GET /api/expenses - Get all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort order
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const expenses = await Expense.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Expense.countDocuments(query);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message
    });
  }
});

// GET /api/expenses/:id - Get single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense',
      error: error.message
    });
  }
});

// POST /api/expenses - Create new expense
router.post('/', async (req, res) => {
  try {
    const expenseData = req.body;
    
    // Validate required fields
    if (!expenseData.title || !expenseData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Title and amount are required'
      });
    }

    const expense = new Expense(expenseData);
    const savedExpense = await expense.save();

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: savedExpense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message
    });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
});

// GET /api/expenses/summary/monthly/:year/:month - Get monthly summary
router.get('/summary/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const summary = await Expense.getMonthlySummary(parseInt(year), parseInt(month));
    
    // Calculate total
    const totalAmount = summary.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalTransactions = summary.reduce((sum, item) => sum + item.count, 0);

    res.status(200).json({
      success: true,
      data: {
        summary,
        totals: {
          amount: totalAmount,
          transactions: totalTransactions
        },
        period: {
          year: parseInt(year),
          month: parseInt(month)
        }
      }
    });
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate monthly summary',
      error: error.message
    });
  }
});

// GET /api/expenses/trends/spending - Get spending trends
router.get('/trends/spending', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const trends = await Expense.getSpendingTrends(parseInt(months));

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error generating spending trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate spending trends',
      error: error.message
    });
  }
});

// GET /api/expenses/analytics/dashboard - Get dashboard analytics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Get current month summary
    const currentMonthSummary = await Expense.getMonthlySummary(currentYear, currentMonth);
    
    // Get last month summary for comparison
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const lastMonthSummary = await Expense.getMonthlySummary(lastMonthYear, lastMonth);
    
    // Get recent expenses (last 10)
    const recentExpenses = await Expense.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate totals
    const currentMonthTotal = currentMonthSummary.reduce((sum, item) => sum + item.totalAmount, 0);
    const lastMonthTotal = lastMonthSummary.reduce((sum, item) => sum + item.totalAmount, 0);
    
    // Calculate percentage change
    const percentageChange = lastMonthTotal > 0 
      ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        currentMonth: {
          total: currentMonthTotal,
          breakdown: currentMonthSummary,
          transactionCount: currentMonthSummary.reduce((sum, item) => sum + item.count, 0)
        },
        lastMonth: {
          total: lastMonthTotal,
          breakdown: lastMonthSummary
        },
        comparison: {
          percentageChange: Math.round(percentageChange * 100) / 100,
          difference: currentMonthTotal - lastMonthTotal
        },
        recentExpenses
      }
    });
  } catch (error) {
    console.error('Error generating dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard analytics',
      error: error.message
    });
  }
});

export default router;