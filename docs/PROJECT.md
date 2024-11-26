# Brain Quest Africa - Project Documentation

## Overview
Brain Quest Africa is a modern educational quiz platform designed specifically for African students. The platform offers interactive learning experiences through quizzes, progress tracking, and personalized learning paths.

## Tech Stack
- Frontend: Next.js 14
- Styling: Tailwind CSS
- Authentication: Firebase Auth
- Database: Firebase Firestore
- State Management: React Context
- UI Components: Shadcn/ui
- Animations: Framer Motion

## Project Structure
```
brain-quest-africa/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── lib/             # Utility functions
│   └── styles/          # Global styles
├── public/              # Static assets
└── docs/               # Documentation
```

## Core Features
1. User Authentication
   - Email/Password login
   - Social authentication
   - Role-based access control

2. Quiz System
   - Multiple quiz formats
   - Progress tracking
   - Real-time scoring
   - Performance analytics

3. Learning Management
   - Topic categorization
   - Difficulty levels
   - Learning paths
   - Progress tracking

4. Admin Dashboard
   - Question management
   - User management
   - Analytics dashboard
   - Content moderation

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Deployment
- Build command: `npm run build`
- Output directory: `out/`
- Node.js version: 18.x or higher

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
Copyright © 2024 Brain Quest Africa. All rights reserved.
