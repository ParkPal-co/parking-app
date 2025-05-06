# Directory Tree

```
.
├── .cursor/
│   └── rules/
│       └── cursorrules
├── .git/
├── functions/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── background/
│   │   ├── events/
│   │   ├── layout/
│   │   ├── location/
│   │   ├── navigation/
│   │   └── parking/
│   ├── firebase/
│   ├── hooks/
│   ├── pages/
│   │   ├── AccountSettingsPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── AdminPanel.tsx
│   │   ├── BookingConfirmationPage.tsx
│   │   ├── BookingSuccessPage.tsx
│   │   ├── DrivewaySelectPage.tsx
│   │   ├── EventSearchPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MessagesPage.tsx
│   │   ├── MyBookingsPage.tsx
│   │   ├── MyListingsPage.tsx
│   │   ├── RegisterAnEventPage.tsx
│   │   ├── RegisterDrivewayPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RegisteredEventsPage.tsx
│   │   └── UpcomingEventsPage.tsx
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .firebaserc
├── .gitignore
├── App.css
├── LICENSE
├── README.md
├── cors.json
├── directory_tree.md
├── eslint.config.js
├── firebase.json
├── firestore.rules
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.cjs
├── setup.sh
├── storage.rules
├── tailwind.config.cjs
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## **Folder Descriptions**

### `components/`

- **NavigationBar.tsx**: A persistent navigation bar with a Rent/List toggle, a clickable app title to return to EventSearchPage, and a profile dropdown for account navigation.
- **EventCard.tsx**: Displays event details on the UpcomingEventsPage, including name, date, location, and a "Find Parking" button.
- **DrivewayCard.tsx**: Shows driveway details, including price, location, and availability, used in DrivewaySelectPage and MyListingsPage.
- **BookingForm.tsx**: Displays booking details, allows user to confirm payment via Stripe, and updates the database upon successful transaction.
- **ProfileDropdown.tsx**: A dropdown menu that appears when clicking the user's profile picture, containing links to account settings, bookings, listings, messages, and sign-out.

### `pages/`

- **EventSearchPage.tsx**: Landing page with a search bar allowing users to find events by name.
- **UpcomingEventsPage.tsx**: Displays upcoming events, with a button to show events sorted by distance.
- **DrivewaySelectPage.tsx**: Lists available driveways for a selected event alongside an interactive map showing their locations.
- **BookingConfirmationPage.tsx**: Displays driveway details, total cost, and a Stripe payment form to confirm the booking.
- **MyListingsPage.tsx**: Shows driveways listed by the user, allowing them to edit or remove their listings.
- **MyBookingsPage.tsx**: Lists booked driveways and provides a "Message Host" button to contact the owner.
- **MessagesPage.tsx**: Provides an interface for renters and hosts to communicate.
- **AccountSettingsPage.tsx**: Lets users update their profile picture, phone number, and address but prevents email/name changes.
- **RegisterDrivewayPage.tsx**: A form allowing users to register a driveway under a selected event.
- **RegisterAnEventPage.tsx**: Admin-only form for registering new events, requiring event title, date, venue, and expected attendance.
- **RegisteredEventsPage.tsx**: Lists all registered events with options to edit, delete, or manage driveways attached to them.

### `hooks/`

- **useAuth.ts**: Manages authentication state using Firebase Authentication.
- **useEvents.ts**: Retrieves a list of upcoming events from Firestore.
- **useDriveways.ts**: Fetches available driveways for a given event.
- **useBookings.ts**: Manages booking status and interactions with Firebase.

### `context/`

- **AuthContext.tsx**: Provides user authentication context across the app.

### `services/`

- **firebase.ts**: Initializes Firebase, including authentication and Firestore.
- **authService.ts**: Handles user authentication (login, logout, retrieving user info).
- **eventService.ts**: Fetches event data and manages event-related Firestore operations.
- **drivewayService.ts**: Manages CRUD operations for driveway listings.
- **bookingService.ts**: Handles booking transactions, availability updates, and Stripe payments.

### `utils/`

- **geoLocation.ts**: Uses the browser's geolocation API to determine the user's current location.
- **distanceCalculator.ts**: Sorts events by distance based on the user's coordinates and event locations.
- **formatDate.ts**: Formats event dates for better readability.

### `styles/`

- **globals.css**: Defines global styles for the application, ensuring consistency across pages.

## **Notes:**

- **Pages use React Router for navigation**.
- **Firestore is used for real-time database operations**.
- **Components are modular and reusable** for better scalability.

This structure ensures **scalability, maintainability, and modularity** while following best practices. Let me know if you need any modifications! 🚀
