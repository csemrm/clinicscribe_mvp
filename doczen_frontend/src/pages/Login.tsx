import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Field from '../components/Field';
import { login } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@clinic.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-page">
      <form className="card auth-card" onSubmit={onSubmit}>
        <div className="eyebrow">Sign in</div>
        <h2>Login</h2>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error ? <div className="banner error">{error}</div> : null}
        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="muted">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
