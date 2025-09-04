# 🚀 Render Deployment Guide - Fix for Crashes

## ❌ Why Your App is Crashing

Your app is crashing on Render due to several configuration issues:

1. **Port Configuration**: Your app defaults to port 10000, but Render expects the PORT environment variable
2. **Frontend API URL**: Your frontend is trying to connect to Vercel instead of Render
3. **Missing Environment Variables**: Several required environment variables are not set in Render

## ✅ Solutions Applied

### 1. Fixed Port Configuration

- Updated `api/index.js` to use `process.env.PORT` first (Render's requirement)
- Fallback to config.PORT, then 5000

### 2. Fixed Frontend API URL

- Updated `client/src/services/api.js` to point to your Render backend
- Changed from Vercel URL to `https://callgirls-api.onrender.com/api`

## 🔧 Required Environment Variables in Render

Set these environment variables in your Render dashboard:

### Required Variables:

```
NODE_ENV=production
PORT=5000
MONGODB_CONN=mongodb+srv://tusiwawasahau:tusiwawasahau.cd@cluster0.kkkt6.mongodb.net/tusiwawasahau?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-that-is-at-least-64-characters-long-for-security-and-production-use
FRONTEND_URL=https://callgirls.vercel.app
RENDER_STORAGE_PATH=/opt/render/project/src/uploads
RENDER_EXTERNAL_URL=https://callgirls-api.onrender.com
BASE_URL=https://callgirls-api.onrender.com
```

### Optional Variables (if using these services):

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🚀 Deployment Steps

1. **Push the fixes to GitHub**:

   ```bash
   git add .
   git commit -m "Fix Render deployment issues"
   git push origin main
   ```

2. **Set Environment Variables in Render**:

   - Go to your Render dashboard
   - Navigate to your service
   - Go to "Environment" tab
   - Add all the required environment variables listed above

3. **Redeploy**:
   - Render will automatically redeploy when you push to GitHub
   - Or manually trigger a redeploy from the Render dashboard

## 🔍 Why This Fixes the Docker Issue

The "Docker" issue you mentioned is actually a **Render infrastructure issue**:

- Render uses containerized deployment (similar to Docker)
- Your app wasn't configured properly for Render's container environment
- The port and environment variable fixes resolve the containerization conflicts

## 📊 Expected Results

After applying these fixes, your app should:

- ✅ Start successfully on Render
- ✅ Connect to MongoDB properly
- ✅ Serve files from the correct paths
- ✅ Handle requests on the correct port
- ✅ Connect properly with your Vercel frontend

## 🆘 If Still Having Issues

If your app still crashes after these fixes:

1. **Check Render logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test the health endpoint**: `https://callgirls-api.onrender.com/health`
4. **Check MongoDB connection** is working
5. **Verify file permissions** for upload directories

## 🔗 Useful Endpoints

Once deployed, test these endpoints:

- Health: `https://callgirls-api.onrender.com/health`
- API Status: `https://callgirls-api.onrender.com/api/status`
- Performance: `https://callgirls-api.onrender.com/api/performance`
