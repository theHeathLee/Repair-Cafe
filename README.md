# Repair Cafe Friedrichshain Website

URL: https://repaircafe-friedrichshain.de/

# how to maintain

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## Deployment

This project is deployed to Firebase Hosting. The live site is available at: https://fbtestproject-efe8a.web.app/

### Prerequisites

1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

### Deploying to Firebase Hosting

1. **Build the project for production:**
```bash
npm run build
```
This creates an optimized production build in the `dist` folder.

2. **Deploy to Firebase:**
```bash
firebase deploy --only hosting
```

Or to deploy everything (if you have other Firebase services configured):
```bash
firebase deploy
```

### Deployment Process

1. Make your changes to the code
2. Test locally with `npm run serve`
3. Build the production version: `npm run build`
4. Deploy to Firebase: `firebase deploy --only hosting`
5. Your changes will be live within a few minutes

### Firebase Project Configuration

- **Project ID**: `fbtestproject-efe8a`
- **Hosting Directory**: `dist` (configured in `firebase.json`)
- **Configuration File**: `.firebaserc` contains the project ID

### Automatic Deployment

The project includes GitHub Actions workflows (in `.github/workflows/`) that automatically deploy when changes are pushed to the main branch:
- Pull requests trigger preview deployments
- Merges to main trigger production deployments

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
