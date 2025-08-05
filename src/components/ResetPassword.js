import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
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
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    setToken(tokenParam);
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



  const handleSubmit = async (e) => {
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
        token: token,
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

  if (!token) {
    return (
      <div className="page-container">
        <div className="content-card form-container">
          <div className="card-header">
            <h1>Password Reset</h1>
          </div>
          <div className="card-body">
            {error && <div className="message error">{error}</div>}
            <div className="text-center">
              <p>Please request a new password reset link.</p>
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-card form-container">
        <div className="card-header">
          <h1>Reset Your Password</h1>
        </div>
        
        <div className="card-body">
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
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