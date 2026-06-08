import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';
import Navbar from '../components/Navbar';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import { StatusBadge } from '../components/Badges';

export default function StudentDashboard() {
  const { auth } = useAuth();
  const { addToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
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

  const handleCreated = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleUpdated = (updated) => {
    setTickets(prev => prev.map(t => t.ticketId === updated.ticketId ? updated : t));
  };

  const filtered = filterStatus === 'All' ? tickets : tickets.filter(t => t.status === filterStatus);

  // Stats
  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'Pending').length,
    assigned: tickets.filter(t => t.status === 'Assigned').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">My Maintenance Requests</h1>
            <p className="page-subtitle">
              Track your submitted tickets and their resolution status
            </p>
          </div>
          <button
            id="create-ticket-btn"
            className="btn btn-primary btn-lg"
            onClick={() => setShowCreate(true)}
          >
            + New Request
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Total Tickets', value: stats.total, borderLeft: '4px solid var(--clr-brand-primary)' },
            { label: 'Pending', value: stats.pending, borderLeft: '4px solid var(--clr-pending)' },
            { label: 'In Progress', value: stats.assigned, borderLeft: '4px solid var(--clr-assigned)' },
            { label: 'Resolved', value: stats.resolved, borderLeft: '4px solid var(--clr-resolved)' },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ borderLeft: s.borderLeft }}>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="filter-bar">
          <span style={{ fontSize: 13, color: 'var(--clr-text-muted)', fontWeight: 500 }}>Filter:</span>
          {['All', 'Pending', 'Assigned', 'Resolved', 'Closed'].map(s => (
            <button
              key={s}
              id={`filter-${s.toLowerCase()}`}
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
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--clr-text-muted)' }}>
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="empty-state">
            <span className="spinner spinner-lg" />
            <p style={{ color: 'var(--clr-text-muted)' }}>Loading tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">
              {filterStatus === 'All' ? 'No tickets yet' : `No ${filterStatus} tickets`}
            </div>
            <p className="empty-state-desc">
              {filterStatus === 'All'
                ? 'Submit your first maintenance request to get started.'
                : `You have no tickets with "${filterStatus}" status.`}
            </p>
            {filterStatus === 'All' && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
              >
                + Submit First Request
              </button>
            )}
          </div>
        ) : (
          <div className="fade-in">
            {filtered.map(t => (
              <TicketCard key={t.ticketId} ticket={t} onUpdated={handleUpdated} />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
