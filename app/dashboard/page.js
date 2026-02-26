'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/Sidebar';

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, won: 0, lost: 0, thisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchLeads();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.replace('/login');
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      setLoading(false);
      return;
    }

    setLeads(data || []);

    // Calculate stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setStats({
      total: data.length,
      new: data.filter(l => l.status === 'new').length,
      contacted: data.filter(l => l.status === 'contacted').length,
      won: data.filter(l => l.status === 'won').length,
      lost: data.filter(l => l.status === 'lost').length,
      thisWeek: data.filter(l => new Date(l.created_at) >= weekAgo).length,
    });

    setLoading(false);
  };

  const statusBadge = (status) => {
    const map = {
      new: 'badge-new',
      contacted: 'badge-contacted',
      proposal: 'badge-proposal',
      won: 'badge-won',
      lost: 'badge-lost',
    };
    return `badge ${map[status] || 'badge-new'}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--mid-gray)' }}>LOADING...</p>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <Sidebar active="dashboard" />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Overview of incoming leads and pipeline</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <StatCard label="Total Leads" value={stats.total} />
          <StatCard label="This Week" value={stats.thisWeek} accent />
          <StatCard label="New" value={stats.new} />
          <StatCard label="Contacted" value={stats.contacted} />
          <StatCard label="Won" value={stats.won} color="var(--green)" />
          <StatCard label="Lost" value={stats.lost} color="var(--red)" />
        </div>

        {/* Recent Leads */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Leads</h2>
            <button className="btn btn-ghost" onClick={() => router.push('/leads')}>View All →</button>
          </div>

          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span style={{ flex: 1.5 }}>Name</span>
              <span style={{ flex: 1.5 }}>Company</span>
              <span style={{ flex: 2 }}>Launching</span>
              <span style={{ flex: 1 }}>Budget</span>
              <span style={{ flex: 0.8 }}>Status</span>
              <span style={{ flex: 1 }}>Date</span>
            </div>

            {leads.slice(0, 8).map((lead) => (
              <div key={lead.id} style={styles.tableRow} onClick={() => router.push('/leads')}>
                <span style={{ flex: 1.5, color: 'var(--white)' }}>{lead.name || '—'}</span>
                <span style={{ flex: 1.5 }}>{lead.company || '—'}</span>
                <span style={{ flex: 2 }}>{lead.launching || '—'}</span>
                <span style={{ flex: 1 }}>{lead.budget || '—'}</span>
                <span style={{ flex: 0.8 }}><span className={statusBadge(lead.status)}>{lead.status}</span></span>
                <span style={{ flex: 1 }}>{formatDate(lead.created_at)}</span>
              </div>
            ))}

            {leads.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--mid-gray)', fontSize: '0.9rem' }}>
                No leads yet. They'll appear here when someone submits the Stride website form.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '24px',
    }}>
      <p style={{
        fontFamily: 'var(--mono)',
        fontSize: '9px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--mid-gray)',
        marginBottom: '8px',
      }}>{label}</p>
      <p style={{
        fontSize: '2rem',
        fontWeight: 600,
        color: color || (accent ? 'var(--accent)' : 'var(--white)'),
        lineHeight: 1,
      }}>{value}</p>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    padding: '40px',
    marginLeft: '240px',
    maxWidth: '1200px',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 500,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--warm-gray)',
    fontWeight: 300,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '2px',
    marginBottom: '40px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  table: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    padding: '14px 20px',
    fontFamily: 'var(--mono)',
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--mid-gray)',
    borderBottom: '1px solid var(--border)',
    gap: '12px',
  },
  tableRow: {
    display: 'flex',
    padding: '14px 20px',
    fontSize: '0.85rem',
    color: 'var(--warm-gray)',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    gap: '12px',
    alignItems: 'center',
  },
};
