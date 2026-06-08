export function StatusBadge({ status }) {
  const map = {
    Pending:  { cls: 'badge badge-pending',  label: 'Pending' },
    Assigned: { cls: 'badge badge-assigned', label: 'Assigned' },
    Resolved: { cls: 'badge badge-resolved', label: 'Resolved' },
    Closed:   { cls: 'badge badge-closed',   label: 'Closed' },
  };
  const { cls, label } = map[status] || { cls: 'badge badge-closed', label: status };
  return (
    <span className={cls}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const map = {
    Plumbing:   { color: '#0284c7' },
    Electrical: { color: '#d97706' },
    Carpentry:  { color: '#7c3aed' },
  };
  const { color } = map[category] || { color: '#6b7280' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px',
      borderRadius: 'var(--border-radius-full)',
      background: `${color}10`,
      color, fontSize: 12, fontWeight: 700,
      border: `1px solid ${color}20`,
    }}>
      {category}
    </span>
  );
}
