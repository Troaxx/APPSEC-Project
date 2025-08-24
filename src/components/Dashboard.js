import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const { user, logout, toggle2FA } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Logout will clear local data even if server call fails
    }
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await toggle2FA(!user.twoFactorEnabled);
      setMessage(result.message);
      
      // Update user data in localStorage
      const updatedUser = { ...user, twoFactorEnabled: !user.twoFactorEnabled };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Force a page refresh to update the UI
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'president':
        return 'You have full administrative access to all features.';
      case 'secretary':
        return 'You have access to meeting management and member communication features.';
      case 'treasurer':
        return 'You have access to financial management and reporting features.';
      case 'member':
        return 'You have access to basic member features and information.';
      default:
        return 'Welcome to the system!';
    }
  };


  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>{getWelcomeMessage()}, {user?.name}!</h1>
          <div className="user-info">
            Role: <strong>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</strong>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>

      {/* Messages */}
      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      {/* Main Content */}
      <div className="grid-2 mb-20">
        {/* Left Side - Account & Security Info */}
        <div>
          {/* Account Information */}
          <div className="content-card mb-20">
            <div className="card-body">
              <h3>Account Information</h3>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
              <div className="info-card">
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{getRoleDescription(user?.role)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Role-Based Navigation */}
        <div>
          {/* Role-Based Navigation */}
          <div className="content-card">
            <div className="card-body">
              <h3>Role-Based Access</h3>
              <div className="nav-links">
                {user?.role === 'president' && (
                  <button onClick={() => navigate('/president')} className="btn btn-primary btn-block">
                    President Portal
                  </button>
                )}
                
                {(user?.role === 'secretary' || user?.role === 'president') && (
                  <button onClick={() => navigate('/secretary')} className="btn btn-success btn-block">
                    Secretary Portal
                  </button>
                )}
                
                {(user?.role === 'treasurer' || user?.role === 'secretary' || user?.role === 'president') && (
                  <button onClick={() => navigate('/treasurer')} className="btn btn-warning btn-block">
                    Treasurer Portal
                  </button>
                )}
                
                {(user?.role === 'member' || user?.role === 'treasurer' || user?.role === 'secretary' || user?.role === 'president') && (
                  <button onClick={() => navigate('/member')} className="btn btn-info btn-block">
                    Member Portal
                  </button>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </div>


      {/* Footer */}
      <div className="page-footer">
        <p>Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default Dashboard;