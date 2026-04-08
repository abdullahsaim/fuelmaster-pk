import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { dashboardAPI, salesAPI, purchasesAPI, suppliersAPI, customersAPI, employeesAPI, expensesAPI, payrollAPI, tanksAPI, nozzlesAPI, productsAPI, fuelTypesAPI, settingsAPI, readingsAPI, dipsAPI, creditPaymentsAPI, supplierPaymentsAPI, pumpsAPI, historyAPI, reportsAPI } from './utils/api.js';
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

// ─── LOGIN PAGE ───
const LoginPage = () => {
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

  return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0c0f14,#1a1f2a,#0c0f14)', fontFamily:"'Outfit',sans-serif" }}>
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
    </div>
  </div>;
};

// ─── DASHBOARD ───
const DashboardPage = () => {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { dashboardAPI.get().then(r=>{ setD(r.data.data); setLoading(false); }).catch(()=>setLoading(false)); }, []);
  if (loading) return <Loader/>;
  if (!d) return <div style={{ color:'#ef4444', padding:40 }}>Failed to load</div>;
  const t = d.todaySales||{}, y = d.yesterdaySales||{};
  return <div>
    <h1 style={{ fontSize:28, fontWeight:800, color:'#e2e8f0', margin:'0 0 4px' }}>Dashboard</h1>
    <p style={{ color:'#8892a4', fontSize:13, marginBottom:24 }}>Live Overview — {fmtDate(new Date())}</p>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:24 }}>
      <StatCard icon={I.dollar} label="Today Revenue" value={PKR(t.totalAmount||0)} color="#10b981"/>
      <StatCard icon={I.fuel} label="Fuel Sold" value={`${(t.totalQty||0).toLocaleString()} Ltr`} color="#3b82f6"/>
      <StatCard icon={I.users} label="Credit Outstanding" value={PKR(d.creditOutstanding?.totalBalance||0)} color="#f59e0b"/>
      <StatCard icon={I.receipt} label="Monthly Expenses" value={PKR(d.monthlyExpenses?.totalAmount||0)} color="#ef4444"/>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
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

