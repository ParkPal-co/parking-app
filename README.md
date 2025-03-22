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
npm run dev:all
```

4. Open your browser and navigate to `http://localhost:5173`

## 🧪 Testing the Application

### Test Accounts

The setup script has created these test accounts for you:

1. **Regular User**

   - Email: test@example.com
   - Password: test123

2. **Driveway Owner**

   - Email: owner@example.com
   - Password: test123

3. **Admin User**
   - Email: admin@example.com
   - Password: test123

### Test Payment Card

- Card Number: 4242 4242 4242 4242
- Any future expiry date
- Any 3-digit CVC
- Any postal code

### Key Features to Test

1. **User Authentication**

   - Try logging in with different test accounts
   - Test the sign-up flow

2. **Event Discovery**

   - Browse available events
   - Use the search and filter functionality

3. **Driveway Management**

   - List a new driveway
   - View and manage existing listings

4. **Booking Process**

   - Select a driveway
   - Complete the payment flow
   - View booking confirmation

5. **Messaging System**
   - Send messages between different test accounts
   - Test real-time updates

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

- `npm run dev:all` - Start both frontend and backend servers
- `npm run build` - Build the frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally

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
