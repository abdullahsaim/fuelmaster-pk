import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { dashboardAPI, salesAPI, purchasesAPI, suppliersAPI, customersAPI, employeesAPI, expensesAPI, payrollAPI, tanksAPI, nozzlesAPI, productsAPI, fuelTypesAPI, settingsAPI, readingsAPI, dipsAPI, creditPaymentsAPI, supplierPaymentsAPI, pumpsAPI, historyAPI, reportsAPI, cashClosingAPI, shiftHandoverAPI, attendanceAPI, tankTransferAPI, checklistAPI, subscriptionAPI, adminAPI, authAPI } from './utils/api.js';
import { PKR, fmtDate, daysAgo, today } from './utils/helpers.js';

// ─── ICONS (inline SVG) ───
const I = {
  fuel: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 22V5a2 2 0 012-2h8a2 2 0 012 2v17"/><path d="M15 10h2a2 2 0 012 2v3a2 2 0 002 2 2 2 0 002-2V8l-4-4"/><rect x="5" y="7" width="8" height="5" rx="1"/></svg>,
  dash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  dollar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  cart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>,
  box: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  truck: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  card: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>,
  receipt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  gauge: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 14l4-4"/><path d="M3.5 13.5a9 9 0 1 1 17 0"/></svg>,
  drop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  history: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
  pump: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3" width="10" height="18" rx="1"/><path d="M14 8h3l3 3v8a2 2 0 0 1-4 0v-7"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  wallet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="16" cy="14" r="1.5"/></svg>,
  money: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  swap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  clipboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  handshake: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>,
  target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

// ─── SHARED UI ───
const Badge = ({ text, color }) => <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:`${color}20`, color }}>{text}</span>;

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background:'#141820', borderRadius:14, padding:'20px 22px', border:'1px solid #1e2533', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:-10, right:-10, width:80, height:80, borderRadius:'50%', background:`${color}10` }}/>
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
      <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', color }}><div style={{ width:20, height:20 }}>{icon}</div></div>
      <span style={{ fontSize:12, color:'#8892a4', letterSpacing:0.5, textTransform:'uppercase', fontWeight:600 }}>{label}</span>
    </div>
    <div style={{ fontSize:24, fontWeight:700, color:'#e2e8f0', fontFamily:"'JetBrains Mono',monospace" }}>{value}</div>
  </div>
);

const DataTable = ({ columns, data }) => (
  <div style={{ overflowX:'auto', borderRadius:12, border:'1px solid #1e2533' }}>
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
      <thead><tr style={{ background:'#141820' }}>
        {columns.map((c,i) => <th key={i} style={{ padding:'12px 16px', textAlign:c.align||'left', color:'#8892a4', fontWeight:600, fontSize:11, textTransform:'uppercase', letterSpacing:0.5, borderBottom:'1px solid #1e2533', whiteSpace:'nowrap' }}>{c.label}</th>)}
      </tr></thead>
      <tbody>
        {data.map((row,ri) => <tr key={row._id||ri} style={{ background:ri%2===0?'#0c0f14':'#141820' }}>
          {columns.map((c,ci) => <td key={ci} style={{ padding:'11px 16px', color:'#e2e8f0', borderBottom:'1px solid #1e2533', textAlign:c.align||'left', whiteSpace:'nowrap' }}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
        </tr>)}
        {!data.length && <tr><td colSpan={columns.length} style={{ padding:40, textAlign:'center', color:'#4a5568' }}>No data found</td></tr>}
      </tbody>
    </table>
  </div>
);

const TankGauge = ({ tank }) => {
  const f = tank.fuelType || {};
  const pct = tank.capacity > 0 ? Math.round((tank.currentStock / tank.capacity) * 100) : 0;
  const col = pct > 60 ? '#10b981' : pct > 30 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ background:'#141820', borderRadius:14, padding:20, border:'1px solid #1e2533' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div><div style={{ fontWeight:700, color:'#e2e8f0', fontSize:14 }}>{tank.name}</div><div style={{ fontSize:11, color:'#8892a4', marginTop:2 }}>{f.name||''}</div></div>
        <Badge text={`${pct}%`} color={col}/>
      </div>
      <div style={{ background:'#0c0f14', borderRadius:8, height:18, overflow:'hidden' }}><div style={{ width:`${pct}%`, height:'100%', background:`linear-gradient(90deg, ${col}cc, ${col})`, borderRadius:8, transition:'width 0.8s ease' }}/></div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:11, color:'#8892a4' }}><span>{tank.currentStock?.toLocaleString()} {f.unit||'Ltr'}</span><span>/ {tank.capacity?.toLocaleString()}</span></div>
    </div>
  );
};

const Loader = () => <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:60 }}><div style={{ width:40, height:40, border:'3px solid #1e2533', borderTop:'3px solid #10b981', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><p style={{ marginTop:16, fontSize:13, color:'#8892a4' }}>Loading...</p></div>;

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }} onClick={onClose}>
    <div style={{ background:'#141820', borderRadius:16, border:'1px solid #1e2533', width:'100%', maxWidth:560, maxHeight:'85vh', overflow:'auto' }} onClick={e=>e.stopPropagation()}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid #1e2533' }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0', margin:0 }}>{title}</h3>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#8892a4', cursor:'pointer' }}><div style={{ width:20, height:20 }}>{I.x}</div></button>
      </div>
      <div style={{ padding:24 }}>{children}</div>
    </div>
  </div>;
};

