
// ─────────────────────────────────────────────
//  Componente de impressão de orçamento
// ─────────────────────────────────────────────
function PrintModal({ order, onClose }) {
  const handlePrint = () => {
    const el = document.getElementById('print-doc');
    // Inject print-specific styles that suppress browser headers/footers
    const style = document.createElement('style');
    style.id = '__print_style__';
    style.innerHTML = `
      @media print {
        @page { margin: 12mm; size: A4; }
        body > *:not(#__print_root__) { display: none !important; }
        #__print_root__ { display: block !important; }
      }
    `;
    document.head.appendChild(style);

    // Create a hidden print container
    const container = document.createElement('div');
    container.id = '__print_root__';
    container.style.cssText = 'display:none;position:fixed;inset:0;background:white;z-index:99999;font-family:DM Sans,sans-serif;';
    container.innerHTML = el.innerHTML;
    document.body.appendChild(container);

    // Show it only during print
    const beforePrint = () => { container.style.display = 'block'; };
    const afterPrint  = () => {
      container.style.display = 'none';
      document.body.removeChild(container);
      const s = document.getElementById('__print_style__');
      if (s) s.remove();
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint',  afterPrint);
    };
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint',  afterPrint);
    window.print();
  };

  const fmtV = v => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,0.55)', display:'flex',
      alignItems:'flex-start', justifyContent:'center',
      padding:'32px 16px', overflowY:'auto',
    }} onClick={e => { if(e.target===e.currentTarget) onClose(); }}>

      <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:720,
        boxShadow:'0 24px 64px rgba(0,0,0,.25)', overflow:'hidden' }}>

        {/* Modal header */}
        <div style={{ background:'#2C2416', padding:'18px 28px',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, color:'white', fontWeight:500 }}>
            Orçamento #{order.id}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={handlePrint} style={{
              padding:'8px 20px', borderRadius:8, border:'none',
              background:'#C8873A', color:'white', fontSize:13, fontWeight:600, cursor:'pointer',
            }}>🖨 Imprimir / Salvar PDF</button>
            <button onClick={onClose} style={{
              padding:'8px 14px', borderRadius:8,
              border:'1px solid rgba(255,255,255,.2)', background:'transparent',
              color:'white', fontSize:13, cursor:'pointer',
            }}>✕ Fechar</button>
          </div>
        </div>

        {/* Documento imprimível */}
        <div id="print-doc" style={{ padding:'36px 40px', fontFamily:'DM Sans, sans-serif' }}>

          {/* Cabeçalho do doc */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, paddingBottom:20, borderBottom:'2px solid #C8873A' }}>
            <div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:600, color:'#2C2416', marginBottom:4 }}>
                Clínica Estética
              </div>
              <div style={{ fontSize:12, color:'#A08B74' }}>Sistema de Orçamentos</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'#A08B74', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Orçamento</div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, fontWeight:600, color:'#C8873A' }}>#{order.id}</div>
              <div style={{ fontSize:12, color:'#A08B74', marginTop:4 }}>Emitido em {order.createdAt}</div>
              <div style={{ fontSize:12, color:'#A08B74' }}>Validade: 30 dias</div>
            </div>
          </div>

          {/* Dados do paciente */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:10 }}>Paciente</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px 24px' }}>
              {[
                ['Nome', order.client.name],
                ['CPF', order.client.cpf],
                ['Telefone', order.client.phone],
                ['E-mail', order.client.email],
                ['Responsável', order.employee],
                ['Data', order.createdAt],
              ].map(([k,v]) => (
                <div key={k}>
                  <div style={{ fontSize:10, color:'#A08B74', fontWeight:600, marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height:1, background:'#E8DDD0', marginBottom:24 }} />

          {/* Procedimentos */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:10 }}>Procedimentos</div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F5EDE0' }}>
                  <th style={{ padding:'9px 12px', textAlign:'left', fontSize:11, color:'#6B5B47', fontWeight:600 }}>Procedimento</th>
                  <th style={{ padding:'9px 12px', textAlign:'left', fontSize:11, color:'#6B5B47', fontWeight:600 }}>Categoria</th>
                  <th style={{ padding:'9px 12px', textAlign:'right', fontSize:11, color:'#6B5B47', fontWeight:600 }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={item.id} style={{ background: i%2===0 ? 'white' : '#FAF7F2' }}>
                    <td style={{ padding:'9px 12px', fontSize:13, color:'#2C2416' }}>{item.name}</td>
                    <td style={{ padding:'9px 12px', fontSize:12, color:'#6B5B47' }}>{item.category}</td>
                    <td style={{ padding:'9px 12px', textAlign:'right', fontSize:13, color:'#6B5B47' }}>{fmtV(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hospital */}
          {order.hospital && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:10 }}>Hospital</div>
              <div style={{ background:'#FAF7F2', borderRadius:8, padding:'12px 16px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px 24px' }}>
                <div>
                  <div style={{ fontSize:10, color:'#A08B74', marginBottom:2 }}>Hospital</div>
                  <div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{order.hospital.name}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'#A08B74', marginBottom:2 }}>Pagamento</div>
                  <div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{order.hospital.payType}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'#A08B74', marginBottom:2 }}>Pernoite</div>
                  <div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{order.hospital.pernoite ? 'Com pernoite' : 'Sem pernoite'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Anestesia */}
          {order.anestesia && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:10 }}>Anestesia</div>
              <div style={{ background:'#FAF7F2', borderRadius:8, padding:'12px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 24px' }}>
                <div>
                  <div style={{ fontSize:10, color:'#A08B74', marginBottom:2 }}>Tempo</div>
                  <div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{order.anestesia.tempo}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, color:'#A08B74', marginBottom:2 }}>Pagamento</div>
                  <div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{order.anestesia.payType}</div>
                </div>
              </div>
            </div>
          )}

          {/* Totais */}
          <div style={{ background:'#2C2416', borderRadius:10, padding:'16px 20px', marginBottom:28 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'rgba(255,255,255,.6)' }}>
                <span>Procedimentos</span>
                <span>{fmtV(order.items.reduce((s,i)=>s+i.price,0))}</span>
              </div>
              {order.hospital && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'rgba(255,255,255,.6)' }}>
                  <span>Hospital</span><span>{fmtV(order.hospital.valor)}</span>
                </div>
              )}
              {order.anestesia && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'rgba(255,255,255,.6)' }}>
                  <span>Anestesia</span><span>{fmtV(order.anestesia.valor)}</span>
                </div>
              )}
              <div style={{ height:1, background:'rgba(255,255,255,.15)', margin:'4px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:14, color:'rgba(255,255,255,.8)', fontWeight:600 }}>TOTAL GERAL</span>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, fontWeight:600, color:'#E8A55A' }}>{fmtV(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {order.obs && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:8 }}>Observações</div>
              <div style={{ background:'#FAF7F2', borderRadius:8, padding:'12px 16px', fontSize:13, color:'#6B5B47', lineHeight:1.7 }}>{order.obs}</div>
            </div>
          )}

          {/* Área de assinatura */}
          <div style={{ borderTop:'1px solid #E8DDD0', paddingTop:24 }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:16 }}>Assinatura</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>
              {/* Cliente */}
              <div>
                <div style={{ height:64, borderBottom:'1.5px solid #2C2416', marginBottom:10 }} />
                <div style={{ fontSize:12, color:'#6B5B47', marginBottom:3 }}>{order.client.name}</div>
                <div style={{ fontSize:11, color:'#A08B74' }}>Paciente — CPF: {order.client.cpf}</div>
                <div style={{ fontSize:11, color:'#A08B74', marginTop:4 }}>Data: _____ / _____ / _______</div>
              </div>
              {/* Responsável */}
              <div>
                <div style={{ height:64, borderBottom:'1.5px solid #2C2416', marginBottom:10 }} />
                <div style={{ fontSize:12, color:'#6B5B47', marginBottom:3 }}>{order.employee}</div>
                <div style={{ fontSize:11, color:'#A08B74' }}>Responsável pelo atendimento</div>
                <div style={{ fontSize:11, color:'#A08B74', marginTop:4 }}>Data: _____ / _____ / _______</div>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div style={{ marginTop:28, paddingTop:14, borderTop:'1px solid #E8DDD0', textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#A08B74' }}>
              Clínica Estética — Documento gerado em {today} — Válido por 30 dias
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

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
  const [printOrder, setPrintOrder] = useState(null);
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
                              onClick={() => setPrintOrder(o)}
                              style={{ padding:'6px 12px', borderRadius:7, border:'1.5px solid var(--border)', background:'white', color:'var(--mid)', fontSize:12, fontWeight:600, transition:'all .2s', whiteSpace:'nowrap' }}
                              onMouseOver={e => e.currentTarget.style.borderColor='var(--caramel)'}
                              onMouseOut={e  => e.currentTarget.style.borderColor='var(--border)'}
                            >
                              🖨 Imprimir
                            </button>
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
      {printOrder && <PrintModal order={printOrder} onClose={() => setPrintOrder(null)} />}
    </div>
  );
}
