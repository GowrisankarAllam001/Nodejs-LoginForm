const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationCode } = require('../emailSender');

const router = express.Router();

// Generate 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ message: "Please use a valid Gmail address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    
    const user = existingUser || new User({
      email,
      password: hashedPassword
    });

    user.verificationCode = verificationCode;
    user.codeExpiry = Date.now() + 600000; // 10 minutes
    await user.save();

    await sendVerificationCode(email, verificationCode);

    res.status(200).json({
      message: "Verification code sent to your email",
      email: email
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// VERIFY CODE
router.post("/verify-code", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({
      email,
      verificationCode,
      codeExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code' 
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.codeExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during verification'
    });
  }
});

// RESEND CODE
router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.codeExpiry = Date.now() + 600000; // 10 minutes
    await user.save();

    await sendVerificationCode(email, verificationCode);

    res.status(200).json({
      message: "New verification code sent to your email"
    });

  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({ message: "Failed to resend code" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
        needsVerification: true
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        email: user.email,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
});

module.exports = router;
