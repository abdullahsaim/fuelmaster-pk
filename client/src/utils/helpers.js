export const PKR = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
export const today = () => new Date().toISOString().slice(0, 10);
