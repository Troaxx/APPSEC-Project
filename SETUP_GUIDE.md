# Security Enhanced Authentication System Setup Guide

## 🚀 Features Implemented

✅ **Two-Factor Authentication (2FA)** - Email-based verification codes  
✅ **reCAPTCHA v3** - Invisible bot protection  
✅ **Account Lockout** - Protection against brute force attacks  
✅ **Password Policy** - Strong password requirements  
✅ **React Frontend** - Modern user interface  
✅ **Rate Limiting** - Login attempt throttling  

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Gmail account (for 2FA emails)
- Google reCAPTCHA v3 account

## 🛠️ Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory with the following:

```env
# Database Connection
DB_CONNECT=mongodb://localhost:27017/certis_cisco

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Email Configuration for 2FA
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# reCAPTCHA v3 Keys (get from https://www.google.com/recaptcha/admin)
RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Environment
NODE_ENV=development

# Server Port
PORT=3001
```

### 2. Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use this password in the `EMAIL_PASSWORD` field

### 3. reCAPTCHA v3 Setup

1. Go to https://www.google.com/recaptcha/admin
2. Create a new site
3. Choose reCAPTCHA v3
4. Add your domains (localhost for development)
5. Get your Site Key and Secret Key
6. Update the keys in your `.env` file

### 4. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install React dependencies
cd client
npm install
cd ..
```

### 5. Start the Application

#### Development Mode (Recommended)

**Terminal 1 - Backend Server:**
```bash
npm run dev
```

**Terminal 2 - React App:**
```bash
cd client
npm start
```

- Backend API: http://localhost:3001
- React App: http://localhost:3000

#### Production Mode

```bash
# Build React app
cd client
npm run build
cd ..

# Start production server
NODE_ENV=production npm start
```

## 🔐 Security Features Explained

### Password Policy
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character (!@#$%^&*)

### Account Lockout
- Account locks after 5 failed login attempts
- 15-minute lockout period
- Automatic unlock after timeout

### 2FA Email Verification
- 6-digit codes sent via email
- 5-minute expiration time
- Can be enabled/disabled by users

### reCAPTCHA v3
- Invisible verification
- Score-based protection (0.0-1.0)
- Blocks requests with score < 0.5

### Rate Limiting
- 5 login attempts per 15-minute window per IP
- Applies to login endpoint only

## 📱 How to Use

### Registration
1. Go to http://localhost:3000/register
2. Fill in all fields with a strong password
3. Choose your role (member, treasurer, secretary, president)
4. Submit registration

### Login
1. Go to http://localhost:3000/login
2. Enter email and password
3. reCAPTCHA verification happens automatically
4. If 2FA is enabled, enter the code sent to your email

### Enable 2FA
1. Login to your account
2. Go to Dashboard
3. Click "Enable 2FA" in Security Settings
4. Next login will require email verification

## 🧪 Testing

### Test Account Lockout
1. Try logging in with wrong password 5 times
2. Account should be locked for 15 minutes

### Test 2FA
1. Enable 2FA in dashboard
2. Logout and login again
3. Check email for verification code

### Test Password Policy
1. Try registering with weak passwords
2. See real-time validation feedback

## 📂 Project Structure

```
project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Authentication context
│   │   └── App.js         # Main app component
│   └── package.json
├── Controller/
│   └── authFunctions.js   # Enhanced auth logic
├── Database/
│   └── user.js           # User schema with security fields
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── securityMiddleware.js # Rate limiting, reCAPTCHA
├── services/
│   └── emailService.js    # Email service for 2FA
├── routes/
│   └── userRouter.js     # API routes
└── server.js             # Express server
```

## 🔧 Troubleshooting

### Email not sending
- Check Gmail app password
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Make sure 2FA is enabled on your Google account

### reCAPTCHA errors
- Verify site and secret keys
- Check domain configuration in reCAPTCHA admin
- Test with browser dev tools

### MongoDB connection issues
- Make sure MongoDB is running
- Check DB_CONNECT string in .env

### React app not loading
- Run `npm install` in client folder
- Check if backend is running on port 3001
- Clear browser cache

## 🚨 Security Notes

- Never commit `.env` file to version control
- Use strong JWT secrets in production
- Enable HTTPS in production
- Regularly update dependencies
- Monitor login attempts and failures
- Consider adding IP whitelisting for admin accounts

## 🎯 Next Steps

Optional enhancements you could add:
- SMS-based 2FA
- Biometric authentication
- Session management dashboard
- Audit logging
- IP geolocation tracking
- Advanced password policies (dictionary checks)
- Social login integration