# Enigma

A full-stack web application built with React, Express.js, and Firebase.

## Project Structure

- **Frontend** (`apps/frontend`): React + Vite + Tailwind CSS (shadcn/ui)
- **Backend** (`apps/backend`): Express.js server with Firebase Authentication and Cloud Firestore

## Prerequisites

- Node.js `v24.8.0`
- pnpm `v10.0.0+`
- Docker Desktop (for containerized deployment)
- Firebase project with Firestore and Authentication enabled

## Setup Instructions

### Option 1: Local Development (Recommended for Development)

#### 1. Install Dependencies

Install Turborepo globally:
```bash
pnpm add turbo --global
```

Install project dependencies:
```bash
pnpm i
```

#### 2. Configure Environment Variables

**Frontend** (`apps/frontend/.env`):
```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Edit `apps/frontend/.env` and add your Firebase configuration:
```env
VITE_BACKEND_SERVER_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Backend** (`apps/backend/.env`):
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
```

#### 3. Add Firebase Admin Credentials

Download your Firebase service account key from [Firebase Console](https://console.firebase.google.com/):
1. Go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the file as `apps/backend/serviceAccountKey.json`

#### 4. Start Development Server

```bash
turbo dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Option 2: Docker (Recommended for Production/Deployment)

#### 1. Install Docker

Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

#### 2. Configure Environment Variables

Create `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:
```env
FIREBASE_PROJECT_ID=your-project-id

VITE_BACKEND_SERVER_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

#### 3. Add Firebase Admin Credentials

Place your `serviceAccountKey.json` in `apps/backend/`

#### 4. Build and Run with Docker

**Development/Standard mode:**
```bash
docker-compose up --build
```

**Production mode:**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

This will start:
- Frontend: http://localhost (port 80)
- Backend: http://localhost:5000

#### 5. Useful Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build

# View running containers
docker ps
```

## Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. **For Frontend** (Web App Config):
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click "Add app" > Web (if not created)
   - Copy the config values

4. **For Backend** (Service Account):
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `apps/backend/serviceAccountKey.json`

## Available Scripts

- `turbo dev` - Start development servers (frontend + backend)
- `turbo build` - Build both applications
- `docker-compose up` - Run with Docker
- `docker-compose down` - Stop Docker containers

## Troubleshooting

### Local Development

**Port already in use:**
- Frontend default: 5173
- Backend default: 5000
- Change ports in respective package.json or .env files

**Firebase Authentication Error:**
- Verify `serviceAccountKey.json` exists and is valid
- Check `FIREBASE_PROJECT_ID` matches your Firebase project

### Docker

**Backend can't find serviceAccountKey.json:**
- Ensure file exists at `apps/backend/serviceAccountKey.json`
- Check volume mount in `docker-compose.yml`

**Environment variables not working:**
- Frontend vars are baked at build time - rebuild if changed
- Backend vars can be changed without rebuild

**Docker Desktop not running:**
- Start Docker Desktop and wait for it to initialize

For more Docker-specific troubleshooting, see [DOCKER_SETUP.md](DOCKER_SETUP.md)

## Security Notes

⚠️ **Never commit these files:**
- `.env` files (contains API keys)
- `serviceAccountKey.json` (Firebase admin credentials)

These are already in `.gitignore` for your safety.

## Tech Stack

- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js 5, TypeScript, Firebase Admin SDK
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth
- **Build Tool**: Turborepo
- **Package Manager**: pnpm
- **Deployment**: Docker + nginx

## License

[Add your license here]
