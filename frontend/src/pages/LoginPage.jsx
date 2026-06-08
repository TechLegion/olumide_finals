import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as api from '../api';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  // Register form state
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirmPassword: '', matricNumber: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(loginForm.email, loginForm.password);
      login(data);
      addToast({ type: 'success', title: `Welcome back!`, message: `Signed in as ${data.role}` });
    } catch (err) {
      addToast({ type: 'error', title: 'Login Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      addToast({ type: 'error', title: 'Validation', message: 'Passwords do not match.' });
      return;
    }
    if (regForm.password.length < 6) {
      addToast({ type: 'error', title: 'Validation', message: 'Password must be at least 6 characters.' });
      return;
    }
    setLoading(true);
    try {
      await api.register({
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        matricNumber: regForm.matricNumber,
      });
      addToast({ type: 'success', title: 'Registered!', message: 'Account created. Please sign in.' });
      setTab('login');
      setLoginForm({ email: regForm.email, password: '' });
    } catch (err) {
      addToast({ type: 'error', title: 'Registration Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--clr-bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background brand colors */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(11,34,101,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(197,160,89,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 450,
        position: 'relative', zIndex: 1,
        animation: 'fadeIn 0.4s ease',
      }}>
        {/* Logo Block */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--border-radius-md)',
            background: 'var(--clr-brand-primary)',
            border: '2px solid var(--clr-brand-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-md)',
            color: 'var(--clr-brand-secondary)',
            fontWeight: 800, fontSize: 24, letterSpacing: '0.05em'
          }}>
            RU
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-brand-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Redeemer's University
          </h1>
          <p style={{ color: 'var(--clr-text-secondary)', fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Computerized Maintenance Management System (CMMS)
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--clr-border)',
          padding: '32px'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--clr-surface-2)',
            borderRadius: 'var(--border-radius-md)',
            padding: 4, marginBottom: 24, gap: 4,
          }}>
            {[
              { key: 'login', label: 'Sign In' },
              { key: 'register', label: 'Register' },
            ].map(t => (
              <button
                key={t.key}
                id={`tab-${t.key}`}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '10px',
                  borderRadius: 'var(--border-radius-sm)', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700,
                  background: tab === t.key ? 'var(--clr-brand-primary)' : 'transparent',
                  color: tab === t.key ? 'white' : 'var(--clr-text-secondary)',
                  transition: 'all var(--transition-base)',
                  boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Login Form ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  placeholder="student@redeemers.edu.ng"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  required autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? <><span className="spinner" /> Signing In...</> : 'Sign In'}
              </button>

              {/* Admin Hint */}
              <div style={{
                background: 'var(--clr-gold-light)',
                border: '1.5px solid rgba(197,160,89,0.3)',
                borderRadius: 'var(--border-radius-md)',
                padding: '14px',
                fontSize: 12.5, color: 'var(--clr-text-secondary)',
                lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 800, color: 'var(--clr-brand-primary)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Demo Administrator Credentials:
                </span>
                Email: <strong style={{ color: 'var(--clr-text-primary)' }}>admin@redeemers.edu.ng</strong><br />
                Password: <strong style={{ color: 'var(--clr-text-primary)' }}>Admin@123!</strong>
              </div>
            </form>
          )}

          {/* ── Register Form ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  id="reg-name"
                  className="form-control"
                  placeholder="e.g., Olumide Garba"
                  value={regForm.name}
                  onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-control"
                  placeholder="e.g., user@redeemers.edu.ng"
                  value={regForm.email}
                  onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Matric Number</label>
                <input
                  id="reg-matric"
                  className="form-control"
                  placeholder="e.g., RUN/CMP/22/12931"
                  value={regForm.matricNumber}
                  onChange={e => setRegForm(f => ({ ...f, matricNumber: e.target.value }))}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                     id="reg-password"
                     type="password"
                     className="form-control"
                     placeholder="Min 6 chars"
                     value={regForm.password}
                     onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                     required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    className="form-control"
                    placeholder="Repeat password"
                    value={regForm.confirmPassword}
                    onChange={e => setRegForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? <><span className="spinner" /> Creating Account...</> : 'Create Account'}
              </button>

              <p style={{ fontSize: 11.5, color: 'var(--clr-text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                Student self-registration only. Maintenance staff and Unit administrators must be registered via the admin portal.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--clr-text-muted)', marginTop: 24, fontWeight: 500 }}>
          © {new Date().getFullYear()} Redeemer's University — Department of Physical Planning & Works
        </p>
      </div>
    </div>
  );
}
