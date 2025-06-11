# Event Parking App

A modern web application that connects event attendees with local driveway owners for convenient parking solutions.

## 🌐 Live Site

Visit the app: [https://ParkPal.co](https://ParkPal.co)

## 📝 About

Event Parking App helps event-goers find and book parking spots at local driveways, and allows homeowners to list their available parking for extra income.

## 🚀 Features

- User authentication
- Event search and discovery
- Driveway listing and management
- Secure payment processing (Stripe)
- Interactive maps (Google Maps)
- User messaging
- User profiles and settings

## 🛠️ Tech Stack

- React + TypeScript
- Firebase (Firestore, Auth, Hosting)
- Stripe
- Google Maps API
- Tailwind CSS

## 🤝 Contributing

We welcome contributions! Please fork the repo and open a pull request.

## 🧩 Cloud Functions Organization

- Each Cloud Function should be placed in its own file within a relevant subdirectory of `functions/src/` (e.g., `payments/`, `storage/`).
- Export your function from its file, e.g.:
  ```ts
  export const myFunction = functions.https.onCall(...)
  ```
- In `functions/src/index.ts`, import and export your function:
  ```ts
  export { myFunction } from "./payments/myFunction";
  ```
- This keeps the codebase modular, maintainable, and scalable as you add more functions.

## 📬 Contact

For questions or support, contact [aleczaitz@gmail.com](mailto:aleczaitz@gmail.com).

## 📝 License

MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Firebase
- Stripe
- Google Maps Platform
- React and TypeScript communities
