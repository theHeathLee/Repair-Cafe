# How to Get Your Firebase Configuration

## Quick Steps

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `fbtestproject-efe8a`
3. **Get the config**:
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" and select the web icon `</>`
   - Copy the configuration object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "fbtestproject-efe8a.firebaseapp.com",
  projectId: "fbtestproject-efe8a",
  storageBucket: "fbtestproject-efe8a.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

4. **Update `src/firebase.js`** with your actual values

## Enable Required Services

After updating the config, you also need to:

### 1. Enable Authentication
- Go to Firebase Console → Authentication → Sign-in method
- Enable "Email/Password" provider
- Enable "Google" provider (for Gmail login)

### 2. Create Firestore Database
- Go to Firebase Console → Firestore Database
- Click "Create database"
- Start in **production mode** (we'll set up security rules)
- Choose a location (e.g., `europe-west` for Germany)

### 3. Set Up Security Rules
Go to Firestore Database → Rules and use:

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

### 4. Create Your First Admin User
After registering through the app:
- Go to Firestore Database → Data
- Find the `users` collection
- Click on your user document (the document ID is your user UID)
- Edit the document and add:
  - `role: "admin"` (string)
  - `approved: true` (boolean)
- Save

## Alternative: Use Firebase CLI

If you have Firebase CLI installed and are logged in:

```bash
firebase apps:list --project fbtestproject-efe8a
```

This will show your apps. Then you can get the config from the Firebase Console.
