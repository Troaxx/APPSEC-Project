# APSEC Authentication System

A comprehensive application security project showcasing advanced security concepts learned in the Temasek Polytechnic APSEC Y2S1(Application Security) module. Built with Node.js, React, and MongoDB, this project demonstrates real-world implementation of security measures including Two-Factor Authentication (2FA), reCAPTCHA integration, and account lockout protection.

## 🚀 Features

### 🔐 Security Features
- **Two-Factor Authentication (2FA)**: 8-digit OTP codes sent via email
- **reCAPTCHA v3 Integration**: Bot protection with score-based verification
- **Account Lockout Protection**: Automatic lockout after 5 failed attempts (30-second duration)
- **Rate Limiting**: IP-based login attempt throttling (20 attempts per 15 minutes)
- **Password Policy Enforcement**: Strong password requirements with history tracking
- **JWT Token Authentication**: Secure session management with 2-hour expiry

### 👥 Role-Based Access Control
- **President**: Full system access
- **Treasurer**: Financial management access
- **Secretary**: Administrative access
- **Member**: Basic user access

### 📧 Email Services
- **2FA Code Delivery**: Secure OTP transmission
- **Password Reset**: Email-based password recovery
- **Account Notifications**: Security alerts and confirmations

## 🏗️ Architecture

```
project/
├── Controller/          # Authentication logic
├── Database/           # MongoDB schemas
├── middleware/         # Security middleware
├── routes/            # API endpoints
├── services/          # Email service
├── src/               # React frontend
│   ├── components/    # UI components
│   ├── context/       # Authentication context
│   └── css/          # Styling
└── public/            # Static assets
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcrypt** - Password hashing
- **JWT** - Token authentication
- **Nodemailer** - Email service

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling

### Security
- **reCAPTCHA v3** - Bot protection
- **Express Rate Limit** - DDoS protection
- **Helmet** - Security headers

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Gmail account (for email service)
- reCAPTCHA v3 keys

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/apsecdb
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Email (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   
   # reCAPTCHA
   RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
   REACT_APP_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
   
   # Server
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start backend
   npm run dev
   
   # Start frontend (in new terminal)
   npm run frontend
   ```

## 🔧 Configuration

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `apsecdb`
3. Update `MONGODB_URI` in `.env`

### Email Service Setup
1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Update `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

### reCAPTCHA Setup
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create a new site with reCAPTCHA v3
3. Add your domain
4. Copy the site key and secret key to `.env`

## 📖 API Endpoints

### Authentication
- `POST /login` - User login with 2FA
- `POST /verify-2fa` - Verify 2FA code
- `POST /logout` - User logout
- `POST /resend-verification` - Resend 2FA code

### User Management
- `POST /register-member` - Register new member
- `POST /register-secretary` - Register secretary
- `POST /register-treasurer` - Register treasurer
- `POST /register-president` - Register president

### Password Management
- `POST /request-password-reset` - Request password reset
- `POST /verify-reset-code` - Verify reset code
- `POST /reset-password` - Reset password

### Security
- `POST /lockout-status` - Check account lockout status
- `POST /clear-account-lockout` - Clear account lockout

## 🔒 Security Implementation

### Two-Factor Authentication
- **Code Generation**: 8-digit random codes
- **Expiry**: 3-minute validity
- **Resend Limit**: Maximum 3 attempts with 45-second cooldown
- **Email Delivery**: Secure transmission via Nodemailer

### Account Lockout
- **Threshold**: 5 failed login attempts
- **Duration**: 30-second lockout
- **Whitelist**: Configurable email exemptions
- **Auto-reset**: Automatic unlock after timeout

### Rate Limiting
- **Window**: 15-minute sliding window
- **Limit**: 20 attempts per IP
- **Skip Success**: Successful logins don't count

### reCAPTCHA
- **Version**: v3 (invisible)
- **Score Threshold**: 0.5 minimum
- **Action**: Login-specific scoring
- **Fallback**: Graceful degradation

## 🎨 Frontend Features

### User Interface
- **Responsive Design**: Mobile-friendly layout
- **Real-time Updates**: Live lockout timers
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during operations

### Security Indicators
- **Attempt Counter**: Remaining login attempts
- **Lockout Timer**: Countdown to unlock
- **2FA Status**: Current authentication state
- **Session Management**: Automatic token handling

## 🧪 Testing

The project includes a Postman collection for API testing:
- **File**: `APSEC Project Testing Collection.postman_collection.json`
- **Coverage**: All authentication endpoints
- **Environment**: Pre-configured variables

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `EMAIL_USER` | Gmail username | Yes | - |
| `EMAIL_PASSWORD` | Gmail app password | Yes | - |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA secret key | No | - |
| `REACT_APP_RECAPTCHA_SITE_KEY` | reCAPTCHA site key | No | - |
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment mode | No | development |

## 🚨 Security Considerations

### Best Practices
- **Environment Variables**: Never commit secrets to version control
- **HTTPS**: Use HTTPS in production
- **Rate Limiting**: Monitor and adjust limits based on usage
- **Logging**: Implement comprehensive security logging
- **Updates**: Keep dependencies updated

### Production Deployment
- **Reverse Proxy**: Use Nginx or Apache
- **SSL/TLS**: Enable HTTPS with valid certificates
- **Database Security**: Use MongoDB authentication
- **Monitoring**: Implement application monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete authentication system
- 2FA implementation
- Security features
- Role-based access control

---

**Built with ❤️ for APSEC - Advanced Security in Practice**
