import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';
import Navbar from '../components/Navbar';
import TicketCard from '../components/TicketCard';

export default function TechnicianDashboard() {
  const { auth } = useAuth();
  const { addToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

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

  // For technicians: filter by their assignment
  const myTickets = tickets.filter(t => t.technician?.email === auth.email);
  const filtered = filterStatus === 'All' ? myTickets : myTickets.filter(t => t.status === filterStatus);

  const stats = {
    total: myTickets.length,
    assigned: myTickets.filter(t => t.status === 'Assigned').length,
    resolved: myTickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Work Queue</h1>
            <p className="page-subtitle">Tickets assigned to you for maintenance</p>
          </div>
          <button
            id="technician-refresh-btn"
            className="btn btn-secondary"
            onClick={fetchTickets}
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Total Assigned', value: stats.total, borderLeft: '4px solid var(--clr-brand-primary)' },
            { label: 'Active Jobs', value: stats.assigned, borderLeft: '4px solid var(--clr-assigned)' },
            { label: 'Completed', value: stats.resolved, borderLeft: '4px solid var(--clr-resolved)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ borderLeft: s.borderLeft }}>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Jobs highlight */}
        {stats.assigned > 0 && (
          <div style={{
            background: 'var(--clr-assigned-bg)',
            border: '1.5px solid rgba(37, 99, 235, 0.25)',
            borderRadius: 'var(--border-radius-md)',
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14,
          }}>
            <span>
              You have <strong style={{ color: 'var(--clr-assigned)' }}>{stats.assigned} active job{stats.assigned !== 1 ? 's' : ''}</strong> waiting to be resolved.
            </span>
          </div>
        )}

        {/* Filter */}
        <div className="filter-bar">
          <span style={{ fontSize: 13, color: 'var(--clr-text-muted)', fontWeight: 500 }}>Filter:</span>
          {['All', 'Assigned', 'Resolved'].map(s => (
            <button
              key={s}
              id={`tech-filter-${s.toLowerCase()}`}
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
        </div>

        {/* Tickets */}
        {loading ? (
          <div className="empty-state">
            <span className="spinner spinner-lg" />
            <p style={{ color: 'var(--clr-text-muted)' }}>Loading your queue...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">
              {filterStatus === 'All' ? 'No tickets assigned yet' : `No ${filterStatus} tickets`}
            </div>
            <p className="empty-state-desc">
              {filterStatus === 'All'
                ? 'An admin will assign maintenance tickets to you.'
                : `You have no tickets with "${filterStatus}" status.`}
            </p>
          </div>
        ) : (
          <div className="fade-in">
            {filtered.map(t => (
              <TicketCard key={t.ticketId} ticket={t} onUpdated={handleUpdated} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
