# 🚀 Vercel Configuration Guide

## **✅ Your Deployments:**

### **Frontend (Client)**

- **Project Name**: `callgirls`
- **Domain**: `callgirls.vercel.app`
- **Status**: ✅ **Deployed Successfully**

### **Backend (API)**

- **Project Name**: `callgirls.api`
- **Domain**: `apicallgirls.vercel.app`
- **Status**: ✅ **Deployed Successfully**

## **🔧 Configuration Steps:**

### **1. Set Frontend Environment Variables**

In your **Frontend Vercel Project** (`callgirls`):

1. **Go to Vercel Dashboard** → `callgirls` project
2. **Settings** → **Environment Variables**
3. **Add these variables**:

```
VITE_API_URL=https://apicallgirls.vercel.app/api
VITE_SOCKET_URL=https://apicallgirls.vercel.app
```

### **2. Set Backend Environment Variables**

In your **Backend Vercel Project** (`callgirls.api`):

1. **Go to Vercel Dashboard** → `callgirls.api` project
2. **Settings** → **Environment Variables**
3. **Add these variables**:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PESAPAL_CONSUMER_KEY=your_pesapal_key
PESAPAL_CONSUMER_SECRET=your_pesapal_secret
PESAPAL_ENVIRONMENT=sandbox_or_live
```

## **🌐 Your URLs:**

### **Frontend (User Interface)**

- **Main URL**: `https://callgirls.vercel.app`
- **This is what users visit**

### **Backend (API Server)**

- **API URL**: `https://apicallgirls.vercel.app`
- **API Endpoints**: `https://apicallgirls.vercel.app/api/*`

## **🎯 How They Work Together:**

1. **Users visit**: `https://callgirls.vercel.app`
2. **Frontend makes API calls to**: `https://apicallgirls.vercel.app/api`
3. **Real-time messaging via**: `https://apicallgirls.vercel.app`

## **✅ Success Indicators:**

- ✅ **Both projects deployed successfully**
- ✅ **No serverless function limit errors**
- ✅ **Frontend builds without issues**
- ✅ **Backend API is accessible**

## **🔧 Redeploy After Environment Variables:**

After setting environment variables:

1. **Frontend**: Will auto-redeploy when you push to GitHub
2. **Backend**: Will auto-redeploy when you push to GitHub

## **📞 Testing:**

1. **Test Frontend**: Visit `https://callgirls.vercel.app`
2. **Test API**: Visit `https://apicallgirls.vercel.app/health`
3. **Test API Endpoints**: `https://apicallgirls.vercel.app/api/auth/me`

**Your deployment is successful! Just configure the environment variables and you're ready to go!** 🎉
