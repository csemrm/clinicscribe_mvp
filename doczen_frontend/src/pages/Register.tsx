import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Field from '../components/Field';
import { register } from '../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('Demo');
  const [lastName, setLastName] = useState('User');
  const [email, setEmail] = useState('demo@clinic.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ first_name: firstName, last_name: lastName, email, password });
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="eyebrow">Create account</div>
        <h2>Register</h2>
        <Field label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Field label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <div className="banner error">{error}</div> : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
