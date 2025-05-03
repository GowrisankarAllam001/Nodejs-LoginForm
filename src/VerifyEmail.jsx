import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail({ initialStatus }) {
  const { token } = useParams(); // Capture the token from URL
  const [status, setStatus] = useState(initialStatus || 'pending'); // Track verification status
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Send request to verify the token
      axios.get(`http://localhost:5000/api/auth/verify-email/${token}`)
        .then((response) => {
          setStatus('success');
          setTimeout(() => {
            navigate('/login'); // Redirect to login page after 3 seconds
          }, 3000);
        })
        .catch((error) => {
          setStatus('error');
        });
    }
  }, [token, navigate]);

  if (status === 'pending') {
    return <h2>Verifying your email...</h2>;
  }

  return (
    <div>
      {status === 'success' ? (
        <div>
          <h2>Your account has been successfully verified!</h2>
          <p>You will be redirected to the login page shortly.</p>
        </div>
      ) : (
        <div>
          <h2>Email verification failed.</h2>
          <p>Please try again or contact support.</p>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
