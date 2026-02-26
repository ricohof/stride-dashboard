'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Sidebar({ active }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '◻', href: '/dashboard' },
    { id: 'leads', label: 'Leads', icon: '◉', href: '/leads' },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>STRIDE</div>
      <p style={styles.logoSub}>Lead Dashboard</p>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            style={{
              ...styles.navItem,
              background: active === item.id ? 'var(--accent-soft)' : 'transparent',
              color: active === item.id ? 'var(--accent)' : 'var(--warm-gray)',
            }}
          >
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div style={styles.bottom}>
        <button onClick={handleLogout} style={styles.logout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 20px',
  },
  logo: {
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    letterSpacing: '0.4em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    marginBottom: '2px',
  },
  logoSub: {
    fontFamily: 'var(--mono)',
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--mid-gray)',
    marginBottom: '40px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '6px',
    fontFamily: 'var(--sans)',
    fontSize: '0.88rem',
    fontWeight: 400,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  },
  bottom: {
    borderTop: '1px solid var(--border)',
    paddingTop: '16px',
  },
  logout: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--mid-gray)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 0',
    transition: 'color 0.2s ease',
  },
};
