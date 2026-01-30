# Firebase Setup Instructions

## Important: Configure Firebase

Before using the authentication and admin features, you need to:

1. **Get your Firebase configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `fbtestproject-efe8a`
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Copy the Firebase configuration object

2. **Update `src/firebase.js`:**
   - Replace the placeholder values in `firebaseConfig` with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "fbtestproject-efe8a.firebaseapp.com",
     projectId: "fbtestproject-efe8a",
     storageBucket: "fbtestproject-efe8a.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **Enable Authentication:**
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Enable "Google" provider (for Gmail login)

4. **Set up Firestore:**
   - In Firebase Console, go to Firestore Database
   - Create database (start in production mode)
   - Set up security rules (see below)

5. **Create the first admin user:**
   - Register a user through the app
   - In Firestore, go to the `users` collection
   - Find your user document
   - Set `role: "admin"` and `approved: true`

## Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Appointments collection
    match /appointments/{document=**} {
      allow read: if true; // Public read
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
    }
  }
}
```

## Collections Structure

### `users` collection
- Document ID: User UID
- Fields:
  - `email`: string
  - `approved`: boolean
  - `role`: string ("user" or "admin")
  - `createdAt`: timestamp
  - `approvedAt`: timestamp (optional)
  - `approvedBy`: string (optional)

### `appointments` collection
- Document ID: "upcoming"
- Fields:
  - `dates`: array of objects `{ date: string, canceled: boolean }`
  - `updatedAt`: timestamp
  - `updatedBy`: string
