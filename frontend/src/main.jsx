import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ExpenseProvider } from './context/ExpenseContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ExpenseProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ExpenseProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
