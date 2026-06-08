import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';
import { StatusBadge, CategoryBadge } from './Badges';
import AssignTicketModal from './AssignTicketModal';

const HOSTEL_NAMES = [
  'Adeboye Hall', 'Deborah Hall', 'Extension Boys Hostel',
  'Extension Female', 'Guest House', 'Joshua Hall',
  'Prophet Moses Hall', 'Queen Esther Hall',
];

export default function TicketCard({ ticket, onUpdated }) {
  const { auth, isAdmin, isTechnician } = useAuth();
  const { addToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [resolving, setResolving] = useState(false);

  const hostelName = typeof ticket.hostel === 'number'
    ? HOSTEL_NAMES[ticket.hostel] || `Hostel ${ticket.hostel}`
    : ticket.hostel;

  const handleResolve = async () => {
    if (!window.confirm('Mark this ticket as Resolved?')) return;
    setResolving(true);
    try {
      const updated = await api.resolveTicket(ticket.ticketId, auth.token);
      addToast({ type: 'success', title: 'Ticket Resolved', message: `Ticket #${ticket.ticketId} marked as resolved.` });
      onUpdated(updated);
    } catch (err) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setResolving(false);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      <div
        className="card card-hover"
        style={{ marginBottom: 12 }}
        id={`ticket-card-${ticket.ticketId}`}
      >
        {/* Card Header */}
        <div
          style={{
            display: 'flex', alignItems: 'flex-start',
            gap: 16, cursor: 'pointer',
          }}
          onClick={() => setExpanded(x => !x)}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{ticket.title}</span>
              <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>#{ticket.ticketId}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <StatusBadge status={ticket.status} />
              <CategoryBadge category={ticket.category} />
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--clr-text-secondary)', marginTop: 8 }}>
              {hostelName}, Room {ticket.roomNumber}
              {' · '}
              {formatDate(ticket.createdAt)}
            </div>
          </div>

          <div style={{
            color: 'var(--clr-text-muted)', fontSize: 12,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--transition-fast)', flexShrink: 0,
          }}>▼</div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div style={{
            marginTop: 16, paddingTop: 16,
            borderTop: '1.5px solid var(--clr-border)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Description
              </div>
              <p style={{ fontSize: 14, color: 'var(--clr-text-secondary)', lineHeight: 1.7 }}>
                {ticket.description}
              </p>
            </div>

            {/* Image */}
            {ticket.imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Attached Photo
                </div>
                <img
                  src={ticket.imageUrl}
                  alt="ticket"
                  style={{
                    maxWidth: 400, maxHeight: 250,
                    borderRadius: 'var(--border-radius-md)',
                    border: '1.5px solid var(--clr-border)',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* People */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--clr-surface-2)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', marginBottom: 4 }}>REPORTED BY</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{ticket.student?.fullName || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{ticket.student?.email}</div>
              </div>
              <div style={{ background: 'var(--clr-surface-2)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', marginBottom: 4 }}>ASSIGNED TO</div>
                {ticket.technician ? (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{ticket.technician.fullName}</div>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{ticket.technician.email}</div>
                  </>
                ) : (
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>Not yet assigned</div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 16 }}>
              <span>Created: {formatDate(ticket.createdAt)}</span>
              <span>Updated: {formatDate(ticket.updatedAt)}</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {isAdmin && ticket.status !== 'Closed' && (
                <button
                  id={`assign-btn-${ticket.ticketId}`}
                  className="btn btn-primary btn-sm"
                  onClick={(e) => { e.stopPropagation(); setShowAssign(true); }}
                >
                  Assign
                </button>
              )}

              {isTechnician && ticket.status === 'Assigned' && ticket.technician?.email === auth.email && (
                <button
                  id={`resolve-btn-${ticket.ticketId}`}
                  className="btn btn-sm"
                  disabled={resolving}
                  onClick={(e) => { e.stopPropagation(); handleResolve(); }}
                  style={{
                    background: 'var(--clr-resolved-bg)',
                    color: 'var(--clr-resolved)',
                    border: '1.5px solid rgba(22, 163, 74, 0.25)',
                  }}
                >
                  {resolving ? <><span className="spinner" /> Resolving...</> : 'Mark Resolved'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showAssign && (
        <AssignTicketModal
          ticket={ticket}
          onClose={() => setShowAssign(false)}
          onAssigned={onUpdated}
        />
      )}
    </>
  );
}
