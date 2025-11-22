# Smart Expense Tracker with AI Insights

A comprehensive expense tracking application with AI-powered categorization and insights using Gemini AI.

## Project Structure

```
SmartTracer/
├── frontend/          # React.js frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js backend API
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## Features

### Must-Have Features ✅
- ✅ Add daily expenses manually
- ✅ Gemini AI to categorize expenses and generate monthly summary
- ✅ Display expense distribution chart using Chart.js
- ✅ Node.js backend for storing expense data in MongoDB

### Good-to-Have Features 🚧
- 🚧 Export expense report as PDF
- 🚧 AI-based budgeting tips
- 🚧 Voice input for adding expenses
- ✅ Dark mode UI

## Tech Stack

### Frontend
- React.js 19
- Chart.js & react-chartjs-2 (for charts)
- Axios (API calls)
- Lucide React (icons)
- Vite (build tool)

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Google Gemini AI
- CORS, Helmet (security)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas cluster)
- Gemini AI API key

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create `.env` file with:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/smart-expense-tracker
MONGODB_URI_CLUSTER=mongodb+srv://Expense:<password>@cluster0.vtt0jda.mongodb.net/smart-expense-tracker
GEMINI_API_KEY=AIzaSyBaxOAitbAzB2QD-n9a-wvh4v1Ci0GLnvM
NODE_ENV=development
```

4. Start backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses (with pagination and filters)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/monthly/:year/:month` - Get monthly summary
- `GET /api/expenses/analytics/dashboard` - Get dashboard analytics

### AI Services
- `POST /api/ai/categorize` - Categorize expense using AI
- `GET /api/ai/summary/:year/:month` - Get AI-generated monthly insights
- `GET /api/ai/budgeting-tips` - Get personalized budgeting tips
- `POST /api/ai/bulk-categorize` - Bulk categorize expenses

## Environment Variables

### Backend (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/smart-expense-tracker
MONGODB_URI_CLUSTER=mongodb+srv://username:password@cluster.mongodb.net/database
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

## Usage

1. **Backend**: Runs on http://localhost:3001
2. **Frontend**: Runs on http://localhost:5173
3. **Add Expenses**: Click "Add Expense" to create new expense entries
4. **AI Categorization**: Use AI button to automatically categorize expenses
5. **View Analytics**: Dashboard shows spending patterns and charts
6. **Monthly Insights**: Get AI-generated monthly summaries and budgeting tips
7. **Dark Mode**: Toggle between light and dark themes

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/analytics/dashboard` - Dashboard analytics

### AI Services
- `POST /api/ai/categorize` - Categorize expense using AI
- `GET /api/ai/summary/:year/:month` - Get AI insights
- `GET /api/ai/budgeting-tips` - Get budgeting tips

## MongoDB Setup

Your MongoDB cluster URL: `mongodb+srv://Expense:<password>@cluster0.vtt0jda.mongodb.net/`

Replace `<password>` with your database password in `backend/.env`
