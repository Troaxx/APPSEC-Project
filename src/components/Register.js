import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

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
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate password
    if (!validatePassword(formData.password)) {
      setError('Password does not meet requirements');
      setLoading(false);
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      }, formData.role);
      
      setSuccess('Registration successful! You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="content-card form-container">
        <div className="card-header">
          <h1>Create Account</h1>
        </div>
        
        <div className="card-body">
          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                placeholder="Enter your username" 
                value={formData.username}
                onChange={handleChange}
                required 
              />
            </div>
            
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
              <label htmlFor="role">Account Role</label>
              <select 
                id="role" 
                name="role" 
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select Role</option>
                <option value="member">Member</option>
                <option value="treasurer">Treasurer</option>
                <option value="secretary">Secretary</option>
                <option value="president">President</option>
              </select>
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
              
              {/* Password Requirements Display */}
              {formData.password && (
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
            </div>
            
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="text-center mt-20">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;