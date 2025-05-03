# Email Verification System

This project implements a user authentication system with email verification using Node.js, Express, and Nodemailer.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth-system
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_gmail_account@gmail.com
EMAIL_APP_PASSWORD=your_app_password_here
```

### 2. Gmail App Password

To use Gmail for sending verification emails, you need to:

1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to your Google Account > Security
   - Under "Signing in to Google," select "App passwords"
   - Generate a new app password for "Mail" and "Other"
   - Use this password as `EMAIL_APP_PASSWORD` in your `.env` file

### 3. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 4. Start the Server

```bash
# Start the backend server
npm start
```

## Features

- User registration with email verification
- Secure password storage with bcrypt
- JWT authentication
- Resend verification email functionality
- Email verification status checking

## Technologies Used

- Express.js - Web framework
- MongoDB/Mongoose - Database
- Nodemailer - Email sending
- JWT - Authentication tokens
- bcrypt.js - Password hashing 