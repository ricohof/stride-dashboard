'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>STRIDE</div>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Sign in to manage your leads</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@stride.com"
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '380px',
    padding: '48px 36px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
  },
  logo: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    letterSpacing: '0.5em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginBottom: '24px',
  },
  title: {
    fontFamily: 'var(--sans)',
    fontSize: '1.5rem',
    fontWeight: 500,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--warm-gray)',
    fontWeight: 300,
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  error: {
    fontSize: '0.85rem',
    color: 'var(--red)',
    fontWeight: 400,
  },
};
