# Developer Setup Guide (Staging Environment)

Welcome to the project! This guide will walk you through setting up your local development environment, with a focus on using the **staging environment**. Follow these steps to get started as a new collaborator.

---

## 1. Get Access to Required Services

Before you begin, make sure you have access to the following:

- **GitHub Repository**: Request collaborator access from a project maintainer.
- **Firebase Console**: Ask a maintainer to add your Google account to the [Firebase Console](https://console.firebase.google.com/) for the staging project.
- **Google Cloud Console**: Request access to the [Google Cloud Console](https://console.cloud.google.com/) project associated with staging. You will be added with the least privilege necessary (usually as a Viewer or Editor).
- **Stripe Dashboard**: Ask to be invited to the [Stripe Dashboard](https://dashboard.stripe.com/) for the staging environment. You'll receive an email invitation.

> **Note:** Access to these services is managed by project admins. For security, only share access with trusted team members and use individual accounts (not shared credentials).

---

## 2. Clone the Repository

1. Ensure you have [Git](https://git-scm.com/) installed.
2. Clone the repository:

```bash
git clone https://github.com/aleczaitz/parking-app
cd parking-app
```

---

## 3. Set Up Environment Variables

You'll need environment variables for the staging environment. These are typically provided by a maintainer(Alec).

1. **Obtain the Staging Environment Variables**

   - Ask a maintainer for the latest `.env.staging` or `.env.staging.bak` file.

2. **Create Local Environment Files**
   - Copy the staging variables to your local environment files:

```bash
cp .env.staging .env.local
cp .env.staging .env.production
```

> **Tip:** Never commit `.env` files to version control. They are gitignored by default.

---

## 4. Install Dependencies

### **Frontend**

1. Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) and [npm](https://www.npmjs.com/) installed.
2. Install dependencies:

```bash
npm install
```

### **Cloud Functions**

1. Navigate to the `functions/` directory:

```bash
cd functions
npm install
cd ..
```

---

## 5. Run the App Locally

1. Start the development server:

```bash
npm run dev
```

2. The app should be available at [http://localhost:5173](http://localhost:5173) (or the port specified in your config).

---

## 6. Using the Staging Firebase Project

- The app will connect to the staging Firebase project using the credentials in your `.env.local` file.
- You can view the staging database, authentication, and storage in the [Firebase Console](https://console.firebase.google.com/).
- For Firestore and Storage rules, see `firestore.rules` and `storage.rules` in the project root.

---

## 7. Accessing Google Cloud Console

- Use your Google account to log in to the [Google Cloud Console](https://console.cloud.google.com/).
- You should see the staging project listed. If not, contact a maintainer.
- **Best Practice:** Only use the permissions you need. Do not modify IAM roles or billing settings unless you are an admin.

---

## 8. Accessing Stripe Dashboard

- Accept your invitation to the [Stripe Dashboard](https://dashboard.stripe.com/).
- Use the dashboard to view test transactions and manage test data for staging.
- **Best Practice:** Never use real customer data in staging. Use Stripe's test cards and data.

---

## 9. Security & Access Best Practices

- **Never share your credentials** (Google, GitHub, Stripe) with others.
- **Do not commit secrets** (API keys, .env files) to the repository.
- **Use 2FA** on all accounts (GitHub, Google, Stripe).
- **Limit permissions**: Only request the access you need.
- **Log out** of shared computers after use.

---

## 10. Troubleshooting

- If you have issues with Firebase access, confirm your Google account is added to the project.
- For environment variable issues, double-check your `.env.local` file matches the provided staging config.
- For dependency issues, try deleting `node_modules` and running `npm install` again.
- For any other issues, contact a project maintainer or check the `README.md` for more info.

---

## 11. Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs/)
- [Google Cloud IAM Best Practices](https://cloud.google.com/iam/docs/best-practices)
- [Stripe Test Data](https://stripe.com/docs/testing)
- [Project README](../README.md)

---

## 12. Next Steps

- Once your environment is running, you can start developing features, running tests, and making pull requests.
- View the public staging app at [staging.parkpal.co](https://staging.parkpal.co/)
- Follow the [contribution guidelines](architecture_improvements.md#contributing) for submitting changes.

---

Welcome aboard! 🎉
