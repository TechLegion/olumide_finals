import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const { addToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast({ type: 'info', title: 'Logged out', message: 'You have been signed out.' });
  };

  const roleColors = {
    Admin: { bg: 'var(--clr-brand-light)', color: 'var(--clr-brand-primary)', border: 'var(--clr-brand-primary)' },
    Student: { bg: 'var(--clr-gold-light)', color: 'var(--clr-brand-secondary)', border: 'var(--clr-brand-secondary)' },
    Technician: { bg: '#ecfdf5', color: '#16a34a', border: '#16a34a' },
  };
  const roleStyle = roleColors[auth?.role] || roleColors.Student;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 'var(--nav-height)', zIndex: 900,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1.5px solid var(--clr-border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: '16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--border-radius-sm)',
          background: 'var(--clr-brand-primary)',
          border: '1.5px solid var(--clr-brand-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, color: 'var(--clr-brand-secondary)',
        }}>
          RU
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--clr-brand-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Campus<span style={{ color: 'var(--clr-brand-secondary)' }}>CMMS</span>
          </div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: 'var(--clr-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Works & Maintenance
          </div>
        </div>
      </div>

      {/* Right side */}
      {auth && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* User button */}
          <div style={{ position: 'relative' }}>
            <button
              id="nav-user-menu"
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--clr-surface)', padding: '6px 14px 6px 8px',
                borderRadius: 'var(--border-radius-md)',
                border: '1.5px solid var(--clr-border)',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--clr-brand-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: 'white',
              }}>
                {auth.email?.[0]?.toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-brand-primary)', lineHeight: 1 }}>
                  {auth.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-secondary)', marginTop: 3 }}>
                  {auth.role}
                </div>
              </div>
              <span style={{ color: 'var(--clr-text-muted)', fontSize: 10, marginLeft: 4 }}>▼</span>
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--clr-surface)',
                border: '1.5px solid var(--clr-border)',
                borderRadius: 'var(--border-radius-md)',
                minWidth: 220, padding: '8px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 999,
                animation: 'fadeIn 0.15s ease',
              }}>
                <div style={{
                  padding: '10px 12px', borderBottom: '1.5px solid var(--clr-surface-2)',
                  marginBottom: 8,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 2 }}>Signed in as</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--clr-text-primary)', wordBreak: 'break-all' }}>{auth.email}</div>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 'var(--border-radius-sm)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--clr-error)', fontSize: 13.5, fontWeight: 700,
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for dropdown */}
      {dropdownOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 998 }}
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
