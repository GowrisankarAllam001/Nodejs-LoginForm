const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");
const dns = require('dns');
const { promisify } = require('util');

const resolveMx = promisify(dns.resolveMx);

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Sender email address
    pass: process.env.EMAIL_APP_PASSWORD, // App password from Gmail account
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send verification email to user
 * @param {string} to - Recipient email address
 * @param {string} verificationLink - Link for email verification
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendVerificationEmail = async (email, verificationLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please click the button below to verify your email:</p>
          <a href="${verificationLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #007bff; 
                    color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

/**
 * Send verification code to user
 * @param {string} email - Recipient email address
 * @param {string} code - Verification code
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendVerificationCode = async (email, code) => {
  try {
    const mailOptions = {
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="text-align: center; margin: 20px;">
            <h1 style="letter-spacing: 5px; font-size: 32px; color: #007bff;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification code sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

/**
 * Verify if email domain exists and that the email is not already in the database
 * This performs two checks:
 * 1. Verifies the email domain by checking the SMTP connection
 * 2. The auth.js route will check if this email already exists in the database
 * 
 * @param {string} email - Email to verify
 * @returns {Promise<boolean>} - Whether the email domain is valid
 */
const verifyEmailExists = async (email) => {
  try {
    const domain = email.split('@')[1];
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch (error) {
    console.error('Error verifying email existence:', error);
    return false;
  }
};

module.exports = {
  transporter,
  sendVerificationEmail,
  sendVerificationCode
};