const SettingsPage = () => {
  const [s, setS] = useState(null); const [ft, setFt] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([settingsAPI.getAll(),fuelTypesAPI.getAll()]).then(([a,b])=>{setS(a.data.data?.[0]||{});setFt(b.data.data);setLoading(false);}).catch(()=>setLoading(false)); }, []);
  if (loading) return <Loader/>;
  return <div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:20 }}>Settings</h2>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#e2e8f0', marginBottom:16 }}>Station Info</div>
        {[['Station',s?.stationName],['Brand',s?.brand],['Owner',s?.ownerName],['City',s?.city],['NTN',s?.ntn],['Phone',s?.phone]].map(([l,v])=>
          <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #1e2533'}}><span style={{fontSize:12,color:'#8892a4'}}>{l}</span><span style={{fontSize:13,color:'#e2e8f0',fontWeight:600}}>{v||'—'}</span></div>)}
      </div>
      <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#e2e8f0', marginBottom:16 }}>OGRA Rates</div>
        {ft.map(f=><div key={f._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #1e2533'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:10,height:10,borderRadius:'50%',background:f.color}}/><span style={{fontSize:13,color:'#e2e8f0'}}>{f.name}</span></div>
          <span style={{fontWeight:700,color:f.color,fontFamily:"'JetBrains Mono',monospace"}}>{PKR(f.currentRate)}/{f.unit}</span>
        </div>)}
      </div>
    </div>
  </div>;
};

// ─── NAV & LAYOUT ───
const NAV = [
  { id:'dashboard', label:'Dashboard', icon:I.dash },
  { id:'sales', label:'Sales', icon:I.dollar },
  { id:'purchases', label:'Purchases', icon:I.cart },
  { id:'readings', label:'Shift Readings', icon:I.gauge },
  { id:'dips', label:'Tank Dips', icon:I.drop },
  { id:'stock', label:'Stock', icon:I.box },
  { id:'pumps', label:'Pumps & Tanks', icon:I.pump },
  { id:'credit', label:'Credit / Payments', icon:I.card },
  { id:'suppliers', label:'Suppliers', icon:I.truck },
  { id:'customers', label:'Customers', icon:I.users },
  { id:'employees', label:'Employees', icon:I.user },
  { id:'expenses', label:'Expenses', icon:I.receipt },
  { id:'history', label:'History', icon:I.history },
  { id:'reports', label:'Reports', icon:I.chart },
  { id:'settings', label:'Settings', icon:I.settings },
];

const PAGES = {
  dashboard:DashboardPage,
  sales:SalesPage,
  purchases:PurchasesPage,
  readings:ReadingsPage,
  dips:DipsPage,
  stock:StockPage,
  pumps:PumpsPage,
  credit:CreditPage,
  suppliers:SuppliersPage,
  customers:CustomersPage,
  employees:EmployeesPage,
  expenses:ExpensesPage,
  history:HistoryPage,
  reports:ReportsPage,
  settings:SettingsPage,
};

const AppLayout = () => {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  if (loading) return <Loader/>;
  if (!user) return <LoginPage/>;
  const Page = PAGES[page] || DashboardPage;
  return <div style={{ display:'flex', minHeight:'100vh', background:'#0c0f14', fontFamily:"'Outfit',-apple-system,sans-serif", color:'#e2e8f0' }}>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet"/>
    <aside style={{ width:collapsed?72:250, background:'#0a0d12', borderRight:'1px solid #1e2533', display:'flex', flexDirection:'column', transition:'width 0.25s', overflow:'hidden', flexShrink:0, position:'sticky', top:0, height:'100vh' }}>
      <div style={{ padding:collapsed?'20px 14px':'20px 22px', borderBottom:'1px solid #1e2533', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><div style={{ width:22, height:22, color:'#fff' }}>{I.fuel}</div></div>
        {!collapsed && <div><div style={{ fontSize:15, fontWeight:800, color:'#e2e8f0' }}>FuelMaster</div><div style={{ fontSize:9, color:'#10b981', fontWeight:600, textTransform:'uppercase', letterSpacing:1.5 }}>PK Edition</div></div>}
      </div>
      <nav style={{ flex:1, overflow:'auto', padding:'12px 10px' }}>
        {NAV.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:collapsed?'10px 16px':'10px 14px', marginBottom:2, borderRadius:8, border:'none', background:page===n.id?'#10b98118':'transparent', color:page===n.id?'#10b981':'#8892a4', cursor:'pointer', fontSize:13, fontWeight:page===n.id?600:500, justifyContent:collapsed?'center':'flex-start', position:'relative' }}>
          {page===n.id && <div style={{ position:'absolute', left:0, width:3, height:24, background:'#10b981', borderRadius:'0 3px 3px 0' }}/>}
          <div style={{ width:20, height:20, flexShrink:0 }}>{n.icon}</div>
          {!collapsed && <span>{n.label}</span>}
        </button>)}
      </nav>
      <div style={{ padding:12, borderTop:'1px solid #1e2533' }}>
        {!collapsed && <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, padding:'8px 10px' }}>
          <div style={{ width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,#10b981,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>{user.name?.slice(0,2).toUpperCase()}</div>
          <div><div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0' }}>{user.name}</div><div style={{ fontSize:10, color:'#8892a4', textTransform:'capitalize' }}>{user.role}</div></div>
        </div>}
        <button onClick={logout} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:8, background:'#ef444415', border:'1px solid #ef444430', borderRadius:8, color:'#ef4444', fontSize:11, fontWeight:600, cursor:'pointer' }}>
          <div style={{ width:14, height:14 }}>{I.logout}</div>{!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
    <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      <header style={{ padding:'14px 28px', borderBottom:'1px solid #1e2533', background:'#0a0d12', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <button onClick={()=>setCollapsed(!collapsed)} style={{ background:'none', border:'none', color:'#8892a4', cursor:'pointer' }}><div style={{ width:22, height:22 }}>{I.menu}</div></button>
        <div style={{ fontSize:12, color:'#8892a4' }}>{new Date().toLocaleDateString('en-PK',{weekday:'long',day:'2-digit',month:'short',year:'numeric'})}</div>
      </header>
      <div style={{ flex:1, padding:28, overflow:'auto' }}><Page/></div>
    </main>
  </div>;
};

export default function App() {
  return <AuthProvider>
    <Toaster position="top-right" toastOptions={{ style:{ background:'#141820', color:'#e2e8f0', border:'1px solid #1e2533', fontSize:13 } }}/>
    <AppLayout/>
  </AuthProvider>;
}
