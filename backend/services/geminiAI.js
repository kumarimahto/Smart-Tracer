import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiAIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Categorize expense based on title and description
   */
  async categorizeExpense(title, description = '', amount = null) {
    try {
      const prompt = `
        Analyze this expense and categorize it into one of these categories:
        Categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Groceries, Personal Care, Home & Garden, Insurance, Investments, Gifts & Donations, Business, Other

        Expense Details:
        - Title: "${title}"
        - Description: "${description}"
        ${amount ? `- Amount: ₹${amount}` : ''}

        Please respond in this exact JSON format:
        {
          "category": "exact category name from the list above",
          "confidence": 0.95,
          "reasoning": "brief explanation for the categorization"
        }

        Be very specific with the category name. Only use categories from the provided list.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON from response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            category: parsed.category,
            confidence: parsed.confidence || 0.8,
            reasoning: parsed.reasoning || 'AI categorization',
            success: true
          };
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
      }

      // Fallback categorization based on keywords
      const fallbackCategory = this.fallbackCategorization(title, description);
      
      return {
        category: fallbackCategory,
        confidence: 0.6,
        reasoning: 'Fallback categorization due to AI parsing error',
        success: false,
        originalResponse: text
      };

    } catch (error) {
      console.error('Gemini AI categorization error:', error);
      
      // Fallback to keyword-based categorization
      const fallbackCategory = this.fallbackCategorization(title, description);
      
      return {
        category: fallbackCategory,
        confidence: 0.5,
        reasoning: 'Fallback categorization due to AI service error',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate monthly expense summary and insights
   */
  async generateMonthlySummary(expenses, monthYear) {
    try {
      const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
      const totalTransactions = expenses.reduce((sum, exp) => sum + exp.count, 0);
      
      // Prepare expense data for AI analysis
      const expenseData = expenses.map(exp => ({
        category: exp._id,
        amount: exp.totalAmount,
        transactions: exp.count,
        avgAmount: exp.avgAmount
      }));

      const prompt = `
        Analyze this monthly expense data and provide insights:

        Month: ${monthYear}
        Total Amount: ₹${totalAmount}
        Total Transactions: ${totalTransactions}

        Category-wise breakdown:
        ${expenseData.map(exp => `- ${exp.category}: ₹${exp.amount} (${exp.transactions} transactions, avg ₹${exp.avgAmount.toFixed(2)})`).join('\n')}

        Please provide a JSON response with these insights:
        {
          "summary": "Brief overview of spending patterns",
          "topCategories": ["category1", "category2", "category3"],
          "insights": [
            "insight 1 about spending patterns",
            "insight 2 about potential savings",
            "insight 3 about financial habits"
          ],
          "budgetingTips": [
            "tip 1 for better budgeting",
            "tip 2 for savings",
            "tip 3 for financial management"
          ],
          "alerts": [
            "alert about high spending in specific categories if any"
          ],
          "overallRating": "Excellent/Good/Average/Poor"
        }

        Focus on actionable insights and be specific about amounts and categories.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON from response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            generatedAt: new Date(),
            success: true
          };
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini monthly summary:', parseError);
      }

      // Fallback summary
      return this.generateFallbackSummary(expenses, totalAmount, totalTransactions);

    } catch (error) {
      console.error('Gemini AI monthly summary error:', error);
      const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
      const totalTransactions = expenses.reduce((sum, exp) => sum + exp.count, 0);
      return this.generateFallbackSummary(expenses, totalAmount, totalTransactions);
    }
  }

  /**
   * Get budgeting tips based on spending patterns
   */
  async getBudgetingTips(expenses, userProfile = {}) {
    try {
      const topCategories = expenses
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map(exp => ({ category: exp._id, amount: exp.totalAmount }));

      const prompt = `
        Provide personalized budgeting tips based on this spending pattern:

        Top spending categories:
        ${topCategories.map(cat => `- ${cat.category}: ₹${cat.amount}`).join('\n')}

        User profile:
        ${userProfile.income ? `Monthly Income: ₹${userProfile.income}` : 'Income not specified'}
        ${userProfile.savingsGoal ? `Savings Goal: ₹${userProfile.savingsGoal}` : 'No savings goal'}

        Please provide practical budgeting tips in JSON format:
        {
          "tips": [
            "tip 1",
            "tip 2",
            "tip 3"
          ],
          "savingsOpportunities": [
            "opportunity 1",
            "opportunity 2"
          ],
          "budgetAllocation": {
            "needs": "percentage for needs",
            "wants": "percentage for wants", 
            "savings": "percentage for savings"
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON from response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse budgeting tips:', parseError);
      }

      // Fallback tips
      return {
        tips: [
          "Track your expenses daily for better awareness",
          "Set spending limits for discretionary categories",
          "Review and optimize recurring expenses monthly"
        ],
        savingsOpportunities: [
          "Reduce dining out expenses by cooking more at home",
          "Compare prices before making purchases"
        ],
        budgetAllocation: {
          needs: "50-60%",
          wants: "20-30%",
          savings: "20%"
        }
      };

    } catch (error) {
      console.error('Budgeting tips generation error:', error);
      return {
        error: error.message,
        tips: ["Track expenses regularly", "Set monthly budgets", "Review spending patterns"]
      };
    }
  }

  /**
   * Fallback categorization using keywords
   */
  fallbackCategorization(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    const categoryKeywords = {
      'Food & Dining': ['restaurant', 'food', 'dining', 'meal', 'lunch', 'dinner', 'breakfast', 'cafe', 'pizza', 'burger'],
      'Transportation': ['fuel', 'gas', 'petrol', 'diesel', 'taxi', 'uber', 'ola', 'bus', 'train', 'metro', 'auto'],
      'Groceries': ['grocery', 'vegetables', 'fruits', 'supermarket', 'market', 'provisions', 'milk', 'bread'],
      'Shopping': ['shopping', 'clothes', 'clothing', 'shoes', 'accessories', 'electronics', 'gadget'],
      'Bills & Utilities': ['electricity', 'water', 'internet', 'mobile', 'phone', 'wifi', 'bill', 'utility'],
      'Healthcare': ['medicine', 'doctor', 'hospital', 'medical', 'pharmacy', 'health', 'clinic'],
      'Entertainment': ['movie', 'game', 'entertainment', 'subscription', 'netflix', 'spotify', 'music'],
      'Education': ['education', 'course', 'book', 'school', 'college', 'tuition', 'fees'],
      'Travel': ['travel', 'trip', 'hotel', 'flight', 'vacation', 'tourism', 'booking']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }

  /**
   * Generate fallback summary when AI fails
   */
  generateFallbackSummary(expenses, totalAmount, totalTransactions) {
    const topCategory = expenses.length > 0 ? expenses[0]._id : 'None';
    
    return {
      summary: `You spent ₹${totalAmount} across ${totalTransactions} transactions this month.`,
      topCategories: expenses.slice(0, 3).map(exp => exp._id),
      insights: [
        `Your highest spending category was ${topCategory}`,
        `You made ${totalTransactions} transactions this month`,
        expenses.length > 1 ? `You spent across ${expenses.length} different categories` : 'Consider diversifying your expense tracking'
      ],
      budgetingTips: [
        "Review your spending patterns regularly",
        "Set monthly budgets for each category",
        "Look for areas where you can reduce expenses"
      ],
      alerts: totalAmount > 50000 ? [`High spending detected: ₹${totalAmount}`] : [],
      overallRating: totalAmount < 20000 ? 'Good' : totalAmount < 40000 ? 'Average' : 'High',
      generatedAt: new Date(),
      success: false,
      source: 'fallback'
    };
  }
}

export default new GeminiAIService();