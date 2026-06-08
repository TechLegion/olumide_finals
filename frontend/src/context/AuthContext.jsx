import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem('cms_auth');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((data) => {
    // data: { token, email, role, expiresAt }
    setAuth(data);
    localStorage.setItem('cms_auth', JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem('cms_auth');
  }, []);

  const isStudent    = auth?.role === 'Student';
  const isAdmin      = auth?.role === 'Admin';
  const isTechnician = auth?.role === 'Technician';

  return (
    <AuthContext.Provider value={{ auth, login, logout, isStudent, isAdmin, isTechnician }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
