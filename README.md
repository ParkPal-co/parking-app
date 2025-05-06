# Event Parking App

A modern web application that connects event attendees with local driveway owners for convenient parking solutions. Built with React, TypeScript, and Firebase.

## 🚀 Quick Start

1. Clone the repository:

```bash
git clone [repository-url]
cd parking-app
```

2. Make the setup script executable and run it:

```bash
chmod +x setup.sh
./setup.sh
```

3. Start the application:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Payment Processing**: Stripe
- **Maps Integration**: Google Maps API
- **State Management**: React Context API + Custom Hooks

## 📱 Features

- 🔐 User Authentication
- 🎯 Event Search and Discovery
- 🏠 Driveway Listing and Management
- 💳 Secure Payment Processing
- 📍 Interactive Maps Integration
- 💬 User-to-User Messaging
- 👤 User Profiles and Settings

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── context/       # Global state management
├── services/      # Firebase and API services
├── styles/        # Global styles
└── utils/         # Utility functions
```

## 🔧 Development Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally
- `npm run deploy` - Deploy to Firebase
- `npm run deploy:functions` - Deploy Firebase Functions
- `npm run deploy:hosting` - Deploy to Firebase Hosting
- `npm run emulators` - Start Firebase emulators

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Alec Zaitz - [aleczaitz@gmail.com](mailto:aleczaitz@gmail.com)

## Acknowledgments

- Firebase for backend infrastructure
- Stripe for payment processing
- Google Maps Platform for mapping features
- React and TypeScript communities for excellent tools and documentation
