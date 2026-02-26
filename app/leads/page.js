'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/Sidebar';

const STATUS_OPTIONS = ['new', 'contacted', 'proposal', 'won', 'lost'];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
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

    if (!error) setLeads(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    }
  };

  const deleteLead = async (id) => {
    if (!confirm('Delete this lead permanently?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) setLeads(leads.filter(l => l.id !== id));
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  const statusBadge = (status) => {
    const map = { new: 'badge-new', contacted: 'badge-contacted', proposal: 'badge-proposal', won: 'badge-won', lost: 'badge-lost' };
    return `badge ${map[status] || 'badge-new'}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
      <Sidebar active="leads" />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Leads</h1>
            <p style={styles.subtitle}>{leads.length} total · {leads.filter(l => l.status === 'new').length} new</p>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                ...styles.filterBtn,
                background: filter === s ? 'var(--accent-soft)' : 'transparent',
                color: filter === s ? 'var(--accent)' : 'var(--mid-gray)',
                borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {s} {s !== 'all' && `(${leads.filter(l => l.status === s).length})`}
              {s === 'all' && `(${leads.length})`}
            </button>
          ))}
        </div>

        {/* Leads Table */}
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={{ flex: 1.2 }}>Name</span>
            <span style={{ flex: 1.2 }}>Company</span>
            <span style={{ flex: 2 }}>Launching</span>
            <span style={{ flex: 0.8 }}>Budget</span>
            <span style={{ flex: 0.8 }}>Timeline</span>
            <span style={{ flex: 0.7 }}>Status</span>
            <span style={{ flex: 1 }}>Date</span>
            <span style={{ flex: 0.5 }}></span>
          </div>

          {filteredLeads.map((lead) => (
            <div key={lead.id}>
              <div
                style={{ ...styles.tableRow, background: expandedId === lead.id ? 'var(--surface-hover)' : 'transparent' }}
                onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              >
                <span style={{ flex: 1.2, color: 'var(--white)', fontWeight: 500 }}>{lead.name || '—'}</span>
                <span style={{ flex: 1.2 }}>{lead.company || '—'}</span>
                <span style={{ flex: 2 }}>{lead.launching || '—'}</span>
                <span style={{ flex: 0.8 }}>{lead.budget || '—'}</span>
                <span style={{ flex: 0.8 }}>{lead.timeline || '—'}</span>
                <span style={{ flex: 0.7 }}><span className={statusBadge(lead.status)}>{lead.status}</span></span>
                <span style={{ flex: 1 }}>{formatDate(lead.created_at)}</span>
                <span style={{ flex: 0.5, textAlign: 'right', color: 'var(--mid-gray)', fontSize: '0.8rem' }}>
                  {expandedId === lead.id ? '▲' : '▼'}
                </span>
              </div>

              {/* Expanded Row */}
              {expandedId === lead.id && (
                <div style={styles.expanded}>
                  <div style={styles.expandedGrid}>
                    <div>
                      <label>Website / Socials</label>
                      <p style={styles.expandedValue}>
                        {lead.link ? <a href={lead.link} target="_blank" rel="noopener" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{lead.link}</a> : '—'}
                      </p>
                    </div>
                    <div>
                      <label>Submitted</label>
                      <p style={styles.expandedValue}>{lead.submitted || formatDate(lead.created_at)}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <label>Update Status</label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={(e) => { e.stopPropagation(); updateStatus(lead.id, s); }}
                          style={{
                            ...styles.statusBtn,
                            background: lead.status === s ? 'var(--accent)' : 'var(--surface)',
                            color: lead.status === s ? 'var(--black)' : 'var(--warm-gray)',
                            borderColor: lead.status === s ? 'var(--accent)' : 'var(--border)',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '10px', padding: '8px 16px', color: 'var(--red)' }}
                      onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                    >
                      Delete Lead
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredLeads.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--mid-gray)', fontSize: '0.9rem' }}>
              {filter === 'all' ? 'No leads yet.' : `No leads with status "${filter}".`}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, padding: '40px', marginLeft: '240px', maxWidth: '1200px' },
  header: { marginBottom: '24px' },
  title: { fontSize: '1.5rem', fontWeight: 500, marginBottom: '4px' },
  subtitle: { fontSize: '0.9rem', color: 'var(--warm-gray)', fontWeight: 300 },
  filters: {
    display: 'flex',
    gap: '6px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '8px 14px',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
    fontSize: '0.83rem',
    color: 'var(--warm-gray)',
    borderBottom: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    gap: '12px',
    alignItems: 'center',
  },
  expanded: {
    padding: '20px 20px 24px',
    background: 'var(--surface-hover)',
    borderBottom: '1px solid var(--border)',
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  expandedValue: {
    fontSize: '0.9rem',
    color: 'var(--white)',
    marginTop: '4px',
  },
  statusBtn: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '6px 14px',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
