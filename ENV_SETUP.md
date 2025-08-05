# Environment Configuration Guide

## 🔧 Required Environment Variables

Create a `.env` file in your project root with these values:

```env
# Database Connection
DB_CONNECT=mongodb://localhost:27017/certis_cisco

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789

# Email Configuration for 2FA
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# reCAPTCHA v3 Keys
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# Environment
NODE_ENV=development

# Server Port
PORT=3001
```

## 🔑 How to Get Each Value:

### 1. **reCAPTCHA Keys** (to remove the overlay):
1. Go to: https://www.google.com/recaptcha/admin/create
2. Sign in with Google account
3. Create new site:
   - **Label**: "Certis Cisco Auth"
   - **Type**: reCAPTCHA v3
   - **Domains**: `localhost`, `127.0.0.1`
4. Copy the **Site Key** and **Secret Key**

### 2. **Gmail App Password** (for 2FA emails):
1. Go to your Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Select "Mail" → Generate
4. Use this 16-character password (not your regular Gmail password)

### 3. **JWT Secret**:
- Use a strong random string (at least 32 characters)
- Generate online at: https://randomkeygen.com/
- Or use: `openssl rand -base64 32`

### 4. **MongoDB Connection**:
- If using local MongoDB: `mongodb://localhost:27017/certis_cisco`
- If using MongoDB Atlas: Get connection string from your cluster

## 🚫 To Remove reCAPTCHA Overlay Immediately:

If you want to temporarily disable reCAPTCHA while setting up:

1. **Comment out reCAPTCHA script** in `public/index.html`:
```html
<!-- Temporarily disabled -->
<!-- <script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script> -->
```

2. **Or set development mode** in your AuthContext to skip reCAPTCHA verification.

## ✅ Complete Setup Steps:

1. **Create `.env` file** with the values above
2. **Get real reCAPTCHA keys** and replace the test keys
3. **Setup Gmail app password** for 2FA emails
4. **Restart your servers**:
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2  
   npm run react-start
   ```

## 🔧 Testing:

- **Login/Register**: Should work without overlay
- **2FA**: Will send real emails if Gmail is configured
- **reCAPTCHA**: Will work silently in background

The overlay appears because we're using test keys. Once you have real keys, it will disappear!