import React from 'react';
import { useAuth } from '../context/AuthContext';
import AuthWrapper from './AuthWrapper';
import { Loader, Shield } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-container">
          <div className="loading-icon">
            <Shield size={48} />
          </div>
          <div className="loading-spinner">
            <Loader size={32} className="spinner" />
          </div>
          <h3>Checking authentication...</h3>
          <p>Please wait while we verify your session</p>
        </div>
        <style jsx>{`
          .protected-route-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .loading-container {
            text-align: center;
            color: white;
            max-width: 400px;
            padding: 40px;
          }
          
          .loading-icon {
            margin-bottom: 20px;
            opacity: 0.8;
          }
          
          .loading-spinner {
            margin-bottom: 24px;
          }
          
          .spinner {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          h3 {
            margin: 0 0 8px 0;
            font-size: 1.5rem;
            font-weight: 600;
          }
          
          p {
            margin: 0;
            opacity: 0.8;
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuthenticated) {
    return <AuthWrapper onAuthSuccess={() => window.location.reload()} />;
  }

  // Show protected content if authenticated
  return children;
};

export default ProtectedRoute;