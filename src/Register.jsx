import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "", confirmPassword: "" });
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Validate Gmail
  const validateGmail = (email) => email.toLowerCase().endsWith("@gmail.com");

  // Poll email verification status
  useEffect(() => {
    let interval;
    if (verificationSent && user.email) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/auth/check-verification?email=${user.email}`);
          if (res.data.isVerified) {
            setIsEmailVerified(true);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Verification check error:", error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [verificationSent, user.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

    if (name === "email" && value && !validateGmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Please use a valid Gmail address (e.g., example@gmail.com)" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { email, password, confirmPassword } = user;

    if (!email) newErrors.email = "Email is required";
    else if (!validateGmail(email)) newErrors.email = "Please use a valid Gmail address";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEmailExists = async (email) => {
    if (!validateGmail(email)) return false;

    setIsCheckingEmail(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/check-email-exists?email=${email}`);
      if (res.data.exists) {
        setErrors((prev) => ({
          ...prev,
          email: res.data.isVerified
            ? "This email is already registered. Please log in instead."
            : "This email is registered but not verified. Would you like to resend verification?",
          needsVerification: !res.data.isVerified,
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Email existence check error:", err);
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const emailExists = await checkEmailExists(user.email);
      if (emailExists) return;

      const response = await axios.post("http://localhost:5000/api/auth/register", {
        email: user.email,
        password: user.password,
      });

      if (response.data.message) {
        setVerificationSent(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-code", {
        email: user.email,
        verificationCode
      });

      if (response.data.success) {
        alert("Account verified successfully!");
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/resend-code", {
        email: user.email
      });
      alert("New verification code sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/resend-verification", { email: user.email });
      alert("Verification email resent. Check your inbox.");
      setVerificationSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Resend failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = () => {
    if (!isEmailVerified) {
      return alert("Please verify your email first.");
    }
    alert("Email verified! You can now log in.");
    navigate("/login");
  };

  const handleLoginClick = () => navigate("/login");

  if (verificationSent) {
    return (
      <div className="login-page">
        <div className="formcontainer">
          <h1>Verify Your Email</h1>
          <p>We've sent a verification code to <strong>{user.email}</strong></p>
          
          <form onSubmit={handleVerifyCode}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                pattern="\d{6}"
                required
                className={`inputemail ${errors.code ? 'input-error' : ''}`}
                disabled={isLoading}
              />
              {errors.code && <div className="error-message">{errors.code}</div>}
            </div>

            <button 
              type="submit" 
              className="buttonlogin"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <p>
            Didn't receive the code?{" "}
            <button 
              className="link-button" 
              onClick={handleResendCode} 
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Resend Code"}
            </button>
          </p>
          
          <p>
            <button 
              className="link-button" 
              onClick={() => setVerificationSent(false)}
              disabled={isLoading}
            >
              Back to Sign Up
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form className="formcontainer" onSubmit={handleRegister}>
        <h1>Create Account</h1>
        <div className="inputcontainer">
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Gmail Address"
              className={`inputemail ${errors.email ? 'input-error' : ''}`}
              required
              value={user.email}
              onChange={handleChange}
              disabled={isLoading || isCheckingEmail}
            />
            {errors.email && (
              <div className="error-message">
                {errors.email}
                {errors.needsVerification && (
                  <button className="link-button" onClick={handleResendEmail} style={{ marginLeft: '5px' }}>
                    Resend verification
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={`inputpassword ${errors.password ? 'input-error' : ''}`}
              required
              value={user.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className={`inputpassword ${errors.confirmPassword ? 'input-error' : ''}`}
              required
              value={user.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
        </div>

        <button type="submit" className="buttonsignup" disabled={isLoading || isCheckingEmail}>
          {isLoading ? "Creating Account..." : isCheckingEmail ? "Checking Email..." : "Sign Up"}
        </button>
        <p>
          Already have an account?{" "}
          <button className="link-button" onClick={handleLoginClick}>
            Log In
          </button>
        </p>
      </form>
    </div>
  );
}

export default Register;