const Btn = ({ children, onClick, variant='primary', icon, type='button' }) => {
  const bg = variant==='primary'?'#10b981':variant==='danger'?'#ef4444':'transparent';
  return <button type={type} onClick={onClick} style={{ padding:'10px 20px', background:bg, color:'#fff', borderRadius:8, border:variant==='ghost'?'1px solid #1e2533':'none', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
    {icon && <div style={{ width:16, height:16 }}>{icon}</div>}{children}
  </button>;
};

const Input = ({ label, value, onChange, type='text', placeholder, required }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%' }}>
    {label && <label style={{ fontSize:11, fontWeight:600, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5 }}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} style={{ padding:'10px 14px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:8, color:'#e2e8f0', fontSize:13, outline:'none', width:'100%', boxSizing:'border-box' }}/>
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    {label && <label style={{ fontSize:11, fontWeight:600, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5 }}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ padding:'10px 14px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:8, color:'#e2e8f0', fontSize:13, outline:'none' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── LANDING PAGE ─────────────────────────────────────────────
const LandingPage = ({ onLogin, onDemo, onRegister }) => {
  const features = [
    { icon: I.dollar,  title: 'Sales & Cash Management', desc: 'Cash & credit sale entry with auto-calculated rates, customer balances, and shift tracking.', color: '#10b981' },
    { icon: I.cart,    title: 'Tanker / Purchase Receipts', desc: 'Record fuel purchases with tanker number, driver, ordered vs received, shortage tracking.', color: '#3b82f6' },
    { icon: I.gauge,   title: 'Shift Meter Readings', desc: 'Per-nozzle opening/closing readings with automatic dispensed calculation and short/excess.', color: '#8b5cf6' },
    { icon: I.drop,    title: 'Tank Dip & Stock Variance', desc: 'Physical-stock dipping with book comparison, gain/loss tracking, and water level monitoring.', color: '#06b6d4' },
    { icon: I.box,     title: 'Stock Management', desc: 'Live tank gauges, valuations, low-stock alerts, and full stock movement audit trail.', color: '#f59e0b' },
    { icon: I.pump,    title: 'Pumps, Nozzles & Tanks', desc: 'Manage your forecourt: define pumps, nozzles, and tanks with status monitoring.', color: '#ec4899' },
    { icon: I.users,   title: 'Credit Customers', desc: 'Fleet/corporate customers with credit limits, aging buckets, and payment collection.', color: '#fb923c' },
    { icon: I.truck,   title: 'Suppliers & Payables', desc: 'Track supplier balances, record payments, and view full supplier statements.', color: '#06b6d4' },
    { icon: I.user,    title: 'Employees & Payroll', desc: 'Staff records by role and shift with monthly payroll generation.', color: '#8b5cf6' },
    { icon: I.receipt, title: 'Expense Tracking', desc: 'Daily operating expenses by category with payment-method breakdown.', color: '#ef4444' },
    { icon: I.chart,   title: '13+ Built-in Reports', desc: 'P&L, day summary, sales, purchases, stock, fuel profitability, credit aging & more.', color: '#10b981' },
    { icon: I.history, title: 'Activity History', desc: 'Unified audit trail of every sale, purchase, reading, dip, and payment.', color: '#3b82f6' },
  ];

  const stats = [
    { value: '13+', label: 'Report Types' },
    { value: '24',  label: 'Modules' },
    { value: '100%',label: 'Pakistan-Ready' },
    { value: 'PKR', label: 'OGRA Rates' },
  ];

  const card = (bg='#141820', border='#1e2533') => ({
    background: bg, borderRadius: 16, border: `1px solid ${border}`,
  });

  return (
    <div style={{ minHeight:'100vh', background:'#0c0f14', fontFamily:"'Outfit',-apple-system,sans-serif", color:'#e2e8f0' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>

      {/* ── NAVBAR ── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, padding:'18px 6vw', background:'rgba(10,13,18,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid #1e2533', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(16,185,129,0.3)' }}>
            <div style={{ width:24, height:24, color:'#fff' }}>{I.fuel}</div>
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, letterSpacing:-0.3 }}>FuelMaster</div>
            <div style={{ fontSize:9, color:'#10b981', fontWeight:700, textTransform:'uppercase', letterSpacing:2 }}>PK Edition</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onDemo} style={{ padding:'10px 20px', background:'transparent', color:'#e2e8f0', border:'1px solid #1e2533', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer' }}>Try Demo</button>
          <button onClick={onLogin} style={{ padding:'10px 22px', background:'transparent', color:'#e2e8f0', border:'1px solid #1e2533', borderRadius:10, fontWeight:600, fontSize:13, cursor:'pointer' }}>Sign In</button>
          <button onClick={onRegister} style={{ padding:'10px 22px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 6px 16px rgba(16,185,129,0.3)' }}>Start Free Trial</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding:'80px 6vw 60px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-200, right:-200, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.15), transparent 60%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-150, left:-150, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.1), transparent 60%)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:48, alignItems:'center', position:'relative' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 14px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:30, marginBottom:24 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 12px #10b981', animation:'pulse 2s infinite' }}/>
              <span style={{ fontSize:12, color:'#10b981', fontWeight:600 }}>v3.0 — Now with 13+ Reports</span>
            </div>

            <h1 style={{ fontSize:'clamp(36px, 5vw, 60px)', fontWeight:900, lineHeight:1.05, margin:'0 0 22px', letterSpacing:-1.5 }}>
              Run your <span style={{ background:'linear-gradient(135deg,#10b981,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>petrol pump</span><br/>
              like a Fortune 500.
            </h1>

            <p style={{ fontSize:17, color:'#8892a4', lineHeight:1.6, margin:'0 0 32px', maxWidth:540 }}>
              Complete filling station management software built for Pakistani fuel dealers. Track sales, purchases, shift readings, stock, credit customers, and generate 13+ reports — all in one place.
            </p>

            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:36 }}>
              <button onClick={onDemo} style={{ padding:'15px 32px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 12px 30px rgba(16,185,129,0.35)', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:18, height:18 }}>{I.fuel}</div>
                Try Live Demo
              </button>
              <button onClick={onLogin} style={{ padding:'15px 32px', background:'transparent', color:'#e2e8f0', border:'1px solid #1e2533', borderRadius:12, fontWeight:700, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                Sign In to Account
                <span style={{ fontSize:18 }}>→</span>
              </button>
            </div>

            <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
              {stats.map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize:28, fontWeight:800, color:'#10b981', fontFamily:"'JetBrains Mono',monospace" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#8892a4', textTransform:'uppercase', letterSpacing:1, fontWeight:600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual — mock dashboard preview */}
          <div style={{ ...card(), padding:24, position:'relative', boxShadow:'0 30px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#ef4444' }}/>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#f59e0b' }}/>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#10b981' }}/>
              <div style={{ marginLeft:10, fontSize:11, color:'#8892a4' }}>fuelmaster.pk / dashboard</div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { l:'Today Revenue', v:'Rs. 1,84,500', c:'#10b981' },
                { l:'Volume',        v:'2,340 L',     c:'#3b82f6' },
                { l:'Credit',        v:'Rs. 56,200',  c:'#f59e0b' },
                { l:'Expenses',      v:'Rs. 12,800',  c:'#ef4444' },
              ].map((s, i) => (
                <div key={i} style={{ background:'#0c0f14', borderRadius:10, padding:12, border:'1px solid #1e2533' }}>
                  <div style={{ fontSize:9, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5, fontWeight:600 }}>{s.l}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:s.c, marginTop:4, fontFamily:"'JetBrains Mono',monospace" }}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{ background:'#0c0f14', borderRadius:10, padding:14, border:'1px solid #1e2533', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, color:'#e2e8f0', fontWeight:600 }}>Tank A · Petrol</span>
                <span style={{ fontSize:11, color:'#10b981', fontWeight:700 }}>78%</span>
              </div>
              <div style={{ height:8, background:'#1e2533', borderRadius:6 }}>
                <div style={{ width:'78%', height:'100%', background:'linear-gradient(90deg,#10b981cc,#10b981)', borderRadius:6 }}/>
              </div>
            </div>
            <div style={{ background:'#0c0f14', borderRadius:10, padding:14, border:'1px solid #1e2533' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, color:'#e2e8f0', fontWeight:600 }}>Tank B · Diesel</span>
                <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>42%</span>
              </div>
              <div style={{ height:8, background:'#1e2533', borderRadius:6 }}>
                <div style={{ width:'42%', height:'100%', background:'linear-gradient(90deg,#f59e0bcc,#f59e0b)', borderRadius:6 }}/>
              </div>
            </div>
          </div>
        </div>

        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding:'70px 6vw', borderTop:'1px solid #1e2533', background:'#0a0d12' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:50 }}>
            <div style={{ fontSize:11, color:'#10b981', fontWeight:700, textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>Everything You Need</div>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, margin:'0 0 14px', letterSpacing:-0.8 }}>Built for the way pumps actually work</h2>
            <p style={{ fontSize:15, color:'#8892a4', maxWidth:620, margin:'0 auto' }}>From shift readings to OGRA rate updates — every workflow a Pakistani filling station owner deals with daily.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:18 }}>
            {features.map((f, i) => (
              <div key={i} style={{ ...card(), padding:24, transition:'transform 0.2s, border-color 0.2s', cursor:'default' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=`${f.color}50`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='#1e2533'; }}>
                <div style={{ width:46, height:46, borderRadius:12, background:`${f.color}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                  <div style={{ width:24, height:24, color:f.color }}>{f.icon}</div>
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, margin:'0 0 8px', color:'#e2e8f0' }}>{f.title}</h3>
                <p style={{ fontSize:13, color:'#8892a4', margin:0, lineHeight:1.55 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REPORTS BANNER ── */}
      <section style={{ padding:'70px 6vw' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', ...card('#141820'), padding:48, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-100, right:-100, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.15),transparent 70%)' }}/>
          <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, color:'#10b981', fontWeight:700, textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>Powerful Reporting</div>
              <h2 style={{ fontSize:32, fontWeight:800, margin:'0 0 14px', letterSpacing:-0.5 }}>13+ reports out of the box</h2>
              <p style={{ fontSize:14, color:'#8892a4', lineHeight:1.6, margin:'0 0 22px' }}>
                Profit & Loss, Day Summary, Sales by Fuel, Purchase by Supplier, Stock Valuation, Fuel Profitability, Credit Aging, Customer & Supplier Statements, Tank Variance, Shift Reconciliation and more — all exportable to CSV.
              </p>
              <button onClick={onDemo} style={{ padding:'12px 24px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>See Reports in Demo →</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {['P&L','Sales','Purchases','Day Summary','Shift','Stock','Expenses','Fuel Profit','Credit Aging','Variance','Monthly','Statements'].map((r,i)=>(
                <div key={r} style={{ padding:'10px 14px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:8, fontSize:12, fontWeight:600, color:i%3===0?'#10b981':i%3===1?'#3b82f6':'#8b5cf6' }}>{r}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:'80px 6vw' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, color:'#10b981', fontWeight:700, textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>Pricing Plans</div>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, margin:'0 0 12px', letterSpacing:-0.8 }}>Simple, transparent pricing</h2>
            <p style={{ fontSize:15, color:'#8892a4', margin:0 }}>Start free, upgrade as you grow. All plans include 14-day free trial.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
            {[
              { name:'Free', price:'0', desc:'For small stations getting started', color:'#8892a4', features:['2 Users','2 Tanks, 4 Nozzles','Sales & Purchases','Basic Dashboard','P&L Report'] },
              { name:'Starter', price:'2,999', desc:'For growing stations with basic team', color:'#3b82f6', features:['5 Users','4 Tanks, 8 Nozzles','Readings & Dips','Credit Management','7 Reports','Quick Sale POS'] },
              { name:'Professional', price:'5,999', desc:'Full features for professional stations', color:'#10b981', popular:true, features:['15 Users','10 Tanks, 20 Nozzles','All 24 Modules','Payroll & Attendance','Shift Handover','11 Reports','Tank Transfer'] },
              { name:'Enterprise', price:'9,999', desc:'Unlimited for chains & multi-site', color:'#8b5cf6', features:['Unlimited Users','Unlimited Resources','All Features','All Reports','Priority Support','Custom Branding'] },
            ].map(plan=>(
              <div key={plan.name} style={{ ...card(plan.popular?'#10b98110':'#141820', plan.popular?'#10b98140':'#1e2533'), padding:32, position:'relative', display:'flex', flexDirection:'column' }}>
                {plan.popular && <div style={{ position:'absolute', top:-1, left:'50%', transform:'translateX(-50%)', padding:'4px 16px', background:'#10b981', borderRadius:'0 0 8px 8px', fontSize:10, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:1 }}>Most Popular</div>}
                <div style={{ fontSize:11, color:plan.color, fontWeight:700, textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 }}>{plan.name}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:8 }}>
                  <span style={{ fontSize:11, color:'#8892a4' }}>PKR</span>
                  <span style={{ fontSize:36, fontWeight:800, color:'#e2e8f0', fontFamily:"'JetBrains Mono',monospace" }}>{plan.price}</span>
                  {plan.price !== '0' && <span style={{ fontSize:12, color:'#8892a4' }}>/month</span>}
                </div>
                <p style={{ fontSize:12, color:'#8892a4', margin:'0 0 20px', lineHeight:1.5 }}>{plan.desc}</p>
                <div style={{ flex:1 }}>
                  {plan.features.map(f=><div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, fontSize:13, color:'#c8d0dc' }}>
                    <div style={{ width:14, height:14, color:'#10b981', flexShrink:0 }}>{I.check}</div>{f}
                  </div>)}
                </div>
                <button onClick={onRegister} style={{ marginTop:20, width:'100%', padding:12, background:plan.popular?'linear-gradient(135deg,#10b981,#059669)':`${plan.color}15`, color:plan.popular?'#fff':plan.color, border:plan.popular?'none':`1px solid ${plan.color}35`, borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  {plan.price==='0'?'Get Started Free':'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'60px 6vw 80px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center', ...card(), padding:60, background:'linear-gradient(135deg,#141820,#0c0f14)' }}>
          <h2 style={{ fontSize:'clamp(26px,4vw,38px)', fontWeight:800, margin:'0 0 14px', letterSpacing:-0.8 }}>Ready to digitize your filling station?</h2>
          <p style={{ fontSize:15, color:'#8892a4', margin:'0 0 28px' }}>Start your 14-day free trial or try the live demo with sample data.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={onRegister} style={{ padding:'15px 32px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:12, fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 12px 30px rgba(16,185,129,0.3)' }}>Start Free Trial</button>
            <button onClick={onDemo} style={{ padding:'15px 32px', background:'transparent', color:'#e2e8f0', border:'1px solid #1e2533', borderRadius:12, fontWeight:700, fontSize:15, cursor:'pointer' }}>Launch Live Demo</button>
            <button onClick={onLogin} style={{ padding:'15px 32px', background:'transparent', color:'#8892a4', border:'1px solid #1e2533', borderRadius:12, fontWeight:600, fontSize:15, cursor:'pointer' }}>Sign In</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:'30px 6vw', borderTop:'1px solid #1e2533', background:'#0a0d12', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:18, height:18, color:'#fff' }}>{I.fuel}</div>
          </div>
          <span style={{ fontSize:13, color:'#8892a4' }}>FuelMaster PK · v3.0</span>
        </div>
        <div style={{ fontSize:12, color:'#4a5568' }}>© {new Date().getFullYear()} FuelMaster. Built for Pakistani filling stations.</div>
      </footer>
    </div>
  );
};

// ─── LOGIN PAGE ───
const LoginPage = ({ onBack, onRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    setLoading(false);
  };

  const quick = async (role) => {
    const c = { owner:['owner@fuelmaster.pk','admin123'], manager:['manager@fuelmaster.pk','manager123'], cashier:['cashier@fuelmaster.pk','cashier123'] };
    setEmail(c[role][0]); setPassword(c[role][1]); setLoading(true); setError('');
    try { await login(c[role][0], c[role][1]); } catch(e) { setError(e.response?.data?.message||'Failed'); }
    setLoading(false);
  };

  return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0c0f14,#1a1f2a,#0c0f14)', fontFamily:"'Outfit',sans-serif", position:'relative' }}>
    {onBack && <button onClick={onBack} style={{ position:'absolute', top:24, left:24, padding:'8px 16px', background:'transparent', color:'#8892a4', border:'1px solid #1e2533', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>← Back to Home</button>}
    <div style={{ width:420, padding:40, background:'#141820', borderRadius:20, border:'1px solid #1e2533' }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ width:64, height:64, borderRadius:16, margin:'0 auto 16px', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:32, height:32, color:'#fff' }}>{I.fuel}</div></div>
        <h1 style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', margin:0 }}>FuelMaster PK</h1>
        <p style={{ fontSize:12, color:'#10b981', fontWeight:600, textTransform:'uppercase', letterSpacing:2, marginTop:4 }}>Filling Station Management</p>
      </div>
      {error && <div style={{ padding:'10px 14px', background:'#ef444420', borderRadius:10, marginBottom:16, border:'1px solid #ef444440', color:'#ef4444', fontSize:13 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom:16 }}><Input label="Email" value={email} onChange={setEmail} type="email" placeholder="owner@fuelmaster.pk" required/></div>
        <div style={{ marginBottom:24 }}><Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••" required/></div>
        <button type="submit" disabled={loading} style={{ width:'100%', padding:14, background:'#10b981', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer' }}>{loading?'Signing in...':'Sign In'}</button>
      </form>
      <div style={{ marginTop:24, paddingTop:16, borderTop:'1px solid #1e2533' }}>
        <p style={{ fontSize:11, color:'#4a5568', textAlign:'center', marginBottom:12 }}>Quick Login (Demo)</p>
        <div style={{ display:'flex', gap:8 }}>
          {[['owner','Owner','#10b981'],['manager','Manager','#3b82f6'],['cashier','Cashier','#f59e0b']].map(([r,l,c])=>
            <button key={r} onClick={()=>quick(r)} style={{ flex:1, padding:8, background:`${c}15`, border:`1px solid ${c}30`, borderRadius:8, color:c, fontSize:12, fontWeight:600, cursor:'pointer' }}>{l}</button>
          )}
        </div>
      </div>
      {onRegister && <div style={{ marginTop:20, textAlign:'center' }}>
        <span style={{ fontSize:12, color:'#8892a4' }}>Don't have an account? </span>
        <button onClick={onRegister} style={{ background:'none', border:'none', color:'#10b981', fontSize:12, fontWeight:700, cursor:'pointer', textDecoration:'underline' }}>Register your station</button>
      </div>}
    </div>
  </div>;
};

// ─── REGISTER PAGE ───
const RegisterPage = ({ onBack }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', stationName:'', city:'', brand:'Other' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form); toast.success('Station registered! Welcome to FuelMaster.'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    setLoading(false);
  };

  return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0c0f14,#1a1f2a,#0c0f14)', fontFamily:"'Outfit',sans-serif", padding:20 }}>
    <button onClick={onBack} style={{ position:'absolute', top:24, left:24, padding:'8px 16px', background:'transparent', color:'#8892a4', border:'1px solid #1e2533', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer' }}>← Back to Home</button>
    <div style={{ width:480, padding:40, background:'#141820', borderRadius:20, border:'1px solid #1e2533' }}>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ width:56, height:56, borderRadius:14, margin:'0 auto 14px', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:28, height:28, color:'#fff' }}>{I.fuel}</div></div>
        <h1 style={{ fontSize:22, fontWeight:800, color:'#e2e8f0', margin:'0 0 4px' }}>Register Your Station</h1>
        <p style={{ fontSize:12, color:'#10b981', fontWeight:600, margin:0 }}>14-day free trial • No credit card required</p>
      </div>
      {error && <div style={{ padding:'10px 14px', background:'#ef444420', borderRadius:10, marginBottom:16, border:'1px solid #ef444440', color:'#ef4444', fontSize:13 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <Input label="Your Name" value={form.name} onChange={v=>set('name',v)} required placeholder="Muhammad Ali"/>
          <Input label="Phone" value={form.phone} onChange={v=>set('phone',v)} placeholder="03001234567"/>
        </div>
        <div style={{ marginBottom:14 }}><Input label="Email" value={form.email} onChange={v=>set('email',v)} type="email" required placeholder="you@example.com"/></div>
        <div style={{ marginBottom:14 }}><Input label="Password" value={form.password} onChange={v=>set('password',v)} type="password" required placeholder="Min 6 characters"/></div>
        <div style={{ marginBottom:14 }}><Input label="Station Name" value={form.stationName} onChange={v=>set('stationName',v)} required placeholder="Al-Madina Filling Station"/></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
          <Input label="City" value={form.city} onChange={v=>set('city',v)} placeholder="Lahore"/>
          <Select label="Brand" value={form.brand} onChange={v=>set('brand',v)} options={[{value:'PSO',label:'PSO'},{value:'Shell',label:'Shell'},{value:'Total',label:'Total'},{value:'Attock',label:'Attock'},{value:'Hascol',label:'Hascol'},{value:'GO',label:'GO'},{value:'Byco',label:'Byco'},{value:'Other',label:'Other'}]}/>
        </div>
        <button type="submit" disabled={loading} style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer' }}>{loading?'Creating your station...':'Start Free Trial'}</button>
      </form>
      <div style={{ marginTop:16, textAlign:'center' }}>
        <span style={{ fontSize:12, color:'#8892a4' }}>Already have an account? </span>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'#10b981', fontSize:12, fontWeight:700, cursor:'pointer', textDecoration:'underline' }}>Sign In</button>
      </div>
    </div>
  </div>;
};

// ─── SUPER ADMIN PANEL ───
const AdminPanel = () => {
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => { adminAPI.getTenants({ search }).then(r => { setTenants(r.data.data); setStats(r.data.stats || {}); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, [search]);

  const updateTenant = async (id, data) => {
    try { await adminAPI.updateTenant(id, data); toast.success('Tenant updated'); load(); setShowModal(false); }
    catch(e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Loader/>;
  const planColors = { free:'#8892a4', starter:'#3b82f6', professional:'#10b981', enterprise:'#8b5cf6' };
  const statusColors = { trial:'#f59e0b', active:'#10b981', past_due:'#ef4444', cancelled:'#8892a4', expired:'#ef4444' };

  return <div>
    <h1 style={{ fontSize:28, fontWeight:800, color:'#e2e8f0', margin:'0 0 4px' }}>Admin Panel</h1>
    <p style={{ color:'#8892a4', fontSize:13, margin:'0 0 24px' }}>Manage all tenants and subscriptions</p>

    {/* Stats */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:24 }}>
      <StatCard icon={I.users} label="Total Tenants" value={stats.total || 0} color="#3b82f6"/>
      <StatCard icon={I.check} label="Active" value={stats.activeCount || 0} color="#10b981"/>
      <StatCard icon={I.clock} label="On Trial" value={stats.byStatus?.trial || 0} color="#f59e0b"/>
      <StatCard icon={I.warn} label="Expired" value={(stats.byStatus?.expired || 0) + (stats.byStatus?.past_due || 0)} color="#ef4444"/>
    </div>

    {/* Search */}
    <div style={{ marginBottom:20 }}>
      <Input placeholder="Search tenants by name, city, email..." value={search} onChange={setSearch}/>
    </div>

    {/* Tenants Table */}
    <DataTable columns={[
      { key:'name', label:'Station', render:(v,r)=><div><div style={{ fontWeight:600 }}>{r.name}</div><div style={{ fontSize:11, color:'#8892a4' }}>{r.city || '—'} · {r.brand || '—'}</div></div> },
      { key:'owner', label:'Owner', render:(v)=>v?.name || '—' },
      { key:'plan', label:'Plan', render:(v)=><Badge text={v} color={planColors[v]||'#8892a4'}/> },
      { key:'subscriptionStatus', label:'Status', render:(v)=><Badge text={v} color={statusColors[v]||'#8892a4'}/> },
      { key:'userCount', label:'Users', align:'center' },
      { key:'createdAt', label:'Created', render:(v)=>v?new Date(v).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'2-digit'}):'—' },
      { key:'_id', label:'Actions', render:(v,r)=><div style={{ display:'flex', gap:6 }}>
        <button onClick={()=>{setSelected(r);setShowModal(true);}} style={{ padding:'4px 10px', background:'#3b82f615', border:'1px solid #3b82f630', borderRadius:6, color:'#3b82f6', fontSize:11, fontWeight:600, cursor:'pointer' }}>Manage</button>
      </div> },
    ]} data={tenants}/>

    {/* Manage Tenant Modal */}
    <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title={`Manage: ${selected?.name || ''}`}>
      {selected && <div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          <div><div style={{ fontSize:11, color:'#8892a4', marginBottom:4 }}>Current Plan</div><Badge text={selected.plan} color={planColors[selected.plan]}/></div>
          <div><div style={{ fontSize:11, color:'#8892a4', marginBottom:4 }}>Status</div><Badge text={selected.subscriptionStatus} color={statusColors[selected.subscriptionStatus]}/></div>
          <div><div style={{ fontSize:11, color:'#8892a4', marginBottom:4 }}>Users</div><span style={{ color:'#e2e8f0', fontSize:14, fontWeight:600 }}>{selected.userCount || 0}</span></div>
          <div><div style={{ fontSize:11, color:'#8892a4', marginBottom:4 }}>Owner</div><span style={{ color:'#e2e8f0', fontSize:13 }}>{selected.owner?.name || '—'}</span></div>
        </div>
        <div style={{ borderTop:'1px solid #1e2533', paddingTop:16, display:'flex', flexDirection:'column', gap:12 }}>
          <Select label="Change Plan" value={selected.plan} onChange={v=>updateTenant(selected._id,{plan:v})} options={[{value:'free',label:'Free'},{value:'starter',label:'Starter'},{value:'professional',label:'Professional'},{value:'enterprise',label:'Enterprise'}]}/>
          <Select label="Subscription Status" value={selected.subscriptionStatus} onChange={v=>updateTenant(selected._id,{subscriptionStatus:v})} options={[{value:'trial',label:'Trial'},{value:'active',label:'Active'},{value:'past_due',label:'Past Due'},{value:'cancelled',label:'Cancelled'},{value:'expired',label:'Expired'}]}/>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>updateTenant(selected._id,{isActive:!selected.isActive})} style={{ flex:1, padding:10, background:selected.isActive?'#ef444415':'#10b98115', border:`1px solid ${selected.isActive?'#ef444435':'#10b98135'}`, borderRadius:8, color:selected.isActive?'#ef4444':'#10b981', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              {selected.isActive?'Deactivate':'Activate'}
            </button>
          </div>
        </div>
      </div>}
    </Modal>
  </div>;
};

// ─── SUBSCRIPTION PAGE (for tenant owners) ───
const SubscriptionPage = () => {
  const { tenant } = useAuth();
  const [sub, setSub] = useState(null);
  const [packages, setPackages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name:'', email:'', password:'', role:'cashier', phone:'' });

  useEffect(() => {
    Promise.all([subscriptionAPI.getMy(), authAPI.getUsers()])
      .then(([s, u]) => { setSub(s.data.data); setPackages(s.data.data.packages); setUsers(u.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addUser = async (e) => {
    e.preventDefault();
    try { await authAPI.addUser(newUser); toast.success('User added'); setShowAddUser(false); setNewUser({ name:'',email:'',password:'',role:'cashier',phone:'' });
      authAPI.getUsers().then(r=>setUsers(r.data.data||[]));
    } catch(err) { toast.error(err.response?.data?.message||'Failed to add user'); }
  };

  const toggleUser = async (id, isActive) => {
    try { await authAPI.updateUser(id, { isActive: !isActive }); toast.success('User updated');
      authAPI.getUsers().then(r=>setUsers(r.data.data||[]));
    } catch(err) { toast.error('Failed'); }
  };

  if (loading) return <Loader/>;
  const t = sub?.tenant || {};
  const pkg = packages?.[t.plan] || {};
  const planColors = { free:'#8892a4', starter:'#3b82f6', professional:'#10b981', enterprise:'#8b5cf6' };
  const statusColors = { trial:'#f59e0b', active:'#10b981', past_due:'#ef4444', cancelled:'#8892a4', expired:'#ef4444' };

  return <div>
    <h1 style={{ fontSize:28, fontWeight:800, color:'#e2e8f0', margin:'0 0 4px' }}>Subscription & Team</h1>
    <p style={{ color:'#8892a4', fontSize:13, margin:'0 0 24px' }}>Manage your plan, station profile, and team members</p>

    {/* Plan Overview */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:11, color:'#8892a4', marginBottom:8, textTransform:'uppercase', fontWeight:600, letterSpacing:0.5 }}>Current Plan</div>
        <Badge text={t.plan?.toUpperCase() || 'FREE'} color={planColors[t.plan]||'#8892a4'}/>
        <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', marginTop:10, fontFamily:"'JetBrains Mono',monospace" }}>PKR {(pkg.price||0).toLocaleString()}<span style={{ fontSize:12, color:'#8892a4', fontWeight:400 }}>/mo</span></div>
      </div>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:11, color:'#8892a4', marginBottom:8, textTransform:'uppercase', fontWeight:600, letterSpacing:0.5 }}>Status</div>
        <Badge text={t.subscriptionStatus||'trial'} color={statusColors[t.subscriptionStatus]||'#f59e0b'}/>
        {t.subscriptionStatus === 'trial' && t.trialEndsAt && <div style={{ fontSize:12, color:'#f59e0b', marginTop:10 }}>Trial ends: {new Date(t.trialEndsAt).toLocaleDateString('en-PK')}</div>}
        {t.subscriptionEndDate && t.subscriptionStatus !== 'trial' && <div style={{ fontSize:12, color:'#8892a4', marginTop:10 }}>Renews: {new Date(t.subscriptionEndDate).toLocaleDateString('en-PK')}</div>}
      </div>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:11, color:'#8892a4', marginBottom:8, textTransform:'uppercase', fontWeight:600, letterSpacing:0.5 }}>Team</div>
        <div style={{ fontSize:24, fontWeight:800, color:'#e2e8f0', fontFamily:"'JetBrains Mono',monospace" }}>{users.length} <span style={{ fontSize:14, color:'#8892a4', fontWeight:400 }}>/ {pkg.maxUsers || '?'}</span></div>
        <div style={{ fontSize:12, color:'#8892a4', marginTop:4 }}>users</div>
      </div>
    </div>

    {/* Users */}
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
      <h2 style={{ fontSize:18, fontWeight:700, color:'#e2e8f0', margin:0 }}>Team Members</h2>
      <Btn onClick={()=>setShowAddUser(true)} icon={I.plus}>Add User</Btn>
    </div>
    <DataTable columns={[
      { key:'name', label:'Name', render:(v,r)=><div><div style={{ fontWeight:600 }}>{r.name}</div><div style={{ fontSize:11, color:'#8892a4' }}>{r.email}</div></div> },
      { key:'role', label:'Role', render:v=><Badge text={v} color={v==='owner'?'#10b981':v==='manager'?'#3b82f6':'#f59e0b'}/> },
      { key:'isActive', label:'Status', render:v=><Badge text={v?'Active':'Inactive'} color={v?'#10b981':'#ef4444'}/> },
      { key:'lastLogin', label:'Last Login', render:v=>v?new Date(v).toLocaleDateString('en-PK'):'Never' },
      { key:'_id', label:'', render:(v,r)=>r.role!=='owner'?<button onClick={()=>toggleUser(r._id,r.isActive)} style={{ padding:'4px 10px', background:r.isActive?'#ef444415':'#10b98115', border:`1px solid ${r.isActive?'#ef444430':'#10b98130'}`, borderRadius:6, color:r.isActive?'#ef4444':'#10b981', fontSize:11, fontWeight:600, cursor:'pointer' }}>{r.isActive?'Deactivate':'Activate'}</button>:null },
    ]} data={users}/>

    {/* Add User Modal */}
    <Modal isOpen={showAddUser} onClose={()=>setShowAddUser(false)} title="Add Team Member">
      <form onSubmit={addUser}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Input label="Name" value={newUser.name} onChange={v=>setNewUser(p=>({...p,name:v}))} required/>
          <Input label="Email" value={newUser.email} onChange={v=>setNewUser(p=>({...p,email:v}))} type="email" required/>
          <Input label="Password" value={newUser.password} onChange={v=>setNewUser(p=>({...p,password:v}))} type="password" required placeholder="Min 6 characters"/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Select label="Role" value={newUser.role} onChange={v=>setNewUser(p=>({...p,role:v}))} options={[{value:'manager',label:'Manager'},{value:'cashier',label:'Cashier'},{value:'operator',label:'Operator'}]}/>
            <Input label="Phone" value={newUser.phone} onChange={v=>setNewUser(p=>({...p,phone:v}))}/>
          </div>
        </div>
        <div style={{ marginTop:20 }}><Btn type="submit">Add User</Btn></div>
      </form>
    </Modal>

    {/* Available Plans */}
    {packages && <div style={{ marginTop:36 }}>
      <h2 style={{ fontSize:18, fontWeight:700, color:'#e2e8f0', margin:'0 0 16px' }}>Available Plans</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14 }}>
        {Object.entries(packages).map(([key,p])=>(
          <div key={key} style={{ background:key===t.plan?'#10b98110':'#141820', borderRadius:14, padding:20, border:`1px solid ${key===t.plan?'#10b98140':'#1e2533'}` }}>
            <div style={{ fontSize:11, color:planColors[key]||'#8892a4', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>{p.name}</div>
            <div style={{ fontSize:22, fontWeight:800, color:'#e2e8f0', margin:'6px 0', fontFamily:"'JetBrains Mono',monospace" }}>PKR {p.price?.toLocaleString()}<span style={{ fontSize:11, color:'#8892a4', fontWeight:400 }}>/mo</span></div>
            <div style={{ fontSize:11, color:'#8892a4', marginBottom:10 }}>{p.description}</div>
            <div style={{ fontSize:11, color:'#8892a4' }}>{p.maxUsers} users · {p.maxTanks} tanks · {p.features?.length === 1 && p.features[0]==='*' ? 'All features' : `${p.features?.length} features`}</div>
            {key===t.plan && <div style={{ marginTop:10 }}><Badge text="Current Plan" color="#10b981"/></div>}
          </div>
        ))}
      </div>
    </div>}
  </div>;
};

// ─── USER MANAGEMENT PAGE ───
const UsersPage = () => <SubscriptionPage/>;

// ─── DASHBOARD (enhanced with alerts, cash position, quick actions) ───
const DashboardPage = ({ onNavigate }) => {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { dashboardAPI.get().then(r=>{ setD(r.data.data); setLoading(false); }).catch(()=>setLoading(false)); }, []);
  if (loading) return <Loader/>;
  if (!d) return <div style={{ color:'#ef4444', padding:40 }}>Failed to load</div>;
  const t = d.todaySales||{}, y = d.yesterdaySales||{};
  const cp = d.cashPosition || {};
  const alerts = d.alerts || [];
  const growthPct = y.totalAmount > 0 ? (((t.totalAmount||0) - y.totalAmount) / y.totalAmount * 100).toFixed(1) : 0;

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
      <div>
        <h1 style={{ fontSize:28, fontWeight:800, color:'#e2e8f0', margin:'0 0 4px' }}>Dashboard</h1>
        <p style={{ color:'#8892a4', fontSize:13, margin:0 }}>Live Overview — {fmtDate(new Date())}</p>
      </div>
      {/* Quick Actions */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {[
          ['sales','+ Sale','#10b981',I.dollar],
          ['readings','Close Shift','#8b5cf6',I.gauge],
          ['cashClosing','Cash Close','#06b6d4',I.wallet],
          ['reports','Reports','#3b82f6',I.chart],
        ].map(([pg,lbl,col,ico])=>(
          <button key={pg} onClick={()=>onNavigate?.(pg)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:`${col}15`, border:`1px solid ${col}35`, borderRadius:8, color:col, fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <div style={{ width:14, height:14 }}>{ico}</div>{lbl}
          </button>
        ))}
      </div>
    </div>

    {/* Alerts banner */}
    {alerts.length > 0 && <div style={{ background:'#1a1208', border:'1px solid #f59e0b30', borderRadius:12, padding:'12px 16px', marginBottom:18, display:'flex', alignItems:'flex-start', gap:10 }}>
      <div style={{ width:18, height:18, color:'#f59e0b', flexShrink:0, marginTop:1 }}>{I.warn}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#f59e0b', marginBottom:4 }}>{alerts.length} Alert{alerts.length>1?'s':''} Requiring Attention</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {alerts.slice(0,4).map((a,i)=><span key={i} style={{ fontSize:11, color:'#e2e8f0', background:a.severity==='critical'?'#ef444425':'#f59e0b18', padding:'3px 10px', borderRadius:6, border:`1px solid ${a.severity==='critical'?'#ef444440':'#f59e0b30'}` }}>{a.message}</span>)}
          {alerts.length > 4 && <span style={{ fontSize:11, color:'#8892a4' }}>+{alerts.length-4} more</span>}
        </div>
      </div>
    </div>}

    {/* Primary KPIs */}
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
      <StatCard icon={I.dollar} label="Today Revenue" value={PKR(t.totalAmount||0)} color="#10b981"/>
      <StatCard icon={I.fuel} label="Fuel Sold" value={`${(t.totalQty||0).toLocaleString()} Ltr`} color="#3b82f6"/>
      <StatCard icon={I.users} label="Credit Outstanding" value={PKR(d.creditOutstanding?.totalBalance||0)} color="#f59e0b"/>
      <StatCard icon={I.receipt} label="Monthly Expenses" value={PKR(d.monthlyExpenses?.totalAmount||0)} color="#ef4444"/>
    </div>

    {/* Cash Position + Monthly P&L */}
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
      <div style={{ background:'#141820', borderRadius:14, padding:20, border:'1px solid #1e2533' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>Today's Cash Position</div>
          <div style={{ width:18, height:18, color:'#10b981' }}>{I.wallet}</div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <span style={{ fontSize:12, color:'#8892a4' }}>Cash Sales</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#10b981', fontFamily:"'JetBrains Mono',monospace" }}>{PKR(cp.cashSales)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <span style={{ fontSize:12, color:'#8892a4' }}>Credit Sales</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#f59e0b', fontFamily:"'JetBrains Mono',monospace" }}>{PKR(cp.creditSales)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <span style={{ fontSize:12, color:'#8892a4' }}>Today Expenses</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#ef4444', fontFamily:"'JetBrains Mono',monospace" }}>-{PKR(cp.expenses)}</span>
        </div>
        <div style={{ marginTop:8, padding:10, background:cp.netCash>=0?'#10b98112':'#ef444412', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:12, color:'#8892a4', fontWeight:600 }}>Net Cash Today</span>
          <span style={{ fontSize:18, fontWeight:800, color:cp.netCash>=0?'#10b981':'#ef4444', fontFamily:"'JetBrains Mono',monospace" }}>{PKR(cp.netCash)}</span>
        </div>
      </div>

      <div style={{ background:'#141820', borderRadius:14, padding:20, border:'1px solid #1e2533' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>Business Snapshot</div>
          <div style={{ width:18, height:18, color:'#3b82f6' }}>{I.chart}</div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <span style={{ fontSize:12, color:'#8892a4' }}>Yesterday Revenue</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', fontFamily:"'JetBrains Mono',monospace" }}>{PKR(y.totalAmount||0)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <span style={{ fontSize:12, color:'#8892a4' }}>Today vs Yesterday</span>
          <span style={{ fontSize:13, fontWeight:700, color:growthPct>=0?'#10b981':'#ef4444', fontFamily:"'JetBrains Mono',monospace" }}>{growthPct>0?'+':''}{growthPct}%</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <span style={{ fontSize:12, color:'#8892a4' }}>Monthly Sales</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#10b981', fontFamily:"'JetBrains Mono',monospace" }}>{PKR(d.monthlySales?.totalAmount||0)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <span style={{ fontSize:12, color:'#8892a4' }}>Supplier Payable</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#ef4444', fontFamily:"'JetBrains Mono',monospace" }}>{PKR(d.supplierPayable?.totalBalance||0)}</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0' }}>
          <span style={{ fontSize:12, color:'#8892a4' }}>Active Staff</span>
          <span style={{ fontSize:13, fontWeight:700, color:'#8b5cf6', fontFamily:"'JetBrains Mono',monospace" }}>{d.employeeCount} · {PKR(d.totalPayroll)}/mo</span>
        </div>
      </div>
    </div>

    {/* 7-Day Revenue Bar Chart */}
    <div style={{ background:'#141820', borderRadius:14, padding:20, border:'1px solid #1e2533', marginBottom:20 }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:14 }}>Last 7 Days Revenue</div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120 }}>
        {d.last7Days?.map((day, i) => {
          const max = Math.max(...d.last7Days.map(x=>x.total), 1);
          const h = Math.max(4, (day.total / max) * 100);
          const isToday = i === d.last7Days.length - 1;
          return <div key={day.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:10, color:'#8892a4', fontFamily:"'JetBrains Mono',monospace" }}>{day.total > 0 ? `${(day.total/1000).toFixed(0)}k` : '0'}</span>
            <div style={{ width:'100%', height:`${h}%`, background:isToday?'linear-gradient(180deg,#10b981,#059669)':'#1e2533', borderRadius:6, minHeight:4, transition:'height 0.5s' }}/>
            <span style={{ fontSize:9, color:isToday?'#10b981':'#4a5568', fontWeight:isToday?700:400 }}>{day.date.slice(5)}</span>
          </div>;
        })}
      </div>
    </div>

    {/* Fuel Rates + Recent Expenses */}
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
      <div style={{ background:'#141820', borderRadius:14, padding:20, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:12 }}>Current Fuel Rates (OGRA)</div>
        {d.fuelTypes?.map(f=><div key={f._id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:8, height:8, borderRadius:'50%', background:f.color }}/><span style={{ fontSize:13, color:'#e2e8f0' }}>{f.name}</span></div>
          <span style={{ fontSize:14, fontWeight:700, color:f.color, fontFamily:"'JetBrains Mono',monospace" }}>{PKR(f.currentRate)}/{f.unit}</span>
        </div>)}
      </div>
      <div style={{ background:'#141820', borderRadius:14, padding:20, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:12 }}>Recent Expenses</div>
        {d.recentExpenses?.slice(0,4).map(e=><div key={e._id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
          <div><div style={{ fontSize:13, color:'#e2e8f0', fontWeight:600 }}>{e.description}</div><div style={{ fontSize:11, color:'#8892a4' }}>{e.category}</div></div>
          <span style={{ fontWeight:700, color:'#ef4444', fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>{PKR(e.amount)}</span>
        </div>)}
      </div>
    </div>

    <h2 style={{ fontSize:18, fontWeight:700, color:'#e2e8f0', marginBottom:14 }}>Tank Levels</h2>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
      {d.tanks?.map(t=><TankGauge key={t._id} tank={t}/>)}
    </div>
  </div>;
};

// ─── GENERIC CRUD PAGE ───
const CrudPage = ({ title, api, columns, formFields, stats }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});

  const load = useCallback(() => { api.getAll().then(r=>{ setData(r.data.data); setLoading(false); }).catch(()=>setLoading(false)); }, [api]);
  useEffect(load, [load]);

  const openCreate = () => { setEdit(null); const d={}; formFields.forEach(f=>{d[f.name]=f.default||''}); setForm(d); setModal(true); };
  const openEdit = (item) => { setEdit(item); const v={}; formFields.forEach(f=>{v[f.name]=item[f.name]??''}); setForm(v); setModal(true); };
  const submit = async (e) => {
    e.preventDefault();
    try { if(edit) await api.update(edit._id, form); else await api.create(form); toast.success(edit?'Updated':'Created'); setModal(false); load(); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete?')) return; try { await api.delete(id); toast.success('Deleted'); load(); } catch(e) { toast.error('Failed'); } };

  if (loading) return <Loader/>;
  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>{title}</h2>
      <Btn icon={I.plus} onClick={openCreate}>Add New</Btn>
    </div>
    {stats && <div style={{ display:'grid', gridTemplateColumns:`repeat(${stats.length},1fr)`, gap:14, marginBottom:24 }}>
      {stats.map((s,i)=><StatCard key={i} icon={s.icon} label={s.label} value={s.compute(data)} color={s.color}/>)}
    </div>}
    <DataTable columns={[...columns, { key:'_', label:'Actions', align:'center', render:(_,r)=><div style={{ display:'flex', gap:6, justifyContent:'center' }}>
      <button onClick={()=>openEdit(r)} style={{ padding:'4px 12px', background:'#3b82f620', border:'1px solid #3b82f640', borderRadius:6, color:'#3b82f6', fontSize:11, fontWeight:600, cursor:'pointer' }}>Edit</button>
      <button onClick={()=>del(r._id)} style={{ padding:'4px 12px', background:'#ef444420', border:'1px solid #ef444440', borderRadius:6, color:'#ef4444', fontSize:11, fontWeight:600, cursor:'pointer' }}>Del</button>
    </div>}]} data={data}/>
    <Modal isOpen={modal} onClose={()=>setModal(false)} title={edit?`Edit`:`Add New`}>
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {formFields.map(f => f.type==='select' ?
            <Select key={f.name} label={f.label} value={form[f.name]||''} onChange={v=>setForm(p=>({...p,[f.name]:v}))} options={f.options}/> :
            <Input key={f.name} label={f.label} value={form[f.name]||''} onChange={v=>setForm(p=>({...p,[f.name]:v}))} type={f.type||'text'} required={f.required}/>
          )}
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">{edit?'Update':'Create'}</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── PAGE CONFIGS ───
const SuppliersPage = () => <CrudPage title="Suppliers" api={suppliersAPI} columns={[
  { key:'name', label:'Name', render:v=><b>{v}</b> }, { key:'type', label:'Type', render:v=><Badge text={v} color="#3b82f6"/> },
  { key:'city', label:'City' }, { key:'phone', label:'Phone' },
  { key:'balance', label:'Balance Due', align:'right', render:v=><span style={{fontWeight:700,color:'#ef4444',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</span> },
]} formFields={[
  {name:'name',label:'Name',required:true},{name:'type',label:'Type',type:'select',options:[{value:'Fuel',label:'Fuel'},{value:'Lubricant',label:'Lubricant'},{value:'Other',label:'Other'}],default:'Fuel'},
  {name:'city',label:'City'},{name:'phone',label:'Phone'},{name:'balance',label:'Balance',type:'number',default:'0'},{name:'contactPerson',label:'Contact Person'},
]} stats={[{icon:I.truck,label:'Total',compute:d=>d.length,color:'#3b82f6'},{icon:I.dollar,label:'Payable',compute:d=>PKR(d.reduce((a,s)=>a+(s.balance||0),0)),color:'#ef4444'}]}/>;

const CustomersPage = () => <CrudPage title="Customers" api={customersAPI} columns={[
  { key:'name', label:'Name', render:v=><b>{v}</b> }, { key:'type', label:'Type', render:v=><Badge text={v} color={v==='Fleet'?'#3b82f6':'#8b5cf6'}/> },
  { key:'city', label:'City' }, { key:'phone', label:'Phone' }, { key:'creditLimit', label:'Limit', align:'right', render:v=>PKR(v) },
  { key:'balance', label:'Outstanding', align:'right', render:v=><span style={{fontWeight:700,color:v>0?'#ef4444':'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</span> },
]} formFields={[
  {name:'name',label:'Name',required:true},{name:'type',label:'Type',type:'select',options:[{value:'Cash',label:'Cash'},{value:'Fleet',label:'Fleet'},{value:'Corporate',label:'Corporate'},{value:'Government',label:'Government'}],default:'Cash'},
  {name:'city',label:'City'},{name:'phone',label:'Phone'},{name:'creditLimit',label:'Credit Limit',type:'number',default:'0'},{name:'balance',label:'Balance',type:'number',default:'0'},
]} stats={[{icon:I.users,label:'Total',compute:d=>d.length,color:'#3b82f6'},{icon:I.dollar,label:'Outstanding',compute:d=>PKR(d.reduce((a,c)=>a+(c.balance||0),0)),color:'#ef4444'}]}/>;

const EmployeesPage = () => <CrudPage title="Employees" api={employeesAPI} columns={[
  { key:'name', label:'Name', render:v=><b>{v}</b> }, { key:'cnic', label:'CNIC' },
  { key:'role', label:'Role', render:v=><Badge text={v} color="#8b5cf6"/> }, { key:'shift', label:'Shift', render:v=><Badge text={v} color={v==='Day'?'#f59e0b':'#06b6d4'}/> },
  { key:'salary', label:'Salary', align:'right', render:v=>PKR(v) }, { key:'status', label:'Status', render:v=><Badge text={v} color={v==='Active'?'#10b981':'#ef4444'}/> },
]} formFields={[
  {name:'name',label:'Name',required:true},{name:'cnic',label:'CNIC',required:true},
  {name:'role',label:'Role',type:'select',required:true,options:[{value:'',label:'Select...'},{value:'Manager',label:'Manager'},{value:'Cashier',label:'Cashier'},{value:'Pump Operator',label:'Pump Operator'},{value:'Guard',label:'Guard'},{value:'Helper',label:'Helper'}]},
  {name:'shift',label:'Shift',type:'select',options:[{value:'Day',label:'Day'},{value:'Night',label:'Night'}],default:'Day'},
  {name:'phone',label:'Phone'},{name:'salary',label:'Salary',type:'number',required:true},
  {name:'status',label:'Status',type:'select',options:[{value:'Active',label:'Active'},{value:'Inactive',label:'Inactive'}],default:'Active'},{name:'city',label:'City'},
]} stats={[{icon:I.user,label:'Staff',compute:d=>d.length,color:'#3b82f6'},{icon:I.dollar,label:'Payroll',compute:d=>PKR(d.reduce((a,e)=>a+(e.salary||0),0)),color:'#10b981'}]}/>;

const ExpensesPage = () => <CrudPage title="Expenses" api={expensesAPI} columns={[
  { key:'date', label:'Date', render:v=>fmtDate(v) }, { key:'category', label:'Category', render:v=><Badge text={v} color="#8b5cf6"/> },
  { key:'description', label:'Description' },
  { key:'amount', label:'Amount', align:'right', render:v=><span style={{fontWeight:700,color:'#ef4444',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</span> },
]} formFields={[
  {name:'date',label:'Date',type:'date',required:true,default:today()},
  {name:'category',label:'Category',type:'select',required:true,options:[{value:'',label:'Select...'},{value:'Electricity',label:'Electricity'},{value:'Sui Gas',label:'Sui Gas'},{value:'Rent',label:'Rent'},{value:'Maintenance',label:'Maintenance'},{value:'Salary Advance',label:'Salary Advance'},{value:'Transport',label:'Transport'},{value:'Tax',label:'Tax'},{value:'Office',label:'Office'},{value:'Miscellaneous',label:'Miscellaneous'}]},
  {name:'description',label:'Description',required:true},{name:'amount',label:'Amount',type:'number',required:true},
  {name:'paymentMethod',label:'Payment',type:'select',options:[{value:'Cash',label:'Cash'},{value:'Bank Transfer',label:'Bank'},{value:'Cheque',label:'Cheque'}],default:'Cash'},{name:'paidTo',label:'Paid To'},
]} stats={[{icon:I.receipt,label:'Total',compute:d=>PKR(d.reduce((a,e)=>a+(e.amount||0),0)),color:'#ef4444'},{icon:I.receipt,label:'Entries',compute:d=>d.length,color:'#8b5cf6'}]}/>;

const StockPage = () => {
  const [tanks, setTanks] = useState([]); const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([tanksAPI.getAll(), productsAPI.getAll()]).then(([t,p])=>{ setTanks(t.data.data); setProducts(p.data.data); setLoading(false); }).catch(()=>setLoading(false)); }, []);
  if (loading) return <Loader/>;
  return <div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:14 }}>Fuel Stock (Tanks)</h2>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16, marginBottom:24 }}>{tanks.map(t=><TankGauge key={t._id} tank={t}/>)}</div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:14 }}>Lubricants</h2>
    <DataTable columns={[{key:'name',label:'Product',render:v=><b>{v}</b>},{key:'category',label:'Category',render:v=><Badge text={v} color="#8b5cf6"/>},{key:'saleRate',label:'Price',align:'right',render:v=>PKR(v)},{key:'stock',label:'Stock',align:'right',render:v=><span style={{fontWeight:700,color:v<10?'#ef4444':'#10b981'}}>{v} pcs</span>}]} data={products}/>
  </div>;
};

// ─── SALES PAGE (with proper add form + filters) ───
const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [nozzles, setNozzles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState({ saleType:'', fuelType:'', startDate:daysAgo(7), endDate:today() });
  const [form, setForm] = useState({ shift:'day', saleType:'cash', fuelType:'', tank:'', nozzle:'', quantity:'', rate:'', customer:'', vehicleNumber:'', notes:'' });

  const load = useCallback(() => {
    setLoading(true);
    salesAPI.getAll(filter).then(r=>{ setSales(r.data.data); setLoading(false); }).catch(()=>setLoading(false));
  }, [filter]);

  useEffect(() => {
    Promise.all([fuelTypesAPI.getAll(), tanksAPI.getAll(), nozzlesAPI.getAll(), customersAPI.getAll()])
      .then(([f,t,n,c])=>{ setFuelTypes(f.data.data); setTanks(t.data.data); setNozzles(n.data.data); setCustomers(c.data.data); });
  }, []);
  useEffect(load, [load]);

  const onFuelChange = (id) => {
    const ft = fuelTypes.find(f=>f._id===id);
    const tank = tanks.find(t=>t.fuelType?._id===id || t.fuelType===id);
    setForm(p=>({...p, fuelType:id, rate: ft?.currentRate || '', tank: tank?._id || ''}));
  };
  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, quantity:Number(form.quantity), rate:Number(form.rate) };
      if (payload.saleType === 'cash') { delete payload.customer; }
      await salesAPI.create(payload);
      toast.success('Sale recorded');
      setModal(false);
      setForm({ shift:'day', saleType:'cash', fuelType:'', tank:'', nozzle:'', quantity:'', rate:'', customer:'', vehicleNumber:'', notes:'' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const del = async (id) => {
    if(!confirm('Delete this sale? Stock and customer balance will be reversed.')) return;
    try { await salesAPI.delete(id); toast.success('Deleted'); load(); }
    catch(e){ toast.error('Failed'); }
  };

  const totals = sales.reduce((a,s)=>{ a.amt += s.amount||0; a.qty += s.quantity||0; if(s.saleType==='cash') a.cash += s.amount||0; else a.credit += s.amount||0; return a; }, {amt:0,qty:0,cash:0,credit:0});

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Sales</h2>
      <Btn icon={I.plus} onClick={()=>setModal(true)}>New Sale</Btn>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
      <StatCard icon={I.dollar} label="Total Sales" value={PKR(totals.amt)} color="#10b981"/>
      <StatCard icon={I.fuel} label="Volume" value={`${totals.qty.toLocaleString()} L`} color="#3b82f6"/>
      <StatCard icon={I.card} label="Cash" value={PKR(totals.cash)} color="#06b6d4"/>
      <StatCard icon={I.users} label="Credit" value={PKR(totals.credit)} color="#f59e0b"/>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:16, padding:14, background:'#141820', borderRadius:12, border:'1px solid #1e2533' }}>
      <Input label="From" type="date" value={filter.startDate} onChange={v=>setFilter(p=>({...p,startDate:v}))}/>
      <Input label="To" type="date" value={filter.endDate} onChange={v=>setFilter(p=>({...p,endDate:v}))}/>
      <Select label="Type" value={filter.saleType} onChange={v=>setFilter(p=>({...p,saleType:v}))} options={[{value:'',label:'All'},{value:'cash',label:'Cash'},{value:'credit',label:'Credit'}]}/>
      <Select label="Fuel" value={filter.fuelType} onChange={v=>setFilter(p=>({...p,fuelType:v}))} options={[{value:'',label:'All'},...fuelTypes.map(f=>({value:f._id,label:f.name}))]}/>
    </div>

    {loading ? <Loader/> : <DataTable columns={[
      { key:'date', label:'Date', render:v=>fmtDate(v) },
      { key:'shift', label:'Shift', render:v=><Badge text={v} color={v==='day'?'#f59e0b':'#06b6d4'}/> },
      { key:'fuelType', label:'Fuel', render:v=>v?.name||'—' },
      { key:'quantity', label:'Qty', align:'right', render:(v,r)=>`${v} ${r.fuelType?.unit||'L'}` },
      { key:'rate', label:'Rate', align:'right', render:v=>PKR(v) },
      { key:'amount', label:'Total', align:'right', render:v=><b style={{color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'saleType', label:'Type', render:v=><Badge text={v} color={v==='cash'?'#10b981':'#f59e0b'}/> },
      { key:'customer', label:'Customer', render:(v,r)=>v?.name || (r.vehicleNumber || '—') },
      { key:'_', label:'Action', align:'center', render:(_,r)=><button onClick={()=>del(r._id)} style={{padding:'4px 10px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,fontWeight:600,cursor:'pointer'}}>Del</button>}
    ]} data={sales}/>}

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Record New Sale">
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Select label="Shift" value={form.shift} onChange={v=>setForm(p=>({...p,shift:v}))} options={[{value:'day',label:'Day'},{value:'night',label:'Night'}]}/>
          <Select label="Sale Type" value={form.saleType} onChange={v=>setForm(p=>({...p,saleType:v}))} options={[{value:'cash',label:'Cash'},{value:'credit',label:'Credit'}]}/>
          <Select label="Fuel Type" value={form.fuelType} onChange={onFuelChange} options={[{value:'',label:'Select fuel...'},...fuelTypes.map(f=>({value:f._id,label:`${f.name} (${PKR(f.currentRate)}/${f.unit})`}))]}/>
          <Select label="Tank" value={form.tank} onChange={v=>setForm(p=>({...p,tank:v}))} options={[{value:'',label:'Select tank...'},...tanks.filter(t=>!form.fuelType||(t.fuelType?._id||t.fuelType)===form.fuelType).map(t=>({value:t._id,label:`${t.name} (${t.currentStock?.toLocaleString()} L)`}))]}/>
          <Select label="Nozzle (optional)" value={form.nozzle} onChange={v=>setForm(p=>({...p,nozzle:v}))} options={[{value:'',label:'—'},...nozzles.map(n=>({value:n._id,label:n.name}))]}/>
          <Input label="Quantity (Ltr)" type="number" value={form.quantity} onChange={v=>setForm(p=>({...p,quantity:v}))} required/>
          <Input label="Rate (PKR)" type="number" value={form.rate} onChange={v=>setForm(p=>({...p,rate:v}))} required/>
          <Input label="Total" value={form.quantity && form.rate ? PKR(Number(form.quantity)*Number(form.rate)) : '—'} onChange={()=>{}}/>
          {form.saleType==='credit' && <Select label="Customer" value={form.customer} onChange={v=>setForm(p=>({...p,customer:v}))} options={[{value:'',label:'Select...'},...customers.map(c=>({value:c._id,label:`${c.name} (Bal: ${PKR(c.balance)})`}))]}/>}
          {form.saleType==='credit' && <Input label="Vehicle #" value={form.vehicleNumber} onChange={v=>setForm(p=>({...p,vehicleNumber:v}))} placeholder="LHR-1234"/>}
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">Record Sale</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── PURCHASES PAGE (with add form + filters) ───
const PurchasesPage = () => {
  const [data, setData] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ supplier:'', fuelType:'', tank:'', quantity:'', rate:'', tankerNumber:'', driverName:'', driverPhone:'', invoiceNumber:'', gatePassNumber:'', receivedQuantity:'', status:'Received', notes:'' });

  const load = () => { setLoading(true); purchasesAPI.getAll().then(r=>{ setData(r.data.data); setLoading(false); }).catch(()=>setLoading(false)); };
  useEffect(() => {
    Promise.all([suppliersAPI.getAll(), fuelTypesAPI.getAll(), tanksAPI.getAll()])
      .then(([s,f,t])=>{ setSuppliers(s.data.data); setFuelTypes(f.data.data); setTanks(t.data.data); });
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, quantity:Number(form.quantity), rate:Number(form.rate),
        receivedQuantity: form.receivedQuantity ? Number(form.receivedQuantity) : Number(form.quantity) };
      await purchasesAPI.create(payload);
      toast.success('Purchase recorded'); setModal(false); load();
      setForm({ supplier:'', fuelType:'', tank:'', quantity:'', rate:'', tankerNumber:'', driverName:'', driverPhone:'', invoiceNumber:'', gatePassNumber:'', receivedQuantity:'', status:'Received', notes:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete purchase? Stock and supplier balance will be reversed.')) return; try { await purchasesAPI.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); } };

  const totals = data.reduce((a,p)=>{ a.amt += p.amount||0; a.qty += p.quantity||0; return a; }, {amt:0,qty:0});

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Purchases (Tanker Receipts)</h2>
      <Btn icon={I.plus} onClick={()=>setModal(true)}>New Purchase</Btn>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
      <StatCard icon={I.cart} label="Total Purchases" value={PKR(totals.amt)} color="#3b82f6"/>
      <StatCard icon={I.fuel} label="Volume Received" value={`${totals.qty.toLocaleString()} L`} color="#10b981"/>
      <StatCard icon={I.truck} label="Receipts" value={data.length} color="#8b5cf6"/>
    </div>

    {loading ? <Loader/> : <DataTable columns={[
      { key:'date', label:'Date', render:v=>fmtDate(v) },
      { key:'supplier', label:'Supplier', render:v=>v?.name||'—' },
      { key:'fuelType', label:'Fuel', render:v=>v?.name||'—' },
      { key:'tankerNumber', label:'Tanker' },
      { key:'quantity', label:'Ordered', align:'right', render:v=>v?.toLocaleString() },
      { key:'receivedQuantity', label:'Received', align:'right', render:v=>v?.toLocaleString() },
      { key:'shortage', label:'Short', align:'right', render:v=><span style={{color:v>0?'#ef4444':'#10b981'}}>{v||0}</span> },
      { key:'rate', label:'Rate', align:'right', render:v=>PKR(v) },
      { key:'amount', label:'Total', align:'right', render:v=><b style={{color:'#3b82f6',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'status', label:'Status', render:v=><Badge text={v||'Pending'} color={v==='Received'?'#10b981':v==='Disputed'?'#ef4444':'#f59e0b'}/> },
      { key:'_', label:'Action', align:'center', render:(_,r)=><button onClick={()=>del(r._id)} style={{padding:'4px 10px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,fontWeight:600,cursor:'pointer'}}>Del</button>}
    ]} data={data}/>}

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="New Purchase / Tanker Receipt">
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Select label="Supplier" value={form.supplier} onChange={v=>setForm(p=>({...p,supplier:v}))} options={[{value:'',label:'Select...'},...suppliers.map(s=>({value:s._id,label:s.name}))]}/>
          <Select label="Fuel Type" value={form.fuelType} onChange={v=>{ const ft = fuelTypes.find(f=>f._id===v); setForm(p=>({...p,fuelType:v,rate:ft?.currentRate||p.rate})); }} options={[{value:'',label:'Select...'},...fuelTypes.map(f=>({value:f._id,label:f.name}))]}/>
          <Select label="Tank" value={form.tank} onChange={v=>setForm(p=>({...p,tank:v}))} options={[{value:'',label:'Select...'},...tanks.filter(t=>!form.fuelType||(t.fuelType?._id||t.fuelType)===form.fuelType).map(t=>({value:t._id,label:`${t.name} (${t.currentStock?.toLocaleString()}/${t.capacity?.toLocaleString()})`}))]}/>
          <Select label="Status" value={form.status} onChange={v=>setForm(p=>({...p,status:v}))} options={['Pending','In Transit','Received','Disputed','Cancelled'].map(s=>({value:s,label:s}))}/>
          <Input label="Ordered Qty (L)" type="number" value={form.quantity} onChange={v=>setForm(p=>({...p,quantity:v}))} required/>
          <Input label="Received Qty (L)" type="number" value={form.receivedQuantity} onChange={v=>setForm(p=>({...p,receivedQuantity:v}))} placeholder="(defaults to ordered)"/>
          <Input label="Rate per Ltr" type="number" value={form.rate} onChange={v=>setForm(p=>({...p,rate:v}))} required/>
          <Input label="Total" value={form.quantity && form.rate ? PKR(Number(form.quantity)*Number(form.rate)) : '—'} onChange={()=>{}}/>
          <Input label="Tanker #" value={form.tankerNumber} onChange={v=>setForm(p=>({...p,tankerNumber:v}))} placeholder="LHR-4521"/>
          <Input label="Driver" value={form.driverName} onChange={v=>setForm(p=>({...p,driverName:v}))}/>
          <Input label="Driver Phone" value={form.driverPhone} onChange={v=>setForm(p=>({...p,driverPhone:v}))}/>
          <Input label="Invoice #" value={form.invoiceNumber} onChange={v=>setForm(p=>({...p,invoiceNumber:v}))}/>
          <Input label="Gate Pass #" value={form.gatePassNumber} onChange={v=>setForm(p=>({...p,gatePassNumber:v}))}/>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">Save Purchase</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── METER READINGS PAGE (per-shift nozzle readings) ───
const ReadingsPage = () => {
  const [data, setData] = useState([]);
  const [nozzles, setNozzles] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ shift:'day', pump:'', nozzle:'', tank:'', fuelType:'', opening:'', closing:'', testing:'0', rate:'', cashDeclared:'', operator:'', notes:'' });

  const load = () => { setLoading(true); readingsAPI.getAll({ startDate:daysAgo(7), endDate:today() }).then(r=>{setData(r.data.data); setLoading(false);}).catch(()=>setLoading(false)); };
  useEffect(() => {
    Promise.all([nozzlesAPI.getAll(), tanksAPI.getAll(), fuelTypesAPI.getAll(), employeesAPI.getAll(), pumpsAPI.getAll()])
      .then(([n,t,f,e,p])=>{ setNozzles(n.data.data); setTanks(t.data.data); setFuelTypes(f.data.data); setEmployees(e.data.data); setPumps(p.data.data); });
    load();
  }, []);

  const onNozzleChange = (id) => {
    const noz = nozzles.find(n=>n._id===id);
    const tankId = noz?.tank?._id || noz?.tank;
    const tank = tanks.find(t=>t._id===tankId);
    const ftId = tank?.fuelType?._id || tank?.fuelType;
    const ft = fuelTypes.find(f=>f._id===ftId);
    setForm(p=>({...p, nozzle:id, tank:tankId||'', fuelType:ftId||'', rate:ft?.currentRate || p.rate}));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, opening:Number(form.opening), closing:Number(form.closing), testing:Number(form.testing||0), rate:Number(form.rate), cashDeclared:Number(form.cashDeclared||0) };
      await readingsAPI.create(payload);
      toast.success('Reading saved & stock updated'); setModal(false); load();
      setForm({ shift:'day', pump:'', nozzle:'', tank:'', fuelType:'', opening:'', closing:'', testing:'0', rate:'', cashDeclared:'', operator:'', notes:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete reading? Stock will be restored.')) return; try { await readingsAPI.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); } };

  const dispensedPreview = Math.max(0, (Number(form.closing||0) - Number(form.opening||0) - Number(form.testing||0)));
  const amountPreview = dispensedPreview * Number(form.rate||0);

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Shift Meter Readings</h2>
      <Btn icon={I.plus} onClick={()=>setModal(true)}>Close Shift</Btn>
    </div>
    {loading ? <Loader/> : <DataTable columns={[
      { key:'date', label:'Date', render:v=>fmtDate(v) },
      { key:'shift', label:'Shift', render:v=><Badge text={v} color={v==='day'?'#f59e0b':'#06b6d4'}/> },
      { key:'nozzle', label:'Nozzle', render:v=>v?.name||'—' },
      { key:'fuelType', label:'Fuel', render:v=>v?.name||'—' },
      { key:'opening', label:'Opening', align:'right' },
      { key:'closing', label:'Closing', align:'right' },
      { key:'testing', label:'Test', align:'right' },
      { key:'dispensed', label:'Dispensed', align:'right', render:v=><b style={{color:'#10b981'}}>{v?.toLocaleString()} L</b> },
      { key:'rate', label:'Rate', align:'right', render:v=>PKR(v) },
      { key:'amount', label:'Sales', align:'right', render:v=><b style={{color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'shortExcess', label:'Short/Exc', align:'right', render:v=><span style={{color:v<0?'#ef4444':v>0?'#10b981':'#8892a4',fontWeight:600}}>{PKR(v)}</span> },
      { key:'_', label:'', render:(_,r)=><button onClick={()=>del(r._id)} style={{padding:'3px 8px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button>}
    ]} data={data}/>}
    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Close Shift — Nozzle Reading">
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Select label="Shift" value={form.shift} onChange={v=>setForm(p=>({...p,shift:v}))} options={[{value:'day',label:'Day'},{value:'night',label:'Night'}]}/>
          <Select label="Pump" value={form.pump} onChange={v=>setForm(p=>({...p,pump:v}))} options={[{value:'',label:'—'},...pumps.map(p=>({value:p._id,label:p.name}))]}/>
          <Select label="Nozzle" value={form.nozzle} onChange={onNozzleChange} options={[{value:'',label:'Select...'},...nozzles.map(n=>({value:n._id,label:n.name}))]}/>
          <Select label="Operator" value={form.operator} onChange={v=>setForm(p=>({...p,operator:v}))} options={[{value:'',label:'Select...'},...employees.map(e=>({value:e._id,label:e.name}))]}/>
          <Input label="Opening Meter" type="number" value={form.opening} onChange={v=>setForm(p=>({...p,opening:v}))} required/>
          <Input label="Closing Meter" type="number" value={form.closing} onChange={v=>setForm(p=>({...p,closing:v}))} required/>
          <Input label="Testing (L)" type="number" value={form.testing} onChange={v=>setForm(p=>({...p,testing:v}))}/>
          <Input label="Rate (PKR)" type="number" value={form.rate} onChange={v=>setForm(p=>({...p,rate:v}))} required/>
          <Input label="Dispensed (L)" value={dispensedPreview.toLocaleString()} onChange={()=>{}}/>
          <Input label="Sales Amount" value={PKR(amountPreview)} onChange={()=>{}}/>
          <Input label="Cash Declared" type="number" value={form.cashDeclared} onChange={v=>setForm(p=>({...p,cashDeclared:v}))}/>
          <Input label="Short/Excess" value={PKR(Number(form.cashDeclared||0) - amountPreview)} onChange={()=>{}}/>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">Save Reading</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── TANK DIPS PAGE ───
const DipsPage = () => {
  const [data, setData] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ tank:'', shift:'opening', physicalStock:'', bookStock:'', temperature:'', waterLevel:'0', adjustStock:false, notes:'' });

  const load = () => { setLoading(true); dipsAPI.getAll().then(r=>{setData(r.data.data); setLoading(false);}).catch(()=>setLoading(false)); };
  useEffect(() => { tanksAPI.getAll().then(r=>setTanks(r.data.data)); load(); }, []);

  const onTankChange = (id) => { const t = tanks.find(x=>x._id===id); setForm(p=>({...p,tank:id,bookStock:t?.currentStock || ''})); };
  const submit = async (e) => {
    e.preventDefault();
    try {
      await dipsAPI.create({ ...form, physicalStock:Number(form.physicalStock), bookStock:Number(form.bookStock), temperature:form.temperature?Number(form.temperature):undefined, waterLevel:Number(form.waterLevel||0) });
      toast.success('Dip recorded'); setModal(false); load();
      setForm({ tank:'', shift:'opening', physicalStock:'', bookStock:'', temperature:'', waterLevel:'0', adjustStock:false, notes:'' });
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete dip?')) return; try { await dipsAPI.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); } };

  const variancePreview = Number(form.physicalStock||0) - Number(form.bookStock||0);

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Tank Dip / Physical Stock</h2>
      <Btn icon={I.plus} onClick={()=>setModal(true)}>New Dip</Btn>
    </div>
    {loading ? <Loader/> : <DataTable columns={[
      { key:'date', label:'Date', render:v=>fmtDate(v) },
      { key:'tank', label:'Tank', render:v=>v?.name||'—' },
      { key:'shift', label:'Type' },
      { key:'physicalStock', label:'Physical', align:'right', render:v=>`${v?.toLocaleString()} L` },
      { key:'bookStock', label:'Book', align:'right', render:v=>`${v?.toLocaleString()} L` },
      { key:'variance', label:'Variance', align:'right', render:v=><b style={{color:v<0?'#ef4444':v>0?'#10b981':'#8892a4'}}>{v>0?'+':''}{v?.toLocaleString()} L</b> },
      { key:'waterLevel', label:'Water', align:'right', render:v=>`${v||0} mm` },
      { key:'temperature', label:'Temp', align:'right', render:v=>v?`${v}°C`:'—' },
      { key:'_', label:'', render:(_,r)=><button onClick={()=>del(r._id)} style={{padding:'3px 8px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button>}
    ]} data={data}/>}
    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Tank Dip Reading">
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Select label="Tank" value={form.tank} onChange={onTankChange} options={[{value:'',label:'Select...'},...tanks.map(t=>({value:t._id,label:`${t.name} (book: ${t.currentStock?.toLocaleString()} L)`}))]}/>
          <Select label="When" value={form.shift} onChange={v=>setForm(p=>({...p,shift:v}))} options={['opening','closing','day','night'].map(s=>({value:s,label:s}))}/>
          <Input label="Physical Stock (L)" type="number" value={form.physicalStock} onChange={v=>setForm(p=>({...p,physicalStock:v}))} required/>
          <Input label="Book Stock (L)" type="number" value={form.bookStock} onChange={v=>setForm(p=>({...p,bookStock:v}))} required/>
          <Input label="Temperature (°C)" type="number" value={form.temperature} onChange={v=>setForm(p=>({...p,temperature:v}))}/>
          <Input label="Water in Tank (mm)" type="number" value={form.waterLevel} onChange={v=>setForm(p=>({...p,waterLevel:v}))}/>
          <Input label="Variance" value={`${variancePreview>0?'+':''}${variancePreview} L`} onChange={()=>{}}/>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:24 }}>
            <input type="checkbox" checked={form.adjustStock} onChange={e=>setForm(p=>({...p,adjustStock:e.target.checked}))} id="adj"/>
            <label htmlFor="adj" style={{fontSize:12,color:'#e2e8f0'}}>Adjust tank stock to physical</label>
          </div>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">Save Dip</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── CREDIT CUSTOMERS / PAYMENTS PAGE ───
const CreditPage = () => {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ customer:'', amount:'', method:'Cash', reference:'', bank:'', notes:'' });

  const load = () => { setLoading(true); Promise.all([customersAPI.getAll(), creditPaymentsAPI.getAll()]).then(([c,p])=>{ setCustomers(c.data.data); setPayments(p.data.data); setLoading(false); }).catch(()=>setLoading(false)); };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await creditPaymentsAPI.create({ ...form, amount:Number(form.amount) }); toast.success('Payment received'); setModal(false); setForm({ customer:'', amount:'', method:'Cash', reference:'', bank:'', notes:'' }); load(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete payment? Customer balance will revert.')) return; try { await creditPaymentsAPI.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); } };

  const totalOut = customers.reduce((a,c)=>a+(c.balance||0),0);
  const overLimit = customers.filter(c=>c.creditLimit>0 && c.balance>c.creditLimit).length;

  if (loading) return <Loader/>;
  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Credit Customers & Payments</h2>
      <Btn icon={I.plus} onClick={()=>setModal(true)}>Receive Payment</Btn>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
      <StatCard icon={I.users} label="Customers" value={customers.length} color="#3b82f6"/>
      <StatCard icon={I.dollar} label="Total Outstanding" value={PKR(totalOut)} color="#ef4444"/>
      <StatCard icon={I.card} label="Over Limit" value={overLimit} color="#f59e0b"/>
      <StatCard icon={I.receipt} label="Payments Recorded" value={payments.length} color="#10b981"/>
    </div>

    <h3 style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:10 }}>Customer Balances</h3>
    <div style={{ marginBottom:24 }}>
      <DataTable columns={[
        { key:'name', label:'Customer', render:v=><b>{v}</b> },
        { key:'type', label:'Type', render:v=><Badge text={v} color="#8b5cf6"/> },
        { key:'phone', label:'Phone' },
        { key:'creditLimit', label:'Limit', align:'right', render:v=>PKR(v) },
        { key:'balance', label:'Outstanding', align:'right', render:(v,r)=><b style={{color:v>(r.creditLimit||Infinity)?'#ef4444':v>0?'#f59e0b':'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
        { key:'_', label:'Util', align:'right', render:(_,r)=>{ const p = r.creditLimit>0 ? Math.round((r.balance/r.creditLimit)*100):0; return <span style={{color:p>100?'#ef4444':p>80?'#f59e0b':'#10b981'}}>{p}%</span>; } },
      ]} data={customers.filter(c=>c.balance>0).sort((a,b)=>(b.balance||0)-(a.balance||0))}/>
    </div>

    <h3 style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:10 }}>Recent Payments</h3>
    <DataTable columns={[
      { key:'date', label:'Date', render:v=>fmtDate(v) },
      { key:'customer', label:'Customer', render:v=>v?.name||'—' },
      { key:'amount', label:'Amount', align:'right', render:v=><b style={{color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'method', label:'Method', render:v=><Badge text={v} color="#3b82f6"/> },
      { key:'reference', label:'Ref' },
      { key:'_', label:'', render:(_,r)=><button onClick={()=>del(r._id)} style={{padding:'3px 8px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button>}
    ]} data={payments}/>

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Receive Credit Payment">
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Select label="Customer" value={form.customer} onChange={v=>setForm(p=>({...p,customer:v}))} options={[{value:'',label:'Select...'},...customers.filter(c=>c.balance>0).map(c=>({value:c._id,label:`${c.name} — ${PKR(c.balance)}`}))]}/>
          <Input label="Amount" type="number" value={form.amount} onChange={v=>setForm(p=>({...p,amount:v}))} required/>
          <Select label="Method" value={form.method} onChange={v=>setForm(p=>({...p,method:v}))} options={['Cash','Bank Transfer','Cheque','Online','Adjustment'].map(m=>({value:m,label:m}))}/>
          <Input label="Reference / Cheque #" value={form.reference} onChange={v=>setForm(p=>({...p,reference:v}))}/>
          <Input label="Bank" value={form.bank} onChange={v=>setForm(p=>({...p,bank:v}))}/>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">Receive Payment</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── PUMPS, NOZZLES, TANKS MANAGEMENT PAGE ───
const PumpsPage = () => {
  const [tab, setTab] = useState('pumps');
  const [pumps, setPumps] = useState([]);
  const [nozzles, setNozzles] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});

  const load = () => { setLoading(true); Promise.all([pumpsAPI.getAll(),nozzlesAPI.getAll(),tanksAPI.getAll(),fuelTypesAPI.getAll()]).then(([p,n,t,f])=>{ setPumps(p.data.data); setNozzles(n.data.data); setTanks(t.data.data); setFuelTypes(f.data.data); setLoading(false); }).catch(()=>setLoading(false)); };
  useEffect(load, []);

  const open = (item) => {
    setEdit(item);
    if (tab==='pumps') setForm(item || { name:'', code:'', location:'', status:'active' });
    if (tab==='nozzles') setForm(item ? { name:item.name, tank:item.tank?._id||item.tank, status:item.status } : { name:'', tank:'', status:'active' });
    if (tab==='tanks') setForm(item ? { name:item.name, fuelType:item.fuelType?._id||item.fuelType, capacity:item.capacity, currentStock:item.currentStock, minLevel:item.minLevel } : { name:'', fuelType:'', capacity:'', currentStock:0, minLevel:1000 });
    setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const api = tab==='pumps'?pumpsAPI:tab==='nozzles'?nozzlesAPI:tanksAPI;
    try { if(edit) await api.update(edit._id, form); else await api.create(form); toast.success('Saved'); setModal(false); load(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };
  const del = async (id) => {
    const api = tab==='pumps'?pumpsAPI:tab==='nozzles'?nozzlesAPI:tanksAPI;
    if(!confirm('Delete?')) return; try { await api.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); }
  };

  if (loading) return <Loader/>;
  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Pumps, Nozzles & Tanks</h2>
      <Btn icon={I.plus} onClick={()=>open(null)}>Add {tab.slice(0,-1)}</Btn>
    </div>
    <div style={{ display:'flex', gap:8, marginBottom:18 }}>
      {['pumps','nozzles','tanks'].map(t=>
        <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px', background:tab===t?'#10b98118':'#141820', border:'1px solid '+(tab===t?'#10b98140':'#1e2533'), borderRadius:8, color:tab===t?'#10b981':'#8892a4', fontWeight:600, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>{t}</button>
      )}
    </div>

    {tab==='pumps' && <DataTable columns={[
      { key:'name', label:'Pump', render:v=><b>{v}</b> },
      { key:'code', label:'Code' },
      { key:'location', label:'Location' },
      { key:'nozzles', label:'Nozzles', render:v=>v?.length||0 },
      { key:'status', label:'Status', render:v=><Badge text={v} color={v==='active'?'#10b981':v==='maintenance'?'#f59e0b':'#ef4444'}/> },
      { key:'_', label:'', align:'center', render:(_,r)=><div style={{display:'flex',gap:6,justifyContent:'center'}}><button onClick={()=>open(r)} style={{padding:'4px 10px',background:'#3b82f620',border:'1px solid #3b82f640',borderRadius:6,color:'#3b82f6',fontSize:11,cursor:'pointer'}}>Edit</button><button onClick={()=>del(r._id)} style={{padding:'4px 10px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button></div> }
    ]} data={pumps}/>}

    {tab==='nozzles' && <DataTable columns={[
      { key:'name', label:'Nozzle', render:v=><b>{v}</b> },
      { key:'tank', label:'Tank', render:v=>v?.name||'—' },
      { key:'status', label:'Status', render:v=><Badge text={v} color={v==='active'?'#10b981':v==='maintenance'?'#f59e0b':'#ef4444'}/> },
      { key:'_', label:'', align:'center', render:(_,r)=><div style={{display:'flex',gap:6,justifyContent:'center'}}><button onClick={()=>open(r)} style={{padding:'4px 10px',background:'#3b82f620',border:'1px solid #3b82f640',borderRadius:6,color:'#3b82f6',fontSize:11,cursor:'pointer'}}>Edit</button><button onClick={()=>del(r._id)} style={{padding:'4px 10px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button></div> }
    ]} data={nozzles}/>}

    {tab==='tanks' && <>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14, marginBottom:20 }}>{tanks.map(t=><TankGauge key={t._id} tank={t}/>)}</div>
      <DataTable columns={[
        { key:'name', label:'Tank', render:v=><b>{v}</b> },
        { key:'fuelType', label:'Fuel', render:v=>v?.name||'—' },
        { key:'capacity', label:'Capacity', align:'right', render:v=>`${v?.toLocaleString()} L` },
        { key:'currentStock', label:'Stock', align:'right', render:v=>`${v?.toLocaleString()} L` },
        { key:'minLevel', label:'Min', align:'right', render:v=>v?.toLocaleString() },
        { key:'_', label:'', align:'center', render:(_,r)=><div style={{display:'flex',gap:6,justifyContent:'center'}}><button onClick={()=>open(r)} style={{padding:'4px 10px',background:'#3b82f620',border:'1px solid #3b82f640',borderRadius:6,color:'#3b82f6',fontSize:11,cursor:'pointer'}}>Edit</button><button onClick={()=>del(r._id)} style={{padding:'4px 10px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button></div> }
      ]} data={tanks}/>
    </>}

    <Modal isOpen={modal} onClose={()=>setModal(false)} title={`${edit?'Edit':'Add'} ${tab.slice(0,-1)}`}>
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {tab==='pumps' && <>
            <Input label="Name" value={form.name||''} onChange={v=>setForm(p=>({...p,name:v}))} required/>
            <Input label="Code" value={form.code||''} onChange={v=>setForm(p=>({...p,code:v}))}/>
            <Input label="Location" value={form.location||''} onChange={v=>setForm(p=>({...p,location:v}))}/>
            <Select label="Status" value={form.status||'active'} onChange={v=>setForm(p=>({...p,status:v}))} options={['active','inactive','maintenance'].map(s=>({value:s,label:s}))}/>
          </>}
          {tab==='nozzles' && <>
            <Input label="Name" value={form.name||''} onChange={v=>setForm(p=>({...p,name:v}))} required/>
            <Select label="Tank" value={form.tank||''} onChange={v=>setForm(p=>({...p,tank:v}))} options={[{value:'',label:'Select...'},...tanks.map(t=>({value:t._id,label:t.name}))]}/>
            <Select label="Status" value={form.status||'active'} onChange={v=>setForm(p=>({...p,status:v}))} options={['active','inactive','maintenance'].map(s=>({value:s,label:s}))}/>
          </>}
          {tab==='tanks' && <>
            <Input label="Name" value={form.name||''} onChange={v=>setForm(p=>({...p,name:v}))} required/>
            <Select label="Fuel Type" value={form.fuelType||''} onChange={v=>setForm(p=>({...p,fuelType:v}))} options={[{value:'',label:'Select...'},...fuelTypes.map(f=>({value:f._id,label:f.name}))]}/>
            <Input label="Capacity (L)" type="number" value={form.capacity||''} onChange={v=>setForm(p=>({...p,capacity:v}))} required/>
            <Input label="Current Stock (L)" type="number" value={form.currentStock||0} onChange={v=>setForm(p=>({...p,currentStock:v}))}/>
            <Input label="Min Level Alert" type="number" value={form.minLevel||1000} onChange={v=>setForm(p=>({...p,minLevel:v}))}/>
          </>}
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">{edit?'Update':'Create'}</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── HISTORY (unified activity feed) ───
const HistoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ startDate:daysAgo(7), endDate:today(), types:'sale,purchase,reading,dip,credit,payable' });

  const load = useCallback(() => { setLoading(true); historyAPI.feed(filter).then(r=>{setData(r.data.data); setLoading(false);}).catch(()=>setLoading(false)); }, [filter]);
  useEffect(load, [load]);

  const toggle = (t) => {
    const cur = filter.types.split(',').filter(Boolean);
    const next = cur.includes(t) ? cur.filter(x=>x!==t) : [...cur, t];
    setFilter(p=>({ ...p, types: next.join(',') }));
  };

  const allTypes = [
    ['sale','Sales','#10b981'],['purchase','Purchases','#3b82f6'],['reading','Readings','#8b5cf6'],
    ['dip','Dips','#06b6d4'],['credit','Credit','#f59e0b'],['payable','Payable','#ec4899'],
  ];

  return <div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:18 }}>Activity History</h2>
    <div style={{ display:'flex', gap:12, marginBottom:16, padding:14, background:'#141820', borderRadius:12, border:'1px solid #1e2533', flexWrap:'wrap', alignItems:'flex-end' }}>
      <Input label="From" type="date" value={filter.startDate} onChange={v=>setFilter(p=>({...p,startDate:v}))}/>
      <Input label="To" type="date" value={filter.endDate} onChange={v=>setFilter(p=>({...p,endDate:v}))}/>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {allTypes.map(([t,l,c])=>{ const on = filter.types.split(',').includes(t); return <button key={t} onClick={()=>toggle(t)} style={{ padding:'6px 12px', background:on?`${c}25`:'#0c0f14', border:`1px solid ${on?c+'60':'#1e2533'}`, borderRadius:6, color:on?c:'#8892a4', fontSize:11, fontWeight:600, cursor:'pointer' }}>{l}</button>; })}
      </div>
    </div>

    {loading ? <Loader/> : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {data.map((row, i) => <div key={`${row.kind}-${row._id}-${i}`} style={{ background:'#141820', border:'1px solid #1e2533', borderLeft:`3px solid ${row.color}`, borderRadius:10, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <Badge text={row.kind} color={row.color}/>
          <div>
            <div style={{ fontSize:13, color:'#e2e8f0', fontWeight:600 }}>{row.desc}</div>
            <div style={{ fontSize:11, color:'#8892a4', marginTop:2 }}>{fmtDate(row.date)} {row.who && `· ${row.who}`}</div>
          </div>
        </div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:row.color, fontSize:14 }}>
          {row.kind==='Dip' ? `${row.amount>0?'+':''}${row.amount} L` : PKR(row.amount)}
        </div>
      </div>)}
      {!data.length && <div style={{ textAlign:'center', padding:40, color:'#4a5568' }}>No activity in this period</div>}
    </div>}
  </div>;
};

// ─── ORIGINAL SIMPLE PURCHASES (kept under different name for fallback) ───
const PurchasesListSimple = () => {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { purchasesAPI.getAll().then(r=>{ setData(r.data.data); setLoading(false); }).catch(()=>setLoading(false)); }, []);
  if (loading) return <Loader/>;
  return <div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:20 }}>Purchases</h2>
    <DataTable columns={[{key:'date',label:'Date',render:v=>fmtDate(v)},{key:'supplier',label:'Supplier',render:v=>v?.name||'—'},{key:'fuelType',label:'Fuel',render:v=>v?.name||'—'},{key:'quantity',label:'Qty',align:'right',render:v=>v?.toLocaleString()},{key:'rate',label:'Rate',align:'right',render:v=>PKR(v)},{key:'amount',label:'Total',align:'right',render:v=><span style={{fontWeight:700,color:'#3b82f6'}}>{PKR(v)}</span>},{key:'status',label:'Status',render:v=><Badge text={v||'Pending'} color={v==='Received'?'#10b981':'#f59e0b'}/>}]} data={data}/>
  </div>;
};

// ─── REPORTS PAGE — multi-report hub ─────────────────────────────
const ReportsPage = () => {
  const [tab, setTab] = useState('pnl');
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
  const [range, setRange] = useState({ startDate: monthStart, endDate: today() });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [dayDate, setDayDate] = useState(today());

  useEffect(() => {
    customersAPI.getAll().then(r => setCustomers(r.data.data));
    suppliersAPI.getAll().then(r => setSuppliers(r.data.data));
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setData(null);
    try {
      let r;
      if (tab === 'pnl')          r = await dashboardAPI.getPnL(range);
      if (tab === 'sales')        r = await reportsAPI.sales(range);
      if (tab === 'purchases')    r = await reportsAPI.purchases(range);
      if (tab === 'day')          r = await reportsAPI.daySummary({ date: dayDate });
      if (tab === 'shift')        r = await reportsAPI.shift(range);
      if (tab === 'stock')        r = await reportsAPI.stock(range);
      if (tab === 'expenses')     r = await reportsAPI.expenses(range);
      if (tab === 'fuelProfit')   r = await reportsAPI.fuelProfit(range);
      if (tab === 'creditAging')  r = await reportsAPI.creditAging();
      if (tab === 'variance')     r = await reportsAPI.variance(range);
      if (tab === 'monthly')      r = await reportsAPI.monthlyTrend({ months: 12 });
      if (tab === 'customer' && selectedCustomer) r = await reportsAPI.customer(selectedCustomer, range);
      if (tab === 'supplier' && selectedSupplier) r = await reportsAPI.supplier(selectedSupplier, range);
      if (r) setData(r.data.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to load report'); }
    setLoading(false);
  }, [tab, range, dayDate, selectedCustomer, selectedSupplier]);

  useEffect(() => { load(); }, [load]);

  const TABS = [
    ['pnl',         'Profit & Loss'],
    ['sales',       'Sales Report'],
    ['purchases',   'Purchase Report'],
    ['day',         'Day Summary'],
    ['shift',       'Shift Report'],
    ['stock',       'Stock Report'],
    ['expenses',    'Expense Report'],
    ['fuelProfit',  'Fuel Profitability'],
    ['creditAging', 'Credit Aging'],
    ['variance',    'Tank Variance'],
    ['monthly',     'Monthly Trend'],
    ['customer',    'Customer Statement'],
    ['supplier',    'Supplier Statement'],
  ];

  const exportCSV = () => {
    if (!data) return;
    let rows = [];
    let filename = `${tab}-report.csv`;
    try {
      if (tab === 'sales' && data.byFuel) rows = [['Fuel','Qty','Amount','Count'], ...data.byFuel.map(r=>[r.name, r.qty, r.amount, r.count])];
      else if (tab === 'purchases' && data.bySupplier) rows = [['Supplier','Qty','Received','Shortage','Amount','Count'], ...data.bySupplier.map(r=>[r.name, r.qty, r.received, r.shortage, r.amount, r.count])];
      else if (tab === 'expenses' && data.byCategory) rows = [['Category','Amount','Count'], ...data.byCategory.map(r=>[r._id, r.amount, r.count])];
      else if (tab === 'creditAging' && data.rows) rows = [['Customer','Type','Limit','Balance','Util%','Days'], ...data.rows.map(r=>[r.name, r.type, r.creditLimit, r.balance, r.utilization, r.oldestDays])];
      else if (tab === 'fuelProfit' && data.rows) rows = [['Fuel','Sold','Revenue','Cost','Profit','Margin%'], ...data.rows.map(r=>[r.name, r.soldQty, r.revenue, r.cogs, r.profit, r.margin])];
      else if (tab === 'monthly' && Array.isArray(data)) rows = [['Month','Sales','Purchases','Expenses','Profit'], ...data.map(r=>[r.label, r.sales, r.purchases, r.expenses, r.profit])];
      else if (tab === 'stock' && data.tanks) rows = [['Tank','Capacity','Stock','Fill%','Value','In','Sold','Variance'], ...data.tanks.map(t=>[t.name, t.capacity, t.currentStock, t.fillPct, t.valuation, t.period.in, t.period.sold, t.period.variance])];
      else if ((tab==='customer' || tab==='supplier') && data.entries) rows = [['Date','Type','Ref','Description','Debit','Credit','Balance'], ...data.entries.map(e=>[fmtDate(e.date), e.kind, e.ref, e.desc, e.debit, e.credit, e.balance])];
      if (!rows.length) return toast.error('Nothing to export');
      const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error('Export failed'); }
  };

  const printReport = () => window.print();

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Reports</h2>
      <div style={{ display:'flex', gap:8 }}>
        <Btn variant="ghost" onClick={exportCSV}>Export CSV</Btn>
        <Btn variant="ghost" onClick={printReport}>Print</Btn>
      </div>
    </div>

    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
      {TABS.map(([id, label]) =>
        <button key={id} onClick={()=>setTab(id)} style={{ padding:'8px 14px', background:tab===id?'#10b98118':'#141820', border:'1px solid '+(tab===id?'#10b98140':'#1e2533'), borderRadius:8, color:tab===id?'#10b981':'#8892a4', fontWeight:600, fontSize:12, cursor:'pointer' }}>{label}</button>
      )}
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:18, padding:14, background:'#141820', borderRadius:12, border:'1px solid #1e2533' }}>
      {tab === 'day' ? (
        <Input label="Date" type="date" value={dayDate} onChange={setDayDate}/>
      ) : tab === 'monthly' || tab === 'creditAging' ? (
        <div style={{ color:'#8892a4', fontSize:12, alignSelf:'center' }}>No filters needed</div>
      ) : (
        <>
          <Input label="From" type="date" value={range.startDate} onChange={v=>setRange(p=>({...p,startDate:v}))}/>
          <Input label="To"   type="date" value={range.endDate}   onChange={v=>setRange(p=>({...p,endDate:v}))}/>
          {tab === 'customer' && <Select label="Customer" value={selectedCustomer} onChange={setSelectedCustomer} options={[{value:'',label:'Select customer...'},...customers.map(c=>({value:c._id,label:c.name}))]}/>}
          {tab === 'supplier' && <Select label="Supplier" value={selectedSupplier} onChange={setSelectedSupplier} options={[{value:'',label:'Select supplier...'},...suppliers.map(s=>({value:s._id,label:s.name}))]}/>}
        </>
      )}
    </div>

    {loading && <Loader/>}
    {!loading && !data && <div style={{ padding:40, textAlign:'center', color:'#8892a4' }}>No data — adjust filters above</div>}
    {!loading && data && <ReportView tab={tab} data={data}/>}
  </div>;
};

// Renders the body of the selected report
const ReportView = ({ tab, data }) => {
  const Card = ({ children, title }) => (
    <div style={{ background:'#141820', borderRadius:12, padding:18, border:'1px solid #1e2533' }}>
      {title && <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', marginBottom:12 }}>{title}</div>}
      {children}
    </div>
  );
  const Row = ({ label, value, color='#e2e8f0' }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e2533' }}>
      <span style={{ fontSize:12, color:'#8892a4' }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"'JetBrains Mono',monospace" }}>{value}</span>
    </div>
  );

  // ─── 1. Profit & Loss ─────
  if (tab === 'pnl') return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
    <Card title="Revenue">
      <Row label="Total Sales" value={PKR(data.revenue)} color="#10b981"/>
    </Card>
    <Card title="Cost & Expenses">
      <Row label="Purchases (COGS)" value={PKR(data.purchases)} color="#ef4444"/>
      <Row label="Operating Expenses" value={PKR(data.expenses)} color="#ef4444"/>
    </Card>
    <Card title="Gross Profit">
      <Row label="Revenue − COGS" value={PKR(data.grossProfit)} color={data.grossProfit>=0?'#10b981':'#ef4444'}/>
    </Card>
    <Card title="Net Profit / Loss">
      <Row label="Margin" value={`${data.margin}%`} color={data.netProfit>=0?'#10b981':'#ef4444'}/>
      <div style={{ marginTop:12, padding:14, background:data.netProfit>=0?'#10b98112':'#ef444412', borderRadius:8, textAlign:'center' }}>
        <div style={{ fontSize:11, color:'#8892a4', textTransform:'uppercase', letterSpacing:1 }}>Net Profit</div>
        <div style={{ fontSize:26, fontWeight:800, color:data.netProfit>=0?'#10b981':'#ef4444', fontFamily:"'JetBrains Mono',monospace" }}>{data.netProfit>=0?'+':''}{PKR(data.netProfit)}</div>
      </div>
    </Card>
  </div>;

  // ─── 2. Sales Report ─────
  if (tab === 'sales') return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.dollar} label="Total Sales" value={PKR(data.totals?.amount||0)} color="#10b981"/>
      <StatCard icon={I.fuel}   label="Volume"      value={`${(data.totals?.qty||0).toLocaleString()} L`} color="#3b82f6"/>
      <StatCard icon={I.receipt} label="Transactions" value={data.totals?.count||0} color="#8b5cf6"/>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
      <Card title="By Fuel Type">
        <DataTable columns={[
          { key:'name', label:'Fuel' },
          { key:'qty', label:'Qty', align:'right', render:(v,r)=>`${v?.toLocaleString()} ${r.unit||'L'}` },
          { key:'amount', label:'Amount', align:'right', render:v=><b style={{color:'#10b981'}}>{PKR(v)}</b> },
        ]} data={data.byFuel||[]}/>
      </Card>
      <Card title="By Sale Type">
        <DataTable columns={[
          { key:'_id', label:'Type', render:v=><Badge text={v} color={v==='cash'?'#10b981':'#f59e0b'}/> },
          { key:'qty', label:'Qty', align:'right', render:v=>v?.toLocaleString() },
          { key:'amount', label:'Amount', align:'right', render:v=>PKR(v) },
        ]} data={data.bySaleType||[]}/>
      </Card>
      <Card title="By Shift">
        <DataTable columns={[
          { key:'_id', label:'Shift', render:v=><Badge text={v} color={v==='day'?'#f59e0b':'#06b6d4'}/> },
          { key:'qty', label:'Qty', align:'right', render:v=>v?.toLocaleString() },
          { key:'amount', label:'Amount', align:'right', render:v=>PKR(v) },
        ]} data={data.byShift||[]}/>
      </Card>
      <Card title="Top Credit Customers">
        <DataTable columns={[
          { key:'name', label:'Customer' },
          { key:'count', label:'Trips', align:'right' },
          { key:'amount', label:'Amount', align:'right', render:v=><b style={{color:'#f59e0b'}}>{PKR(v)}</b> },
        ]} data={data.topCustomers||[]}/>
      </Card>
    </div>
    <Card title="Daily Sales Trend">
      <DataTable columns={[
        { key:'_id', label:'Date' },
        { key:'qty', label:'Qty (L)', align:'right', render:v=>v?.toLocaleString() },
        { key:'count', label:'Txns', align:'right' },
        { key:'amount', label:'Amount', align:'right', render:v=><b style={{color:'#10b981'}}>{PKR(v)}</b> },
      ]} data={data.daily||[]}/>
    </Card>
  </div>;

  // ─── 3. Purchase Report ─────
  if (tab === 'purchases') return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.cart}   label="Total Purchases" value={PKR(data.totals?.amount||0)} color="#3b82f6"/>
      <StatCard icon={I.fuel}   label="Ordered"  value={`${(data.totals?.qty||0).toLocaleString()} L`} color="#8b5cf6"/>
      <StatCard icon={I.fuel}   label="Received" value={`${(data.totals?.received||0).toLocaleString()} L`} color="#10b981"/>
      <StatCard icon={I.fuel}   label="Shortage" value={`${(data.totals?.shortage||0).toLocaleString()} L`} color="#ef4444"/>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
      <Card title="By Supplier">
        <DataTable columns={[
          { key:'name', label:'Supplier' },
          { key:'qty', label:'Qty', align:'right', render:v=>v?.toLocaleString() },
          { key:'shortage', label:'Short', align:'right', render:v=><span style={{color:v>0?'#ef4444':'#10b981'}}>{v||0}</span> },
          { key:'amount', label:'Amount', align:'right', render:v=><b style={{color:'#3b82f6'}}>{PKR(v)}</b> },
        ]} data={data.bySupplier||[]}/>
      </Card>
      <Card title="By Fuel Type">
        <DataTable columns={[
          { key:'name', label:'Fuel' },
          { key:'qty', label:'Qty', align:'right', render:(v,r)=>`${v?.toLocaleString()} ${r.unit||'L'}` },
          { key:'amount', label:'Amount', align:'right', render:v=>PKR(v) },
        ]} data={data.byFuel||[]}/>
      </Card>
      <Card title="By Status">
        <DataTable columns={[
          { key:'_id', label:'Status', render:v=><Badge text={v} color={v==='Received'?'#10b981':v==='Disputed'?'#ef4444':'#f59e0b'}/> },
          { key:'count', label:'Receipts', align:'right' },
          { key:'amount', label:'Amount', align:'right', render:v=>PKR(v) },
        ]} data={data.byStatus||[]}/>
      </Card>
      <Card title="Daily Purchases">
        <DataTable columns={[
          { key:'_id', label:'Date' },
          { key:'qty', label:'Qty', align:'right', render:v=>v?.toLocaleString() },
          { key:'amount', label:'Amount', align:'right', render:v=>PKR(v) },
        ]} data={data.daily||[]}/>
      </Card>
    </div>
  </div>;

  // ─── 4. Day Summary ─────
  if (tab === 'day') return <div>
    <h3 style={{ fontSize:14, color:'#8892a4', marginBottom:14 }}>Summary for {fmtDate(data.date)}</h3>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.dollar}  label="Sales"            value={PKR(data.sales?.amount)} color="#10b981"/>
      <StatCard icon={I.card}    label="Cash Sales"       value={PKR(data.sales?.cash)} color="#06b6d4"/>
      <StatCard icon={I.users}   label="Credit Sales"     value={PKR(data.sales?.credit)} color="#f59e0b"/>
      <StatCard icon={I.cart}    label="Purchases"        value={PKR(data.purchases?.amount)} color="#3b82f6"/>
      <StatCard icon={I.receipt} label="Expenses"         value={PKR(data.expenses?.amount)} color="#ef4444"/>
      <StatCard icon={I.gauge}   label="Reading Sales"    value={PKR(data.readings?.amount)} color="#8b5cf6"/>
      <StatCard icon={I.dollar}  label="Credit Collected" value={PKR(data.creditCollected?.amount)} color="#10b981"/>
      <StatCard icon={I.truck}   label="Supplier Paid"    value={PKR(data.supplierPaid?.amount)} color="#ec4899"/>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
      <Card title="Cash Position">
        <Row label="Cash In (sales + collections)" value={PKR(data.cash?.in)} color="#10b981"/>
        <Row label="Cash Out (supplier + expense)" value={PKR(data.cash?.out)} color="#ef4444"/>
        <div style={{ marginTop:8, padding:12, background:data.cash?.net>=0?'#10b98112':'#ef444412', borderRadius:8 }}>
          <Row label="Net Cash" value={PKR(data.cash?.net)} color={data.cash?.net>=0?'#10b981':'#ef4444'}/>
        </div>
      </Card>
      <Card title="Reading Reconciliation">
        <Row label="Dispensed (L)" value={(data.readings?.dispensed||0).toLocaleString()}/>
        <Row label="Reading Sales" value={PKR(data.readings?.amount)}/>
        <Row label="Cash Declared" value={PKR(data.readings?.declared)}/>
        <Row label="Short / Excess" value={PKR(data.readings?.shortExcess)} color={data.readings?.shortExcess<0?'#ef4444':'#10b981'}/>
        <Row label="Tank Variance (L)" value={data.dips?.variance||0} color={data.dips?.variance<0?'#ef4444':'#10b981'}/>
      </Card>
      <Card title="Sales by Shift">
        <DataTable columns={[
          { key:'_id', label:'Shift', render:v=><Badge text={v} color={v==='day'?'#f59e0b':'#06b6d4'}/> },
          { key:'qty', label:'Qty (L)', align:'right', render:v=>v?.toLocaleString() },
          { key:'amount', label:'Amount', align:'right', render:v=>PKR(v) },
        ]} data={data.salesByShift||[]}/>
      </Card>
      <Card title="Sales by Fuel">
        <DataTable columns={[
          { key:'name', label:'Fuel' },
          { key:'qty', label:'Qty', align:'right', render:(v,r)=>`${v?.toLocaleString()} ${r.unit||'L'}` },
          { key:'amount', label:'Amount', align:'right', render:v=>PKR(v) },
        ]} data={data.salesByFuel||[]}/>
      </Card>
    </div>
    <Card title="Day Profit (Gross)">
      <div style={{ padding:14, background:data.grossProfit>=0?'#10b98112':'#ef444412', borderRadius:8, textAlign:'center' }}>
        <div style={{ fontSize:11, color:'#8892a4', textTransform:'uppercase', letterSpacing:1 }}>Sales − Purchases</div>
        <div style={{ fontSize:26, fontWeight:800, color:data.grossProfit>=0?'#10b981':'#ef4444', fontFamily:"'JetBrains Mono',monospace" }}>{PKR(data.grossProfit)}</div>
      </div>
    </Card>
  </div>;

  // ─── 5. Shift Report ─────
  if (tab === 'shift') return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.fuel}    label="Total Dispensed" value={`${(data.totals?.dispensed||0).toLocaleString()} L`} color="#10b981"/>
      <StatCard icon={I.dollar}  label="Reading Sales"   value={PKR(data.totals?.amount)} color="#3b82f6"/>
      <StatCard icon={I.card}    label="Cash Declared"   value={PKR(data.totals?.declared)} color="#06b6d4"/>
      <StatCard icon={I.receipt} label="Short / Excess"  value={PKR(data.totals?.shortExcess)} color={data.totals?.shortExcess<0?'#ef4444':'#10b981'}/>
    </div>
    <Card title="By Operator">
      <DataTable columns={[
        { key:'name', label:'Operator', render:v=><b>{v}</b> },
        { key:'count', label:'Shifts', align:'right' },
        { key:'dispensed', label:'Dispensed (L)', align:'right', render:v=>v?.toLocaleString() },
        { key:'amount', label:'Sales', align:'right', render:v=>PKR(v) },
        { key:'declared', label:'Declared', align:'right', render:v=>PKR(v) },
        { key:'shortExcess', label:'Short/Exc', align:'right', render:v=><b style={{color:v<0?'#ef4444':v>0?'#10b981':'#8892a4'}}>{PKR(v)}</b> },
      ]} data={data.byOperator||[]}/>
    </Card>
    <div style={{ marginTop:16 }}>
      <Card title="Shift Readings">
        <DataTable columns={[
          { key:'date', label:'Date', render:v=>fmtDate(v) },
          { key:'shift', label:'Shift', render:v=><Badge text={v} color={v==='day'?'#f59e0b':'#06b6d4'}/> },
          { key:'nozzle', label:'Nozzle', render:v=>v?.name||'—' },
          { key:'fuelType', label:'Fuel', render:v=>v?.name||'—' },
          { key:'dispensed', label:'Dispensed', align:'right', render:v=>v?.toLocaleString() },
          { key:'amount', label:'Sales', align:'right', render:v=>PKR(v) },
          { key:'shortExcess', label:'S/E', align:'right', render:v=><span style={{color:v<0?'#ef4444':'#10b981'}}>{PKR(v)}</span> },
        ]} data={data.readings||[]}/>
      </Card>
    </div>
  </div>;

  // ─── 6. Stock Report ─────
  if (tab === 'stock') return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.box}    label="Total Capacity" value={`${(data.summary?.totalCapacity||0).toLocaleString()} L`} color="#3b82f6"/>
      <StatCard icon={I.fuel}   label="Current Stock"  value={`${(data.summary?.totalStock||0).toLocaleString()} L`} color="#10b981"/>
      <StatCard icon={I.dollar} label="Stock Value"    value={PKR(data.summary?.totalValue)} color="#8b5cf6"/>
      <StatCard icon={I.receipt} label="Below Min"     value={data.summary?.belowMinCount||0} color="#ef4444"/>
    </div>
    <Card title="Tank-wise Stock & Movements">
      <DataTable columns={[
        { key:'name', label:'Tank', render:v=><b>{v}</b> },
        { key:'fuelType', label:'Fuel', render:v=>v?.name||'—' },
        { key:'capacity', label:'Capacity', align:'right', render:v=>`${v?.toLocaleString()} L` },
        { key:'currentStock', label:'Stock', align:'right', render:(v,r)=><span style={{color:r.belowMin?'#ef4444':'#10b981',fontWeight:700}}>{v?.toLocaleString()} L</span> },
        { key:'fillPct', label:'Fill', align:'right', render:v=>`${v}%` },
        { key:'valuation', label:'Value', align:'right', render:v=>PKR(v) },
        { key:'period', label:'Received', align:'right', render:v=>(v?.in||0).toLocaleString() },
        { key:'period', label:'Dispensed', align:'right', render:v=>(v?.dispensed||0).toLocaleString() },
        { key:'period', label:'Variance', align:'right', render:v=><span style={{color:(v?.variance||0)<0?'#ef4444':'#10b981'}}>{v?.variance||0}</span> },
      ]} data={data.tanks||[]}/>
    </Card>
  </div>;

  // ─── 7. Expense Report ─────
  if (tab === 'expenses') return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.receipt} label="Total Expenses" value={PKR(data.totals?.amount)} color="#ef4444"/>
      <StatCard icon={I.receipt} label="Entries" value={data.totals?.count||0} color="#8b5cf6"/>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
      <Card title="By Category">
        <DataTable columns={[
          { key:'_id', label:'Category', render:v=><Badge text={v} color="#8b5cf6"/> },
          { key:'count', label:'#', align:'right' },
          { key:'amount', label:'Amount', align:'right', render:v=><b style={{color:'#ef4444'}}>{PKR(v)}</b> },
        ]} data={data.byCategory||[]}/>
      </Card>
      <Card title="By Payment Method">
        <DataTable columns={[
          { key:'_id', label:'Method' },
          { key:'count', label:'#', align:'right' },
          { key:'amount', label:'Amount', align:'right', render:v=>PKR(v) },
        ]} data={data.byMethod||[]}/>
      </Card>
    </div>
    <Card title="Recent Expenses">
      <DataTable columns={[
        { key:'date', label:'Date', render:v=>fmtDate(v) },
        { key:'category', label:'Category' },
        { key:'description', label:'Description' },
        { key:'paidTo', label:'Paid To' },
        { key:'amount', label:'Amount', align:'right', render:v=><b style={{color:'#ef4444'}}>{PKR(v)}</b> },
      ]} data={data.recent||[]}/>
    </Card>
  </div>;

  // ─── 8. Fuel Profitability ─────
  if (tab === 'fuelProfit') return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.dollar} label="Revenue" value={PKR(data.totals?.revenue)} color="#10b981"/>
      <StatCard icon={I.cart}   label="COGS"    value={PKR(data.totals?.cogs)} color="#ef4444"/>
      <StatCard icon={I.chart}  label="Profit"  value={PKR(data.totals?.profit)} color={data.totals?.profit>=0?'#10b981':'#ef4444'}/>
      <StatCard icon={I.chart}  label="Margin"  value={`${data.totals?.margin||0}%`} color="#8b5cf6"/>
    </div>
    <Card title="By Fuel">
      <DataTable columns={[
        { key:'name', label:'Fuel', render:v=><b>{v}</b> },
        { key:'soldQty', label:'Sold', align:'right', render:(v,r)=>`${v?.toLocaleString()} ${r.unit||'L'}` },
        { key:'revenue', label:'Revenue', align:'right', render:v=><b style={{color:'#10b981'}}>{PKR(v)}</b> },
        { key:'avgCost', label:'Avg Cost', align:'right', render:v=>PKR(v.toFixed(2)) },
        { key:'cogs', label:'COGS', align:'right', render:v=>PKR(v) },
        { key:'profit', label:'Profit', align:'right', render:v=><b style={{color:v>=0?'#10b981':'#ef4444'}}>{PKR(v)}</b> },
        { key:'margin', label:'Margin', align:'right', render:v=>`${v}%` },
      ]} data={data.rows||[]}/>
    </Card>
  </div>;

  // ─── 9. Credit Aging ─────
  if (tab === 'creditAging') return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.dollar} label="Total Outstanding" value={PKR(data.total)} color="#ef4444"/>
      <StatCard icon={I.users} label="Current (≤0d)"   value={PKR(data.buckets?.current)} color="#10b981"/>
      <StatCard icon={I.users} label="1–30 days"        value={PKR(data.buckets?.d30)} color="#06b6d4"/>
      <StatCard icon={I.users} label="31–60 days"       value={PKR(data.buckets?.d60)} color="#f59e0b"/>
      <StatCard icon={I.users} label="61–90 days"       value={PKR(data.buckets?.d90)} color="#fb923c"/>
      <StatCard icon={I.users} label="90+ days"         value={PKR(data.buckets?.d90plus)} color="#ef4444"/>
    </div>
    <Card title="Customer Aging">
      <DataTable columns={[
        { key:'name', label:'Customer', render:v=><b>{v}</b> },
        { key:'type', label:'Type', render:v=><Badge text={v} color="#8b5cf6"/> },
        { key:'phone', label:'Phone' },
        { key:'creditLimit', label:'Limit', align:'right', render:v=>PKR(v) },
        { key:'balance', label:'Balance', align:'right', render:(v,r)=><b style={{color:r.overLimit?'#ef4444':'#f59e0b'}}>{PKR(v)}</b> },
        { key:'utilization', label:'Util', align:'right', render:v=>`${v}%` },
        { key:'oldestDays', label:'Days', align:'right' },
        { key:'bucket', label:'Bucket', render:v=><Badge text={v} color={v==='d90plus'?'#ef4444':v==='d90'?'#fb923c':v==='d60'?'#f59e0b':v==='d30'?'#06b6d4':'#10b981'}/> },
      ]} data={data.rows||[]}/>
    </Card>
  </div>;

  // ─── 10. Tank Variance ─────
  if (tab === 'variance') return <div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:18 }}>
      <StatCard icon={I.drop}  label="Dip Records"  value={data.totals?.count||0} color="#3b82f6"/>
      <StatCard icon={I.drop}  label="Net Variance" value={`${data.totals?.totalVariance||0} L`} color={data.totals?.totalVariance<0?'#ef4444':'#10b981'}/>
      <StatCard icon={I.drop}  label="Total Gain"   value={`${data.totals?.gain||0} L`} color="#10b981"/>
      <StatCard icon={I.drop}  label="Total Loss"   value={`${data.totals?.loss||0} L`} color="#ef4444"/>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
      <Card title="Variance by Tank">
        <DataTable columns={[
          { key:'name', label:'Tank' },
          { key:'count', label:'Dips', align:'right' },
          { key:'totalVariance', label:'Net', align:'right', render:v=><b style={{color:v<0?'#ef4444':'#10b981'}}>{v} L</b> },
          { key:'gain', label:'Gain', align:'right', render:v=><span style={{color:'#10b981'}}>{v} L</span> },
          { key:'loss', label:'Loss', align:'right', render:v=><span style={{color:'#ef4444'}}>{v} L</span> },
        ]} data={data.byTank||[]}/>
      </Card>
      <Card title="Recent Dips">
        <DataTable columns={[
          { key:'date', label:'Date', render:v=>fmtDate(v) },
          { key:'tank', label:'Tank', render:v=>v?.name||'—' },
          { key:'physicalStock', label:'Physical', align:'right' },
          { key:'bookStock', label:'Book', align:'right' },
          { key:'variance', label:'Var', align:'right', render:v=><b style={{color:v<0?'#ef4444':'#10b981'}}>{v}</b> },
        ]} data={data.dips||[]}/>
      </Card>
    </div>
  </div>;

  // ─── 11. Monthly Trend ─────
  if (tab === 'monthly') return <Card title="12-Month Trend">
    <DataTable columns={[
      { key:'label', label:'Month', render:v=><b>{v}</b> },
      { key:'sales', label:'Sales', align:'right', render:v=><span style={{color:'#10b981'}}>{PKR(v)}</span> },
      { key:'purchases', label:'Purchases', align:'right', render:v=><span style={{color:'#3b82f6'}}>{PKR(v)}</span> },
      { key:'expenses', label:'Expenses', align:'right', render:v=><span style={{color:'#ef4444'}}>{PKR(v)}</span> },
      { key:'profit', label:'Profit', align:'right', render:v=><b style={{color:v>=0?'#10b981':'#ef4444'}}>{PKR(v)}</b> },
    ]} data={data||[]}/>
  </Card>;

  // ─── 12 / 13. Customer / Supplier Statement ─────
  if (tab === 'customer' || tab === 'supplier') {
    const subj = data.customer || data.supplier;
    if (!subj) return <div style={{padding:40, textAlign:'center', color:'#8892a4'}}>Select a {tab}</div>;
    return <div>
      <Card title={`${tab==='customer'?'Customer':'Supplier'}: ${subj.name}`}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:14 }}>
          <Row label="Type" value={subj.type||'—'}/>
          <Row label="Phone" value={subj.phone||'—'}/>
          <Row label="City" value={subj.city||'—'}/>
          <Row label="Total Debit" value={PKR(data.totals?.debit)} color="#ef4444"/>
          <Row label="Total Credit" value={PKR(data.totals?.credit)} color="#10b981"/>
          <Row label="Closing Balance" value={PKR(data.totals?.closing)} color={data.totals?.closing>0?'#ef4444':'#10b981'}/>
        </div>
      </Card>
      <div style={{ marginTop:16 }}>
        <Card title="Ledger Entries">
          <DataTable columns={[
            { key:'date', label:'Date', render:v=>fmtDate(v) },
            { key:'kind', label:'Type', render:v=><Badge text={v} color={v==='Sale'||v==='Purchase'?'#3b82f6':'#10b981'}/> },
            { key:'ref',  label:'Ref' },
            { key:'desc', label:'Description' },
            { key:'debit',  label:'Debit',  align:'right', render:v=>v?PKR(v):'—' },
            { key:'credit', label:'Credit', align:'right', render:v=>v?PKR(v):'—' },
            { key:'balance',label:'Balance',align:'right', render:v=><b>{PKR(v)}</b> },
          ]} data={data.entries||[]}/>
        </Card>
      </div>
    </div>;
  }

  return null;
};

// ─── SETTINGS PAGE (fully editable) ─────────────────────────────
const SettingsPage = () => {
  const [tab, setTab] = useState('station');
  const [s, setS] = useState(null);
  const [ft, setFt] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rateEdits, setRateEdits] = useState({});           // {fuelId: newRate}
  const [fuelModal, setFuelModal] = useState(false);
  const [fuelEdit, setFuelEdit] = useState(null);
  const [fuelForm, setFuelForm] = useState({ name:'', code:'', currentRate:'', unit:'Ltr', color:'#10b981', isActive:true });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([settingsAPI.getAll(), fuelTypesAPI.getAll()])
      .then(([a, b]) => { setS(a.data.data?.[0] || {}); setFt(b.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  // ── Station info save (create-or-update) ──
  const saveStation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (s._id) await settingsAPI.update(s._id, s);
      else { const r = await settingsAPI.create(s); setS(r.data.data); }
      toast.success('Settings saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  // ── Inline OGRA rate update ──
  const saveRate = async (fuel) => {
    const newRate = Number(rateEdits[fuel._id]);
    if (!newRate || newRate <= 0) return toast.error('Enter a valid rate');
    try {
      await fuelTypesAPI.update(fuel._id, { currentRate: newRate });
      toast.success(`${fuel.name} rate updated`);
      setRateEdits(p => { const n = {...p}; delete n[fuel._id]; return n; });
      load();
    } catch (err) { toast.error('Failed'); }
  };

  // ── Fuel type CRUD ──
  const openFuel = (f) => {
    setFuelEdit(f);
    setFuelForm(f ? { name:f.name, code:f.code, currentRate:f.currentRate, unit:f.unit, color:f.color, isActive:f.isActive } : { name:'', code:'', currentRate:'', unit:'Ltr', color:'#10b981', isActive:true });
    setFuelModal(true);
  };
  const submitFuel = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...fuelForm, currentRate: Number(fuelForm.currentRate) };
      if (fuelEdit) await fuelTypesAPI.update(fuelEdit._id, payload);
      else await fuelTypesAPI.create(payload);
      toast.success('Saved'); setFuelModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const delFuel = async (id) => {
    if (!confirm('Delete this fuel type?')) return;
    try { await fuelTypesAPI.delete(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error('Failed'); }
  };

  if (loading) return <Loader/>;

  const upd = (k, v) => setS(p => ({ ...p, [k]: v }));
  const TABS = [
    ['station',  'Station Info'],
    ['shifts',   'Shift Timings'],
    ['tax',      'Tax & Currency'],
    ['fuels',    'Fuel Types & Rates'],
  ];

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Settings</h2>
    </div>
    <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
      {TABS.map(([id, label]) =>
        <button key={id} onClick={()=>setTab(id)} style={{ padding:'8px 18px', background:tab===id?'#10b98118':'#141820', border:'1px solid '+(tab===id?'#10b98140':'#1e2533'), borderRadius:8, color:tab===id?'#10b981':'#8892a4', fontWeight:600, fontSize:12, cursor:'pointer' }}>{label}</button>
      )}
    </div>

    {tab === 'station' && <form onSubmit={saveStation}>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#e2e8f0', marginBottom:16 }}>Station Information</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Station Name"   value={s.stationName||''}   onChange={v=>upd('stationName',v)} required/>
          <Select label="Brand"         value={s.brand||'PSO'}      onChange={v=>upd('brand',v)} options={['PSO','Shell','Total Parco','Attock','Hascol','GO','Caltex','Other'].map(b=>({value:b,label:b}))}/>
          <Input label="Owner Name"     value={s.ownerName||''}     onChange={v=>upd('ownerName',v)}/>
          <Input label="Dealer License" value={s.dealerLicense||''} onChange={v=>upd('dealerLicense',v)}/>
          <Input label="Phone"          value={s.phone||''}         onChange={v=>upd('phone',v)}/>
          <Input label="Email"          value={s.email||''}         onChange={v=>upd('email',v)} type="email"/>
          <Input label="Address"        value={s.address||''}       onChange={v=>upd('address',v)}/>
          <Input label="City"           value={s.city||''}          onChange={v=>upd('city',v)}/>
          <Select label="Province"      value={s.province||'Punjab'} onChange={v=>upd('province',v)} options={['Punjab','Sindh','KPK','Balochistan','Islamabad','AJK','GB'].map(p=>({value:p,label:p}))}/>
          <Input label="NTN"            value={s.ntn||''}           onChange={v=>upd('ntn',v)}/>
          <Input label="STRN"           value={s.strn||''}          onChange={v=>upd('strn',v)}/>
          <Input label="Logo URL"       value={s.logo||''}          onChange={v=>upd('logo',v)} placeholder="https://..."/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}>
          <Btn type="submit">{saving?'Saving...':'Save Station Info'}</Btn>
        </div>
      </div>
    </form>}

    {tab === 'shifts' && <form onSubmit={saveStation}>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#e2e8f0', marginBottom:6 }}>Shift Timings</div>
        <div style={{ fontSize:12, color:'#8892a4', marginBottom:16 }}>Used by readings, sales, and reports for shift filtering.</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Day Shift Start"   type="time" value={s.dayShiftStart||'06:00'}   onChange={v=>upd('dayShiftStart',v)}/>
          <Input label="Day Shift End"     type="time" value={s.dayShiftEnd||'18:00'}     onChange={v=>upd('dayShiftEnd',v)}/>
          <Input label="Night Shift Start" type="time" value={s.nightShiftStart||'18:00'} onChange={v=>upd('nightShiftStart',v)}/>
          <Input label="Night Shift End"   type="time" value={s.nightShiftEnd||'06:00'}   onChange={v=>upd('nightShiftEnd',v)}/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}>
          <Btn type="submit">{saving?'Saving...':'Save Shift Timings'}</Btn>
        </div>
      </div>
    </form>}

    {tab === 'tax' && <form onSubmit={saveStation}>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#e2e8f0', marginBottom:16 }}>Tax & Currency</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="GST %"   type="number" value={s.gst||17} onChange={v=>upd('gst',Number(v))}/>
          <Input label="Currency" value={s.currency||'PKR'} onChange={v=>upd('currency',v)}/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:20 }}>
          <Btn type="submit">{saving?'Saving...':'Save Tax Settings'}</Btn>
        </div>
      </div>
    </form>}

    {tab === 'fuels' && <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontSize:14, color:'#8892a4' }}>Update OGRA notified rates inline. Rates flow to all new sales automatically.</div>
        <Btn icon={I.plus} onClick={()=>openFuel(null)}>Add Fuel Type</Btn>
      </div>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        {ft.map(f => {
          const editing = rateEdits[f._id] !== undefined;
          return <div key={f._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'14px 0', borderBottom:'1px solid #1e2533' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:f.color, boxShadow:`0 0 12px ${f.color}40` }}/>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{f.name}</div>
                <div style={{ fontSize:11, color:'#8892a4' }}>{f.code} · per {f.unit} {!f.isActive && <Badge text="Inactive" color="#ef4444"/>}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {editing ? <>
                <input type="number" autoFocus value={rateEdits[f._id]} onChange={e=>setRateEdits(p=>({...p,[f._id]:e.target.value}))}
                  style={{ width:120, padding:'8px 12px', background:'#0c0f14', border:'1px solid #10b98140', borderRadius:8, color:'#e2e8f0', fontSize:13, outline:'none', fontFamily:"'JetBrains Mono',monospace", textAlign:'right' }}/>
                <button onClick={()=>saveRate(f)} style={{ padding:'7px 14px', background:'#10b981', border:'none', borderRadius:6, color:'#fff', fontSize:11, fontWeight:600, cursor:'pointer' }}>Save</button>
                <button onClick={()=>setRateEdits(p=>{const n={...p}; delete n[f._id]; return n;})} style={{ padding:'7px 12px', background:'transparent', border:'1px solid #1e2533', borderRadius:6, color:'#8892a4', fontSize:11, cursor:'pointer' }}>Cancel</button>
              </> : <>
                <span style={{ fontSize:15, fontWeight:700, color:f.color, fontFamily:"'JetBrains Mono',monospace", minWidth:120, textAlign:'right' }}>{PKR(f.currentRate)}/{f.unit}</span>
                <button onClick={()=>setRateEdits(p=>({...p,[f._id]:f.currentRate}))} style={{ padding:'6px 12px', background:'#3b82f620', border:'1px solid #3b82f640', borderRadius:6, color:'#3b82f6', fontSize:11, fontWeight:600, cursor:'pointer' }}>Update Rate</button>
                <button onClick={()=>openFuel(f)} style={{ padding:'6px 12px', background:'#8b5cf620', border:'1px solid #8b5cf640', borderRadius:6, color:'#8b5cf6', fontSize:11, fontWeight:600, cursor:'pointer' }}>Edit</button>
                <button onClick={()=>delFuel(f._id)} style={{ padding:'6px 12px', background:'#ef444420', border:'1px solid #ef444440', borderRadius:6, color:'#ef4444', fontSize:11, fontWeight:600, cursor:'pointer' }}>Del</button>
              </>}
            </div>
          </div>;
        })}
        {!ft.length && <div style={{ padding:30, textAlign:'center', color:'#4a5568' }}>No fuel types defined</div>}
      </div>

      <Modal isOpen={fuelModal} onClose={()=>setFuelModal(false)} title={fuelEdit?'Edit Fuel Type':'Add Fuel Type'}>
        <form onSubmit={submitFuel}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <Input label="Name" value={fuelForm.name} onChange={v=>setFuelForm(p=>({...p,name:v}))} required/>
            <Input label="Code" value={fuelForm.code} onChange={v=>setFuelForm(p=>({...p,code:v}))} placeholder="petrol, diesel, hobc..." required/>
            <Input label="Current Rate" type="number" value={fuelForm.currentRate} onChange={v=>setFuelForm(p=>({...p,currentRate:v}))} required/>
            <Select label="Unit" value={fuelForm.unit} onChange={v=>setFuelForm(p=>({...p,unit:v}))} options={[{value:'Ltr',label:'Litre'},{value:'Kg',label:'Kilogram'}]}/>
            <Input label="Color (hex)" value={fuelForm.color} onChange={v=>setFuelForm(p=>({...p,color:v}))} placeholder="#10b981"/>
            <Select label="Status" value={fuelForm.isActive?'1':'0'} onChange={v=>setFuelForm(p=>({...p,isActive:v==='1'}))} options={[{value:'1',label:'Active'},{value:'0',label:'Inactive'}]}/>
          </div>
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
            <Btn variant="ghost" onClick={()=>setFuelModal(false)}>Cancel</Btn>
            <Btn type="submit">{fuelEdit?'Update':'Create'}</Btn>
          </div>
        </form>
      </Modal>
    </div>}
  </div>;
};

// ─── SUPPLIER PAYMENTS PAGE ───
const SupplierPaymentsPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ supplier:'', amount:'', method:'Cash', reference:'', bank:'', notes:'' });

  const load = () => { setLoading(true); Promise.all([suppliersAPI.getAll(), supplierPaymentsAPI.getAll()]).then(([s,p])=>{ setSuppliers(s.data.data); setPayments(p.data.data); setLoading(false); }).catch(()=>setLoading(false)); };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    try { await supplierPaymentsAPI.create({ ...form, amount:Number(form.amount) }); toast.success('Payment recorded'); setModal(false); setForm({ supplier:'', amount:'', method:'Cash', reference:'', bank:'', notes:'' }); load(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete payment? Supplier balance will revert.')) return; try { await supplierPaymentsAPI.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); } };

  const totalPaid = payments.reduce((a,p)=>a+(p.amount||0),0);
  const totalPayable = suppliers.reduce((a,s)=>a+(s.balance||0),0);

  if (loading) return <Loader/>;
  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Supplier Payments</h2>
      <Btn icon={I.plus} onClick={()=>setModal(true)}>Make Payment</Btn>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
      <StatCard icon={I.truck} label="Suppliers" value={suppliers.length} color="#3b82f6"/>
      <StatCard icon={I.dollar} label="Total Payable" value={PKR(totalPayable)} color="#ef4444"/>
      <StatCard icon={I.money} label="Total Paid" value={PKR(totalPaid)} color="#10b981"/>
      <StatCard icon={I.receipt} label="Payments" value={payments.length} color="#8b5cf6"/>
    </div>

    <h3 style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:10 }}>Supplier Balances</h3>
    <div style={{ marginBottom:24 }}>
      <DataTable columns={[
        { key:'name', label:'Supplier', render:v=><b>{v}</b> },
        { key:'type', label:'Type', render:v=><Badge text={v} color="#3b82f6"/> },
        { key:'phone', label:'Phone' },
        { key:'balance', label:'Payable', align:'right', render:v=><b style={{color:v>0?'#ef4444':'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      ]} data={suppliers.filter(s=>s.balance>0).sort((a,b)=>(b.balance||0)-(a.balance||0))}/>
    </div>

    <h3 style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:10 }}>Recent Payments</h3>
    <DataTable columns={[
      { key:'date', label:'Date', render:v=>fmtDate(v) },
      { key:'supplier', label:'Supplier', render:v=>v?.name||'—' },
      { key:'amount', label:'Amount', align:'right', render:v=><b style={{color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'method', label:'Method', render:v=><Badge text={v} color="#3b82f6"/> },
      { key:'reference', label:'Ref' },
      { key:'_', label:'', render:(_,r)=><button onClick={()=>del(r._id)} style={{padding:'3px 8px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button>}
    ]} data={payments}/>

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Make Supplier Payment">
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Select label="Supplier" value={form.supplier} onChange={v=>setForm(p=>({...p,supplier:v}))} options={[{value:'',label:'Select...'},...suppliers.filter(s=>s.balance>0).map(s=>({value:s._id,label:`${s.name} — ${PKR(s.balance)}`}))]}/>
          <Input label="Amount" type="number" value={form.amount} onChange={v=>setForm(p=>({...p,amount:v}))} required/>
          <Select label="Method" value={form.method} onChange={v=>setForm(p=>({...p,method:v}))} options={['Cash','Bank Transfer','Cheque','Online'].map(m=>({value:m,label:m}))}/>
          <Input label="Reference / Cheque #" value={form.reference} onChange={v=>setForm(p=>({...p,reference:v}))}/>
          <Input label="Bank" value={form.bank} onChange={v=>setForm(p=>({...p,bank:v}))}/>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">Record Payment</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── PAYROLL PAGE ───
const PayrollPage = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const nowMonth = new Date().toISOString().slice(0,7); // "2026-04"
  const [genMonth, setGenMonth] = useState(nowMonth);
  const [filterMonth, setFilterMonth] = useState(nowMonth);

  const load = () => { setLoading(true);
    const [y, m] = filterMonth.split('-');
    Promise.all([payrollAPI.getAll({ month: filterMonth, year: y }), employeesAPI.getAll()])
      .then(([p,e])=>{ setPayrolls(p.data.data); setEmployees(e.data.data); setLoading(false); }).catch(()=>setLoading(false));
  };
  useEffect(load, [filterMonth]);

  const generate = async () => {
    const [y, m] = genMonth.split('-');
    try { await payrollAPI.generate({ month: genMonth, year: parseInt(y) }); toast.success('Payroll generated'); setFilterMonth(genMonth); load(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };

  const processAll = async () => {
    if (!confirm('Mark all pending payrolls as Paid?')) return;
    const [y] = filterMonth.split('-');
    try { await payrollAPI.process({ month: filterMonth, year: parseInt(y) }); toast.success('Payrolls processed'); load(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({ overtime: item.overtime||0, bonus: item.bonus||0, deductions: item.deductions||0, advance: item.advance||0, loanDeduction: item.loanDeduction||0, status: item.status, notes: item.notes||'',
      attendance: { present: item.attendance?.present||30, absent: item.attendance?.absent||0, late: item.attendance?.late||0, leaves: item.attendance?.leaves||0 }
    });
    setEditModal(true);
  };
  const submitEdit = async (e) => {
    e.preventDefault();
    try { await payrollAPI.update(editItem._id, editForm); toast.success('Updated'); setEditModal(false); load(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete this payroll record?')) return; try { await payrollAPI.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); } };

  const totalNet = payrolls.reduce((a,p)=>a+(p.netSalary||0),0);
  const pending = payrolls.filter(p=>p.status==='Pending').length;
  const paid = payrolls.filter(p=>p.status==='Paid').length;

  if (loading) return <Loader/>;
  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Payroll Management</h2>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{ padding:'8px 12px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:8, color:'#e2e8f0', fontSize:12, outline:'none' }}/>
      </div>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
      <StatCard icon={I.user} label="Staff" value={employees.length} color="#3b82f6"/>
      <StatCard icon={I.money} label="Total Payroll" value={PKR(totalNet)} color="#10b981"/>
      <StatCard icon={I.receipt} label="Pending" value={pending} color="#f59e0b"/>
      <StatCard icon={I.check} label="Paid" value={paid} color="#10b981"/>
    </div>

    {/* Generate + Process actions */}
    <div style={{ display:'flex', gap:10, marginBottom:18, padding:14, background:'#141820', borderRadius:12, border:'1px solid #1e2533', alignItems:'flex-end', flexWrap:'wrap' }}>
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <label style={{ fontSize:11, fontWeight:600, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5 }}>Generate For</label>
        <input type="month" value={genMonth} onChange={e=>setGenMonth(e.target.value)} style={{ padding:'8px 12px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:8, color:'#e2e8f0', fontSize:12, outline:'none' }}/>
      </div>
      <Btn onClick={generate} icon={I.zap}>Generate Payroll</Btn>
      {pending > 0 && <Btn onClick={processAll} variant="ghost" icon={I.check}>Process All ({pending})</Btn>}
    </div>

    <DataTable columns={[
      { key:'employee', label:'Employee', render:v=><div><b>{v?.name||'—'}</b><div style={{fontSize:10,color:'#8892a4'}}>{v?.role} · {v?.shift}</div></div> },
      { key:'basicSalary', label:'Basic', align:'right', render:v=>PKR(v) },
      { key:'overtime', label:'OT', align:'right', render:v=>v?PKR(v):'—' },
      { key:'bonus', label:'Bonus', align:'right', render:v=>v?PKR(v):'—' },
      { key:'deductions', label:'Ded.', align:'right', render:v=>v?<span style={{color:'#ef4444'}}>{PKR(v)}</span>:'—' },
      { key:'advance', label:'Adv.', align:'right', render:v=>v?<span style={{color:'#ef4444'}}>{PKR(v)}</span>:'—' },
      { key:'eobi', label:'EOBI', align:'right', render:v=>v?PKR(v):'—' },
      { key:'netSalary', label:'Net', align:'right', render:v=><b style={{color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'attendance', label:'Att.', render:v=><span style={{fontSize:11,color:'#8892a4'}}>{v?.present||30}/{v?.totalDays||30}</span> },
      { key:'status', label:'Status', render:v=><Badge text={v} color={v==='Paid'?'#10b981':v==='Pending'?'#f59e0b':'#ef4444'}/> },
      { key:'_', label:'', align:'center', render:(_,r)=><div style={{display:'flex',gap:4,justifyContent:'center'}}>
        <button onClick={()=>openEdit(r)} style={{padding:'3px 8px',background:'#3b82f620',border:'1px solid #3b82f640',borderRadius:6,color:'#3b82f6',fontSize:11,cursor:'pointer'}}>Edit</button>
        <button onClick={()=>del(r._id)} style={{padding:'3px 8px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button>
      </div>}
    ]} data={payrolls}/>

    <Modal isOpen={editModal} onClose={()=>setEditModal(false)} title={`Edit Payroll — ${editItem?.employee?.name||''}`}>
      <form onSubmit={submitEdit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Overtime (PKR)" type="number" value={editForm.overtime} onChange={v=>setEditForm(p=>({...p,overtime:Number(v)}))}/>
          <Input label="Bonus (PKR)" type="number" value={editForm.bonus} onChange={v=>setEditForm(p=>({...p,bonus:Number(v)}))}/>
          <Input label="Deductions" type="number" value={editForm.deductions} onChange={v=>setEditForm(p=>({...p,deductions:Number(v)}))}/>
          <Input label="Advance" type="number" value={editForm.advance} onChange={v=>setEditForm(p=>({...p,advance:Number(v)}))}/>
          <Input label="Loan Deduction" type="number" value={editForm.loanDeduction} onChange={v=>setEditForm(p=>({...p,loanDeduction:Number(v)}))}/>
          <Select label="Status" value={editForm.status||'Pending'} onChange={v=>setEditForm(p=>({...p,status:v}))} options={['Pending','Processed','Paid','Cancelled'].map(s=>({value:s,label:s}))}/>
          <Input label="Days Present" type="number" value={editForm.attendance?.present} onChange={v=>setEditForm(p=>({...p,attendance:{...p.attendance,present:Number(v)}}))}/>
          <Input label="Days Absent" type="number" value={editForm.attendance?.absent} onChange={v=>setEditForm(p=>({...p,attendance:{...p.attendance,absent:Number(v)}}))}/>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setEditModal(false)}>Cancel</Btn>
          <Btn type="submit">Update</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── DAILY CASH CLOSING PAGE ───
const CashClosingPage = () => {
  const [closings, setClosings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date:today(), shift:'full', openingCash:0, cashSales:0, creditCollected:0, otherIncome:0, expenses:0, supplierPayments:0, salaryAdvances:0, otherPayments:0, actualCash:0, denominations:{ n5000:0, n1000:0, n500:0, n100:0, n50:0, n20:0, n10:0, coins:0 }, notes:'' });
  const [showDenom, setShowDenom] = useState(false);

  const load = () => { setLoading(true); cashClosingAPI.getAll({ startDate:daysAgo(30), endDate:today() }).then(r=>{setClosings(r.data.data); setLoading(false);}).catch(()=>setLoading(false)); };
  useEffect(load, []);

  const autoPopulate = async () => {
    try {
      const r = await cashClosingAPI.populate({ date: form.date, shift: form.shift });
      const d = r.data.data;
      setForm(p=>({ ...p, cashSales: d.cashSales, creditCollected: d.creditCollected, expenses: d.expenses, supplierPayments: d.supplierPayments, openingCash: d.openingCash }));
      toast.success('Auto-populated from today\'s records');
    } catch(e) { toast.error('Failed to populate'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, cashSales:Number(form.cashSales), creditCollected:Number(form.creditCollected), otherIncome:Number(form.otherIncome), expenses:Number(form.expenses), supplierPayments:Number(form.supplierPayments), salaryAdvances:Number(form.salaryAdvances), otherPayments:Number(form.otherPayments), actualCash:Number(form.actualCash), openingCash:Number(form.openingCash), status:'Closed' };
      await cashClosingAPI.create(payload);
      toast.success('Cash closing saved');
      setModal(false);
      setForm({ date:today(), shift:'full', openingCash:0, cashSales:0, creditCollected:0, otherIncome:0, expenses:0, supplierPayments:0, salaryAdvances:0, otherPayments:0, actualCash:0, denominations:{ n5000:0, n1000:0, n500:0, n100:0, n50:0, n20:0, n10:0, coins:0 }, notes:'' });
      load();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete?')) return; try { await cashClosingAPI.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); } };

  const totalIn = Number(form.cashSales||0) + Number(form.creditCollected||0) + Number(form.otherIncome||0);
  const totalOut = Number(form.expenses||0) + Number(form.supplierPayments||0) + Number(form.salaryAdvances||0) + Number(form.otherPayments||0);
  const expected = Number(form.openingCash||0) + totalIn - totalOut;
  const diff = Number(form.actualCash||0) - expected;
  const denomTotal = Object.entries(form.denominations||{}).reduce((sum,[k,v])=>{
    const notes = { n5000:5000, n1000:1000, n500:500, n100:100, n50:50, n20:20, n10:10, coins:1 };
    return sum + (notes[k]||0) * Number(v||0);
  }, 0);

  if (loading) return <Loader/>;
  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Daily Cash Closing</h2>
      <Btn icon={I.plus} onClick={()=>{ setModal(true); autoPopulate(); }}>New Closing</Btn>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:20 }}>
      <StatCard icon={I.wallet} label="Closings (30d)" value={closings.length} color="#3b82f6"/>
      <StatCard icon={I.dollar} label="Last Expected" value={PKR(closings[0]?.expectedCash||0)} color="#10b981"/>
      <StatCard icon={I.money} label="Last Actual" value={PKR(closings[0]?.actualCash||0)} color="#8b5cf6"/>
      <StatCard icon={I.receipt} label="Last Difference" value={PKR(closings[0]?.difference||0)} color={closings[0]?.difference<0?'#ef4444':'#10b981'}/>
    </div>

    <DataTable columns={[
      { key:'date', label:'Date', render:v=>fmtDate(v) },
      { key:'shift', label:'Shift', render:v=><Badge text={v} color={v==='day'?'#f59e0b':v==='night'?'#06b6d4':'#8b5cf6'}/> },
      { key:'openingCash', label:'Opening', align:'right', render:v=>PKR(v) },
      { key:'totalCashIn', label:'Cash In', align:'right', render:v=><span style={{color:'#10b981',fontWeight:600}}>{PKR(v)}</span> },
      { key:'totalCashOut', label:'Cash Out', align:'right', render:v=><span style={{color:'#ef4444',fontWeight:600}}>{PKR(v)}</span> },
      { key:'expectedCash', label:'Expected', align:'right', render:v=><b>{PKR(v)}</b> },
      { key:'actualCash', label:'Actual', align:'right', render:v=><b style={{fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'difference', label:'Diff', align:'right', render:v=><b style={{color:v<0?'#ef4444':v>0?'#10b981':'#8892a4',fontFamily:"'JetBrains Mono',monospace"}}>{v>0?'+':''}{PKR(v)}</b> },
      { key:'status', label:'', render:v=><Badge text={v} color={v==='Closed'?'#10b981':'#f59e0b'}/> },
      { key:'_', label:'', render:(_,r)=><button onClick={()=>del(r._id)} style={{padding:'3px 8px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button>}
    ]} data={closings}/>

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Daily Cash Closing">
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Date" type="date" value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} required/>
          <Select label="Shift" value={form.shift} onChange={v=>setForm(p=>({...p,shift:v}))} options={[{value:'full',label:'Full Day'},{value:'day',label:'Day Shift'},{value:'night',label:'Night Shift'}]}/>
          <Input label="Opening Cash" type="number" value={form.openingCash} onChange={v=>setForm(p=>({...p,openingCash:v}))}/>
          <div/>
          {/* Cash In */}
          <div style={{ gridColumn:'1/-1', fontSize:12, fontWeight:700, color:'#10b981', textTransform:'uppercase', letterSpacing:1, borderTop:'1px solid #1e2533', paddingTop:10 }}>Cash Inflows</div>
          <Input label="Cash Sales" type="number" value={form.cashSales} onChange={v=>setForm(p=>({...p,cashSales:v}))}/>
          <Input label="Credit Collected (Cash)" type="number" value={form.creditCollected} onChange={v=>setForm(p=>({...p,creditCollected:v}))}/>
          <Input label="Other Income" type="number" value={form.otherIncome} onChange={v=>setForm(p=>({...p,otherIncome:v}))}/>
          <Input label="Total Cash In" value={PKR(totalIn)} onChange={()=>{}}/>
          {/* Cash Out */}
          <div style={{ gridColumn:'1/-1', fontSize:12, fontWeight:700, color:'#ef4444', textTransform:'uppercase', letterSpacing:1, borderTop:'1px solid #1e2533', paddingTop:10 }}>Cash Outflows</div>
          <Input label="Expenses" type="number" value={form.expenses} onChange={v=>setForm(p=>({...p,expenses:v}))}/>
          <Input label="Supplier Payments" type="number" value={form.supplierPayments} onChange={v=>setForm(p=>({...p,supplierPayments:v}))}/>
          <Input label="Salary Advances" type="number" value={form.salaryAdvances} onChange={v=>setForm(p=>({...p,salaryAdvances:v}))}/>
          <Input label="Other Payments" type="number" value={form.otherPayments} onChange={v=>setForm(p=>({...p,otherPayments:v}))}/>
          {/* Reconciliation */}
          <div style={{ gridColumn:'1/-1', fontSize:12, fontWeight:700, color:'#8b5cf6', textTransform:'uppercase', letterSpacing:1, borderTop:'1px solid #1e2533', paddingTop:10 }}>Reconciliation</div>
          <Input label="Expected Cash" value={PKR(expected)} onChange={()=>{}}/>
          <Input label="Actual Cash Counted" type="number" value={form.actualCash} onChange={v=>setForm(p=>({...p,actualCash:v}))} required/>
        </div>

        {/* Difference display */}
        <div style={{ marginTop:12, padding:14, background:diff>=0?'#10b98112':'#ef444412', borderRadius:10, textAlign:'center' }}>
          <div style={{ fontSize:11, color:'#8892a4', textTransform:'uppercase', letterSpacing:1 }}>Difference (Actual − Expected)</div>
          <div style={{ fontSize:22, fontWeight:800, color:diff<0?'#ef4444':diff>0?'#10b981':'#8892a4', fontFamily:"'JetBrains Mono',monospace" }}>{diff>0?'+':''}{PKR(diff)}</div>
        </div>

        {/* Denomination counter toggle */}
        <button type="button" onClick={()=>setShowDenom(!showDenom)} style={{ marginTop:12, padding:'6px 12px', background:'#1e253320', border:'1px solid #1e2533', borderRadius:6, color:'#8892a4', fontSize:11, cursor:'pointer', width:'100%', textAlign:'center' }}>{showDenom?'Hide':'Show'} Denomination Counter</button>
        {showDenom && <div style={{ marginTop:10, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[['n5000','5000'],['n1000','1000'],['n500','500'],['n100','100'],['n50','50'],['n20','20'],['n10','10'],['coins','Coins']].map(([k,label])=>
            <div key={k}>
              <label style={{ fontSize:10, color:'#8892a4', fontWeight:600 }}>Rs. {label}</label>
              <input type="number" value={form.denominations[k]||0} onChange={e=>setForm(p=>({...p,denominations:{...p.denominations,[k]:Number(e.target.value)}}))} style={{ width:'100%', padding:'6px 8px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:6, color:'#e2e8f0', fontSize:12, outline:'none', boxSizing:'border-box' }}/>
            </div>
          )}
          <div style={{ gridColumn:'1/-1', textAlign:'right', fontSize:12, color:'#8892a4' }}>Denomination Total: <b style={{ color:'#e2e8f0' }}>{PKR(denomTotal)}</b></div>
        </div>}

        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:16 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">Save Closing</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── SHIFT HANDOVER PAGE ───
const ShiftHandoverPage = () => {
  const [handovers, setHandovers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date:today(), shift:'day', outgoingOperator:'', cashInHand:0, pendingItems:[''], remarks:'' });
  const [autoData, setAutoData] = useState(null);

  const load = () => { setLoading(true); Promise.all([shiftHandoverAPI.getAll({ startDate:daysAgo(14), endDate:today() }), employeesAPI.getAll()]).then(([h,e])=>{ setHandovers(h.data.data); setEmployees(e.data.data); setLoading(false); }).catch(()=>setLoading(false)); };
  useEffect(load, []);

  const autoPopulate = async () => {
    try {
      const r = await shiftHandoverAPI.populate({ date: form.date, shift: form.shift });
      setAutoData(r.data.data);
      setForm(p=>({ ...p, cashInHand: r.data.data.totalCashSales - r.data.data.expenses }));
      toast.success('Shift data loaded');
    } catch(e) { toast.error('Failed to auto-populate'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form, cashInHand:Number(form.cashInHand), status:'Submitted',
        totalSales: autoData?.totalSales||0, totalCashSales: autoData?.totalCashSales||0,
        totalCreditSales: autoData?.totalCreditSales||0, expenses: autoData?.expenses||0,
        shortExcess: autoData?.shortExcess||0, meterReadings: autoData?.meterReadings||[],
        tankLevels: autoData?.tankLevels||[],
        pendingItems: form.pendingItems.filter(p=>p.trim()),
      };
      await shiftHandoverAPI.create(payload);
      toast.success('Shift handover submitted'); setModal(false); load();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };

  const ack = async (id) => {
    const incoming = prompt('Enter incoming operator employee ID or leave blank:');
    try { await shiftHandoverAPI.acknowledge(id, { incomingOperator: incoming || undefined }); toast.success('Acknowledged'); load(); }
    catch(e){ toast.error('Failed'); }
  };
  const del = async (id) => { if(!confirm('Delete?')) return; try { await shiftHandoverAPI.delete(id); toast.success('Deleted'); load(); } catch(e){ toast.error('Failed'); } };

  if (loading) return <Loader/>;
  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Shift Handover</h2>
      <Btn icon={I.plus} onClick={()=>{ setModal(true); setAutoData(null); }}>New Handover</Btn>
    </div>

    <DataTable columns={[
      { key:'date', label:'Date', render:v=>fmtDate(v) },
      { key:'shift', label:'Shift', render:v=><Badge text={v} color={v==='day'?'#f59e0b':'#06b6d4'}/> },
      { key:'outgoingOperator', label:'Outgoing', render:v=>v?.name||'—' },
      { key:'incomingOperator', label:'Incoming', render:v=>v?.name||'Pending' },
      { key:'totalSales', label:'Sales', align:'right', render:v=>PKR(v) },
      { key:'cashInHand', label:'Cash', align:'right', render:v=><b style={{color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'shortExcess', label:'S/E', align:'right', render:v=><span style={{color:v<0?'#ef4444':'#10b981'}}>{PKR(v)}</span> },
      { key:'status', label:'Status', render:v=><Badge text={v} color={v==='Acknowledged'?'#10b981':v==='Submitted'?'#3b82f6':'#8892a4'}/> },
      { key:'_', label:'', align:'center', render:(_,r)=><div style={{display:'flex',gap:4,justifyContent:'center'}}>
        {r.status==='Submitted' && <button onClick={()=>ack(r._id)} style={{padding:'3px 8px',background:'#10b98120',border:'1px solid #10b98140',borderRadius:6,color:'#10b981',fontSize:11,cursor:'pointer'}}>Ack</button>}
        <button onClick={()=>del(r._id)} style={{padding:'3px 8px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button>
      </div>}
    ]} data={handovers}/>

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Shift Handover Form">
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Date" type="date" value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} required/>
          <Select label="Shift" value={form.shift} onChange={v=>setForm(p=>({...p,shift:v}))} options={[{value:'day',label:'Day'},{value:'night',label:'Night'}]}/>
          <Select label="Outgoing Operator" value={form.outgoingOperator} onChange={v=>setForm(p=>({...p,outgoingOperator:v}))} options={[{value:'',label:'Select...'},...employees.map(e=>({value:e._id,label:`${e.name} (${e.role})`}))]}/>
          <div style={{display:'flex',alignItems:'flex-end'}}>
            <button type="button" onClick={autoPopulate} style={{ padding:'10px 16px', background:'#3b82f620', border:'1px solid #3b82f640', borderRadius:8, color:'#3b82f6', fontSize:12, fontWeight:600, cursor:'pointer', width:'100%' }}>Auto-Populate Shift Data</button>
          </div>
        </div>

        {autoData && <div style={{ marginTop:14, padding:14, background:'#0c0f14', borderRadius:10, border:'1px solid #1e2533' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', marginBottom:8 }}>Shift Summary (Auto)</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, fontSize:12 }}>
            <div><span style={{color:'#8892a4'}}>Cash Sales:</span> <b style={{color:'#10b981'}}>{PKR(autoData.totalCashSales)}</b></div>
            <div><span style={{color:'#8892a4'}}>Credit Sales:</span> <b style={{color:'#f59e0b'}}>{PKR(autoData.totalCreditSales)}</b></div>
            <div><span style={{color:'#8892a4'}}>Expenses:</span> <b style={{color:'#ef4444'}}>{PKR(autoData.expenses)}</b></div>
            <div><span style={{color:'#8892a4'}}>Total Sales:</span> <b>{PKR(autoData.totalSales)}</b></div>
            <div><span style={{color:'#8892a4'}}>Short/Excess:</span> <b style={{color:autoData.shortExcess<0?'#ef4444':'#10b981'}}>{PKR(autoData.shortExcess)}</b></div>
          </div>
          {autoData.tankLevels?.length>0 && <div style={{ marginTop:8, fontSize:11, color:'#8892a4' }}>Tanks: {autoData.tankLevels.map(t=>`${t.tankName}: ${t.level?.toLocaleString()}L`).join(' · ')}</div>}
        </div>}

        <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Cash in Hand (PKR)" type="number" value={form.cashInHand} onChange={v=>setForm(p=>({...p,cashInHand:v}))} required/>
          <Input label="Remarks" value={form.remarks} onChange={v=>setForm(p=>({...p,remarks:v}))}/>
        </div>

        <div style={{ marginTop:14 }}>
          <label style={{ fontSize:11, fontWeight:600, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5 }}>Pending Items for Next Shift</label>
          {form.pendingItems.map((item,i)=><div key={i} style={{ display:'flex', gap:6, marginTop:6 }}>
            <input value={item} onChange={e=>{ const arr=[...form.pendingItems]; arr[i]=e.target.value; setForm(p=>({...p,pendingItems:arr})); }}
              style={{ flex:1, padding:'8px 12px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:6, color:'#e2e8f0', fontSize:12, outline:'none' }} placeholder={`Item ${i+1}`}/>
            {i===form.pendingItems.length-1 && <button type="button" onClick={()=>setForm(p=>({...p,pendingItems:[...p.pendingItems,'']}))} style={{ padding:'6px 10px', background:'#1e2533', border:'none', borderRadius:6, color:'#8892a4', cursor:'pointer', fontSize:14 }}>+</button>}
          </div>)}
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn type="submit">Submit Handover</Btn>
        </div>
      </form>
    </Modal>
  </div>;
};

// ─── QUICK SALE MODE (POS) ───
const QuickSalePage = () => {
  const [fuelTypes, setFuelTypes] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState('');
  const [saleType, setSaleType] = useState('cash');
  const [customer, setCustomer] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [shift, setShift] = useState(new Date().getHours() < 18 ? 'day' : 'night');
  const [recentSales, setRecentSales] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fuelTypesAPI.getAll(), tanksAPI.getAll(), customersAPI.getAll()])
      .then(([f,t,c])=>{ setFuelTypes(f.data.data.filter(x=>x.isActive)); setTanks(t.data.data); setCustomers(c.data.data); });
    salesAPI.getAll({ startDate:today(), endDate:today() }).then(r=>setRecentSales(r.data.data));
  }, []);

  const submit = async () => {
    if (!selected || !qty) return toast.error('Select fuel and enter quantity');
    setSubmitting(true);
    try {
      const tank = tanks.find(t=>(t.fuelType?._id||t.fuelType)===selected._id);
      const payload = { shift, saleType, fuelType:selected._id, tank:tank?._id, quantity:Number(qty), rate:selected.currentRate };
      if (saleType==='credit') { payload.customer = customer; payload.vehicleNumber = vehicleNumber; }
      await salesAPI.create(payload);
      toast.success(`${qty}L ${selected.name} — ${PKR(Number(qty)*selected.currentRate)}`);
      setQty(''); setVehicleNumber('');
      salesAPI.getAll({ startDate:today(), endDate:today() }).then(r=>setRecentSales(r.data.data));
    } catch(err) { toast.error(err.response?.data?.message||'Sale failed'); }
    setSubmitting(false);
  };

  const todayTotal = recentSales.reduce((a,s)=>a+(s.amount||0),0);
  const todayQty = recentSales.reduce((a,s)=>a+(s.quantity||0),0);

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:'0 0 2px' }}>Quick Sale (POS)</h2>
        <p style={{ fontSize:12, color:'#8892a4', margin:0 }}>Fast sale entry — select fuel, enter qty, done.</p>
      </div>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <div style={{ fontSize:12, color:'#8892a4' }}>Today: <b style={{color:'#10b981'}}>{PKR(todayTotal)}</b> · {todayQty.toLocaleString()}L · {recentSales.length} sales</div>
        <Select value={shift} onChange={setShift} options={[{value:'day',label:'Day Shift'},{value:'night',label:'Night Shift'}]}/>
      </div>
    </div>

    {/* Fuel Buttons */}
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(fuelTypes.length,4)},1fr)`, gap:14, marginBottom:24 }}>
      {fuelTypes.map(f=>(
        <button key={f._id} onClick={()=>setSelected(f)} style={{
          padding:24, borderRadius:16, cursor:'pointer', border:`2px solid ${selected?._id===f._id?f.color:'#1e2533'}`,
          background:selected?._id===f._id?`${f.color}18`:'#141820', textAlign:'center', transition:'all 0.2s',
        }}>
          <div style={{ width:12, height:12, borderRadius:'50%', background:f.color, margin:'0 auto 10px', boxShadow:`0 0 16px ${f.color}60` }}/>
          <div style={{ fontSize:18, fontWeight:800, color:selected?._id===f._id?f.color:'#e2e8f0' }}>{f.name}</div>
          <div style={{ fontSize:22, fontWeight:800, color:f.color, fontFamily:"'JetBrains Mono',monospace", marginTop:8 }}>{PKR(f.currentRate)}</div>
          <div style={{ fontSize:11, color:'#8892a4', marginTop:2 }}>per {f.unit}</div>
        </button>
      ))}
    </div>

    {/* Quantity + Sale Type */}
    {selected && <div style={{ background:'#141820', borderRadius:16, padding:24, border:'1px solid #1e2533', marginBottom:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:16, alignItems:'flex-end' }}>
        <div>
          <label style={{ fontSize:11, fontWeight:600, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>Quantity (Litres)</label>
          <input type="number" value={qty} onChange={e=>setQty(e.target.value)} autoFocus placeholder="Enter litres..."
            style={{ width:'100%', padding:'16px 20px', background:'#0c0f14', border:`2px solid ${selected.color}40`, borderRadius:12, color:'#e2e8f0', fontSize:28, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", outline:'none', boxSizing:'border-box', textAlign:'center' }}/>
        </div>
        <div>
          <label style={{ fontSize:11, fontWeight:600, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>Sale Type</label>
          <div style={{ display:'flex', gap:6 }}>
            {['cash','credit'].map(t=><button key={t} onClick={()=>setSaleType(t)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${saleType===t?(t==='cash'?'#10b981':'#f59e0b'):'#1e2533'}`, background:saleType===t?(t==='cash'?'#10b98118':'#f59e0b18'):'#0c0f14', color:saleType===t?(t==='cash'?'#10b981':'#f59e0b'):'#8892a4', fontSize:14, fontWeight:700, cursor:'pointer', textTransform:'capitalize' }}>{t}</button>)}
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <label style={{ fontSize:11, fontWeight:600, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>Total</label>
          <div style={{ fontSize:28, fontWeight:800, color:selected.color, fontFamily:"'JetBrains Mono',monospace" }}>{qty ? PKR(Number(qty)*selected.currentRate) : '—'}</div>
        </div>
      </div>

      {saleType==='credit' && <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:14 }}>
        <Select label="Customer" value={customer} onChange={setCustomer} options={[{value:'',label:'Select...'},...customers.map(c=>({value:c._id,label:`${c.name} (${PKR(c.balance)})`}))]}/>
        <Input label="Vehicle #" value={vehicleNumber} onChange={setVehicleNumber} placeholder="LHR-1234"/>
      </div>}

      <button onClick={submit} disabled={submitting||!qty} style={{ marginTop:18, width:'100%', padding:18, background:selected.color, color:'#fff', border:'none', borderRadius:12, fontSize:18, fontWeight:800, cursor:submitting?'wait':'pointer', opacity:!qty?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
        <div style={{ width:22, height:22 }}>{I.zap}</div>
        {submitting ? 'Recording...' : `Record ${qty||0}L ${selected.name} — ${qty ? PKR(Number(qty)*selected.currentRate) : ''}`}
      </button>
    </div>}

    {/* Recent sales ticker */}
    <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:10 }}>Recent Sales Today</div>
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {recentSales.slice(0,8).map(s=><div key={s._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#141820', border:'1px solid #1e2533', borderRadius:10 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Badge text={s.fuelType?.name||'—'} color={s.fuelType?.color||'#8892a4'}/>
          <span style={{ fontSize:13, color:'#e2e8f0' }}>{s.quantity}L</span>
          <Badge text={s.saleType} color={s.saleType==='cash'?'#10b981':'#f59e0b'}/>
          {s.customer?.name && <span style={{fontSize:11,color:'#8892a4'}}>{s.customer.name}</span>}
        </div>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:'#10b981', fontSize:14 }}>{PKR(s.amount)}</span>
      </div>)}
      {!recentSales.length && <div style={{ padding:24, textAlign:'center', color:'#4a5568', fontSize:12 }}>No sales today yet</div>}
    </div>
  </div>;
};

// ─── ATTENDANCE PAGE ───
const AttendancePage = () => {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState('mark');
  const nowMonth = new Date().toISOString().slice(0,7);
  const [summaryMonth, setSummaryMonth] = useState(nowMonth);
  const [summary, setSummary] = useState([]);
  const [markForm, setMarkForm] = useState({});

  const load = () => { setLoading(true);
    Promise.all([employeesAPI.getAll(), attendanceAPI.getAll({ date })])
      .then(([e,a])=>{
        const emps = e.data.data.filter(x=>x.status==='Active');
        setEmployees(emps);
        setRecords(a.data.data);
        // Pre-fill mark form
        const form = {};
        emps.forEach(emp => {
          const existing = a.data.data.find(r=>r.employee?._id===emp._id);
          form[emp._id] = { status: existing?.status||'Present', shift: existing?.shift||emp.shift||'Day', checkIn: existing?.checkIn||'', checkOut: existing?.checkOut||'', overtimeHours: existing?.overtimeHours||0 };
        });
        setMarkForm(form);
        setLoading(false);
      }).catch(()=>setLoading(false));
  };
  useEffect(load, [date]);

  const loadSummary = () => { attendanceAPI.summary({ month:summaryMonth }).then(r=>setSummary(r.data.data)).catch(()=>{}); };
  useEffect(loadSummary, [summaryMonth]);

  const submitAttendance = async () => {
    const records = Object.entries(markForm).map(([empId, data])=>({ employee:empId, ...data }));
    try { await attendanceAPI.bulkMark({ date, records }); toast.success('Attendance marked'); load(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };

  if (loading) return <Loader/>;
  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Attendance</h2>
      <div style={{ display:'flex', gap:8 }}>
        {['mark','summary'].map(t=><button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 16px', background:tab===t?'#10b98118':'#141820', border:'1px solid '+(tab===t?'#10b98140':'#1e2533'), borderRadius:8, color:tab===t?'#10b981':'#8892a4', fontWeight:600, fontSize:12, cursor:'pointer', textTransform:'capitalize' }}>{t==='mark'?'Daily Mark':'Monthly Summary'}</button>)}
      </div>
    </div>

    {tab==='mark' && <div>
      <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'flex-end' }}>
        <Input label="Date" type="date" value={date} onChange={setDate}/>
        <Btn onClick={submitAttendance} icon={I.check}>Save Attendance</Btn>
      </div>

      <div style={{ background:'#141820', borderRadius:14, border:'1px solid #1e2533', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead><tr style={{ background:'#0c0f14' }}>
            <th style={{ padding:'12px 16px', textAlign:'left', color:'#8892a4', fontWeight:600, fontSize:11, textTransform:'uppercase', letterSpacing:0.5 }}>Employee</th>
            <th style={{ padding:'12px 16px', textAlign:'center', color:'#8892a4', fontWeight:600, fontSize:11, textTransform:'uppercase' }}>Shift</th>
            <th style={{ padding:'12px 16px', textAlign:'center', color:'#8892a4', fontWeight:600, fontSize:11, textTransform:'uppercase' }}>Status</th>
            <th style={{ padding:'12px 16px', textAlign:'center', color:'#8892a4', fontWeight:600, fontSize:11, textTransform:'uppercase' }}>Check In</th>
            <th style={{ padding:'12px 16px', textAlign:'center', color:'#8892a4', fontWeight:600, fontSize:11, textTransform:'uppercase' }}>Check Out</th>
            <th style={{ padding:'12px 16px', textAlign:'center', color:'#8892a4', fontWeight:600, fontSize:11, textTransform:'uppercase' }}>OT Hrs</th>
          </tr></thead>
          <tbody>
            {employees.map((emp,i) => {
              const f = markForm[emp._id] || {};
              const upd = (key, val) => setMarkForm(p=>({...p,[emp._id]:{...p[emp._id],[key]:val}}));
              return <tr key={emp._id} style={{ background:i%2===0?'#141820':'#0c0f14' }}>
                <td style={{ padding:'10px 16px', color:'#e2e8f0', borderBottom:'1px solid #1e2533' }}>
                  <div><b>{emp.name}</b></div><div style={{fontSize:10,color:'#8892a4'}}>{emp.role}</div>
                </td>
                <td style={{ padding:'8px', textAlign:'center', borderBottom:'1px solid #1e2533' }}>
                  <select value={f.shift||'Day'} onChange={e=>upd('shift',e.target.value)} style={{ padding:'6px 8px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:6, color:'#e2e8f0', fontSize:11, outline:'none' }}>
                    <option value="Day">Day</option><option value="Night">Night</option>
                  </select>
                </td>
                <td style={{ padding:'8px', textAlign:'center', borderBottom:'1px solid #1e2533' }}>
                  <select value={f.status||'Present'} onChange={e=>upd('status',e.target.value)} style={{ padding:'6px 8px', background:'#0c0f14', border:`1px solid ${f.status==='Present'?'#10b98140':f.status==='Absent'?'#ef444440':'#f59e0b40'}`, borderRadius:6, color:f.status==='Present'?'#10b981':f.status==='Absent'?'#ef4444':'#f59e0b', fontSize:11, fontWeight:600, outline:'none' }}>
                    <option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option><option value="Half Day">Half Day</option><option value="Leave">Leave</option>
                  </select>
                </td>
                <td style={{ padding:'8px', textAlign:'center', borderBottom:'1px solid #1e2533' }}><input type="time" value={f.checkIn||''} onChange={e=>upd('checkIn',e.target.value)} style={{ padding:'4px 8px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:6, color:'#e2e8f0', fontSize:11, outline:'none' }}/></td>
                <td style={{ padding:'8px', textAlign:'center', borderBottom:'1px solid #1e2533' }}><input type="time" value={f.checkOut||''} onChange={e=>upd('checkOut',e.target.value)} style={{ padding:'4px 8px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:6, color:'#e2e8f0', fontSize:11, outline:'none' }}/></td>
                <td style={{ padding:'8px', textAlign:'center', borderBottom:'1px solid #1e2533' }}><input type="number" value={f.overtimeHours||0} onChange={e=>upd('overtimeHours',Number(e.target.value))} style={{ width:50, padding:'4px 6px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:6, color:'#e2e8f0', fontSize:11, outline:'none', textAlign:'center' }}/></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>}

    {tab==='summary' && <div>
      <div style={{ marginBottom:16, display:'flex', gap:12, alignItems:'flex-end' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <label style={{ fontSize:11, fontWeight:600, color:'#8892a4', textTransform:'uppercase', letterSpacing:0.5 }}>Month</label>
          <input type="month" value={summaryMonth} onChange={e=>setSummaryMonth(e.target.value)} style={{ padding:'8px 12px', background:'#0c0f14', border:'1px solid #1e2533', borderRadius:8, color:'#e2e8f0', fontSize:12, outline:'none' }}/>
        </div>
      </div>
      <DataTable columns={[
        { key:'employee', label:'Employee', render:v=><div><b>{v?.name}</b><div style={{fontSize:10,color:'#8892a4'}}>{v?.role} · {v?.shift}</div></div> },
        { key:'present', label:'Present', align:'right', render:v=><b style={{color:'#10b981'}}>{v}</b> },
        { key:'late', label:'Late', align:'right', render:v=>v?<span style={{color:'#f59e0b'}}>{v}</span>:'0' },
        { key:'absent', label:'Absent', align:'right', render:v=>v?<span style={{color:'#ef4444'}}>{v}</span>:'0' },
        { key:'halfDay', label:'Half', align:'right' },
        { key:'leave', label:'Leave', align:'right' },
        { key:'overtime', label:'OT Hrs', align:'right', render:v=>v?<span style={{color:'#06b6d4'}}>{v}</span>:'0' },
        { key:'attendancePct', label:'Rate', align:'right', render:v=><Badge text={`${v}%`} color={v>=90?'#10b981':v>=70?'#f59e0b':'#ef4444'}/> },
      ]} data={summary}/>
    </div>}
  </div>;
};

// ─── EMPLOYEE PERFORMANCE PAGE ───
const PerformancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ startDate:daysAgo(30), endDate:today() });

  const load = useCallback(() => { setLoading(true); dashboardAPI.getPerformance(range).then(r=>{setData(r.data.data); setLoading(false);}).catch(()=>setLoading(false)); }, [range]);
  useEffect(load, [load]);

  if (loading) return <Loader/>;
  if (!data) return <div style={{ color:'#ef4444', padding:40 }}>Failed to load</div>;

  const perf = data.performance || [];
  const topSeller = perf.reduce((best, p) => p.salesAmount > (best?.salesAmount||0) ? p : best, null);

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, flexWrap:'wrap', gap:10 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Employee Performance</h2>
      <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
        <Input label="From" type="date" value={range.startDate} onChange={v=>setRange(p=>({...p,startDate:v}))}/>
        <Input label="To" type="date" value={range.endDate} onChange={v=>setRange(p=>({...p,endDate:v}))}/>
      </div>
    </div>

    {topSeller && topSeller.salesAmount > 0 && <div style={{ background:'linear-gradient(135deg,#10b98112,#3b82f612)', border:'1px solid #10b98130', borderRadius:14, padding:18, marginBottom:18, display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:42, height:42, borderRadius:10, background:'#10b98120', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:20, height:20, color:'#10b981' }}>{I.target}</div></div>
      <div>
        <div style={{ fontSize:11, color:'#10b981', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Top Performer</div>
        <div style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>{topSeller.employee?.name} — {PKR(topSeller.salesAmount)} sales · {topSeller.dispensed.toLocaleString()}L dispensed</div>
      </div>
    </div>}

    <DataTable columns={[
      { key:'employee', label:'Employee', render:v=><div><b>{v?.name}</b><div style={{fontSize:10,color:'#8892a4'}}>{v?.role} · {v?.shift}</div></div> },
      { key:'shifts', label:'Shifts', align:'right' },
      { key:'dispensed', label:'Dispensed (L)', align:'right', render:v=><b style={{color:'#3b82f6'}}>{v.toLocaleString()}</b> },
      { key:'salesAmount', label:'Sales', align:'right', render:v=><b style={{color:'#10b981',fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</b> },
      { key:'avgDispensed', label:'Avg/Shift', align:'right', render:v=>`${v.toLocaleString()}L` },
      { key:'shortExcess', label:'Short/Excess', align:'right', render:v=><span style={{color:v<0?'#ef4444':v>0?'#10b981':'#8892a4',fontWeight:600}}>{PKR(v)}</span> },
      { key:'present', label:'Present', align:'right', render:v=><span style={{color:'#10b981'}}>{v}</span> },
      { key:'late', label:'Late', align:'right', render:v=>v?<span style={{color:'#f59e0b'}}>{v}</span>:'0' },
      { key:'absent', label:'Absent', align:'right', render:v=>v?<span style={{color:'#ef4444'}}>{v}</span>:'0' },
      { key:'overtime', label:'OT', align:'right' },
      { key:'attendancePct', label:'Att%', align:'right', render:v=>v>0?<Badge text={`${v}%`} color={v>=90?'#10b981':v>=70?'#f59e0b':'#ef4444'}/>:'—' },
    ]} data={perf.sort((a,b)=>(b.salesAmount||0)-(a.salesAmount||0))}/>

    {data.salesByShift?.length>0 && <div style={{ marginTop:20 }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:10 }}>Sales by Shift</div>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${data.salesByShift.length},1fr)`, gap:14 }}>
        {data.salesByShift.map(s=><div key={s._id} style={{ background:'#141820', borderRadius:12, padding:18, border:'1px solid #1e2533', textAlign:'center' }}>
          <Badge text={s._id} color={s._id==='day'?'#f59e0b':'#06b6d4'}/>
          <div style={{ fontSize:20, fontWeight:800, color:'#e2e8f0', marginTop:8, fontFamily:"'JetBrains Mono',monospace" }}>{PKR(s.totalAmount)}</div>
          <div style={{ fontSize:11, color:'#8892a4', marginTop:4 }}>{s.totalQty?.toLocaleString()}L · {s.count} txns</div>
        </div>)}
      </div>
    </div>}
  </div>;
};

// ─── TANK TRANSFER PAGE ───
const TankTransferPage = () => {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fromTank:'', toTank:'', quantity:'', notes:'' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { tanksAPI.getAll().then(r=>{setTanks(r.data.data); setLoading(false);}).catch(()=>setLoading(false)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await tankTransferAPI.transfer({ ...form, quantity:Number(form.quantity) });
      toast.success(r.data.message);
      setForm({ fromTank:'', toTank:'', quantity:'', notes:'' });
      tanksAPI.getAll().then(r=>setTanks(r.data.data));
    } catch(err) { toast.error(err.response?.data?.message||'Transfer failed'); }
    setSubmitting(false);
  };

  if (loading) return <Loader/>;
  return <div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:18 }}>Tank-to-Tank Transfer</h2>

    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14, marginBottom:24 }}>
      {tanks.map(t=><TankGauge key={t._id} tank={t}/>)}
    </div>

    <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533', maxWidth:600 }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}><div style={{ width:18, height:18, color:'#3b82f6' }}>{I.swap}</div>Transfer Fuel</div>
      <form onSubmit={submit}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:14, alignItems:'flex-end', marginBottom:14 }}>
          <Select label="From Tank" value={form.fromTank} onChange={v=>setForm(p=>({...p,fromTank:v}))} options={[{value:'',label:'Select...'},...tanks.map(t=>({value:t._id,label:`${t.name} (${t.currentStock?.toLocaleString()}L)`}))]}/>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'#1e2533', display:'flex', alignItems:'center', justifyContent:'center', color:'#8892a4', marginBottom:6 }}><div style={{ width:16, height:16 }}>{I.swap}</div></div>
          <Select label="To Tank" value={form.toTank} onChange={v=>setForm(p=>({...p,toTank:v}))} options={[{value:'',label:'Select...'},...tanks.filter(t=>t._id!==form.fromTank).map(t=>({value:t._id,label:`${t.name} (${t.currentStock?.toLocaleString()}L)`}))]}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Quantity (Litres)" type="number" value={form.quantity} onChange={v=>setForm(p=>({...p,quantity:v}))} required/>
          <Input label="Notes" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="Reason for transfer"/>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:18 }}>
          <Btn type="submit" icon={I.swap}>{submitting?'Transferring...':'Transfer Fuel'}</Btn>
        </div>
      </form>
    </div>
  </div>;
};

// ─── DAILY CHECKLIST PAGE ───
const ChecklistPage = () => {
  const [checklists, setChecklists] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState(null);
  const [form, setForm] = useState({ date:today(), shift:'day', type:'opening', completedBy:'' });

  const load = () => { setLoading(true); Promise.all([checklistAPI.getAll({ startDate:daysAgo(7), endDate:today() }), employeesAPI.getAll()]).then(([c,e])=>{ setChecklists(c.data.data); setEmployees(e.data.data); setLoading(false); }).catch(()=>setLoading(false)); };
  useEffect(load, []);

  const createNew = async () => {
    try {
      const r = await checklistAPI.create({ date:form.date, shift:form.shift, type:form.type, completedBy:form.completedBy||undefined });
      toast.success('Checklist created');
      setActiveChecklist(r.data.data);
      setModal(false); load();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };

  const toggleItem = async (idx) => {
    if (!activeChecklist) return;
    const items = [...activeChecklist.items];
    items[idx].checked = !items[idx].checked;
    try {
      const r = await checklistAPI.update(activeChecklist._id, { items });
      setActiveChecklist(r.data.data);
      load();
    } catch(e){ toast.error('Failed to update'); }
  };

  const updateItemRemark = async (idx, remarks) => {
    if (!activeChecklist) return;
    const items = [...activeChecklist.items];
    items[idx].remarks = remarks;
    setActiveChecklist({ ...activeChecklist, items });
  };

  const saveRemarks = async () => {
    try { const r = await checklistAPI.update(activeChecklist._id, { items: activeChecklist.items }); setActiveChecklist(r.data.data); toast.success('Saved'); }
    catch(e){ toast.error('Failed'); }
  };

  const verify = async (id) => {
    try { await checklistAPI.update(id, { status:'Verified' }); toast.success('Verified'); load(); }
    catch(e){ toast.error('Failed'); }
  };

  const del = async (id) => { if(!confirm('Delete?')) return; try { await checklistAPI.delete(id); toast.success('Deleted'); if(activeChecklist?._id===id) setActiveChecklist(null); load(); } catch(e){ toast.error('Failed'); } };

  if (loading) return <Loader/>;

  return <div>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', margin:0 }}>Daily Checklists</h2>
      <Btn icon={I.plus} onClick={()=>setModal(true)}>New Checklist</Btn>
    </div>

    <div style={{ display:'grid', gridTemplateColumns:activeChecklist?'1fr 1.5fr':'1fr', gap:20 }}>
      {/* Checklist list */}
      <div>
        <DataTable columns={[
          { key:'date', label:'Date', render:v=>fmtDate(v) },
          { key:'shift', label:'Shift', render:v=><Badge text={v} color={v==='day'?'#f59e0b':'#06b6d4'}/> },
          { key:'type', label:'Type', render:v=><Badge text={v} color={v==='opening'?'#10b981':'#8b5cf6'}/> },
          { key:'items', label:'Done', align:'right', render:v=>{ const done=v.filter(i=>i.checked).length; return <span style={{color:done===v.length?'#10b981':'#f59e0b',fontWeight:600}}>{done}/{v.length}</span>; }},
          { key:'status', label:'', render:v=><Badge text={v} color={v==='Verified'?'#10b981':v==='Completed'?'#3b82f6':'#f59e0b'}/> },
          { key:'_', label:'', align:'center', render:(_,r)=><div style={{display:'flex',gap:4,justifyContent:'center'}}>
            <button onClick={()=>setActiveChecklist(r)} style={{padding:'3px 8px',background:'#3b82f620',border:'1px solid #3b82f640',borderRadius:6,color:'#3b82f6',fontSize:11,cursor:'pointer'}}>Open</button>
            {r.status==='Completed' && <button onClick={()=>verify(r._id)} style={{padding:'3px 8px',background:'#10b98120',border:'1px solid #10b98140',borderRadius:6,color:'#10b981',fontSize:11,cursor:'pointer'}}>Verify</button>}
            <button onClick={()=>del(r._id)} style={{padding:'3px 8px',background:'#ef444420',border:'1px solid #ef444440',borderRadius:6,color:'#ef4444',fontSize:11,cursor:'pointer'}}>Del</button>
          </div>}
        ]} data={checklists}/>
      </div>

      {/* Active checklist detail */}
      {activeChecklist && <div style={{ background:'#141820', borderRadius:14, padding:20, border:'1px solid #1e2533' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{activeChecklist.type==='opening'?'Opening':'Closing'} Checklist</div>
            <div style={{ fontSize:11, color:'#8892a4' }}>{fmtDate(activeChecklist.date)} · {activeChecklist.shift} shift · {activeChecklist.completedBy?.name||'—'}</div>
          </div>
          <Badge text={activeChecklist.status} color={activeChecklist.status==='Verified'?'#10b981':activeChecklist.status==='Completed'?'#3b82f6':'#f59e0b'}/>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {activeChecklist.items.map((item, i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 10px', background:item.checked?'#10b98108':'#0c0f14', borderRadius:8, border:`1px solid ${item.checked?'#10b98120':'#1e2533'}` }}>
              <input type="checkbox" checked={item.checked} onChange={()=>toggleItem(i)} style={{ marginTop:3, cursor:'pointer', accentColor:'#10b981' }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:item.checked?'#10b981':'#e2e8f0', fontWeight:item.checked?600:400, textDecoration:item.checked?'line-through':'none' }}>{item.label}</div>
                <input placeholder="Remarks..." value={item.remarks||''} onChange={e=>updateItemRemark(i, e.target.value)}
                  style={{ marginTop:4, width:'100%', padding:'4px 8px', background:'transparent', border:'1px solid #1e2533', borderRadius:4, color:'#8892a4', fontSize:11, outline:'none', boxSizing:'border-box' }}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:14, gap:8 }}>
          <Btn variant="ghost" onClick={saveRemarks}>Save Remarks</Btn>
          <button onClick={()=>setActiveChecklist(null)} style={{ padding:'8px 14px', background:'#1e2533', border:'none', borderRadius:6, color:'#8892a4', fontSize:12, cursor:'pointer' }}>Close</button>
        </div>
      </div>}
    </div>

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="New Checklist">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Input label="Date" type="date" value={form.date} onChange={v=>setForm(p=>({...p,date:v}))}/>
        <Select label="Shift" value={form.shift} onChange={v=>setForm(p=>({...p,shift:v}))} options={[{value:'day',label:'Day'},{value:'night',label:'Night'}]}/>
        <Select label="Type" value={form.type} onChange={v=>setForm(p=>({...p,type:v}))} options={[{value:'opening',label:'Opening'},{value:'closing',label:'Closing'}]}/>
        <Select label="Completed By" value={form.completedBy} onChange={v=>setForm(p=>({...p,completedBy:v}))} options={[{value:'',label:'Select...'},...employees.map(e=>({value:e._id,label:`${e.name} (${e.role})`}))]}/>
      </div>
      <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:20 }}>
        <Btn variant="ghost" onClick={()=>setModal(false)}>Cancel</Btn>
        <Btn onClick={createNew}>Create Checklist</Btn>
      </div>
    </Modal>
  </div>;
};

// ─── NAV & LAYOUT ───
const NAV = [
  { id:'dashboard', label:'Dashboard', icon:I.dash },
  { id:'quickSale', label:'Quick Sale (POS)', icon:I.zap, feature:'quick_sale' },
  { id:'sales', label:'Sales', icon:I.dollar, feature:'sales' },
  { id:'purchases', label:'Purchases', icon:I.cart, feature:'purchases' },
  { id:'readings', label:'Shift Readings', icon:I.gauge, feature:'readings' },
  { id:'shiftHandover', label:'Shift Handover', icon:I.swap, feature:'shift_handover' },
  { id:'dips', label:'Tank Dips', icon:I.drop, feature:'dips' },
  { id:'stock', label:'Stock', icon:I.box, feature:'stock' },
  { id:'pumps', label:'Pumps & Tanks', icon:I.pump, feature:'pumps' },
  { id:'tankTransfer', label:'Tank Transfer', icon:I.swap, feature:'tank_transfer' },
  { id:'credit', label:'Credit / Payments', icon:I.card, feature:'credit' },
  { id:'supplierPay', label:'Supplier Payments', icon:I.money, feature:'supplier_payments' },
  { id:'suppliers', label:'Suppliers', icon:I.truck, feature:'suppliers' },
  { id:'customers', label:'Customers', icon:I.users, feature:'customers' },
  { id:'employees', label:'Employees', icon:I.user, feature:'employees' },
  { id:'attendance', label:'Attendance', icon:I.clock, feature:'attendance' },
  { id:'performance', label:'Performance', icon:I.target },
  { id:'payroll', label:'Payroll', icon:I.wallet, feature:'payroll' },
  { id:'expenses', label:'Expenses', icon:I.receipt, feature:'expenses' },
  { id:'cashClosing', label:'Cash Closing', icon:I.money, feature:'cash_closing' },
  { id:'checklist', label:'Checklists', icon:I.clipboard, feature:'checklist' },
  { id:'history', label:'History', icon:I.history, feature:'history' },
  { id:'reports', label:'Reports', icon:I.chart, feature:'reports' },
  { id:'subscription', label:'Subscription', icon:I.card, ownerOnly:true },
  { id:'settings', label:'Settings', icon:I.settings, feature:'settings' },
  { id:'admin', label:'Admin Panel', icon:I.settings, superadminOnly:true },
];

const PAGES = {
  dashboard:DashboardPage,
  quickSale:QuickSalePage,
  sales:SalesPage,
  purchases:PurchasesPage,
  readings:ReadingsPage,
  shiftHandover:ShiftHandoverPage,
  dips:DipsPage,
  stock:StockPage,
  pumps:PumpsPage,
  tankTransfer:TankTransferPage,
  credit:CreditPage,
  supplierPay:SupplierPaymentsPage,
  suppliers:SuppliersPage,
  customers:CustomersPage,
  employees:EmployeesPage,
  attendance:AttendancePage,
  performance:PerformancePage,
  payroll:PayrollPage,
  expenses:ExpensesPage,
  cashClosing:CashClosingPage,
  checklist:ChecklistPage,
  history:HistoryPage,
  reports:ReportsPage,
  subscription:SubscriptionPage,
  settings:SettingsPage,
  admin:AdminPanel,
};

const AppLayout = () => {
  const { user, tenant, loading, logout, login, hasFeature, isSuperAdmin } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [publicView, setPublicView] = useState('landing'); // 'landing' | 'login' | 'register'
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);

  // Fetch alerts periodically
  useEffect(() => {
    if (!user) return;
    const fetchAlerts = () => {
      dashboardAPI.get().then(r => setAlerts(r.data.data?.alerts || [])).catch(() => {});
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 120000);
    return () => clearInterval(interval);
  }, [user]);

  // Listen for subscription expired events
  useEffect(() => {
    const handler = () => setSubscriptionExpired(true);
    window.addEventListener('subscription-expired', handler);
    return () => window.removeEventListener('subscription-expired', handler);
  }, []);

  // Filter nav items based on role and features
  const visibleNav = NAV.filter(n => {
    if (n.superadminOnly && !isSuperAdmin) return false;
    if (n.ownerOnly && user?.role !== 'owner' && !isSuperAdmin) return false;
    if (n.feature && !hasFeature(n.feature)) return false;
    // Hide admin for non-superadmin
    if (n.id === 'admin' && !isSuperAdmin) return false;
    return true;
  });

  if (loading) return <Loader/>;
  if (!user) {
    if (publicView === 'register') return <RegisterPage onBack={()=>setPublicView('login')}/>;
    if (publicView === 'login') return <LoginPage onBack={()=>setPublicView('landing')} onRegister={()=>setPublicView('register')}/>;
    return <LandingPage
      onLogin={()=>setPublicView('login')}
      onRegister={()=>setPublicView('register')}
      onDemo={async ()=>{
        try { await login('owner@fuelmaster.pk','admin123'); }
        catch(e) { setPublicView('login'); }
      }}
    />;
  }
  const Page = PAGES[page] || DashboardPage;
  const pageProps = page === 'dashboard' ? { onNavigate: setPage } : {};
  return <div style={{ display:'flex', minHeight:'100vh', background:'#0c0f14', fontFamily:"'Outfit',-apple-system,sans-serif", color:'#e2e8f0' }}>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>
    <aside style={{ width:collapsed?72:250, background:'#0a0d12', borderRight:'1px solid #1e2533', display:'flex', flexDirection:'column', transition:'width 0.25s', overflow:'hidden', flexShrink:0, position:'sticky', top:0, height:'100vh' }}>
      <div style={{ padding:collapsed?'20px 14px':'20px 22px', borderBottom:'1px solid #1e2533', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><div style={{ width:22, height:22, color:'#fff' }}>{I.fuel}</div></div>
        {!collapsed && <div><div style={{ fontSize:15, fontWeight:800, color:'#e2e8f0' }}>FuelMaster</div><div style={{ fontSize:9, color:'#10b981', fontWeight:600, textTransform:'uppercase', letterSpacing:1.5 }}>PK Edition</div></div>}
      </div>
      <nav style={{ flex:1, overflow:'auto', padding:'12px 10px' }}>
        {visibleNav.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:collapsed?'10px 16px':'10px 14px', marginBottom:2, borderRadius:8, border:'none', background:page===n.id?'#10b98118':'transparent', color:page===n.id?'#10b981':'#8892a4', cursor:'pointer', fontSize:13, fontWeight:page===n.id?600:500, justifyContent:collapsed?'center':'flex-start', position:'relative' }}>
          {page===n.id && <div style={{ position:'absolute', left:0, width:3, height:24, background:'#10b981', borderRadius:'0 3px 3px 0' }}/>}
          <div style={{ width:20, height:20, flexShrink:0 }}>{n.icon}</div>
          {!collapsed && <span>{n.label}</span>}
        </button>)}
      </nav>
      <div style={{ padding:12, borderTop:'1px solid #1e2533' }}>
        {!collapsed && <div style={{ marginBottom:12, padding:'8px 10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,#10b981,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>{user.name?.slice(0,2).toUpperCase()}</div>
            <div><div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0' }}>{user.name}</div><div style={{ fontSize:10, color:'#8892a4', textTransform:'capitalize' }}>{user.role}</div></div>
          </div>
          {tenant && <div style={{ fontSize:10, color:'#4a5568', padding:'4px 8px', background:'#0c0f14', borderRadius:6, marginTop:4 }}>{tenant.name} · <span style={{ color:{free:'#8892a4',starter:'#3b82f6',professional:'#10b981',enterprise:'#8b5cf6'}[tenant.plan]||'#8892a4', fontWeight:600, textTransform:'uppercase' }}>{tenant.plan}</span></div>}
        </div>}
        <button onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:8, background:'#ef444415', border:'1px solid #ef444430', borderRadius:8, color:'#ef4444', fontSize:11, fontWeight:600, cursor:'pointer' }}>
          <div style={{ width:14, height:14 }}>{I.logout}</div>{!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
    <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <header style={{ padding:'14px 28px', borderBottom:'1px solid #1e2533', background:'#0a0d12', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <button onClick={()=>setCollapsed(!collapsed)} style={{ background:'none', border:'none', color:'#8892a4', cursor:'pointer' }}><div style={{ width:22, height:22 }}>{I.menu}</div></button>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {/* Notification Bell */}
          <div style={{ position:'relative' }}>
            <button onClick={()=>setShowAlerts(!showAlerts)} style={{ background:'none', border:'none', color:alerts.length>0?'#f59e0b':'#8892a4', cursor:'pointer', position:'relative' }}>
              <div style={{ width:20, height:20 }}>{I.bell}</div>
              {alerts.length>0 && <span style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{alerts.length}</span>}
            </button>
            {showAlerts && <div style={{ position:'absolute', top:'100%', right:0, marginTop:8, width:340, maxHeight:400, overflow:'auto', background:'#141820', border:'1px solid #1e2533', borderRadius:12, boxShadow:'0 20px 40px rgba(0,0,0,0.5)', zIndex:100 }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e2533', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>Alerts</span>
                <span style={{ fontSize:11, color:'#8892a4' }}>{alerts.length} active</span>
              </div>
              {alerts.length === 0 && <div style={{ padding:24, textAlign:'center', color:'#4a5568', fontSize:12 }}>No alerts — everything looks good!</div>}
              {alerts.map((a,i)=><div key={i} style={{ padding:'10px 16px', borderBottom:'1px solid #1e2533', display:'flex', alignItems:'flex-start', gap:10 }}>
                <div style={{ width:14, height:14, flexShrink:0, marginTop:1, color:a.severity==='critical'?'#ef4444':'#f59e0b' }}>{I.warn}</div>
                <div>
                  <div style={{ fontSize:12, color:'#e2e8f0', fontWeight:500 }}>{a.message}</div>
                  <div style={{ fontSize:10, color:'#4a5568', marginTop:2, textTransform:'capitalize' }}>{a.type.replace(/_/g,' ')}</div>
                </div>
              </div>)}
            </div>}
          </div>
          <div style={{ fontSize:12, color:'#8892a4' }}>{new Date().toLocaleDateString('en-PK',{weekday:'long',day:'2-digit',month:'short',year:'numeric'})}</div>
        </div>
      </header>
      <div style={{ flex:1, padding:28, overflow:'auto' }}>
        {subscriptionExpired && <div style={{ padding:'14px 20px', background:'#ef444415', border:'1px solid #ef444435', borderRadius:12, marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:18, height:18, color:'#ef4444' }}>{I.warn}</div>
            <span style={{ color:'#ef4444', fontSize:13, fontWeight:600 }}>Your subscription has expired. Please renew to continue using all features.</span>
          </div>
          <button onClick={()=>setPage('subscription')} style={{ padding:'6px 14px', background:'#ef4444', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>Renew Now</button>
        </div>}
        {tenant?.subscriptionStatus==='trial' && tenant?.trialEndsAt && <div style={{ padding:'10px 20px', background:'#f59e0b10', border:'1px solid #f59e0b30', borderRadius:10, marginBottom:16, display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
          <div style={{ width:14, height:14, color:'#f59e0b' }}>{I.clock}</div>
          <span style={{ color:'#f59e0b' }}>Free trial · Ends {new Date(tenant.trialEndsAt).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'})}</span>
        </div>}
        <Page {...pageProps}/>
      </div>
    </main>
    {/* Click outside to close alerts */}
    {showAlerts && <div onClick={()=>setShowAlerts(false)} style={{ position:'fixed', inset:0, zIndex:9 }}/>}
  </div>;
};

export default function App() {
  return <AuthProvider>
    <Toaster position="top-right" toastOptions={{ style:{ background:'#141820', color:'#e2e8f0', border:'1px solid #1e2533', fontSize:13 } }}/>
    <AppLayout/>
  </AuthProvider>;
}
