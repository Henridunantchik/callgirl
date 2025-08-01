# 🚀 Call Girls App - Setup Instructions

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🔧 Backend Setup

### 1. Install Backend Dependencies
```bash
cd api
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `api` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_CONN=mongodb://localhost:27017/escort_directory

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 3. Start Backend Server
```bash
cd api
npm run dev
```

The API will be available at: `http://localhost:5000/api`

## 🎨 Frontend Setup

### 1. Install Frontend Dependencies
```bash
cd client
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `client` directory:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_APP_NAME=Call Girls
REACT_APP_APP_DESCRIPTION=Premium Escort Directory

# External Services (if needed)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

### 3. Start Frontend Development Server
```bash
cd client
npm start
```

The app will be available at: `http://localhost:3000`

## 🔗 API Integration Status

### ✅ Completed
- [x] API service layer (`client/src/services/api.js`)
- [x] Authentication context (`client/src/contexts/AuthContext.jsx`)
- [x] AuthProvider integration in App.jsx
- [x] EscortList page updated to use real API
- [x] Error handling and loading states

### 🔄 In Progress
- [ ] Update remaining pages to use real API
- [ ] Implement real-time messaging with Socket.io
- [ ] Add payment processing integration
- [ ] File upload functionality

### 📝 To Do
- [ ] Update EscortProfile page
- [ ] Update ClientDashboard page
- [ ] Update AdminDashboard page
- [ ] Update BookingCalendar component
- [ ] Update RatingSystem component
- [ ] Add real-time notifications
- [ ] Implement search functionality
- [ ] Add image upload to forms

## 🧪 Testing the Integration

### 1. Test API Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Escort Directory API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Age Verification
Visit: `http://localhost:3000/age-verification`

### 3. Test Escort List
Visit: `http://localhost:3000/escorts`

## 🚀 Deployment

### Backend Deployment (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Update `REACT_APP_API_URL` to production API URL
2. Build the app: `npm run build`
3. Deploy to Vercel or Netlify

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly in backend `.env`
   - Check that frontend is running on the correct port

2. **Database Connection**
   - Verify MongoDB is running
   - Check `MONGODB_CONN` in backend `.env`

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in backend `.env`

4. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend server logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

## 🎉 Success!

Once everything is set up correctly, you'll have a fully functional escort directory platform with:
- ✅ User authentication and authorization
- ✅ Escort profile management
- ✅ Booking system
- ✅ Real-time messaging
- ✅ Payment processing
- ✅ Admin dashboard
- ✅ Content moderation
- ✅ Analytics and reporting 