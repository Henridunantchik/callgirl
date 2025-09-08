# 🚂 Railway Deployment Guide

## ✅ Configuration Updated for Railway

I've updated your app configuration to work with Railway instead of Render:

### Changes Made:

- ✅ Updated frontend API URL to point to Railway backend
- ✅ Changed storage paths from Render to Railway format
- ✅ Updated environment variable names for Railway
- ✅ Fixed all URL references

## 🚂 Railway Environment Variables

Set these environment variables in your Railway dashboard:

### Required Variables:

```
NODE_ENV=production
# DO NOT set PORT on Railway; it is injected
MONGODB_CONN=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>/<YOUR_DB>?retryWrites=true&w=majority&appName=<YOUR_APP_NAME>
JWT_SECRET=<REPLACE_WITH_A_NEW_RANDOM_64+_CHAR_SECRET>
FRONTEND_URL=https://epicescorts.live
FRONTEND_URLS=https://epicescorts.live,https://callgirls.vercel.app,http://localhost:5173
RAILWAY_STORAGE_PATH=/data/uploads
RAILWAY_EXTERNAL_URL=https://api.epicescorts.live
BASE_URL=https://api.epicescorts.live
```

### Optional Variables (if using these services):

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🚀 Railway Deployment Steps

### 1. Connect Your Repository

- Go to [Railway.app](https://railway.app)
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `callgirls` repository

### 2. Configure the Service

- **Root Directory**: `api` (since your backend is in the `api` folder)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Set Environment Variables

- Go to your Railway project dashboard
- Click on your service
- Go to "Variables" tab
- Add all the environment variables listed above

### 4. Deploy

- Railway will automatically deploy when you push to GitHub
- Or click "Deploy" in the Railway dashboard

## 🔧 Railway-Specific Configuration

### File Storage

Attach a Railway Volume to the API service and set `RAILWAY_STORAGE_PATH=/data/uploads`. This path will persist across deploys.

### Port Configuration

Railway automatically sets the `PORT` environment variable. Do not set it manually.

### URL Structure

Set `BASE_URL` to your custom domain, e.g. `https://api.epicescorts.live`.

### Multiple Frontend Support

Your API supports multiple frontend domains:

- **Primary**: `https://epicescorts.live`
- **Secondary**: `https://callgirls.vercel.app`
- **Development**: `http://localhost:5173`

The CORS configuration allows requests from all these domains.

## 📊 Expected Results

After deployment, your app should:

- ✅ Start successfully on Railway
- ✅ Connect to MongoDB properly
- ✅ Serve files from `/data/uploads` (Railway Volume)
- ✅ Handle requests on Railway's assigned port
- ✅ Connect properly with both your frontend domains (epicescorts.live and callgirls.vercel.app)

## 🔗 Useful Endpoints

Once deployed, test these endpoints:

- Health: `https://api.epicescorts.live/health`
- API Status: `https://api.epicescorts.live/api/status`
- Performance: `https://api.epicescorts.live/api/performance`

## 🆘 Troubleshooting

### If deployment fails:

1. **Check Railway logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Ensure MongoDB connection** is working
4. **Check that PORT is not hardcoded** (Railway sets this automatically)

### Common Railway Issues:

- **Build failures**: Usually due to missing dependencies or incorrect build commands
- **Runtime crashes**: Often caused by missing environment variables
- **File upload issues**: Check that `/app/uploads` directory exists and is writable

## 🎯 Key Differences from Render

| Feature      | Render                            | Railway (Your Setup)           |
| ------------ | --------------------------------- | ------------------------------ |
| Storage Path | `/opt/render/project/src/uploads` | `/app/uploads`                 |
| URL Pattern  | `https://your-app.onrender.com`   | `https://api.epicescorts.live` |
| Environment  | More Docker-like                  | More Heroku-like               |
| File System  | Persistent storage                | Ephemeral storage              |

## 🚀 Next Steps

1. **Push these changes** to GitHub
2. **Deploy to Railway** using the steps above
3. **Set environment variables** in Railway dashboard
4. **Test your endpoints** to ensure everything works

Your app should now work perfectly on Railway! 🚂
