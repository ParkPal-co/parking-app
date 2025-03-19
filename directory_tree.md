# Event Parking App File Structure

## Root Directory (`/`)
```
/event-parking-app
│── src/
│   │── components/        # Reusable UI components
│   │   │── NavigationBar.tsx          # Persistent top navigation bar with Rent/List toggle, account dropdown
│   │   │── EventCard.tsx              # Displays event information on the UpcomingEventsPage
│   │   │── DrivewayCard.tsx           # Displays driveway listings on DrivewaySelectPage and MyListingsPage
│   │   │── BookingForm.tsx            # Form for confirming a driveway booking with Stripe payment
│   │   │── ProfileDropdown.tsx        # Account settings dropdown with links to profile, bookings, and messages
│   │── pages/             # Individual pages (Navigation Routes)
│   │   │── EventSearchPage.tsx        # Landing page with search bar for finding events
│   │   │── UpcomingEventsPage.tsx     # Displays a list of upcoming events with sorting by proximity
│   │   │── DrivewaySelectPage.tsx     # Lists driveways available for an event, includes a map
│   │   │── BookingConfirmationPage.tsx# Checkout page displaying booking details and Stripe payment processing
│   │   │── MyListingsPage.tsx         # Displays user's listed driveways, showing availability and edit options
│   │   │── MyBookingsPage.tsx         # Displays user's bookings, allows messaging hosts
│   │   │── MessagesPage.tsx           # User-to-user messaging for renters and hosts
│   │   │── AccountSettingsPage.tsx    # Profile settings page for updating user information
│   │   │── RegisterDrivewayPage.tsx   # Form for adding a driveway to an event
│   │   │── RegisterAnEventPage.tsx    # Admin page for adding new events
│   │   │── RegisteredEventsPage.tsx   # Admin dashboard listing all registered events with management options
│   │── hooks/             # Custom hooks (useAuth, useListings, useEvents)
│   │   │── useAuth.ts               # Handles authentication state and user session management
│   │   │── useEvents.ts             # Fetches upcoming events from Firestore
│   │   │── useDriveways.ts          # Fetches driveways associated with an event from Firestore
│   │   │── useBookings.ts           # Handles booking creation, cancellation, and retrieval
│   │── context/           # Global state management using React Context API
│   │   │── AuthContext.tsx         # Provides authentication state across the app
│   │── services/          # Firebase interactions (API layer for Firestore and Authentication)
│   │   │── firebase.ts             # Initializes Firebase app and configuration
│   │   │── authService.ts          # Manages user authentication (login, logout, user data retrieval)
│   │   │── eventService.ts         # Handles fetching and updating events in Firestore
│   │   │── drivewayService.ts      # Handles CRUD operations for driveways
│   │   │── bookingService.ts       # Manages bookings, availability, and Stripe payments
│   │── styles/            # Global styles
│   │   │── globals.css             # Global CSS styles for the app
│   │── utils/             # Utility functions
│   │   │── geoLocation.ts          # Gets the user’s current location and calculates distances
│   │   │── distanceCalculator.ts   # Sorts upcoming events by proximity to the user
│   │   │── formatDate.ts           # Formats event dates for display
│   │── App.tsx            # Main App Component defining routes and global providers
│   │── index.tsx          # Entry point that initializes the React app
│── public/                # Static assets (images, icons, etc.)
│── package.json           # Project dependencies and scripts
│── .cursorrules           # Cursor AI guidelines
```

## **Folder Descriptions**
### `components/`
- **NavigationBar.tsx**: A persistent navigation bar with a Rent/List toggle, a clickable app title to return to EventSearchPage, and a profile dropdown for account navigation.
- **EventCard.tsx**: Displays event details on the UpcomingEventsPage, including name, date, location, and a “Find Parking” button.
- **DrivewayCard.tsx**: Shows driveway details, including price, location, and availability, used in DrivewaySelectPage and MyListingsPage.
- **BookingForm.tsx**: Displays booking details, allows user to confirm payment via Stripe, and updates the database upon successful transaction.
- **ProfileDropdown.tsx**: A dropdown menu that appears when clicking the user’s profile picture, containing links to account settings, bookings, listings, messages, and sign-out.

### `pages/`
- **EventSearchPage.tsx**: Landing page with a search bar allowing users to find events by name.
- **UpcomingEventsPage.tsx**: Displays upcoming events, with a button to show events sorted by distance.
- **DrivewaySelectPage.tsx**: Lists available driveways for a selected event alongside an interactive map showing their locations.
- **BookingConfirmationPage.tsx**: Displays driveway details, total cost, and a Stripe payment form to confirm the booking.
- **MyListingsPage.tsx**: Shows driveways listed by the user, allowing them to edit or remove their listings.
- **MyBookingsPage.tsx**: Lists booked driveways and provides a “Message Host” button to contact the owner.
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
- **geoLocation.ts**: Uses the browser’s geolocation API to determine the user’s current location.
- **distanceCalculator.ts**: Sorts events by distance based on the user’s coordinates and event locations.
- **formatDate.ts**: Formats event dates for better readability.

### `styles/`
- **globals.css**: Defines global styles for the application, ensuring consistency across pages.

## **Notes:**
- **Pages use React Router for navigation**.
- **Firestore is used for real-time database operations**.
- **Components are modular and reusable** for better scalability.

This structure ensures **scalability, maintainability, and modularity** while following best practices. Let me know if you need any modifications! 🚀

