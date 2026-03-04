import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { store, fmt, CATEGORIES, EMPLOYEES } from '../store';
import { HOSPITALS, ANESTESIA_TEMPOS } from '../hospitalData';

const STEPS = [
  { id: 1, label: 'Paciente'      },
  { id: 2, label: 'Procedimentos' },
  { id: 3, label: 'Hospital'      },
  { id: 4, label: 'Anestesia'     },
  { id: 5, label: 'Resumo'        },
];

// ── helpers ──────────────────────────────────────
const inp = {
  base: {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    fontSize: 14, color: 'var(--dark)', outline: 'none', transition: 'border .2s',
  },
  error: { border: '1.5px solid var(--red)' },
};

function Label({ children }) {
  return (
    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--mid)',
      marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {children}
    </label>
  );
}

function SectionCard({ title, children }) {
  return (
    <section style={{ background:'var(--white)', borderRadius:14,
      border:'1px solid var(--border)', overflow:'hidden', marginBottom:0 }}>
      <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)',
        background:'var(--warm)' }}>
        <h2 style={{ fontSize:17, color:'var(--dark)' }}>{title}</h2>
      </div>
      <div style={{ padding:24 }}>{children}</div>
    </section>
  );
}

function OptionCard({ selected, onClick, children, accent = false }) {
  return (
    <button onClick={onClick} style={{
      textAlign:'left', padding:18, borderRadius:12, width:'100%',
      border: selected ? '2px solid var(--caramel)' : '1.5px solid var(--border)',
      background: selected ? '#FFF8EE' : 'white',
      boxShadow: selected ? '0 4px 16px rgba(200,135,58,.12)' : 'none',
      position:'relative', transition:'all .18s', cursor:'pointer',
    }}>
      {selected && (
        <div style={{
          position:'absolute', top:10, right:10,
          width:20, height:20, borderRadius:'50%',
          background:'var(--caramel)', color:'white',
          fontSize:10, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>✓</div>
      )}
      {children}
    </button>
  );
}

function StepBar({ current }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:32 }}>
      {STEPS.map((s, i) => {
        const done   = s.id < current;
        const active = s.id === current;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flex:0 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: active ? 'var(--caramel)' : done ? 'var(--green)' : 'var(--border)',
                color: (active||done) ? 'white' : 'var(--light)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:700, transition:'all .2s',
              }}>
                {done ? '✓' : s.id}
              </div>
              <span style={{ fontSize:11, fontWeight: active ? 600 : 400,
                color: active ? 'var(--caramel)' : done ? 'var(--green)' : 'var(--light)',
                whiteSpace:'nowrap' }}>{s.label}</span>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:2, background: done ? 'var(--green)' : 'var(--border)',
                margin:'0 8px', marginBottom:22, transition:'background .3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════
export default function NovoOrcamento() {
  const navigate  = useNavigate();
  const allProcs  = store.getProcedures();

  // Step
  const [step, setStep] = useState(1);

  // Step 1 — Paciente
  const [client,   setClient]   = useState({ name:'', email:'', phone:'', cpf:'' });
  const [employee, setEmployee] = useState(EMPLOYEES[0]);
  const [obs,      setObs]      = useState('');
  const [errors,   setErrors]   = useState({});

  // Step 2 — Procedimentos
  const [cat,      setCat]      = useState('Todos');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState([]);

  // Step 3 — Hospital + pagamento hospital
  const [hospital,      setHospital]      = useState(null);   // HOSPITALS[i]
  const [hospPayType,   setHospPayType]   = useState(null);   // 'avista' | 'credito3x'
  const [hospPernoite,  setHospPernoite]  = useState(null);   // 'com' | 'sem'

  // Step 4 — Anestesia + pagamento anestesia
  const [anestTempo,    setAnestTempo]    = useState(null);   // ANESTESIA_TEMPOS[i]
  const [anestPayType,  setAnestPayType]  = useState(null);   // 'avista' | 'credito3x'

  // ── derived values ──
  const procTotal = selected.reduce((s, p) => s + p.price, 0);

  const hospValor = (() => {
    if (!hospital || !hospPayType || !hospPernoite) return 0;
    const pay = hospital.payment[hospPayType];
    return hospPernoite === 'com' ? pay.comPernoite : pay.semPernoite;
  })();

  const anestValor = (() => {
    if (!anestTempo || !anestPayType) return 0;
    return anestTempo.payment[anestPayType].valor;
  })();

  const total = procTotal + hospValor + anestValor;

  // ── validation ──
  const validate1 = () => {
    const e = {};
    if (!client.name.trim())  e.name  = 'Obrigatório';
    if (!client.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'E-mail inválido';
    if (!client.phone.trim()) e.phone = 'Obrigatório';
    if (!client.cpf.trim())   e.cpf   = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canAdvance = () => {
    if (step === 1) return validate1();
    if (step === 2) return selected.length > 0;
    if (step === 3) return hospital && hospPayType && hospPernoite;
    if (step === 4) return anestTempo && anestPayType;
    return true;
  };

  const next = () => { if (canAdvance()) setStep(s => s+1); };
  const back = () => setStep(s => s-1);

  // ── save ──
  const save = (sendLink) => {
    const id = store.nextOrderId();
    store.addOrder({
      id, client, employee, obs,
      items: selected,
      hospital: {
        name: hospital.name,
        address: hospital.address,
        payType: hospPayType === 'avista' ? 'À vista (Pix ou Dinheiro)' : 'Até 3x no Cartão',
        pernoite: hospPernoite === 'com',
        valor: hospValor,
      },
      anestesia: {
        tempo: anestTempo.label,
        payType: anestPayType === 'avista' ? 'À vista (Pix ou Dinheiro)' : 'Até 3x no Cartão',
        valor: anestValor,
      },
      total,
      status: sendLink ? 'sent' : 'draft',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      signedAt: null,
    });
    navigate(sendLink ? `/admin?highlight=${id}&copied=1` : '/admin');
  };

  const toggleProc = (p) =>
    setSelected(prev =>
      prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]
    );

  const filtered = allProcs.filter(p =>
    (cat === 'Todos' || p.category === cat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  // ── shared sidebar ──
  const Sidebar = () => (
    <aside style={{ background:'var(--dark)', borderRadius:16, padding:24,
      position:'sticky', top:80, color:'white', minWidth:260 }}>
      <h2 style={{ fontSize:20, color:'white', marginBottom:18,
        fontFamily:'Cormorant Garamond,serif' }}>Resumo</h2>

      {/* Procedimentos */}
      {selected.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em',
            color:'var(--light)', marginBottom:8, fontWeight:600 }}>Procedimentos</div>
          {selected.map(p => (
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between',
              padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.06)', fontSize:12 }}>
              <span style={{ color:'rgba(255,255,255,.85)' }}>{p.name}</span>
              <span style={{ color:'var(--caramel2)', fontWeight:600 }}>{fmt(p.price)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hospital */}
      {hospital && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em',
            color:'var(--light)', marginBottom:8, fontWeight:600 }}>Hospital</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.85)', marginBottom:3 }}>{hospital.name}</div>
          {hospPayType && hospPernoite && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'var(--light)' }}>
                {hospPernoite === 'com' ? 'Com pernoite' : 'Sem pernoite'}
              </span>
              <span style={{ color:'var(--caramel2)', fontWeight:600 }}>{fmt(hospValor)}</span>
            </div>
          )}
        </div>
      )}

      {/* Anestesia */}
      {anestTempo && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em',
            color:'var(--light)', marginBottom:8, fontWeight:600 }}>Anestesia</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.85)', marginBottom:3 }}>{anestTempo.label}</div>
          {anestPayType && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'var(--light)' }}>
                {anestPayType === 'avista' ? 'À vista' : 'Até 3x'}
              </span>
              <span style={{ color:'var(--caramel2)', fontWeight:600 }}>{fmt(anestValor)}</span>
            </div>
          )}
        </div>
      )}

      {selected.length === 0 && !hospital && !anestTempo && (
        <div style={{ textAlign:'center', padding:'20px 0', color:'var(--light)' }}>
          <div style={{ fontSize:24, opacity:.4, marginBottom:8 }}>✦</div>
          <p style={{ fontSize:12 }}>Preencha as etapas ao lado</p>
        </div>
      )}

      <div style={{ height:1, background:'rgba(255,255,255,.1)', margin:'14px 0' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <span style={{ fontSize:12, color:'var(--light)' }}>Total estimado</span>
      </div>
      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:600,
        color:'var(--caramel2)', marginBottom:8 }}>{fmt(total)}</div>

      {step < 5 && (
        <>
          {step > 1 && (
            <button onClick={back} style={{ width:'100%', padding:11, borderRadius:10,
              border:'1px solid rgba(255,255,255,.15)', background:'transparent',
              color:'var(--light)', fontSize:13, marginBottom:8, cursor:'pointer' }}>
              ← Voltar
            </button>
          )}
          <button onClick={next} style={{ width:'100%', padding:13, borderRadius:10,
            border:'none', background:'var(--caramel)', color:'white',
            fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .2s' }}
            onMouseOver={e => e.currentTarget.style.background='var(--caramel3)'}
            onMouseOut={e  => e.currentTarget.style.background='var(--caramel)'}>
            {step === 4 ? 'Ver resumo →' : 'Continuar →'}
          </button>
          {step === 2 && selected.length === 0 && (
            <p style={{ fontSize:11, color:'var(--red)', textAlign:'center', marginTop:8 }}>
              Selecione ao menos um procedimento
            </p>
          )}
        </>
      )}
    </aside>
  );

  const wrapStyle = { maxWidth:1200, margin:'0 auto', padding:'32px 24px 64px' };
  const gridStyle = { display:'grid', gridTemplateColumns:'1fr 280px', gap:28, alignItems:'start' };

  // ══════════════════════════
  //  STEP 1 — PACIENTE
  // ══════════════════════════
  if (step === 1) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:() => navigate('/admin') }} />
      <div style={wrapStyle}>
        <StepBar current={1} />
        <div style={gridStyle}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <SectionCard title="Dados do Paciente">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* Nome full width */}
                <div style={{ gridColumn:'1/-1' }}>
                  <Label>Nome completo</Label>
                  <input value={client.name}
                    onChange={e => { setClient(p=>({...p,name:e.target.value})); setErrors(p=>({...p,name:''})); }}
                    placeholder="Nome completo do paciente"
                    style={{...inp.base, ...(errors.name ? inp.error : {})}}
                    onFocus={e=>e.target.style.borderColor='var(--caramel)'}
                    onBlur={e=>e.target.style.borderColor=errors.name?'var(--red)':'var(--border)'}
                  />
                  {errors.name && <span style={{fontSize:11,color:'var(--red)',marginTop:4,display:'block'}}>{errors.name}</span>}
                </div>
                {[
                  {key:'cpf',   label:'CPF',                 ph:'000.000.000-00'},
                  {key:'email', label:'E-mail',               ph:'email@exemplo.com'},
                  {key:'phone', label:'Telefone / WhatsApp',  ph:'(XX) 99999-0000'},
                ].map(f => (
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    <input value={client[f.key]}
                      onChange={e => { setClient(p=>({...p,[f.key]:e.target.value})); setErrors(p=>({...p,[f.key]:''})); }}
                      placeholder={f.ph}
                      style={{...inp.base, ...(errors[f.key] ? inp.error : {})}}
                      onFocus={e=>e.target.style.borderColor='var(--caramel)'}
                      onBlur={e=>e.target.style.borderColor=errors[f.key]?'var(--red)':'var(--border)'}
                    />
                    {errors[f.key] && <span style={{fontSize:11,color:'var(--red)',marginTop:4,display:'block'}}>{errors[f.key]}</span>}
                  </div>
                ))}
                <div>
                  <Label>Responsável pelo atendimento</Label>
                  <select value={employee} onChange={e=>setEmployee(e.target.value)}
                    style={{...inp.base}}>
                    {EMPLOYEES.map(e=><option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Observações internas">
              <textarea value={obs} onChange={e=>setObs(e.target.value)}
                placeholder="Anotações, preferências, detalhes clínicos relevantes..."
                rows={3}
                style={{...inp.base, resize:'vertical', lineHeight:1.6}}
                onFocus={e=>e.target.style.borderColor='var(--caramel)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}
              />
            </SectionCard>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );

  // ══════════════════════════
  //  STEP 2 — PROCEDIMENTOS
  // ══════════════════════════
  if (step === 2) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:back }} />
      <div style={wrapStyle}>
        <StepBar current={2} />
        <div style={gridStyle}>
          <SectionCard title="Procedimentos Cirúrgicos">
            {/* Search + Tabs */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={()=>setCat(c)} style={{
                    padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:500,
                    border: cat===c ? 'none' : '1.5px solid var(--border)',
                    background: cat===c ? 'var(--caramel)' : 'white',
                    color: cat===c ? 'white' : 'var(--mid)', cursor:'pointer',
                  }}>{c}</button>
                ))}
              </div>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Buscar procedimento..."
                style={{...inp.base, width:200}}
              />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
              {filtered.map(p => {
                const isSel = !!selected.find(x=>x.id===p.id);
                return (
                  <button key={p.id} onClick={()=>toggleProc(p)} style={{
                    textAlign:'left', padding:16, borderRadius:12, cursor:'pointer',
                    border: isSel ? '2px solid var(--caramel)' : '1.5px solid var(--border)',
                    background: isSel ? '#FFF8EE' : 'white', position:'relative',
                    transition:'all .18s',
                    boxShadow: isSel ? '0 4px 14px rgba(200,135,58,.14)' : 'none',
                  }}>
                    {isSel && (
                      <div style={{ position:'absolute', top:10, right:10, width:20, height:20,
                        borderRadius:'50%', background:'var(--caramel)', color:'white',
                        fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✓</div>
                    )}
                    <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em',
                      color:'var(--light)', marginBottom:5, fontWeight:600 }}>{p.category}</div>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:16,
                      fontWeight:600, color:'var(--dark)', marginBottom:5, lineHeight:1.3 }}>{p.name}</div>
                    <div style={{ fontSize:11, color:'var(--mid)', marginBottom:10, lineHeight:1.5 }}>{p.desc}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--caramel)' }}>{fmt(p.price)}</div>
                  </button>
                );
              })}
            </div>
          </SectionCard>
          <Sidebar />
        </div>
      </div>
    </div>
  );

  // ══════════════════════════
  //  STEP 3 — HOSPITAL
  // ══════════════════════════
  if (step === 3) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:back }} />
      <div style={wrapStyle}>
        <StepBar current={3} />
        <div style={gridStyle}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Selecionar hospital */}
            <SectionCard title="Selecionar Hospital">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {HOSPITALS.map(h => (
                  <OptionCard key={h.id} selected={hospital?.id===h.id} onClick={()=>{ setHospital(h); setHospPayType(null); setHospPernoite(null); }}>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, fontWeight:600, color:'var(--dark)', marginBottom:5 }}>{h.name}</div>
                    <div style={{ fontSize:12, color:'var(--light)' }}>{h.address}</div>
                  </OptionCard>
                ))}
              </div>
            </SectionCard>

            {/* Forma de pagamento hospital */}
            {hospital && (
              <SectionCard title="Forma de Pagamento — Hospital">
                <p style={{ fontSize:13, color:'var(--mid)', marginBottom:16 }}>
                  Selecione a forma de pagamento e se haverá pernoite em <strong>{hospital.name}</strong>.
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                  {[
                    { key:'avista',    label:'À vista', sub:'Pix ou Dinheiro' },
                    { key:'credito3x', label:'Até 3x',  sub:'Cartão de Crédito' },
                  ].map(pt => (
                    <OptionCard key={pt.key} selected={hospPayType===pt.key} onClick={()=>setHospPayType(pt.key)}>
                      <div style={{ fontWeight:600, fontSize:14, color:'var(--dark)', marginBottom:3 }}>{pt.label}</div>
                      <div style={{ fontSize:12, color:'var(--light)' }}>{pt.sub}</div>
                    </OptionCard>
                  ))}
                </div>

                {hospPayType && (
                  <>
                    <div style={{ height:1, background:'var(--border)', marginBottom:18 }} />
                    <p style={{ fontSize:13, color:'var(--mid)', marginBottom:14, fontWeight:600 }}>Pernoite no hospital?</p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      {[
                        { key:'sem', label:'Sem pernoite', valor: hospital.payment[hospPayType].semPernoite },
                        { key:'com', label:'Com pernoite', valor: hospital.payment[hospPayType].comPernoite },
                      ].map(pn => (
                        <OptionCard key={pn.key} selected={hospPernoite===pn.key} onClick={()=>setHospPernoite(pn.key)}>
                          <div style={{ fontWeight:600, fontSize:14, color:'var(--dark)', marginBottom:5 }}>{pn.label}</div>
                          <div style={{ fontSize:18, fontWeight:700, color:'var(--caramel)' }}>{fmt(pn.valor)}</div>
                        </OptionCard>
                      ))}
                    </div>
                  </>
                )}
              </SectionCard>
            )}
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );

  // ══════════════════════════
  //  STEP 4 — ANESTESIA
  // ══════════════════════════
  if (step === 4) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:back }} />
      <div style={wrapStyle}>
        <StepBar current={4} />
        <div style={gridStyle}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            <SectionCard title="Tempo de Anestesia">
              <p style={{ fontSize:13, color:'var(--mid)', marginBottom:16 }}>
                Selecione o tempo estimado de anestesia para o procedimento.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
                {ANESTESIA_TEMPOS.map(at => (
                  <OptionCard key={at.id} selected={anestTempo?.id===at.id} onClick={()=>{ setAnestTempo(at); setAnestPayType(null); }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--dark)', marginBottom:4 }}>{at.label}</div>
                    <div style={{ fontSize:11, color:'var(--light)' }}>
                      À vista: {fmt(at.payment.avista.valor)}
                    </div>
                  </OptionCard>
                ))}
              </div>
            </SectionCard>

            {anestTempo && (
              <SectionCard title="Forma de Pagamento — Anestesia">
                <p style={{ fontSize:13, color:'var(--mid)', marginBottom:16 }}>
                  Anestesia de <strong>{anestTempo.label}</strong>. Selecione a forma de pagamento:
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {Object.entries(anestTempo.payment).map(([key, pay]) => (
                    <OptionCard key={key} selected={anestPayType===key} onClick={()=>setAnestPayType(key)}>
                      <div style={{ fontWeight:600, fontSize:14, color:'var(--dark)', marginBottom:5 }}>
                        {key === 'avista' ? 'À vista' : 'Até 3x no Cartão'}
                      </div>
                      <div style={{ fontSize:12, color:'var(--light)', marginBottom:8 }}>
                        {key === 'avista' ? 'Pix ou Dinheiro' : 'Cartão de Crédito'}
                      </div>
                      <div style={{ fontSize:20, fontWeight:700, color:'var(--caramel)' }}>{fmt(pay.valor)}</div>
                    </OptionCard>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );

  // ══════════════════════════
  //  STEP 5 — RESUMO FINAL
  // ══════════════════════════
  const Row = ({ label, value, highlight }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'12px 0', borderBottom:'1px solid var(--warm)' }}>
      <span style={{ fontSize:14, color:'var(--mid)' }}>{label}</span>
      <span style={{ fontSize: highlight ? 18 : 14, fontWeight: highlight ? 700 : 500,
        color: highlight ? 'var(--caramel)' : 'var(--dark)',
        fontFamily: highlight ? 'Cormorant Garamond,serif' : 'DM Sans,sans-serif' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:back }} />
      <div style={wrapStyle}>
        <StepBar current={5} />
        <div style={{ maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Paciente */}
          <SectionCard title="Paciente">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['Nome',client.name],['CPF',client.cpf],['E-mail',client.email],['Telefone',client.phone],['Responsável',employee]].map(([k,v])=>(
                <div key={k}>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--light)', textTransform:'uppercase', marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:14, color:'var(--dark)' }}>{v}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Procedimentos */}
          <SectionCard title="Procedimentos">
            {selected.map(p=>(
              <Row key={p.id} label={p.name} value={fmt(p.price)} />
            ))}
            <Row label={<strong>Subtotal procedimentos</strong>} value={fmt(procTotal)} highlight />
          </SectionCard>

          {/* Hospital */}
          <SectionCard title="Hospital">
            <Row label="Hospital"            value={hospital.name} />
            <Row label="Forma de pagamento"  value={hospital.payment[hospPayType].label} />
            <Row label="Pernoite"            value={hospPernoite === 'com' ? 'Com pernoite' : 'Sem pernoite'} />
            <Row label={<strong>Valor hospital</strong>} value={fmt(hospValor)} highlight />
          </SectionCard>

          {/* Anestesia */}
          <SectionCard title="Anestesia">
            <Row label="Tempo de anestesia"  value={anestTempo.label} />
            <Row label="Forma de pagamento"  value={anestTempo.payment[anestPayType].label} />
            <Row label={<strong>Valor anestesia</strong>} value={fmt(anestValor)} highlight />
          </SectionCard>

          {/* Total */}
          <div style={{ background:'var(--dark)', borderRadius:14, padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ fontSize:16, color:'rgba(255,255,255,.7)', fontWeight:500 }}>TOTAL GERAL</span>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:34, fontWeight:600, color:'var(--caramel2)' }}>{fmt(total)}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <button onClick={()=>save(false)} style={{
                padding:13, borderRadius:10,
                border:'1px solid rgba(255,255,255,.2)', background:'transparent',
                color:'white', fontSize:13, fontWeight:500, cursor:'pointer',
              }}>
                Salvar como rascunho
              </button>
              <button onClick={()=>save(true)} style={{
                padding:13, borderRadius:10, border:'none',
                background:'var(--caramel)', color:'white',
                fontSize:13, fontWeight:600, cursor:'pointer',
              }}
                onMouseOver={e=>e.currentTarget.style.background='var(--caramel3)'}
                onMouseOut={e=>e.currentTarget.style.background='var(--caramel)'}>
                Gerar e enviar link →
              </button>
            </div>
          </div>

          {obs && (
            <SectionCard title="Observações">
              <p style={{ fontSize:14, color:'var(--mid)', lineHeight:1.7 }}>{obs}</p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
