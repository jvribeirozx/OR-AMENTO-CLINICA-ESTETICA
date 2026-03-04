import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { store, fmt, STATUS_LABEL, PROC_CATEGORIES } from '../store';

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
const S = {
  card:   { background:'white', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' },
  th:     { padding:'12px 18px', textAlign:'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', fontWeight:600, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' },
  td:     { padding:'14px 18px', borderBottom:'1px solid var(--warm)', verticalAlign:'middle' },
  inp:    { width:'100%', padding:'10px 13px', borderRadius:8, border:'1.5px solid var(--border)', background:'var(--bg)', fontSize:13, color:'var(--dark)', outline:'none' },
  label:  { display:'block', fontSize:11, fontWeight:600, color:'var(--mid)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.05em' },
  btnPri: { padding:'9px 20px', borderRadius:8, border:'none', background:'var(--caramel)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' },
  btnSec: { padding:'9px 16px', borderRadius:8, border:'1.5px solid var(--border)', background:'white', color:'var(--mid)', fontSize:12, fontWeight:500, cursor:'pointer' },
  btnDel: { padding:'7px 12px', borderRadius:7, border:'1.5px solid var(--red-bg)', background:'var(--red-bg)', color:'var(--red)', fontSize:12, fontWeight:500, cursor:'pointer' },
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.2)' }}>
        <div style={{ background:'var(--dark)', padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, color:'white', fontWeight:500 }}>{title}</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'var(--light)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:28 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom:16 }}><label style={S.label}>{label}</label>{children}</div>;
}

function MiniInput({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div>
      <label style={{ ...S.label, fontSize:10 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...S.inp, padding:'8px 10px', fontSize:12 }}
        onFocus={e => e.target.style.borderColor='var(--caramel)'}
        onBlur={e  => e.target.style.borderColor='var(--border)'} />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Print Modal
// ─────────────────────────────────────────────
function PrintModal({ order, onClose }) {
  const [loading, setLoading] = React.useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      // Load html2pdf dynamically
      await new Promise((resolve, reject) => {
        if (window.html2pdf) { resolve(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });

      const el = document.getElementById('print-doc');
      await window.html2pdf().set({
        margin:        [10, 10, 10, 10],
        filename:      `Orcamento-${order.id}.pdf`,
        image:         { type: 'jpeg', quality: 0.98 },
        html2canvas:   { scale: 2, useCORS: true, logging: false },
        jsPDF:         { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:     { mode: ['avoid-all'] },
      }).from(el).save();
    } catch(e) {
      console.error(e);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  const fmtV = v => Number(v||0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  const today = new Date().toLocaleDateString('pt-BR');

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'28px 16px', overflowY:'auto' }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:720, boxShadow:'0 24px 64px rgba(0,0,0,.25)', overflow:'hidden' }}>
        <div style={{ background:'#2C2416', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:19, color:'white', fontWeight:500 }}>Orçamento #{order.id}</span>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={handlePrint} disabled={loading} style={{ ...S.btnPri, opacity: loading ? 0.7 : 1 }}>{loading ? '⏳ Gerando PDF...' : '⬇ Baixar PDF'}</button>
            <button onClick={onClose} style={{ padding:'9px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,.2)', background:'transparent', color:'white', fontSize:13, cursor:'pointer' }}>✕</button>
          </div>
        </div>
        <div id="print-doc" style={{ padding:'32px 36px', fontFamily:'DM Sans,sans-serif' }}>
          {/* Header doc */}
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24, paddingBottom:18, borderBottom:'2px solid #C8873A' }}>
            <div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:600, color:'#2C2416' }}>Clínica Estética</div>
              <div style={{ fontSize:12, color:'#A08B74' }}>Sistema de Orçamentos</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:10, color:'#A08B74', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Orçamento</div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:600, color:'#C8873A' }}>#{order.id}</div>
              <div style={{ fontSize:11, color:'#A08B74', marginTop:3 }}>Emitido em {order.createdAt} · Validade 30 dias</div>
            </div>
          </div>
          {/* Paciente */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:8 }}>Paciente</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px 20px' }}>
              {[['Nome',order.client.name],['CPF',order.client.cpf],['Telefone',order.client.phone],['E-mail',order.client.email],['Responsável',order.employee]].map(([k,v])=>(
                <div key={k}><div style={{ fontSize:10, color:'#A08B74', marginBottom:2 }}>{k}</div><div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={{ height:1, background:'#E8DDD0', marginBottom:20 }} />
          {/* Procedimentos */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:8 }}>Procedimentos</div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'#F5EDE0' }}>
                {['Procedimento','Categoria','Valor'].map(h=>(
                  <th key={h} style={{ padding:'8px 10px', textAlign: h==='Valor'?'right':'left', fontSize:11, color:'#6B5B47', fontWeight:600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{order.items.map((item,i)=>(
                <tr key={item.id} style={{ background:i%2===0?'white':'#FAF7F2' }}>
                  <td style={{ padding:'8px 10px', fontSize:13, color:'#2C2416' }}>{item.name}</td>
                  <td style={{ padding:'8px 10px', fontSize:12, color:'#6B5B47' }}>{item.category}</td>
                  <td style={{ padding:'8px 10px', textAlign:'right', fontSize:13, color:'#6B5B47' }}>—</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {/* Hospital */}
          {order.hospital && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:8 }}>Hospital</div>
              <div style={{ background:'#FAF7F2', borderRadius:8, padding:'10px 14px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px 20px' }}>
                {[['Hospital',order.hospital.name],['Pagamento',order.hospital.payType],['Pernoite',order.hospital.pernoite?'Com pernoite':'Sem pernoite'],['Valor',fmtV(order.hospital.valor)]].map(([k,v])=>(
                  <div key={k}><div style={{ fontSize:10, color:'#A08B74', marginBottom:2 }}>{k}</div><div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{v}</div></div>
                ))}
              </div>
            </div>
          )}
          {/* Anestesia */}
          {order.anestesia && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:8 }}>Anestesia</div>
              <div style={{ background:'#FAF7F2', borderRadius:8, padding:'10px 14px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px 20px' }}>
                {[['Tempo',order.anestesia.tempo],['Pagamento',order.anestesia.payType],['Valor',fmtV(order.anestesia.valor)]].map(([k,v])=>(
                  <div key={k}><div style={{ fontSize:10, color:'#A08B74', marginBottom:2 }}>{k}</div><div style={{ fontSize:13, color:'#2C2416', fontWeight:500 }}>{v}</div></div>
                ))}
              </div>
            </div>
          )}
          {/* Totais */}
          <div style={{ background:'#2C2416', borderRadius:10, padding:'14px 18px', marginBottom:24 }}>
            {[
              ['Procedimentos', '—'],
              ...(order.hospital  ? [['Hospital',  fmtV(order.hospital.valor)]]  : []),
              ...(order.anestesia ? [['Anestesia', fmtV(order.anestesia.valor)]] : []),
            ].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'rgba(255,255,255,.6)', marginBottom:6 }}><span>{k}</span><span>{v}</span></div>
            ))}
            <div style={{ height:1, background:'rgba(255,255,255,.15)', margin:'8px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,.8)', fontWeight:600 }}>TOTAL GERAL</span>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:600, color:'#E8A55A' }}>{fmtV(order.total)}</span>
            </div>
          </div>
          {/* Assinatura */}
          <div style={{ borderTop:'1px solid #E8DDD0', paddingTop:20 }}>
            <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#A08B74', fontWeight:600, marginBottom:14 }}>Assinatura</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32 }}>
              {[[order.client.name, `Paciente — CPF: ${order.client.cpf}`],[order.employee,'Responsável pelo atendimento']].map(([name,role])=>(
                <div key={name}><div style={{ height:56, borderBottom:'1.5px solid #2C2416', marginBottom:8 }} /><div style={{ fontSize:12, color:'#6B5B47', marginBottom:2 }}>{name}</div><div style={{ fontSize:11, color:'#A08B74' }}>{role}</div><div style={{ fontSize:11, color:'#A08B74', marginTop:4 }}>Data: _____ / _____ / _______</div></div>
              ))}
            </div>
          </div>
          <div style={{ marginTop:24, paddingTop:12, borderTop:'1px solid #E8DDD0', textAlign:'center', fontSize:11, color:'#A08B74' }}>
            Clínica Estética — Documento gerado em {today} — Válido por 30 dias
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [tab,         setTab]         = useState('orders');
  const [orders,      setOrders]      = useState(store.getOrders());
  const [procs,       setProcs]       = useState(store.getProcedures());
  const [hospitals,   setHospitals]   = useState(store.getHospitals());
  const [pricing,     setPricing]     = useState(store.getPricing());
  const [search,      setSearch]      = useState('');
  const [copied,      setCopied]      = useState(null);
  const [highlight,   setHL]          = useState(null);
  const [printOrder,  setPrintOrder]  = useState(null);

  // Modals
  const [procModal,   setProcModal]   = useState(null);   // null | 'new' | procedure obj
  const [hospModal,   setHospModal]   = useState(null);   // null | 'new' | hospital obj
  const [priceModal,  setPriceModal]  = useState(null);   // null | procedure obj

  const refresh = () => {
    setOrders(store.getOrders());
    setProcs(store.getProcedures());
    setHospitals(store.getHospitals());
    setPricing(store.getPricing());
  };

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const h = p.get('highlight'), cp = p.get('copied');
    if (h) { setHL(h); if(cp) setCopied(h); setTimeout(()=>{ setHL(null); setCopied(null); },4000); }
  }, [location.search]);

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/assinar/${id}`)
      .then(() => { setCopied(id); setTimeout(()=>setCopied(null),2500); });
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const revenue = orders.filter(o=>o.status==='signed').reduce((s,o)=>s+o.total,0);
  const stats = [
    { label:'Receita confirmada', value:fmt(revenue),                              icon:'💰', bg:'#FFF3E4', ac:'var(--caramel)'  },
    { label:'Assinados',          value:String(orders.filter(o=>o.status==='signed').length), icon:'✓',  bg:'var(--green-bg)', ac:'var(--green)'   },
    { label:'Aguardando',         value:String(orders.filter(o=>o.status==='sent').length),   icon:'⏳', bg:'#FFF8EE',         ac:'var(--caramel2)'},
    { label:'Rascunhos',          value:String(orders.filter(o=>o.status==='draft').length),  icon:'📋', bg:'var(--warm)',      ac:'var(--light)'   },
  ];

  const TABS = [
    ['orders',     'Orçamentos',  orders.length],
    ['procedures', 'Procedimentos', procs.length],
    ['hospitals',  'Hospitais',   hospitals.length],
    ['pricing',    'Tabela de Preços', pricing.length],
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Painel Administrativo" action={{ label:'+ Novo orçamento', onClick:()=>navigate('/admin/novo') }} />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px 64px' }}>

        {/* Toast */}
        {copied && (
          <div className="fade-up" style={{ position:'fixed', bottom:28, right:28, zIndex:999, background:'var(--dark)', color:'white', padding:'13px 22px', borderRadius:10, fontSize:13, fontWeight:500, boxShadow:'0 8px 32px rgba(0,0,0,.2)', borderLeft:'4px solid var(--caramel)' }}>
            ✓ Link copiado para a área de transferência
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {stats.map((s,i) => (
            <div key={i} className="fade-up" style={{ animationDelay:`${i*.05}s`, background:'white', borderRadius:14, padding:18, border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:600, color:s.ac }}>{s.value}</div>
                <div style={{ fontSize:12, color:'var(--mid)', marginTop:1 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:20, background:'white', padding:5, borderRadius:12, border:'1px solid var(--border)', width:'fit-content' }}>
          {TABS.map(([key,label,count]) => (
            <button key={key} onClick={()=>setTab(key)} style={{
              padding:'8px 18px', borderRadius:9, border:'none', cursor:'pointer',
              background:tab===key?'var(--dark)':'transparent',
              color:tab===key?'white':'var(--mid)',
              fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:7, transition:'all .2s',
            }}>
              {label}
              <span style={{ fontSize:11, padding:'2px 7px', borderRadius:10, background:tab===key?'rgba(255,255,255,.15)':'var(--warm)', color:tab===key?'rgba(255,255,255,.8)':'var(--mid)' }}>{count}</span>
            </button>
          ))}
        </div>

        {/* ══ ORDERS ══ */}
        {tab === 'orders' && (
          <div className="fade-in" style={S.card}>
            <div style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
              <h2 style={{ fontSize:20 }}>Orçamentos</h2>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por cliente ou nº..." style={{ ...S.inp, width:240 }} />
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr>{['Nº','Paciente','Procedimentos','Total','Status','Data','Ações'].map(h=>(
                  <th key={h} style={S.th}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {filteredOrders.length===0 ? (
                    <tr><td colSpan={7} style={{ textAlign:'center', padding:48, color:'var(--light)', fontSize:14 }}>Nenhum orçamento encontrado</td></tr>
                  ) : filteredOrders.map(o => {
                    const st = STATUS_LABEL[o.status];
                    return (
                      <tr key={o.id} style={{ background:o.id===highlight?'#FFFBF5':'transparent', transition:'background .3s' }}>
                        <td style={S.td}><span style={{ fontSize:12, fontWeight:700, color:'var(--caramel)', background:'#FFF3E4', padding:'4px 10px', borderRadius:6 }}>{o.id}</span></td>
                        <td style={S.td}><div style={{ fontSize:14, fontWeight:500 }}>{o.client.name}</div><div style={{ fontSize:12, color:'var(--light)', marginTop:2 }}>{o.client.email}</div></td>
                        <td style={S.td}><div style={{ display:'flex', flexWrap:'wrap', gap:4, maxWidth:240 }}>{o.items.map(i=><span key={i.id} style={{ fontSize:11, background:'var(--warm)', color:'var(--mid)', padding:'3px 8px', borderRadius:5 }}>{i.name}</span>)}</div></td>
                        <td style={{ ...S.td, fontFamily:'Cormorant Garamond,serif', fontSize:16, fontWeight:600, color:'var(--caramel)', whiteSpace:'nowrap' }}>{fmt(o.total)}</td>
                        <td style={S.td}><span style={{ padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:st.bg, color:st.color, whiteSpace:'nowrap' }}>{st.label}</span></td>
                        <td style={{ ...S.td, fontSize:12, color:'var(--mid)', whiteSpace:'nowrap' }}>{o.createdAt}</td>
                        <td style={S.td}>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {o.status!=='signed' && (
                              <button onClick={()=>copyLink(o.id)} style={{ ...S.btnSec, background:copied===o.id?'var(--green-bg)':'white', color:copied===o.id?'var(--green)':'var(--mid)', borderColor:copied===o.id?'var(--green)':'var(--border)', whiteSpace:'nowrap' }}>
                                {copied===o.id?'✓ Copiado':'🔗 Copiar link'}
                              </button>
                            )}
                            <button onClick={()=>setPrintOrder(o)} style={{ ...S.btnSec, whiteSpace:'nowrap' }}>🖨 Imprimir</button>
                            <button onClick={()=>navigate(`/assinar/${o.id}`)} style={{ ...S.btnSec, whiteSpace:'nowrap' }}>
                              {o.status==='signed'?'👁 Ver':'📄 Abrir'}
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

        {/* ══ PROCEDURES ══ */}
        {tab === 'procedures' && (
          <div className="fade-in" style={S.card}>
            <div style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:20 }}>Procedimentos</h2>
              <button onClick={()=>setProcModal('new')} style={S.btnPri}>+ Novo procedimento</button>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Procedimento','Categoria','Descrição','Ações'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {procs.map(p=>(
                  <tr key={p.id}>
                    <td style={{ ...S.td, fontWeight:500, fontSize:14 }}>{p.name}</td>
                    <td style={S.td}><span style={{ fontSize:11, fontWeight:600, background:'var(--warm)', color:'var(--mid)', padding:'4px 10px', borderRadius:6 }}>{p.category}</span></td>
                    <td style={{ ...S.td, fontSize:12, color:'var(--mid)', maxWidth:220 }}>{p.desc}</td>
                    <td style={S.td}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>setProcModal(p)} style={S.btnSec}>✎ Editar</button>
                        <button onClick={()=>{ store.deleteProcedure(p.id); refresh(); }} style={S.btnDel}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ HOSPITALS ══ */}
        {tab === 'hospitals' && (
          <div className="fade-in" style={S.card}>
            <div style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:20 }}>Hospitais</h2>
              <button onClick={()=>setHospModal('new')} style={S.btnPri}>+ Novo hospital</button>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Hospital','Endereço','Ações'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {hospitals.map(h=>(
                  <tr key={h.id}>
                    <td style={{ ...S.td, fontWeight:500, fontSize:14 }}>{h.name}</td>
                    <td style={{ ...S.td, fontSize:13, color:'var(--mid)' }}>{h.address}</td>
                    <td style={S.td}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={()=>setHospModal(h)} style={S.btnSec}>✎ Editar</button>
                        <button onClick={()=>{ store.deleteHospital(h.id); refresh(); }} style={S.btnDel}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ PRICING ══ */}
        {tab === 'pricing' && (
          <div className="fade-in" style={S.card}>
            <div style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:20 }}>Tabela de Preços por Hospital</h2>
              <span style={{ fontSize:12, color:'var(--light)', background:'var(--warm)', padding:'6px 14px', borderRadius:6 }}>
                Clique em "Gerenciar" para editar os preços de cada procedimento
              </span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Procedimento','Categoria','Hospitais cadastrados',''].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {procs.map(p => {
                  const entries = store.getPricingForProcedure(p.id);
                  return (
                    <tr key={p.id}>
                      <td style={{ ...S.td, fontWeight:500, fontSize:14 }}>{p.name}</td>
                      <td style={S.td}><span style={{ fontSize:11, fontWeight:600, background:'var(--warm)', color:'var(--mid)', padding:'4px 10px', borderRadius:6 }}>{p.category}</span></td>
                      <td style={S.td}>
                        {entries.length === 0 ? (
                          <span style={{ fontSize:12, color:'var(--light)' }}>Nenhum hospital cadastrado</span>
                        ) : (
                          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                            {entries.map(e => {
                              const h = hospitals.find(hh=>hh.id===e.hospitalId);
                              return h ? (
                                <span key={e.id} style={{ fontSize:11, background:'#FFF3E4', color:'var(--caramel3)', padding:'4px 10px', borderRadius:6, fontWeight:500 }}>
                                  {h.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </td>
                      <td style={S.td}>
                        <button onClick={()=>setPriceModal(p)} style={S.btnPri}>Gerenciar preços</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Print modal */}
        {printOrder && <PrintModal order={printOrder} onClose={()=>setPrintOrder(null)} />}

        {/* ══ MODAL PROCEDIMENTO ══ */}
        {procModal && <ProcedureModal initial={procModal==='new'?null:procModal} onClose={()=>setProcModal(null)} onSave={()=>{ refresh(); setProcModal(null); }} />}

        {/* ══ MODAL HOSPITAL ══ */}
        {hospModal && <HospitalModal initial={hospModal==='new'?null:hospModal} onClose={()=>setHospModal(null)} onSave={()=>{ refresh(); setHospModal(null); }} />}

        {/* ══ MODAL PREÇOS ══ */}
        {priceModal && <PricingModal procedure={priceModal} hospitals={hospitals} onClose={()=>setPriceModal(null)} onSave={()=>{ refresh(); }} />}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Modal: Procedimento
// ─────────────────────────────────────────────
function ProcedureModal({ initial, onClose, onSave }) {
  const [name, setName]   = useState(initial?.name     || '');
  const [cat,  setCat]    = useState(initial?.category || PROC_CATEGORIES[0]);
  const [desc, setDesc]   = useState(initial?.desc     || '');

  const save = () => {
    if (!name.trim()) return;
    if (initial) store.updateProcedure(initial.id, { name, category:cat, desc });
    else         store.addProcedure({ name, category:cat, desc });
    onSave();
  };

  return (
    <Modal title={initial ? 'Editar Procedimento' : 'Novo Procedimento'} onClose={onClose}>
      <Field label="Nome do procedimento">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Rinoplastia" style={S.inp}
          onFocus={e=>e.target.style.borderColor='var(--caramel)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
      </Field>
      <Field label="Categoria">
        <select value={cat} onChange={e=>setCat(e.target.value)} style={S.inp}>
          {PROC_CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Descrição">
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Descrição breve do procedimento..."
          style={{ ...S.inp, resize:'vertical', lineHeight:1.6 }}
          onFocus={e=>e.target.style.borderColor='var(--caramel)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
      </Field>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
        <button onClick={onClose} style={S.btnSec}>Cancelar</button>
        <button onClick={save}    style={S.btnPri}>Salvar</button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
//  Modal: Hospital
// ─────────────────────────────────────────────
function HospitalModal({ initial, onClose, onSave }) {
  const [name,    setName]    = useState(initial?.name    || '');
  const [address, setAddress] = useState(initial?.address || '');

  const save = () => {
    if (!name.trim()) return;
    if (initial) store.updateHospital(initial.id, { name, address });
    else         store.addHospital({ name, address });
    onSave();
  };

  return (
    <Modal title={initial ? 'Editar Hospital' : 'Novo Hospital'} onClose={onClose}>
      <Field label="Nome do hospital">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Hospital São Rafael" style={S.inp}
          onFocus={e=>e.target.style.borderColor='var(--caramel)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
      </Field>
      <Field label="Endereço">
        <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Ex: Rua das Flores, 420 — BH, MG" style={S.inp}
          onFocus={e=>e.target.style.borderColor='var(--caramel)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
      </Field>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
        <button onClick={onClose} style={S.btnSec}>Cancelar</button>
        <button onClick={save}    style={S.btnPri}>Salvar</button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
//  Modal: Preços por Hospital
// ─────────────────────────────────────────────
function PricingModal({ procedure, hospitals, onClose, onSave }) {
  const allEntries = store.getPricingForProcedure(procedure.id);

  // local state: map hospitalId -> { avistaSem, avistaComPernoite, credito3xSem, credito3xComPernoite, active }
  const initState = () => {
    const m = {};
    hospitals.forEach(h => {
      const e = allEntries.find(en => en.hospitalId === h.id);
      m[h.id] = e
        ? { active:true, avistaSem:String(e.avistaSem), avistaComPernoite:String(e.avistaComPernoite), credito3xSem:String(e.credito3xSem), credito3xComPernoite:String(e.credito3xComPernoite) }
        : { active:false, avistaSem:'', avistaComPernoite:'', credito3xSem:'', credito3xComPernoite:'' };
    });
    return m;
  };

  const [rows, setRows] = useState(initState);

  const setRow = (hid, field, val) =>
    setRows(prev => ({ ...prev, [hid]: { ...prev[hid], [field]: val } }));

  const save = () => {
    hospitals.forEach(h => {
      const r = rows[h.id];
      if (r.active) {
        store.upsertPricing({
          procedureId: procedure.id,
          hospitalId:  h.id,
          avistaSem:           parseFloat(r.avistaSem)           || 0,
          avistaComPernoite:   parseFloat(r.avistaComPernoite)   || 0,
          credito3xSem:        parseFloat(r.credito3xSem)        || 0,
          credito3xComPernoite:parseFloat(r.credito3xComPernoite)|| 0,
        });
      } else {
        store.deletePricing(procedure.id, h.id);
      }
    });
    onSave();
  };

  return (
    <Modal title={`Preços — ${procedure.name}`} onClose={onClose}>
      <p style={{ fontSize:13, color:'var(--mid)', marginBottom:20, lineHeight:1.6 }}>
        Ative os hospitais em que este procedimento é realizado e preencha os valores para cada forma de pagamento.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {hospitals.map(h => {
          const r = rows[h.id];
          return (
            <div key={h.id} style={{ border:'1.5px solid', borderColor: r.active?'var(--caramel)':'var(--border)', borderRadius:10, overflow:'hidden', transition:'border-color .2s' }}>
              {/* Hospital header */}
              <div style={{ padding:'12px 16px', background:r.active?'#FFF8EE':'var(--warm)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--dark)' }}>{h.name}</div>
                  <div style={{ fontSize:11, color:'var(--light)', marginTop:2 }}>{h.address}</div>
                </div>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
                  <span style={{ fontSize:12, color: r.active?'var(--caramel3)':'var(--light)', fontWeight:500 }}>
                    {r.active ? 'Ativo' : 'Inativo'}
                  </span>
                  <div onClick={()=>setRow(h.id,'active',!r.active)} style={{
                    width:38, height:22, borderRadius:11,
                    background:r.active?'var(--caramel)':'var(--border)',
                    position:'relative', cursor:'pointer', transition:'background .2s',
                  }}>
                    <div style={{ position:'absolute', top:3, left: r.active?18:3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.2)' }} />
                  </div>
                </label>
              </div>

              {/* Preços */}
              {r.active && (
                <div style={{ padding:16 }}>
                  {/* À vista */}
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--caramel)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
                    À vista — Pix ou Dinheiro
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                    <MiniInput label="Sem pernoite (R$)"  value={r.avistaSem}         onChange={v=>setRow(h.id,'avistaSem',v)}         placeholder="0,00" type="number" />
                    <MiniInput label="Com pernoite (R$)"  value={r.avistaComPernoite} onChange={v=>setRow(h.id,'avistaComPernoite',v)} placeholder="0,00" type="number" />
                  </div>

                  {/* 3x */}
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--caramel)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
                    Até 3x no Cartão de Crédito
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <MiniInput label="Sem pernoite (R$)"  value={r.credito3xSem}          onChange={v=>setRow(h.id,'credito3xSem',v)}          placeholder="0,00" type="number" />
                    <MiniInput label="Com pernoite (R$)"  value={r.credito3xComPernoite}  onChange={v=>setRow(h.id,'credito3xComPernoite',v)}  placeholder="0,00" type="number" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:24 }}>
        <button onClick={onClose} style={S.btnSec}>Cancelar</button>
        <button onClick={save}    style={S.btnPri}>Salvar preços</button>
      </div>
    </Modal>
  );
}
