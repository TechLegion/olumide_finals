import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';
import Navbar from '../components/Navbar';
import TicketCard from '../components/TicketCard';
import RegisterStaffModal from '../components/RegisterStaffModal';

const HOSTEL_NAMES = [
  'Adeboye Hall', 'Deborah Hall', 'Extension Boys Hostel',
  'Extension Female', 'Guest House', 'Joshua Hall',
  'Prophet Moses Hall', 'Queen Esther Hall',
];

export default function AdminDashboard() {
  const { auth } = useAuth();
  const { addToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'analytics'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getTickets(auth.token);
      setTickets(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleUpdated = (updated) => {
    setTickets(prev => prev.map(t => t.ticketId === updated.ticketId ? updated : t));
  };

  const filtered = tickets.filter(t => {
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    const matchSearch = !searchQuery || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'Pending').length,
    assigned: tickets.filter(t => t.status === 'Assigned').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
  };

  const categoryStats = ['Plumbing', 'Electrical', 'Carpentry'].map(cat => ({
    name: cat,
    count: tickets.filter(t => t.category === cat).length,
  }));

  const hostelStats = HOSTEL_NAMES.map((name, idx) => ({
    name,
    count: tickets.filter(t => t.hostel === idx).length,
  })).filter(h => h.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage and oversee all campus maintenance requests</p>
          </div>
          <button
            id="register-staff-btn"
            className="btn btn-primary"
            onClick={() => setShowStaffModal(true)}
          >
            Register Staff
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {[
            { label: 'Total', value: stats.total, borderLeft: '4px solid var(--clr-brand-primary)' },
            { label: 'Pending', value: stats.pending, borderLeft: '4px solid var(--clr-pending)' },
            { label: 'Assigned', value: stats.assigned, borderLeft: '4px solid var(--clr-assigned)' },
            { label: 'Resolved', value: stats.resolved, borderLeft: '4px solid var(--clr-resolved)' },
            { label: 'Closed', value: stats.closed, borderLeft: '4px solid var(--clr-closed)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ borderLeft: s.borderLeft }}>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--clr-surface)',
          borderRadius: 'var(--border-radius-md)',
          padding: 4, marginBottom: 24,
          border: '1.5px solid var(--clr-border)',
          width: 'fit-content',
        }}>
          {[
            { key: 'tickets', label: 'All Tickets' },
            { key: 'analytics', label: 'Analytics' },
          ].map(t => (
            <button
              key={t.key}
              id={`admin-tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '8px 20px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: activeTab === t.key ? 'var(--clr-brand-primary)' : 'transparent',
                color: activeTab === t.key ? 'white' : 'var(--clr-text-secondary)',
                transition: 'all var(--transition-base)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TICKETS TAB */}
        {activeTab === 'tickets' && (
          <>
            {/* Filter Bar */}
            <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
              {/* Search */}
              <input
                id="admin-search"
                className="form-control"
                style={{ maxWidth: 240, padding: '8px 14px', fontSize: 13 }}
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />

              {['All', 'Pending', 'Assigned', 'Resolved', 'Closed'].map(s => (
                <button
                  key={s}
                  id={`admin-filter-status-${s.toLowerCase()}`}
                  onClick={() => setFilterStatus(s)}
                  className="filter-select"
                  style={{
                    background: filterStatus === s ? 'var(--clr-brand-primary)' : 'var(--clr-surface)',
                    color: filterStatus === s ? 'white' : 'var(--clr-text-secondary)',
                    borderColor: filterStatus === s ? 'transparent' : 'var(--clr-border)',
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}

              <select
                id="admin-filter-category"
                className="filter-select"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
              </select>

              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--clr-text-muted)' }}>
                {filtered.length} of {tickets.length} tickets
              </span>

              <button
                id="admin-refresh-btn"
                className="btn btn-ghost btn-sm"
                onClick={fetchTickets}
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <span className="spinner spinner-lg" />
                <p style={{ color: 'var(--clr-text-muted)' }}>Loading all tickets...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-title">No tickets found</div>
                <p className="empty-state-desc">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="fade-in">
                {filtered.map(t => (
                  <TicketCard key={t.ticketId} ticket={t} onUpdated={handleUpdated} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Status Breakdown */}
            <div className="card">
              <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Status Breakdown</h3>
              {[
                { label: 'Pending', value: stats.pending, total: stats.total, color: 'var(--clr-pending)' },
                { label: 'Assigned', value: stats.assigned, total: stats.total, color: 'var(--clr-assigned)' },
                { label: 'Resolved', value: stats.resolved, total: stats.total, color: 'var(--clr-resolved)' },
                { label: 'Closed', value: stats.closed, total: stats.total, color: 'var(--clr-closed)' },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: s.color, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ color: 'var(--clr-text-muted)' }}>
                      {s.value} ({s.total ? Math.round((s.value / s.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{
                    height: 8, borderRadius: 4,
                    background: 'var(--clr-surface-3)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${s.total ? (s.value / s.total) * 100 : 0}%`,
                      background: s.color,
                      borderRadius: 4,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Category Breakdown */}
            <div className="card">
              <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Category Breakdown</h3>
              {categoryStats.map(c => (
                <div key={c.name} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 0',
                  borderBottom: '1.5px solid var(--clr-surface-2)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--clr-brand-primary)' }}>{c.name}</div>
                    <div style={{ color: 'var(--clr-text-muted)', fontSize: 12, marginTop: 2 }}>
                      {c.count} ticket{c.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: '1.5rem',
                    color: 'var(--clr-text-primary)',
                  }}>{c.count}</div>
                </div>
              ))}
            </div>

            {/* Hostel Breakdown */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>Top Hostels by Ticket Volume</h3>
              {hostelStats.length === 0 ? (
                <p style={{ color: 'var(--clr-text-muted)' }}>No data yet</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {hostelStats.map((h, i) => (
                    <div key={h.name} style={{
                      background: 'var(--clr-surface-2)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '14px 16px',
                      border: '1.5px solid var(--clr-border)',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--clr-brand-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0,
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {h.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
                          {h.count} ticket{h.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showStaffModal && (
        <RegisterStaffModal onClose={() => setShowStaffModal(false)} />
      )}
    </div>
  );
}
