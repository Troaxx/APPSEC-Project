import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SecretaryPage() {
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
          <h1>Secretary Portal</h1>
          <p>This page is available for only secretary and above. Public domain is not allowed to access this page.</p>
        </div>
        
        <div className="card-body">
          <div className="info-card role-secretary">
            <h4>Secretary Responsibilities:</h4>
            <ul>
              <li>Meeting management and scheduling</li>
              <li>Member communication coordination</li>
              <li>Document management</li>
              <li>Meeting minutes and records</li>
              <li>Administrative support functions</li>
            </ul>
          </div>
          
          <div className="d-flex gap-15 justify-center mt-30">
            <Link to="/home" className="btn btn-primary">
              Home
            </Link>
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
    </div>
  );
}

export default SecretaryPage;