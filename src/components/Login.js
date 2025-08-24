import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lockoutStatus, setLockoutStatus] = useState(null);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Check lockout status when email changes
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      checkLockoutStatus();
    }
  }, [formData.email]);

  // Update lockout timer
  useEffect(() => {
    if (lockoutStatus?.isLocked && lockoutStatus.remainingTime > 0) {
      const timer = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            checkLockoutStatus(); // Recheck when timer expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutStatus]);

  const checkLockoutStatus = async () => {
    try {
      const response = await axios.post('/lockout-status', { email: formData.email });
      setLockoutStatus(response.data);
      setLockoutTimer(response.data.remainingTime);
    } catch (error) {
      // Ignore errors for non-existent users
      setLockoutStatus(null);
      setLockoutTimer(0);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error and remaining attempts when user starts typing
    if (error) {
      setError('');
      setRemainingAttempts(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRemainingAttempts(null);
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.requires2FA) {
        // Redirect to 2FA page with userId
        navigate('/verify-2fa', { 
          state: { 
            userId: result.userId, 
            message: result.message 
          } 
        });
      } else {
        // Login successful, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
      
      // Check if the error response contains remaining attempts information
      if (err.response?.data?.remainingAttempts !== undefined) {
        setRemainingAttempts(err.response.data.remainingAttempts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/request-password-reset', {
        email: user.email
      });
      setMessage('Password reset link sent to your email. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-card form-container">
        <div className="card-header">
          <h1>Certis Cisco Login</h1>
        </div>
        
        <div className="card-body">
          {error && (
            <div className="message error">
              {error}
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#ff6b6b' }}>
                  ⚠️ {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before account lockout
                </div>
              )}
              {remainingAttempts === 0 && (
                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#ff6b6b' }}>
                  🔒 Account will be locked after next failed attempt
                </div>
              )}
            </div>
          )}
          
          {lockoutStatus?.isLocked && (
            <div className="message warning">
              <strong>Account Locked</strong>
              <p>Too many failed login attempts. Please wait {formatTime(lockoutTimer)} before trying again.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter your email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  name="password" 
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading || lockoutStatus?.isLocked}
            >
              {loading ? 'Logging in...' : lockoutStatus?.isLocked ? 'Account Locked' : 'Login'}
            </button>
          </form>
          
          <div className="text-center mt-20">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>

          <div className="text-center mt-20">
            <p>Forgot Password? <Link to="/reset-password">Reset Password</Link></p>
          </div>
          
          <div className="info-card mt-20">
            <p className="text-center" style={{ fontSize: '0.85rem', margin: 0 }}>
              This site is protected by reCAPTCHA and Google's Privacy Policy applies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;