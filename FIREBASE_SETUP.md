# 🔥 Firebase Setup Guide for Project Evaluation

## Quick Setup for Evaluators

### Option 1: Use Demo Credentials (Recommended)
The developer can provide demo Firebase credentials for evaluation purposes. Contact the developer for access.

### Option 2: Create Your Own Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "super-mall-demo"
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Storage
6. Copy the configuration and add to `.env` file

### Option 3: Mock Mode (Development)
The application includes fallback mock data that works without Firebase for basic evaluation:

```bash
# Run in mock mode
npm run dev:mock
```

## Environment Variables Required

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Security Note
- The actual production Firebase keys are NOT included in this repository for security reasons
- Demo credentials (if provided) have restricted permissions and limited data
- This follows industry best practices for secure development

## Quick Start
1. Clone the repository
2. `npm install`
3. Copy `.env.example` to `.env`
4. Add Firebase credentials (contact developer for demo credentials)
5. `npm run dev`

## Demo Features Available
- User Authentication (Register/Login)
- Shop Management (CRUD operations)
- Product Catalog
- Offers System
- Admin Dashboard
- Responsive Design
- Real-time Updates
