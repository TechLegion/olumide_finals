import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

const HOSTELS = [
  { value: 0, label: 'Adeboye Hall' },
  { value: 1, label: 'Deborah Hall' },
  { value: 2, label: 'Extension Boys Hostel' },
  { value: 3, label: 'Extension Female' },
  { value: 4, label: 'Guest House' },
  { value: 5, label: 'Joshua Hall' },
  { value: 6, label: 'Prophet Moses Hall' },
  { value: 7, label: 'Queen Esther Hall' },
];

const CATEGORIES = [
  { value: 0, label: 'Plumbing' },
  { value: 1, label: 'Electrical' },
  { value: 2, label: 'Carpentry' },
];

export default function CreateTicketModal({ onClose, onCreated }) {
  const { auth } = useAuth();
  const { addToast } = useToast();
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: '', description: '', hostel: '', roomNumber: '', category: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || form.hostel === '' || !form.roomNumber || form.category === '') {
      addToast({ type: 'error', title: 'Validation Error', message: 'Please fill in all required fields.' });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('Title', form.title);
      fd.append('Description', form.description);
      fd.append('Hostel', form.hostel);
      fd.append('RoomNumber', form.roomNumber);
      fd.append('Category', form.category);
      if (image) fd.append('Image', image);

      const ticket = await api.createTicket(fd, auth.token);
      addToast({ type: 'success', title: 'Ticket Created', message: `Ticket #${ticket.ticketId} submitted successfully.` });
      onCreated(ticket);
      onClose();
    } catch (err) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Submit Maintenance Request</h2>
            <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 4 }}>
              Describe the issue and we'll get it resolved
            </p>
          </div>
          <button id="close-create-modal" className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Issue Title *</label>
            <input
              id="ticket-title"
              className="form-control"
              placeholder="e.g., Broken ceiling fan, Leaking pipe..."
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              id="ticket-description"
              className="form-control"
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Hostel + Room */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Hostel *</label>
              <select
                id="ticket-hostel"
                className="form-control"
                value={form.hostel}
                onChange={e => set('hostel', e.target.value)}
                required
              >
                <option value="">Select hostel...</option>
                {HOSTELS.map(h => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input
                id="ticket-room"
                className="form-control"
                placeholder="e.g., 204, B-12..."
                value={form.roomNumber}
                onChange={e => set('roomNumber', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  id={`category-${c.label.toLowerCase()}`}
                  onClick={() => set('category', c.value)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--border-radius-md)',
                    border: `2px solid ${form.category === c.value ? 'var(--clr-brand-primary)' : 'var(--clr-border)'}`,
                    background: form.category === c.value ? 'var(--clr-brand-light)' : 'var(--clr-surface)',
                    color: form.category === c.value ? 'var(--clr-brand-primary)' : 'var(--clr-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'center',
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="form-group">
            <label className="form-label">Attach Photo (optional)</label>
            {preview ? (
              <div style={{ position: 'relative' }}>
                <img src={preview} alt="preview" className="img-preview" />
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null); }}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.7)', color: 'white',
                    border: 'none', borderRadius: 6, padding: '4px 8px',
                    cursor: 'pointer', fontSize: 12,
                  }}
                >Remove</button>
              </div>
            ) : (
              <div className="file-drop" onClick={() => fileRef.current.click()}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
                <div style={{ fontWeight: 600, fontSize: 14 }}>Click to upload photo</div>
                <div style={{ color: 'var(--clr-text-muted)', fontSize: 13, marginTop: 4 }}>
                  PNG, JPG, WEBP supported
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <button type="button" id="cancel-create-ticket" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="submit-ticket-btn"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: 130 }}
            >
              {loading ? <><span className="spinner" /> Submitting...</> : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
