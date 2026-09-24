import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { registerWithEmail, loginWithGoogle } from '../services/firebase/authService';
import { isValidEmail, isStrongPassword, isNonEmpty } from '../utils/validators';
import Button from '../components/common/Button';
import './AuthPages.css';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isNonEmpty(name)) return toast.error('Enter your name');
    if (!isValidEmail(email)) return toast.error('Enter a valid email address');
    if (!isStrongPassword(password)) return toast.error('Password must be at least 6 characters');

    setSubmitting(true);
    try {
      await registerWithEmail(name, email, password);
      toast.success('Account created!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Google login failed');
    }
  };

  return (
    <div className="container auth-page">
      <div className="glass-card auth-card">
        <h1>Create Account</h1>
        <p className="auth-card__subtitle">Join CricPulse to follow matches and favorite players.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <FiUser size={16} />
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="auth-field">
            <FiMail size={16} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="auth-field">
            <FiLock size={16} />
            <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Creating account…' : 'Register'}
          </Button>
        </form>

        <button className="auth-google-btn" onClick={handleGoogle}>
          <FcGoogle size={18} /> Continue with Google
        </button>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
