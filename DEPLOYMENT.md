# Firebase Hosting Configuration

This project is configured for deployment on Firebase Hosting.

## Prerequisites

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

## Deployment Steps

1. Build the project:
```bash
npm run build
```

2. Initialize Firebase hosting (if not already done):
```bash
firebase init hosting
```

Select:
- Use an existing project: Choose your Firebase project
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds and deploys with GitHub: `No` (for now)

3. Deploy to Firebase:
```bash
firebase deploy
```

## Environment Variables

Make sure your `.env` file contains:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Firebase Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Shops can be read by anyone, but only created/updated by authenticated users
    match /shops/{shopId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // Offers can be read by anyone, but only created/updated by shop owners
    match /offers/{offerId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // Categories can be read by anyone, managed by authenticated users
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
    
    // Floors can be read by anyone, managed by authenticated users
    match /floors/{floorId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Local Development

1. Start the development server:
```bash
npm run dev
```

2. Test Firebase locally (optional):
```bash
firebase serve
```

## Production URL

After deployment, your app will be available at:
`https://your-project-id.web.app`

## Additional Configuration

### Enable Google Analytics (Optional)
1. Go to Firebase Console > Analytics
2. Enable Google Analytics for your project
3. Add the analytics configuration to your Firebase config

### Custom Domain (Optional)
1. Go to Firebase Console > Hosting
2. Add custom domain
3. Follow the DNS configuration steps
