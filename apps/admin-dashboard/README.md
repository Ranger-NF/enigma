# Enigma Admin Dashboard

Admin dashboard for managing daily questions in the Enigma trivia contest application.

## Features

- ✅ Create, read, update, and delete questions for days 1-10
- ✅ Upload question images to Firebase Storage
- ✅ Set difficulty levels and unlock dates
- ✅ Manage hints and answers
- ✅ Beautiful dark-themed UI with Tailwind CSS
- ✅ Real-time Firebase integration

## Setup

### Prerequisites

- Node.js 16+
- pnpm
- Firebase project with Firestore and Storage enabled

### Installation

1. Navigate to the workspace root:
```bash
cd /home/gayathri/Documents/egch5/enigma
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure Firebase credentials in `.env` file (copy from `.env.example`)

### Running the Dashboard

Start all development servers (frontend on 5174, backend on 8080, admin on 3000):

```bash
pnpm run dev
```

Or start just the admin dashboard:

```bash
cd apps/admin-dashboard
pnpm run dev
```

The dashboard will be available at: **http://localhost:3000**

## Project Structure

```
src/
├── components/
│   ├── QuestionsGrid.tsx    # Display all 10 days with question cards
│   └── QuestionForm.tsx     # Form for creating/editing questions
├── lib/
│   ├── firebase.ts          # Firebase initialization
│   └── firestoreService.ts  # Firestore and Storage operations
├── App.tsx                  # Main application component
├── main.tsx                 # Entry point
└── index.css                # Tailwind styles
```

## Features Breakdown

### Dashboard Functions

1. **View All Questions** - Grid view of all 10 days
2. **Create Question** - Add new question with image upload
3. **Edit Question** - Modify existing question details
4. **Delete Question** - Remove questions (with confirmation)
5. **Image Management** - Upload/delete images from Firebase Storage

### Image Handling

- Images are stored in Firebase Storage at `questions/day{N}/image.{ext}`
- URL is stored in Firestore for retrieval by frontend
- Maximum file size: 5MB
- Supports: PNG, JPG, GIF, WebP

### Data Structure

Each question document in Firestore contains:
- `day`: Day number (1-10)
- `text`: Question text
- `hint`: Hint for users
- `answer`: Correct answer
- `difficulty`: 1-5 rating
- `image`: Firebase Storage URL (optional)
- `unlockDate`: When question becomes available
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Build

```bash
pnpm run build
```

Built files will be in the `dist/` directory.
