
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate('/complete-profile');
    }
  }, [user, navigate]);

  return (
    <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
      <h2>Please Confirm Your Email</h2>
      <p>We have sent a confirmation link to your email address.</p>
      <p>Click the link in the email to verify and reload this page.</p>
    </div>
  );
}
