import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

export default function AssignTicketModal({ ticket, onClose, onAssigned }) {
  const { auth } = useAuth();
  const { addToast } = useToast();
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingTechs, setFetchingTechs] = useState(true);

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const data = await api.getTechnicians(auth.token);
        setTechnicians(data);
        if (data.length > 0) {
          setTechnicianId(data[0].userId.toString());
        }
      } catch (err) {
        addToast({ type: 'error', title: 'Error', message: 'Failed to load technicians list.' });
      } finally {
        setFetchingTechs(false);
      }
    };
    fetchTechs();
  }, [auth.token, addToast]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!technicianId) {
      addToast({ type: 'error', title: 'Validation', message: 'Please select a technician.' });
      return;
    }
    setLoading(true);
    try {
      const updated = await api.assignTicket(ticket.ticketId, Number(technicianId), auth.token);
      addToast({ type: 'success', title: 'Ticket Assigned', message: `Ticket #${ticket.ticketId} has been assigned.` });
      onAssigned(updated);
      onClose();
    } catch (err) {
      addToast({ type: 'error', title: 'Assignment Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Ticket</h2>
          <button id="close-assign-modal" className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Ticket Summary */}
        <div style={{
          background: 'var(--clr-surface-2)',
          borderRadius: 'var(--border-radius-md)',
          padding: '14px 16px',
          marginBottom: 20,
          border: '1.5px solid var(--clr-border)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{ticket.title}</div>
          <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>
            Ticket #{ticket.ticketId} · {ticket.category} · Room {ticket.roomNumber}
          </div>
        </div>

        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">Select Technician *</label>
            {fetchingTechs ? (
              <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', padding: '10px 0' }}>
                <span className="spinner spinner-sm" style={{ marginRight: 8 }} /> Loading technicians list...
              </div>
            ) : technicians.length === 0 ? (
              <div style={{ fontSize: 13, color: '#f87171', padding: '10px 0', fontWeight: 600 }}>
                No technicians registered. Use the "Register Staff" button to add one first.
              </div>
            ) : (
              <select
                id="technician-select"
                className="form-control"
                value={technicianId}
                onChange={e => setTechnicianId(e.target.value)}
                required
              >
                <option value="">-- Choose a technician --</option>
                {technicians.map(tech => (
                  <option key={tech.userId} value={tech.userId}>
                    {tech.fullName} ({tech.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="button" id="cancel-assign-btn" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-assign-btn"
              className="btn btn-primary"
              disabled={loading || technicians.length === 0}
              style={{ minWidth: 130 }}
            >
              {loading ? <><span className="spinner" /> Assigning...</> : 'Assign Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
