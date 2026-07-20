# Kharcha Mitra - Smart Finance Management

A comprehensive expense tracking application with AI-powered categorization and insights using Gemini AI.

## 🌐 Live Demo

- **Frontend**: Deploy to Netlify/Vercel using the `dist` folder
- **Backend**: https://smart-tracer-2.onrender.com
- **API Base URL**: https://smart-tracer.onrender.com/api
- Live - https://smart-tracer-uzp.vercel.app/

## 🚀 Deployment Status

- ✅ **Backend**: Successfully deployed on Render
- ✅ **Database**: MongoDB Atlas cluster configured
- ✅ **AI Service**: Gemini AI integrated and working
- ✅ **Frontend**: Production build ready for deployment

## Project Structure

```
KharchaMitra/
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
- ✅ Add daily expenses manually with AI categorization
- ✅ Gemini AI to categorize expenses and generate monthly summary
- ✅ Budget notification system with daily/monthly limits
- ✅ Display expense distribution chart using Chart.js
- ✅ Node.js backend for storing expense data in MongoDB
- ✅ Real-time budget monitoring with alerts
- ✅ Expense history management with edit/delete

### Good-to-Have Features ✅
- ✅ AI-based budgeting tips and insights
- ✅ Dark mode UI with theme persistence
- ✅ Responsive design for mobile and desktop
- ✅ Advanced filtering and sorting options
- 🚧 Export expense report as PDF
- 🚧 Voice input for adding expenses

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

```

4. Start backend server:
```bash
node server.js
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

## 🚀 Deployment Guide

### Backend Deployment (Render)

1. **Already Deployed** ✅
   - URL: https://smart-tracer-2.onrender.com
   - API: https://smart-tracer.onrender.com/api
   - Status: ✅ Online

2. **Environment Variables** (configured on Render):

   ```

### Frontend Deployment

1. **Build Production Version**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**:
   - Upload the `dist` folder to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Deploy to Vercel**:
   - Connect GitHub repo to Vercel
   - Set framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Manual Deployment**:
   - Serve locally: `npx serve dist -p 3000`
   - Upload `dist` folder contents to any static hosting

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
Contribution test
UI updated
