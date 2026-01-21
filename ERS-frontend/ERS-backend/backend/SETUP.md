# Backend Setup Guide

## 🚨 **Critical: Create .env file first!**

Create a `.env` file in the `ERS-backend/backend/` folder with the following content:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/ers_db

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here_make_it_long

# Server Configuration
PORT=5000

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3001

# Optional: Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 📋 **Installation Steps:**

1. **Install Dependencies:**
   ```bash
   cd ERS-backend/backend
   npm install
   ```

2. **Start MongoDB:**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/ers_db`

3. **Start the Backend:**
   ```bash
   npm run dev
   # or
   npm start
   ```

## ✅ **Expected Output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
```

## 🐛 **Troubleshooting:**

### CORS Errors:
- ✅ Fixed: Backend now allows both ports 3000 and 3001
- ✅ Added preflight request handling

### Missing Environment Variables:
- ✅ Added validation - server will show exactly what's missing
- ✅ Create `.env` file with required variables

### Database Connection:
- ✅ Make sure MongoDB is running
- ✅ Check your `MONGO_URI` in `.env`

## 🔍 **API Endpoints Available:**

- `GET /api/events` - Public event browsing
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/user/profile` - Get user profile
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- And many more...

## 📝 **Notes:**
- Frontend should work on both ports 3000 and 3001
- All CORS issues have been resolved
- Added request logging for debugging
- Added proper error handling
