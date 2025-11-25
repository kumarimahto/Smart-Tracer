import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthWrapper = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleAuthSuccess = () => {
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  return (
    <>
      {isLogin ? (
        <Login 
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={handleAuthSuccess}
        />
      ) : (
        <Register 
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default AuthWrapper;