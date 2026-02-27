import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { store, fmt, STATUS_LABEL } from '../store';

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [tab, setTab]           = useState('orders');
  const [orders, setOrders]     = useState(store.getOrders());
  const [procs, setProcs]       = useState(store.getProcedures());
  const [search, setSearch]     = useState('');
  const [editId, setEditId]     = useState(null);
  const [editVal, setEditVal]   = useState('');
  const [copied, setCopied]     = useState(null);
  const [highlight, setHL]      = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const h = params.get('highlight');
    const c = params.get('copied');
    if (h) { setHL(h); setCopied(h); setTimeout(() => { setHL(null); setCopied(null); }, 4000); }
  }, [location.search]);

  const refresh = () => { setOrders(store.getOrders()); setProcs(store.getProcedures()); };

  const savePrice = (id) => {
    const p = parseFloat(editVal);
    if (!isNaN(p) && p > 0) { store.updateProcedurePrice(id, p); refresh(); }
    setEditId(null);
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/assinar/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id); setTimeout(() => setCopied(null), 2500);
    });
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const revenue  = orders.filter(o => o.status==='signed').reduce((s,o) => s+o.total, 0);
  const signed   = orders.filter(o => o.status==='signed').length;
  const sent     = orders.filter(o => o.status==='sent').length;
  const drafts   = orders.filter(o => o.status==='draft').length;

  const statCards = [
    { label:'Receita confirmada', value:fmt(revenue),         icon:'💰', bg:'#FFF3E4', accent:'var(--caramel)' },
    { label:'Assinados',          value:String(signed),       icon:'✓',  bg:'var(--green-bg)', accent:'var(--green)' },
    { label:'Aguardando assinatura', value:String(sent),      icon:'⏳', bg:'#FFF8EE', accent:'var(--caramel2)' },
    { label:'Rascunhos',          value:String(drafts),       icon:'📋', bg:'var(--warm)', accent:'var(--light)' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Painel Administrativo" action={{ label:'+ Novo orçamento', onClick:() => navigate('/admin/novo') }} />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px 64px' }}>

        {/* Copied toast */}
        {copied && (
          <div className="fade-up" style={{
            position:'fixed', bottom:28, right:28, zIndex:999,
            background:'var(--dark)', color:'white', padding:'13px 22px',
            borderRadius:10, fontSize:13, fontWeight:500,
            boxShadow:'0 8px 32px rgba(0,0,0,.2)',
            borderLeft:'4px solid var(--caramel)',
          }}>
            ✓ Link copiado para a área de transferência
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
          {statCards.map((s,i) => (
            <div key={i} className="fade-up" style={{ animationDelay:`${i*.05}s`, background:'white', borderRadius:14, padding:20, border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:600, color:s.accent }}>{s.value}</div>
                <div style={{ fontSize:12, color:'var(--mid)', marginTop:2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:20, background:'white', padding:5, borderRadius:12, border:'1px solid var(--border)', width:'fit-content' }}>
          {[['orders','Orçamentos',orders.length],['procedures','Procedimentos',procs.length]].map(([key,label,count]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding:'9px 20px', borderRadius:9, border:'none',
              background: tab===key ? 'var(--dark)' : 'transparent',
              color: tab===key ? 'white' : 'var(--mid)',
              fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8, transition:'all .2s',
            }}>
              {label}
              <span style={{ fontSize:11, padding:'2px 7px', borderRadius:10, background: tab===key ? 'rgba(255,255,255,.15)' : 'var(--warm)', color: tab===key ? 'rgba(255,255,255,.8)' : 'var(--mid)' }}>{count}</span>
            </button>
          ))}
        </div>

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="fade-in" style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden' }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <h2 style={{ fontSize:20 }}>Orçamentos</h2>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por cliente ou nº..."
                style={{ padding:'9px 16px', borderRadius:8, border:'1.5px solid var(--border)', background:'var(--bg)', fontSize:13, outline:'none', width:240 }}
              />
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {['Nº','Paciente','Procedimentos','Total','Status','Data','Ações'].map(h => (
                      <th key={h} style={{ padding:'13px 20px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', fontWeight:600, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--light)', fontSize:14 }}>Nenhum orçamento encontrado</td></tr>
                  ) : filteredOrders.map(o => {
                    const st = STATUS_LABEL[o.status];
                    const isHL = o.id === highlight;
                    return (
                      <tr key={o.id} style={{ background: isHL ? '#FFFBF5' : 'transparent', transition:'background .3s' }}>
                        <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)' }}>
                          <span style={{ fontSize:12, fontWeight:700, color:'var(--caramel)', background:'#FFF3E4', padding:'4px 10px', borderRadius:6 }}>{o.id}</span>
                        </td>
                        <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)' }}>
                          <div style={{ fontSize:14, fontWeight:500, color:'var(--dark)' }}>{o.client.name}</div>
                          <div style={{ fontSize:12, color:'var(--light)', marginTop:2 }}>{o.client.email}</div>
                        </td>
                        <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)' }}>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:4, maxWidth:260 }}>
                            {o.items.map(i => (
                              <span key={i.id} style={{ fontSize:11, background:'var(--warm)', color:'var(--mid)', padding:'3px 8px', borderRadius:5 }}>{i.name}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)', fontFamily:'Cormorant Garamond,serif', fontSize:16, fontWeight:600, color:'var(--caramel)', whiteSpace:'nowrap' }}>{fmt(o.total)}</td>
                        <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)' }}>
                          <span style={{ padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:st.bg, color:st.color, whiteSpace:'nowrap' }}>{st.label}</span>
                        </td>
                        <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)', fontSize:12, color:'var(--mid)', whiteSpace:'nowrap' }}>{o.createdAt}</td>
                        <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            {o.status !== 'signed' && (
                              <button
                                onClick={() => copyLink(o.id)}
                                style={{
                                  padding:'6px 12px', borderRadius:7,
                                  border: copied===o.id ? 'none' : '1.5px solid var(--border)',
                                  background: copied===o.id ? 'var(--green-bg)' : 'white',
                                  color: copied===o.id ? 'var(--green)' : 'var(--mid)',
                                  fontSize:12, fontWeight:600, transition:'all .2s', whiteSpace:'nowrap',
                                }}
                              >
                                {copied===o.id ? '✓ Copiado' : '🔗 Copiar link'}
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/assinar/${o.id}`)}
                              style={{ padding:'6px 12px', borderRadius:7, border:'1.5px solid var(--border)', background:'white', color:'var(--mid)', fontSize:12, fontWeight:600, transition:'all .2s', whiteSpace:'nowrap' }}
                              onMouseOver={e => e.currentTarget.style.borderColor='var(--caramel)'}
                              onMouseOut={e  => e.currentTarget.style.borderColor='var(--border)'}
                            >
                              {o.status === 'signed' ? '👁 Ver' : '📄 Abrir'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PROCEDURES */}
        {tab === 'procedures' && (
          <div className="fade-in" style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden' }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:20 }}>Procedimentos</h2>
              <span style={{ fontSize:12, color:'var(--light)', background:'var(--warm)', padding:'6px 14px', borderRadius:6 }}>Clique no valor para editar o preço</span>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {['Procedimento','Categoria','Descrição','Preço'].map(h => (
                      <th key={h} style={{ padding:'13px 20px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', fontWeight:600, borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {procs.map(p => (
                    <tr key={p.id}>
                      <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)', fontSize:14, fontWeight:500, color:'var(--dark)' }}>{p.name}</td>
                      <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)' }}>
                        <span style={{ fontSize:11, fontWeight:600, background:'var(--warm)', color:'var(--mid)', padding:'4px 10px', borderRadius:6 }}>{p.category}</span>
                      </td>
                      <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)', fontSize:12, color:'var(--mid)', maxWidth:240 }}>{p.desc}</td>
                      <td style={{ padding:'16px 20px', borderBottom:'1px solid var(--warm)' }}>
                        {editId === p.id ? (
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ fontSize:13, color:'var(--mid)' }}>R$</span>
                            <input
                              autoFocus type="number" value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              onKeyDown={e => { if(e.key==='Enter') savePrice(p.id); if(e.key==='Escape') setEditId(null); }}
                              style={{ width:90, padding:'6px 10px', borderRadius:7, border:'1.5px solid var(--caramel)', fontSize:14, fontWeight:600, outline:'none' }}
                            />
                            <button onClick={() => savePrice(p.id)} style={{ width:28, height:28, borderRadius:7, background:'var(--green)', color:'white', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>✓</button>
                            <button onClick={() => setEditId(null)} style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--border)', background:'white', color:'var(--mid)', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditId(p.id); setEditVal(String(p.price)); }}
                            style={{ padding:'7px 14px', borderRadius:8, border:'1.5px solid var(--border)', background:'var(--bg)', color:'var(--caramel)', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:8, transition:'all .2s' }}
                            onMouseOver={e => e.currentTarget.style.borderColor='var(--caramel)'}
                            onMouseOut={e  => e.currentTarget.style.borderColor='var(--border)'}
                          >
                            {fmt(p.price)} <span style={{ fontSize:12, color:'var(--light)' }}>✎</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
