import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PresidentPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Logout will clear local data even if server call fails
    }
  };

  return (
    <div className="page-container">
      <div className="content-card">
        <div className="card-header">
          <h1>President Portal</h1>
          <p>This page is available for only the president. Public domain is not allowed to access this page.</p>
        </div>
        
        <div className="card-body">
          <div className="info-card role-president">
            <h4>President Privileges:</h4>
            <ul>
              <li>Full administrative access</li>
              <li>User management capabilities</li>
              <li>System configuration access</li>
              <li>All financial and operational reports</li>
              <li>Override permissions for emergency situations</li>
            </ul>
          </div>
          
          <div className="d-flex gap-15 justify-center mt-30">
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
        
        <div className="page-footer">
          <p>Logged in as: <strong>{user?.name}</strong> ({user?.role})</p>
        </div>
      </div>
      
      <noscript>Enable JavaScript to access this page</noscript>
    </div>
  );
}

export default PresidentPage;