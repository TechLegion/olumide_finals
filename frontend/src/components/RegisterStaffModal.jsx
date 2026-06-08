import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

const ROLES = [
  { value: 1, label: 'Technician' },
  { value: 2, label: 'Admin' },
];

export default function RegisterStaffModal({ onClose }) {
  const { auth } = useAuth();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.role) {
      addToast({ type: 'error', title: 'Validation', message: 'Please select a role.' });
      return;
    }
    setLoading(true);
    try {
      await api.registerStaff({
        name: form.name,
        email: form.email,
        password: form.password,
        role: Number(form.role),
        matricNumber: '',
      }, auth.token);
      addToast({
        type: 'success',
        title: 'Staff Registered',
        message: `${form.name} has been added successfully.`,
      });
      onClose();
    } catch (err) {
      addToast({ type: 'error', title: 'Registration Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Register Staff Account</h2>
            <p style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 4 }}>
              Admin-only: Create Technician or Admin accounts
            </p>
          </div>
          <button id="close-staff-modal" className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  id={`role-btn-${r.value}`}
                  onClick={() => set('role', r.value)}
                  style={{
                    padding: '14px 12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: `2px solid ${form.role === r.value ? 'var(--clr-brand-primary)' : 'var(--clr-border)'}`,
                    background: form.role === r.value ? 'var(--clr-brand-light)' : 'var(--clr-surface)',
                    color: form.role === r.value ? 'var(--clr-brand-primary)' : 'var(--clr-text-secondary)',
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              id="staff-name"
              className="form-control"
              placeholder="Staff member's full name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              id="staff-email"
              type="email"
              className="form-control"
              placeholder="staff@redeemers.edu.ng"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Temporary Password *</label>
            <input
              id="staff-password"
              type="password"
              className="form-control"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required minLength={6}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 }}>
            <button type="button" id="cancel-staff-btn" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              id="submit-staff-btn"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: 160 }}
            >
              {loading ? <><span className="spinner" /> Creating...</> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
