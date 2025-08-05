import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email', 'code', 'password'
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setResetToken(tokenParam);
      setStep('password');
    }
  }, [searchParams]);

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(req => req);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate password requirements in real-time
    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/request-password-reset', {
        email: email
      });

      setSuccess('Verification code sent to your email. Please check your inbox.');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/verify-reset-code', {
        email: email,
        code: verificationCode
      });

      setResetToken(response.data.resetToken);
      setSuccess('Code verified successfully. Please enter your new password.');
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (!validatePassword(formData.newPassword)) {
      setError('Password does not meet requirements');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/reset-password', {
        token: resetToken,
        newPassword: formData.newPassword
      });

      setSuccess('Password reset successful! You can now login with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Email step
  if (step === 'email') {
    return (
      <div className="page-container">
        <div className="content-card form-container">
          <div className="card-header">
            <h1>Reset Your Password</h1>
          </div>
          
          <div className="card-body">
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}
            
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
            
            <div className="text-center" style={{ marginTop: '20px' }}>
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-secondary"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Code verification step
  if (step === 'code') {
    return (
      <div className="page-container">
        <div className="content-card form-container">
          <div className="card-header">
            <h1>Enter Verification Code</h1>
          </div>
          
          <div className="card-body">
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}
            
            <form onSubmit={handleCodeSubmit}>
              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code</label>
                <input 
                  type="text" 
                  id="verificationCode" 
                  name="verificationCode" 
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength="6"
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
            
            <div className="text-center" style={{ marginTop: '20px' }}>
              <button 
                onClick={() => setStep('email')}
                className="btn btn-secondary"
              >
                Back to Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Password reset step
  return (
    <div className="page-container">
      <div className="content-card form-container">
        <div className="card-header">
          <h1>Set New Password</h1>
        </div>
        
        <div className="card-body">
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-container">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword" 
                  name="newPassword" 
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required 
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword" 
                  name="confirmPassword" 
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Password Requirements Display */}
            {formData.newPassword && (
              <div className="password-requirements">
                <h4>Password requirements:</h4>
                <ul>
                  <li className={passwordRequirements.length ? 'requirement-met' : 'requirement-unmet'}>
                    At least 8 characters
                  </li>
                  <li className={passwordRequirements.uppercase ? 'requirement-met' : 'requirement-unmet'}>
                    One uppercase letter
                  </li>
                  <li className={passwordRequirements.lowercase ? 'requirement-met' : 'requirement-unmet'}>
                    One lowercase letter
                  </li>
                  <li className={passwordRequirements.number ? 'requirement-met' : 'requirement-unmet'}>
                    One number
                  </li>
                  <li className={passwordRequirements.special ? 'requirement-met' : 'requirement-unmet'}>
                    One special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}

export default ResetPassword; 