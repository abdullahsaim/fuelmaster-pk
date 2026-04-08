import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { dashboardAPI, salesAPI, purchasesAPI, suppliersAPI, customersAPI, employeesAPI, expensesAPI, payrollAPI, tanksAPI, productsAPI, fuelTypesAPI, settingsAPI } from './utils/api.js';
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

const PurchasesPage = () => {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { purchasesAPI.getAll().then(r=>{ setData(r.data.data); setLoading(false); }).catch(()=>setLoading(false)); }, []);
  if (loading) return <Loader/>;
  return <div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:20 }}>Purchases</h2>
    <DataTable columns={[{key:'date',label:'Date',render:v=>fmtDate(v)},{key:'supplier',label:'Supplier',render:v=>v?.name||'—'},{key:'fuelType',label:'Fuel',render:v=>v?.name||'—'},{key:'quantity',label:'Qty',align:'right',render:v=>v?.toLocaleString()},{key:'rate',label:'Rate',align:'right',render:v=>PKR(v)},{key:'amount',label:'Total',align:'right',render:v=><span style={{fontWeight:700,color:'#3b82f6'}}>{PKR(v)}</span>},{key:'status',label:'Status',render:v=><Badge text={v||'Pending'} color={v==='Received'?'#10b981':'#f59e0b'}/>}]} data={data}/>
  </div>;
};

const ReportsPage = () => {
  const [pnl, setPnl] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => {
    const ms = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10);
    dashboardAPI.getPnL({ startDate:ms, endDate:today() }).then(r=>{ setPnl(r.data.data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);
  if (loading) return <Loader/>;
  if (!pnl) return <div style={{color:'#ef4444',padding:40}}>Failed</div>;
  return <div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#e2e8f0', marginBottom:20 }}>Profit & Loss — {new Date().toLocaleDateString('en-PK',{month:'long',year:'numeric'})}</h2>
    <div style={{ background:'#141820', borderRadius:14, padding:24, border:'1px solid #1e2533' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div>{[['Revenue',pnl.revenue,'#10b981']].map(([l,v,c])=><div key={l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #1e2533'}}><span style={{color:'#e2e8f0'}}>{l}</span><span style={{color:c,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</span></div>)}</div>
        <div>{[['Purchases',pnl.purchases],['Expenses',pnl.expenses]].map(([l,v])=><div key={l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #1e2533'}}><span style={{color:'#e2e8f0'}}>{l}</span><span style={{color:'#ef4444',fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{PKR(v)}</span></div>)}</div>
      </div>
      <div style={{ marginTop:20, padding:16, background:pnl.netProfit>=0?'#10b98112':'#ef444412', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>Net Profit/Loss</span>
        <span style={{ fontSize:24, fontWeight:800, color:pnl.netProfit>=0?'#10b981':'#ef4444', fontFamily:"'JetBrains Mono',monospace" }}>{pnl.netProfit>=0?'+':''}{PKR(pnl.netProfit)}</span>
      </div>
    </div>
  </div>;
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
  { id:'stock', label:'Stock', icon:I.box },
  { id:'suppliers', label:'Suppliers', icon:I.truck },
  { id:'customers', label:'Customers', icon:I.users },
  { id:'employees', label:'Employees', icon:I.user },
  { id:'expenses', label:'Expenses', icon:I.receipt },
  { id:'reports', label:'Reports', icon:I.chart },
  { id:'settings', label:'Settings', icon:I.settings },
];

const PAGES = { dashboard:DashboardPage, sales:DashboardPage, purchases:PurchasesPage, stock:StockPage, suppliers:SuppliersPage, customers:CustomersPage, employees:EmployeesPage, expenses:ExpensesPage, reports:ReportsPage, settings:SettingsPage };

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
