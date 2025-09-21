# Enigma Setup Guide

This guide will help you set up your own 10-day treasure hunt web app with Firebase integration, daily progress tracking, and live leaderboards.

## 🚀 Quick Start

### 1. Firebase Project Setup

1. **Create a new Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Name it (e.g., "Enigma")
   - Enable Google Analytics (optional)

2. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Google" sign-in provider
   - Add your domain to authorized domains

3. **Enable Firestore Database:**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select a location close to your users

4. **Get Firebase Configuration:**
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Click "Add app" → Web app
   - Copy the Firebase config object

### 2. Environment Configuration

1. **Copy the sample environment file:**
   ```bash
   cp apps/frontend/sample.env apps/frontend/.env
   ```

2. **Update the `.env` file with your Firebase config:**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Backend Environment:**
   - Copy your Firebase service account key to `apps/backend/serviceAccountKey.json`
   - Update `apps/backend/.env` with your project ID

### 3. Database Structure

The app uses the following Firestore collections:

#### Users Collection (`users`)
```javascript
{
  userId: {
    name: "John Doe",
    email: "john@example.com",
    createdAt: timestamp,
    completed: {
      day1: { done: true, timestamp: timestamp },
      day2: { done: false },
      // ... up to day10
    }
  }
}
```

#### Questions Collection (`questions`)
```javascript
{
  day1: {
    day: 1,
    text: "What is the capital of France?",
    answer: "Paris",
    hint: "The city of lights",
    difficulty: 1,
    unlockDate: timestamp
  },
  // ... up to day10
}
```

### 4. Setting Up Questions

1. **Start the frontend development server:**
   ```bash
   cd apps/frontend
   npm run dev
   ```

2. **Open the browser console and run:**
   ```javascript
   // Import the setup script
   import { setupQuestions } from './src/scripts/setupQuestions.ts';
   
   // Set up all 10 questions
   setupQuestions();
   ```

3. **Or manually add questions in Firebase Console:**
   - Go to Firestore Database
   - Create collection "questions"
   - Add documents with IDs: day1, day2, ..., day10
   - Use the structure shown above

### 5. Running the Application

1. **Install dependencies:**
   ```bash
   # From the root directory
   pnpm install
   ```

2. **Start the backend:**
   ```bash
   cd apps/backend
   npm run dev
   ```

3. **Start the frontend:**
   ```bash
   cd apps/frontend
   npm run dev
   ```

4. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎮 Features

### Daily Progress Tracking
- ✅ One question per day for 10 days
- ✅ Progress tracking with visual indicators
- ✅ Completion status persistence
- ✅ User profile management

### Live Leaderboard
- ✅ Real-time ranking based on completion speed
- ✅ Daily leaderboard that resets each day
- ✅ Historical leaderboard viewing
- ✅ User ranking display

### Question Management
- ✅ Automatic daily question unlocking
- ✅ Difficulty levels (1-5)
- ✅ Hints for each question
- ✅ Answer validation

## 🔧 Customization

### Changing the Start Date
Update the start date in both frontend and backend:

**Frontend:** `apps/frontend/src/services/firestoreService.ts`
```javascript
const startDate = new Date('2025-01-01'); // Change this date
```

**Backend:** `apps/backend/src/index.ts`
```javascript
const startDate = new Date('2025-01-01'); // Change this date
```

### Adding Custom Questions
1. Use the setup script in the browser console
2. Or manually add questions in Firebase Console
3. Or use the `addQuestion()` function from the setup script

### Styling
The app uses Tailwind CSS. You can customize:
- Colors in the component files
- Layout in the page components
- Theme in `apps/frontend/src/index.css`

## 🚨 Security Rules

Add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Questions are readable by authenticated users
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can write questions
    }
  }
}
```

## 📱 Mobile Responsiveness

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🐛 Troubleshooting

### Common Issues

1. **Firebase connection errors:**
   - Check your environment variables
   - Verify Firebase project configuration
   - Ensure Firestore is enabled

2. **Authentication not working:**
   - Check Google sign-in is enabled
   - Verify authorized domains
   - Check browser console for errors

3. **Questions not loading:**
   - Verify questions are added to Firestore
   - Check the collection name is "questions"
   - Ensure document IDs are "day1", "day2", etc.

4. **Leaderboard not updating:**
   - Check Firestore security rules
   - Verify user completion data is being saved
   - Check browser console for errors

### Getting Help

- Check the browser console for error messages
- Verify Firebase Console for data structure
- Test API endpoints directly using tools like Postman

## 🎉 You're Ready!

Your web app is now set up and ready to use! Users can:

1. Sign in with Google
2. Answer daily questions
3. Compete on the leaderboard
4. Track their progress
5. See their rankings

The app automatically handles daily question unlocking, progress tracking, and leaderboard updates. Enjoy ! 🏴‍☠
