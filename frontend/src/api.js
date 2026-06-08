const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ── Auth ──────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data; // { token, email, role, expiresAt }
}

export async function register(payload) {
  // payload: { name, email, password, matricNumber }
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function registerStaff(payload, token) {
  // payload: { name, email, password, role (1=Technician, 2=Admin) }
  const res = await fetch(`${API_BASE}/auth/register-staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Staff registration failed');
  return data;
}

// ── Tickets ───────────────────────────────────────────────────────────
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function getTickets(token) {
  const res = await fetch(`${API_BASE}/tickets`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tickets');
  return data;
}

export async function getTicketById(id, token) {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch ticket');
  return data;
}

export async function createTicket(formData, token) {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData, // multipart/form-data
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create ticket');
  return data;
}

export async function assignTicket(ticketId, technicianId, token) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/assign`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ technicianId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to assign ticket');
  return data;
}

export async function resolveTicket(ticketId, token) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ status: 'Resolved' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to resolve ticket');
  return data;
}

export async function getTechnicians(token) {
  const res = await fetch(`${API_BASE}/auth/technicians`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch technicians');
  return data;
}
