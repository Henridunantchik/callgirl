# 🚀 Escort Directory - Deployment Guide

## Overview
This guide covers deploying the Escort Directory application to production.

## 📋 Prerequisites

### Backend (API) Requirements
- Node.js 18+ 
- MongoDB Atlas account
- Cloudinary account
- VPS or cloud hosting (Vercel, Railway, Render, etc.)

### Frontend Requirements
- Node.js 18+
- Vite build system
- Static hosting (Vercel, Netlify, etc.)

## 🔧 Backend Deployment

### 1. Environment Variables
Create `.env.production` in the `api` folder:

```env
NODE_ENV=production
PORT=5000
MONGODB_CONN=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
CLOUDINARY_APP_NAME=your_cloudinary_app_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Production Scripts
The API includes these production scripts:
- `npm start` - Start production server
- `npm run build` - Build preparation
- `npm test` - Run tests

### 3. Deployment Options

#### Option A: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy API
cd api
vercel --prod
```

#### Option B: Railway
```bash
# Connect to Railway
railway login
railway init
railway up
```

#### Option C: Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

## 🌐 Frontend Deployment

### 1. Environment Variables
Create `.env.production` in the `client` folder:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_FIREBASE_API=your_firebase_api_key
```

### 2. Build and Deploy
```bash
cd client
npm run build
```

### 3. Deployment Options

#### Option A: Vercel
```bash
# Deploy frontend
cd client
vercel --prod
```

#### Option B: Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 🔒 Security Checklist

### Backend Security
- [ ] JWT_SECRET is 64+ characters
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is active
- [ ] File upload limits are set
- [ ] HTTPS is enforced

### Frontend Security
- [ ] Environment variables are secure
- [ ] API keys are not exposed
- [ ] HTTPS is enforced
- [ ] CSP headers are set

## 📊 Monitoring & Analytics

### 1. Health Checks
- API health endpoint: `/health`
- Performance monitoring: `/api/performance`

### 2. Logging
- Request logging enabled
- Error tracking configured
- Performance monitoring active

## 🧪 Testing

### 1. API Tests
```bash
cd api
npm test
```

### 2. Frontend Tests
```bash
cd client
npm test
```

### 3. Manual Testing
- Visit `/test` page to run API tests
- Test escort registration flow
- Test escort listing and search
- Test authentication flow

## 🚀 Quick Deploy Commands

### Backend
```bash
cd api
npm install
npm start
```

### Frontend
```bash
cd client
npm install
npm run build
npm run preview
```

## 📝 Post-Deployment Checklist

- [ ] All API endpoints respond correctly
- [ ] File uploads work (Cloudinary)
- [ ] Authentication works
- [ ] Escort registration works
- [ ] Search and filtering work
- [ ] Mobile responsiveness
- [ ] Performance is acceptable
- [ ] SSL certificate is valid
- [ ] Domain is configured
- [ ] Analytics are tracking

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL in backend .env
   - Verify CORS configuration

2. **MongoDB Connection**
   - Verify connection string
   - Check network access

3. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits

4. **Authentication Issues**
   - Verify JWT_SECRET
   - Check token expiration

## 📞 Support

For deployment issues:
1. Check the test page at `/test`
2. Review server logs
3. Verify environment variables
4. Test API endpoints manually

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring (Sentry, LogRocket)
2. Configure analytics (Google Analytics)
3. Set up backup strategies
4. Plan scaling strategy
5. Implement CI/CD pipeline
