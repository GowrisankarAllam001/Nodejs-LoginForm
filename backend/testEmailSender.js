require('dotenv').config({ path: './.env' }); // Explicit path

const { sendCustomVerificationEmail } = require('./emailSender');

async function testEmailSender() {
  console.log('Testing email sender with these environment variables:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✓' : 'Not set ✗');
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set ✓' : 'Not set ✗');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('❌ Environment variables not set correctly. Check your .env file.');
    return;
  }

  const testEmail = process.env.EMAIL_USER; // Can be any recipient
  const verificationLink = 'http://localhost:3000/verify-test-link';

  try {
    console.log(`📧 Sending test email to ${testEmail}...`);
    await sendCustomVerificationEmail(testEmail, verificationLink);
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

testEmailSender();
