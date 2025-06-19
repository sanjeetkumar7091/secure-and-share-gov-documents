# Secure & Share Govt Document with Family Members

## Project Overview
This project is a web application that allows users to securely register, upload, manage, and share government documents with family members. It uses Firebase for authentication, storage, and database services.

## Technologies Used
- HTML
- CSS
- JavaScript
- Firebase Authentication (Email/Password and Phone OTP)
- Firebase Firestore (Database)
- Firebase Storage (File storage)

## Features
- User Registration with OTP verification via phone number
- User Login with email and password
- Upload government documents securely
- View, download, update, and delete uploaded documents
- Share documents with family members by email
- User profile management and logout

## Setup Instructions
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable Authentication methods: Email/Password and Phone.
3. Create Firestore database and Storage bucket.
4. Register a web app in Firebase project settings and copy the Firebase config.
5. Replace the placeholder Firebase config in `app.js` with your actual config.
6. Open `index.html` in a web browser to run the application.

## Usage
- Register with your email and phone number to receive OTP.
- Verify OTP to complete registration.
- Login with your email and password.
- Upload and manage your government documents.
- Share documents with family members by entering their email.

## Notes
- Ensure you have internet connectivity to load Firebase SDKs.
- This is a medium difficulty project suitable for learning Firebase integration with web apps.

## License
This project is open source and free to use.
