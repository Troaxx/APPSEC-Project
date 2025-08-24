import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function TwoFactorAuth() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resendTimeLeft, setResendTimeLeft] = useState(0);
  
  const { verify2FA } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const userId = location.state?.userId;
  const message = location.state?.message;

  // Redirect if no userId
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setError('Verification code has expired. Please login again.');
    }
  }, [timeLeft]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimeLeft > 0) {
      const timer = setTimeout(() => setResendTimeLeft(resendTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendTimeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (code.length !== 8) {
      setError('Please enter a 8-digit verification code');
      setLoading(false);
      return;
    }

    try {
      await verify2FA(userId, code);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 8) {
      setCode(value);
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      setLoading(true);
      
      const response = await axios.post('/resend-verification', { userId });
      
      if (response.data.success) {
        setResendCount(response.data.resendCount);
        setResendDisabled(true);
        setResendTimeLeft(45); // 45 seconds cooldown
        setTimeLeft(180); // Reset timer to 3 minutes
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = () => {
    navigate('/login');
  };

  if (!userId) {
    return null; // Will redirect to login
  }

  return (
    <div className="page-container">
      <div className="content-card two-factor-container">
        <div className="card-header">
          <h2>Two-Factor Authentication</h2>
        </div>
        
        <div className="card-body">
          {message && <div className="message info">{message}</div>}
          {error && <div className="message error">{error}</div>}
          
          <p>Please enter the 8-digit verification code sent to your email:</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="00000000"
                maxLength="8"
                className="verification-code-input"
                required
              />
            </div>
            
            <div className={`timer-display ${timeLeft > 0 ? 'timer-active' : 'timer-expired'}`}>
              {timeLeft > 0 ? (
                <span>Code expires in: <strong>{formatTime(timeLeft)}</strong></span>
              ) : (
                <span><strong>Code has expired!</strong></span>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={loading || timeLeft === 0}
              className="btn btn-primary btn-block"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
          
          <div className="d-flex justify-center gap-10 mt-20">
            <button 
              onClick={handleResend}
              disabled={resendDisabled || resendCount >= 3 || loading}
              className="btn btn-secondary"
            >
              {resendDisabled 
                ? `Resend (${resendTimeLeft}s)` 
                : resendCount >= 3 
                  ? 'Max attempts reached' 
                  : 'Resend Code'
              }
            </button>
            
            <button 
              onClick={goBackToLogin}
              className="btn btn-secondary"
            >
              Back to Login
            </button>
          </div>
          
          <div className="info-card mt-20">
            <p>Check your email for the verification code</p>
            <p>For security, this code will expire in 3 minutes</p>
            <p>You can resend the code up to 3 times with a 45-second cooldown</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorAuth;