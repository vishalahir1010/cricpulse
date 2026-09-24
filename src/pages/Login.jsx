import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { loginWithEmail, loginWithGoogle } from '../services/firebase/authService';
import { isValidEmail } from '../utils/validators';
import Button from '../components/common/Button';
import './AuthPages.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Google login failed');
    }
  };

  return (
    <div className="container auth-page">
      <div className="glass-card auth-card">
        <h1>Log In</h1>
        <p className="auth-card__subtitle">Welcome back to CricPulse.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <FiMail size={16} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="auth-field">
            <FiLock size={16} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        {/* <button className="auth-google-btn" onClick={handleGoogle}>
          <FcGoogle size={18} /> Continue with Google
        </button> */}

        <p className="auth-card__footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
