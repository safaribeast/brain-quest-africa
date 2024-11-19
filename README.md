# Brain Quest Africa 🌍

An educational quiz platform designed to make learning fun and engaging for students across Africa.

## 🚀 Features

- 📱 Responsive design for all devices
- 🔐 Secure authentication with Firebase
- 📊 Real-time quiz progress tracking
- 🎯 Multiple quiz categories
- 🏆 Leaderboard system
- 🌐 Social authentication options

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **State Management**: React Context

## 🏁 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/safaribeast/brain-quest-africa.git
   cd brain-quest-africa
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📱 Production Deployment

The application is automatically deployed to Vercel. Each push to the `main` branch triggers a new deployment.

### Deployment Checklist
- [ ] Update environment variables in Vercel
- [ ] Verify Firebase configuration
- [ ] Test authentication flows
- [ ] Check responsive design
- [ ] Validate API endpoints

## 🔄 Development Workflow

1. **Branch Naming Convention**
   - Feature: `feature/feature-name`
   - Bug Fix: `fix/bug-name`
   - Enhancement: `enhance/enhancement-name`

2. **Commit Message Format**
   ```
   type(scope): description

   [optional body]
   ```
   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

3. **Pull Request Process**
   - Create feature branch
   - Make changes
   - Test locally
   - Create PR with description
   - Wait for review

## 🗺️ Future Development Roadmap

### Phase 1: Core Features Enhancement
- [ ] Add more quiz categories
- [ ] Implement difficulty levels
- [ ] Add progress tracking
- [ ] Enhance user profiles

### Phase 2: Social Features
- [ ] Add friend system
- [ ] Implement challenge mode
- [ ] Add chat functionality
- [ ] Create study groups

### Phase 3: Content Management
- [ ] Add quiz creation interface
- [ ] Implement content moderation
- [ ] Add reporting system
- [ ] Create analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email [support@brainquestafrica.com](mailto:support@brainquestafrica.com) or join our Slack channel.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase team for the backend services
- All contributors who have helped shape this project

---

Made with ❤️ for African Education
