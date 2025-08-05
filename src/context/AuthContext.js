import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData && userData.email) {
          setUser(userData);
        } else {
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Starting login process...');
      console.log('Email:', email);
      console.log('Password length:', password.length);
      
      // Get reCAPTCHA token
      const recaptchaToken = await new Promise((resolve) => {
        console.log('Getting reCAPTCHA token...');
        console.log('window.grecaptcha exists:', !!window.grecaptcha);
        
        if (window.grecaptcha && window.grecaptcha.execute) {
          console.log('reCAPTCHA loaded, executing...');
          // Use your actual site key from environment
          const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
          console.log('Site key configured:', !!siteKey);
          
          if (siteKey) {
            window.grecaptcha.execute(siteKey, {
              action: 'login'
            }).then((token) => {
              console.log('reCAPTCHA token received:', token ? 'YES' : 'NO');
              resolve(token);
            }).catch((error) => {
              console.error('reCAPTCHA error:', error);
              resolve('no-recaptcha-token');
            });
          } else {
            console.log('No site key, using fallback');
            resolve('no-recaptcha-token');
          }
        } else {
          console.log('reCAPTCHA not loaded, using fallback');
          resolve('no-recaptcha-token');
        }
      });

      console.log('Sending login request to backend...');
      console.log('Request URL:', '/login');
      console.log('Request data:', { email, password: '***', recaptchaToken: recaptchaToken ? 'YES' : 'NO' });
      
      const response = await axios.post('/login', {
        email,
        password,
        recaptchaToken
      });

      console.log('Backend response received');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      const { data } = response;

      if (data.requires2FA) {
        console.log('2FA required, redirecting...');
        return { requires2FA: true, userId: data.userId, message: data.message };
      }

      console.log('Login successful, storing data...');
      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error occurred');
      console.error('Error details:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Login failed');
    }
  };

  const verify2FA = async (userId, code) => {
    try {
      const response = await axios.post('/verify-2fa', {
        userId,
        code
      });

      const { data } = response;

      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      throw new Error(error.response?.data?.error || '2FA verification failed');
    }
  };

  const register = async (userData, role) => {
    try {
      const response = await axios.post(`/register-${role}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/logout');
    } catch (error) {
      // Even if logout fails on server, clear local data
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const toggle2FA = async (enable) => {
    try {
      const response = await axios.post('/toggle-2fa', { enable });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update 2FA settings');
    }
  };

  const value = {
    user,
    login,
    verify2FA,
    register,
    logout,
    toggle2FA,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}