# Repair Cafe Friedrichshain Website

URL: https://fbtestproject-efe8a.web.app/

# how to maintain

## cafe dates

To add or remove upcoming Repair Cafe dates, edit the `src/upcomingDates.js` file.

### Adding dates

1. Open `src/upcomingDates.js`
2. Add new dates to the `upcomingDates` array in `YYYY-MM-DD` format
3. Dates should be in chronological order (earliest first)
4. The website will automatically display the next upcoming date that hasn't passed

Example:
```javascript
export const upcomingDates = [
  "2026-01-31",
  "2026-02-28",
  "2026-03-28",
  // Add new dates here
  "2026-04-25",
];
```

### Removing dates

1. Open `src/upcomingDates.js`
2. Remove the date string from the array
3. Make sure to remove the comma if it's the last item, or add a comma if removing a middle item

### Date format

- Use `YYYY-MM-DD` format (e.g., `"2026-12-25"`)
- Dates must be strings (wrapped in quotes)
- Dates should be separated by commas
- The app automatically filters out past dates and shows the next upcoming one

### Marking dates as canceled

If a Repair Cafe date needs to be canceled, use an object format instead of a string:

```javascript
export const upcomingDates = [
  "2026-01-31",
  { date: "2026-02-28", canceled: true },  // This date is canceled
  "2026-03-28",
];
```

When a date is marked as canceled:
- The website will display a cancellation message instead of the regular date announcement
- The message will appear in red to indicate cancellation
- The app will still show the next upcoming date (even if canceled) so visitors know when the cafe was scheduled

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
