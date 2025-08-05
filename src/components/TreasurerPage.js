import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TreasurerPage() {
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
          <h1>Treasurer Portal</h1>
          <p>This page is available for treasurer and above. Public domain is not allowed to access this page.</p>
        </div>
        
        <div className="card-body">
          <div className="info-card role-treasurer">
            <h4>Treasurer Responsibilities:</h4>
            <ul>
              <li>Financial management and reporting</li>
              <li>Budget planning and oversight</li>
              <li>Transaction monitoring</li>
              <li>Financial compliance and auditing</li>
              <li>Payment processing and approvals</li>
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

export default TreasurerPage;