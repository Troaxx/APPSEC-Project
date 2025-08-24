// Controller/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

//aka memberAuth from labs
const authMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Get token from header or cookie
      let token = null;
      
      // Check Authorization header first
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      
      // If no token in header, check cookies
      if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided. Authorization denied.' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user data to request
      req.user = decoded;
      
      // Check if user has required role
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(decoded.role)) {
          return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
      }
      
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired.' });
      }
      return res.status(401).json({ message: 'Invalid token.' });
    }
  };
};

module.exports = authMiddleware;