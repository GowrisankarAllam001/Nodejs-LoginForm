import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateGmail = (email) => {
    return email.toLowerCase().includes('@gmail.com');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!user.email) {
      newErrors.email = "Email is required";
    } else if (!validateGmail(user.email)) {
      newErrors.email = "Please use a valid Gmail address";
    }
    
    if (!user.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { 
        email: user.email, 
        password: user.password 
      });

      localStorage.setItem("token", res.data.token); // Store JWT
      localStorage.setItem("user", JSON.stringify(res.data.user)); // Store user info
      
      // Success alert
      alert("Login successful!");
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        const { data } = error.response;

        // Clear and specific user feedback cases
        if (data.exists === false) {
          // User doesn't exist in the database
          setErrors({
            ...errors,
            email: "No account found with this email. Please register first."
          });
          alert("No account exists with this email address. Please sign up.");
        } 
        else if (data.needsVerification) {
          // User exists but needs verification
          setNeedsVerification(true);
          setErrors({
            ...errors,
            email: "Your account is not verified. Please check your email and click the verification link."
          });
          alert("Your account is not verified. Please verify your email first.");
        } 
        else if (data.wrongPassword) {
          // User exists but password is wrong
          setErrors({
            ...errors,
            password: "Wrong password. Please check and try again."
          });
          alert("Wrong password. Please check your credentials and try again.");
        }
        else if (data.message?.includes("valid Gmail")) {
          // Email format validation failed
          setErrors({
            ...errors,
            email: "Please use a valid Gmail address."
          });
          alert("Please use a valid Gmail address.");
        } 
        else {
          // Generic error for all other cases
          setErrors({
            ...errors,
            general: data.message || "Login failed. Please try again."
          });
          alert(data.message || "Login failed. Please try again.");
        }
      } else {
        setErrors({
          ...errors,
          general: "Server error. Please try again later."
        });
        alert("Server error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/resend-verification", {
        email: user.email,
      });
      alert("Verification email resent. Please check your inbox.");
      navigate(`/verify-email?email=${user.email}`);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
      alert(err.response?.data?.message || "Could not resend verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="formcontainer" onSubmit={handleLogin}>
        <h1>Welcome Back</h1>
        
        {errors.general && (
          <div className="alert alert-error">{errors.general}</div>
        )}
        
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
              disabled={isLoading}
            />
            {errors.email && (
              <div className="error-message">
                {errors.email}
                {needsVerification && (
                  <button 
                    type="button"
                    className="link-button" 
                    onClick={handleResendVerification}
                    style={{ marginLeft: '5px' }}
                  >
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
        </div>
        
        <button 
          type="submit" 
          className="buttonlogin"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
        
        <p className="signup-link">
          Don't have an account?{" "}
          <button 
            className="link-button"
            type="button" 
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
