require('dotenv').config();
const { transporter, sendVerificationEmail } = require('./emailSender');

async function testEmailConnection() {
  console.log('Testing email connection...');
  
  try {
    // Test configuration
    console.log('Email configuration:');
    console.log('Username:', process.env.EMAIL_USER);
    console.log('Password:', process.env.EMAIL_APP_PASSWORD ? '[SET]' : '[NOT SET]');
    
    // Verify connection
    const verificationResult = await transporter.verify();
    console.log('SMTP connection verified:', verificationResult);
    
    // Test sending email
    await sendVerificationEmail(
      process.env.EMAIL_USER, // Send to yourself for testing
      'http://localhost:3000/verify-email/test-token'
    );
    
    console.log('Test email sent successfully');
    return true;
  } catch (error) {
    console.error('Email test failed:', error.message);
    return false;
  }
}

// Run the test
testEmailConnection().then(success => {
  console.log(success ? 'Email test completed successfully!' : 'Email test failed!');
  process.exit(0);
});