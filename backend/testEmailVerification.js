require('dotenv').config();
const mongoose = require('mongoose');
const { sendVerificationEmail, verifyEmailExists } = require('./emailSender');
const User = require('./models/User');

// Test function
async function testEmailVerification() {
  try {
    console.log('📧 Email Verification Test Tool 📧');
    console.log('----------------------------------');
    
    // Verify environment variables
    console.log('Testing with these environment variables:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✓' : 'Not set ✗');
    console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set ✓' : 'Not set ✗');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : 'Not set ✗');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set ✓' : 'Not set ✗');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD || !process.env.JWT_SECRET || !process.env.MONGO_URI) {
      console.error('❌ Environment variables not set correctly. Check your .env file.');
      return;
    }
    
    // Connect to MongoDB
    console.log('\n📝 Step 1: Connecting to MongoDB');
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✓ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      return;
    }
    
    // Email to test with - edit this to test a different address
    const testEmail = process.env.EMAIL_USER;
    const verificationLink = 'http://localhost:3000/verify-test-link';
    
    // Step 2: Verify if email format is valid
    console.log('\n📝 Step 2: Verifying email format');
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    
    if (!gmailRegex.test(testEmail)) {
      console.error(`❌ ${testEmail} is not a valid Gmail address.`);
      await mongoose.disconnect();
      return;
    }
    
    console.log(`✓ ${testEmail} passes Gmail format validation.`);
    
    // Step 3: Check if email exists in the database
    console.log('\n📝 Step 3: Checking if email exists in MongoDB');
    const existingUser = await User.findOne({ email: testEmail });
    
    if (existingUser) {
      console.log(`ℹ️ Email ${testEmail} already exists in the database.`);
      console.log(`ℹ️ Verification status: ${existingUser.isVerified ? 'Verified' : 'Not Verified'}`);
    } else {
      console.log(`✓ Email ${testEmail} does not exist in the database yet.`);
    }
    
    // Step 4: Verify if email domain is valid
    console.log('\n📝 Step 4: Verifying email domain');
    const isEmailValid = await verifyEmailExists(testEmail);
    
    if (isEmailValid) {
      console.log(`✓ ${testEmail} domain appears valid.`);
    } else {
      console.error(`❌ Could not verify ${testEmail} domain.`);
      await mongoose.disconnect();
      return;
    }
    
    // Step 5: Send verification email
    console.log(`\n📝 Step 5: Sending verification email to ${testEmail}`);
    try {
      await sendVerificationEmail(testEmail, verificationLink);
      console.log('✅ Test verification email sent successfully!');
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
    }
    
    console.log('\n✨ Test completed. If all steps passed, your email verification system is working! ✨');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    // Ensure we disconnect from MongoDB even if there's an error
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
  }
}

// Run the test
testEmailVerification(); 