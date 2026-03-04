import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { store, fmt, CATEGORIES, EMPLOYEES, ANESTESIA_TEMPOS } from '../store';

const STEPS = [
  { id:1, label:'Paciente'       },
  { id:2, label:'Procedimentos'  },
  { id:3, label:'Hospital'       },
  { id:4, label:'Anestesia'      },
  { id:5, label:'Resumo'         },
];

const baseInp = {
  width:'100%', padding:'11px 14px', borderRadius:8,
  border:'1.5px solid var(--border)', background:'var(--bg)',
  fontSize:14, color:'var(--dark)', outline:'none', transition:'border .2s',
};

function Label({ children }) {
  return <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--mid)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{children}</label>;
}

function SectionCard({ title, children }) {
  return (
    <section style={{ background:'white', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
        <h2 style={{ fontSize:17, color:'var(--dark)' }}>{title}</h2>
      </div>
      <div style={{ padding:24 }}>{children}</div>
    </section>
  );
}

function OptionCard({ selected, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      textAlign:'left', padding:18, borderRadius:12, width:'100%', cursor:'pointer',
      border: selected ? '2px solid var(--caramel)' : '1.5px solid var(--border)',
      background: selected ? '#FFF8EE' : 'white',
      boxShadow: selected ? '0 4px 16px rgba(200,135,58,.12)' : 'none',
      position:'relative', transition:'all .18s',
    }}>
      {selected && (
        <div style={{ position:'absolute', top:10, right:10, width:20, height:20, borderRadius:'50%',
          background:'var(--caramel)', color:'white', fontSize:10, fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'center' }}>✓</div>
      )}
      {children}
    </button>
  );
}

function StepBar({ current }) {
  return (
    <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
      {STEPS.map((s, i) => {
        const done = s.id < current, active = s.id === current;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, flex:0 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background: active?'var(--caramel)':done?'var(--green)':'var(--border)',
                color:(active||done)?'white':'var(--light)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:700, transition:'all .2s',
              }}>{done?'✓':s.id}</div>
              <span style={{ fontSize:11, fontWeight:active?600:400, whiteSpace:'nowrap',
                color:active?'var(--caramel)':done?'var(--green)':'var(--light)' }}>{s.label}</span>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:2, background:done?'var(--green)':'var(--border)',
                margin:'0 8px', marginBottom:22, transition:'background .3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function NovoOrcamento() {
  const navigate = useNavigate();
  const allProcs = store.getProcedures();

  const [step,     setStep]    = useState(1);
  const [client,   setClient]  = useState({ name:'', email:'', phone:'', cpf:'' });
  const [employee, setEmp]     = useState(EMPLOYEES[0]);
  const [obs,      setObs]     = useState('');
  const [errors,   setErrors]  = useState({});
  const [cat,      setCat]     = useState('Todos');
  const [search,   setSearch]  = useState('');
  const [selected, setSelected]= useState([]);

  // Hospital
  const [hospital,     setHospital]    = useState(null);
  const [hospPayType,  setHospPayType] = useState(null); // 'avista' | 'credito3x'
  const [hospPernoite, setHospPernoite]= useState(null); // 'com' | 'sem'

  // Anestesia
  const [anestTempo,   setAnestTempo]  = useState(null);
  const [anestPayType, setAnestPayType]= useState(null);

  // ── Derived: hospitais disponíveis para os procedimentos selecionados
  // Um hospital aparece apenas se tiver pricing para TODOS os procedimentos selecionados
  const availableHospitals = (() => {
    if (selected.length === 0) return store.getHospitals();
    const hospitals = store.getHospitals();
    return hospitals.filter(h =>
      selected.every(p => store.getPricingEntry(p.id, h.id) !== null)
    );
  })();

  // ── Pricing entry do hospital selecionado (média dos procedimentos)
  // Para múltiplos procedimentos, somamos os valores de cada um
  const getHospValor = () => {
    if (!hospital || !hospPayType || !hospPernoite) return 0;
    return selected.reduce((sum, p) => {
      const entry = store.getPricingEntry(p.id, hospital.id);
      if (!entry) return sum;
      if (hospPayType === 'avista')
        return sum + (hospPernoite === 'sem' ? entry.avistaSem : entry.avistaComPernoite);
      else
        return sum + (hospPernoite === 'sem' ? entry.credito3xSem : entry.credito3xComPernoite);
    }, 0);
  };

  // Se hospital não tem pricing para algum procedimento, mostrar aviso
  const getHospValorItem = (hospId, payType, pernoite) => {
    return selected.reduce((sum, p) => {
      const entry = store.getPricingEntry(p.id, hospId);
      if (!entry) return sum;
      if (payType === 'avista')
        return sum + (pernoite === 'sem' ? entry.avistaSem : entry.avistaComPernoite);
      else
        return sum + (pernoite === 'sem' ? entry.credito3xSem : entry.credito3xComPernoite);
    }, 0);
  };

  const hospValor = getHospValor();

  const anestValor = (() => {
    if (!anestTempo || !anestPayType) return 0;
    return anestPayType === 'avista' ? anestTempo.avista : anestTempo.credito3x;
  })();

  const total = anestValor + hospValor;

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
    if (step===1) return validate1();
    if (step===2) return selected.length > 0;
    if (step===3) return hospital && hospPayType && hospPernoite;
    if (step===4) return anestTempo && anestPayType;
    return true;
  };

  const next = () => { if (canAdvance()) setStep(s=>s+1); };
  const back = () => setStep(s=>s-1);

  const save = (sendLink) => {
    const id = store.nextOrderId();
    store.addOrder({
      id, client, employee, obs,
      items: selected,
      hospital: {
        name:     hospital.name,
        address:  hospital.address,
        payType:  hospPayType === 'avista' ? 'À vista (Pix ou Dinheiro)' : 'Até 3x no Cartão',
        pernoite: hospPernoite === 'com',
        valor:    hospValor,
      },
      anestesia: {
        tempo:   anestTempo.label,
        payType: anestPayType === 'avista' ? 'À vista (Pix ou Dinheiro)' : 'Até 3x no Cartão',
        valor:   anestValor,
      },
      total,
      status:    sendLink ? 'sent' : 'draft',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      signedAt:  null,
    });
    navigate(sendLink ? `/admin?highlight=${id}&copied=1` : '/admin');
  };

  const toggleProc = (p) => {
    setSelected(prev =>
      prev.find(x=>x.id===p.id) ? prev.filter(x=>x.id!==p.id) : [...prev, p]
    );
    // Reset hospital se mudar procedimentos
    setHospital(null); setHospPayType(null); setHospPernoite(null);
  };

  const filtered = allProcs.filter(p =>
    (cat==='Todos' || p.category===cat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Sidebar ──
  const Sidebar = () => (
    <aside style={{ background:'var(--dark)', borderRadius:16, padding:24, position:'sticky', top:80, color:'white', minWidth:260 }}>
      <h2 style={{ fontSize:20, color:'white', marginBottom:18, fontFamily:'Cormorant Garamond,serif' }}>Resumo</h2>

      {selected.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', marginBottom:8, fontWeight:600 }}>Procedimentos</div>
          {selected.map(p => (
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,.06)', fontSize:12 }}>
              <span style={{ color:'rgba(255,255,255,.85)' }}>{p.name}</span>
            </div>
          ))}
        </div>
      )}

      {hospital && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', marginBottom:8, fontWeight:600 }}>Hospital</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.85)', marginBottom:3 }}>{hospital.name}</div>
          {hospPayType && hospPernoite && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'var(--light)' }}>{hospPernoite==='com'?'Com pernoite':'Sem pernoite'}</span>
              <span style={{ color:'var(--caramel2)', fontWeight:600 }}>{fmt(hospValor)}</span>
            </div>
          )}
        </div>
      )}

      {anestTempo && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', marginBottom:8, fontWeight:600 }}>Anestesia</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.85)', marginBottom:3 }}>{anestTempo.label}</div>
          {anestPayType && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ color:'var(--light)' }}>{anestPayType==='avista'?'À vista':'Até 3x'}</span>
              <span style={{ color:'var(--caramel2)', fontWeight:600 }}>{fmt(anestValor)}</span>
            </div>
          )}
        </div>
      )}

      {selected.length===0 && !hospital && !anestTempo && (
        <div style={{ textAlign:'center', padding:'20px 0', color:'var(--light)' }}>
          <div style={{ fontSize:24, opacity:.4, marginBottom:8 }}>✦</div>
          <p style={{ fontSize:12 }}>Preencha as etapas ao lado</p>
        </div>
      )}

      <div style={{ height:1, background:'rgba(255,255,255,.1)', margin:'14px 0' }} />
      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:600, color:'var(--caramel2)', marginBottom:12 }}>{fmt(total)}</div>

      {step < 5 && (
        <>
          {step > 1 && (
            <button onClick={back} style={{ width:'100%', padding:11, borderRadius:10, border:'1px solid rgba(255,255,255,.15)', background:'transparent', color:'var(--light)', fontSize:13, marginBottom:8, cursor:'pointer' }}>← Voltar</button>
          )}
          <button onClick={next} style={{ width:'100%', padding:13, borderRadius:10, border:'none', background:'var(--caramel)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}
            onMouseOver={e=>e.currentTarget.style.background='var(--caramel3)'}
            onMouseOut={e=>e.currentTarget.style.background='var(--caramel)'}>
            {step===4?'Ver resumo →':'Continuar →'}
          </button>
          {step===2 && selected.length===0 && <p style={{ fontSize:11, color:'var(--red)', textAlign:'center', marginTop:8 }}>Selecione ao menos um procedimento</p>}
          {step===3 && availableHospitals.length===0 && selected.length>0 && <p style={{ fontSize:11, color:'var(--red)', textAlign:'center', marginTop:8 }}>Nenhum hospital disponível para os procedimentos selecionados. Cadastre os preços na aba "Tabela de Preços".</p>}
        </>
      )}
    </aside>
  );

  const wrapStyle = { maxWidth:1200, margin:'0 auto', padding:'32px 24px 64px' };
  const gridStyle = { display:'grid', gridTemplateColumns:'1fr 280px', gap:28, alignItems:'start' };

  // ══ STEP 1 ══
  if (step===1) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:()=>navigate('/admin') }} />
      <div style={wrapStyle}>
        <StepBar current={1} />
        <div style={gridStyle}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <SectionCard title="Dados do Paciente">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <Label>Nome completo</Label>
                  <input value={client.name} onChange={e=>{setClient(p=>({...p,name:e.target.value}));setErrors(p=>({...p,name:''}));}}
                    placeholder="Nome completo do paciente"
                    style={{...baseInp,...(errors.name?{border:'1.5px solid var(--red)'}:{})}}
                    onFocus={e=>e.target.style.borderColor='var(--caramel)'}
                    onBlur={e=>e.target.style.borderColor=errors.name?'var(--red)':'var(--border)'} />
                  {errors.name && <span style={{fontSize:11,color:'var(--red)',marginTop:4,display:'block'}}>{errors.name}</span>}
                </div>
                {[{key:'cpf',label:'CPF',ph:'000.000.000-00'},{key:'email',label:'E-mail',ph:'email@exemplo.com'},{key:'phone',label:'Telefone / WhatsApp',ph:'(XX) 99999-0000'}].map(f=>(
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    <input value={client[f.key]} onChange={e=>{setClient(p=>({...p,[f.key]:e.target.value}));setErrors(p=>({...p,[f.key]:''}));}}
                      placeholder={f.ph}
                      style={{...baseInp,...(errors[f.key]?{border:'1.5px solid var(--red)'}:{})}}
                      onFocus={e=>e.target.style.borderColor='var(--caramel)'}
                      onBlur={e=>e.target.style.borderColor=errors[f.key]?'var(--red)':'var(--border)'} />
                    {errors[f.key] && <span style={{fontSize:11,color:'var(--red)',marginTop:4,display:'block'}}>{errors[f.key]}</span>}
                  </div>
                ))}
                <div>
                  <Label>Responsável pelo atendimento</Label>
                  <select value={employee} onChange={e=>setEmp(e.target.value)} style={baseInp}>
                    {EMPLOYEES.map(e=><option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Observações internas">
              <textarea value={obs} onChange={e=>setObs(e.target.value)} placeholder="Anotações, preferências, detalhes clínicos..." rows={3}
                style={{...baseInp,resize:'vertical',lineHeight:1.6}}
                onFocus={e=>e.target.style.borderColor='var(--caramel)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </SectionCard>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );

  // ══ STEP 2 ══
  if (step===2) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:back }} />
      <div style={wrapStyle}>
        <StepBar current={2} />
        <div style={gridStyle}>
          <SectionCard title="Procedimentos Cirúrgicos">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {CATEGORIES.map(c=>(
                  <button key={c} onClick={()=>setCat(c)} style={{ padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer', border:cat===c?'none':'1.5px solid var(--border)', background:cat===c?'var(--caramel)':'white', color:cat===c?'white':'var(--mid)' }}>{c}</button>
                ))}
              </div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{...baseInp,width:200}} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
              {filtered.map(p=>{
                const isSel = !!selected.find(x=>x.id===p.id);
                return (
                  <button key={p.id} onClick={()=>toggleProc(p)} style={{ textAlign:'left', padding:16, borderRadius:12, cursor:'pointer', border:isSel?'2px solid var(--caramel)':'1.5px solid var(--border)', background:isSel?'#FFF8EE':'white', position:'relative', transition:'all .18s', boxShadow:isSel?'0 4px 14px rgba(200,135,58,.14)':'none' }}>
                    {isSel && <div style={{ position:'absolute', top:10, right:10, width:20, height:20, borderRadius:'50%', background:'var(--caramel)', color:'white', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✓</div>}
                    <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', marginBottom:5, fontWeight:600 }}>{p.category}</div>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:16, fontWeight:600, color:'var(--dark)', marginBottom:5, lineHeight:1.3 }}>{p.name}</div>
                    <div style={{ fontSize:11, color:'var(--mid)', lineHeight:1.5 }}>{p.desc}</div>
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

  // ══ STEP 3 — HOSPITAL ══
  if (step===3) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:back }} />
      <div style={wrapStyle}>
        <StepBar current={3} />
        <div style={gridStyle}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            <SectionCard title="Selecionar Hospital">
              {availableHospitals.length === 0 ? (
                <div style={{ textAlign:'center', padding:'28px 0', color:'var(--light)' }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>🏥</div>
                  <p style={{ fontSize:14, marginBottom:8 }}>Nenhum hospital disponível para os procedimentos selecionados.</p>
                  <p style={{ fontSize:12 }}>Cadastre os preços na aba <strong>Tabela de Preços</strong> do painel admin.</p>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {availableHospitals.map(h=>(
                    <OptionCard key={h.id} selected={hospital?.id===h.id} onClick={()=>{ setHospital(h); setHospPayType(null); setHospPernoite(null); }}>
                      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, fontWeight:600, color:'var(--dark)', marginBottom:5 }}>{h.name}</div>
                      <div style={{ fontSize:12, color:'var(--light)' }}>{h.address}</div>
                    </OptionCard>
                  ))}
                </div>
              )}
            </SectionCard>

            {hospital && (
              <SectionCard title={`Forma de Pagamento — ${hospital.name}`}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                  {[{key:'avista',label:'À vista',sub:'Pix ou Dinheiro'},{key:'credito3x',label:'Até 3x',sub:'Cartão de Crédito'}].map(pt=>(
                    <OptionCard key={pt.key} selected={hospPayType===pt.key} onClick={()=>{setHospPayType(pt.key);setHospPernoite(null);}}>
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
                      {['sem','com'].map(pn=>(
                        <OptionCard key={pn} selected={hospPernoite===pn} onClick={()=>setHospPernoite(pn)}>
                          <div style={{ fontWeight:600, fontSize:14, color:'var(--dark)', marginBottom:5 }}>{pn==='sem'?'Sem pernoite':'Com pernoite'}</div>
                          <div style={{ fontSize:18, fontWeight:700, color:'var(--caramel)' }}>{fmt(getHospValorItem(hospital.id, hospPayType, pn))}</div>
                          <div style={{ fontSize:11, color:'var(--light)', marginTop:4 }}>total dos procedimentos</div>
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

  // ══ STEP 4 — ANESTESIA ══
  if (step===4) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:back }} />
      <div style={wrapStyle}>
        <StepBar current={4} />
        <div style={gridStyle}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <SectionCard title="Tempo de Anestesia">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
                {ANESTESIA_TEMPOS.map(at=>(
                  <OptionCard key={at.id} selected={anestTempo?.id===at.id} onClick={()=>{setAnestTempo(at);setAnestPayType(null);}}>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--dark)', marginBottom:4 }}>{at.label}</div>
                    <div style={{ fontSize:11, color:'var(--light)' }}>À vista: {fmt(at.avista)}</div>
                  </OptionCard>
                ))}
              </div>
            </SectionCard>

            {anestTempo && (
              <SectionCard title="Forma de Pagamento — Anestesia">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[{key:'avista',label:'À vista',sub:'Pix ou Dinheiro',val:anestTempo.avista},{key:'credito3x',label:'Até 3x no Cartão',sub:'Cartão de Crédito',val:anestTempo.credito3x}].map(pt=>(
                    <OptionCard key={pt.key} selected={anestPayType===pt.key} onClick={()=>setAnestPayType(pt.key)}>
                      <div style={{ fontWeight:600, fontSize:14, color:'var(--dark)', marginBottom:5 }}>{pt.label}</div>
                      <div style={{ fontSize:12, color:'var(--light)', marginBottom:8 }}>{pt.sub}</div>
                      <div style={{ fontSize:20, fontWeight:700, color:'var(--caramel)' }}>{fmt(pt.val)}</div>
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

  // ══ STEP 5 — RESUMO ══
  const Row = ({label,value,highlight}) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--warm)' }}>
      <span style={{ fontSize:14, color:'var(--mid)' }}>{label}</span>
      <span style={{ fontSize:highlight?18:14, fontWeight:highlight?700:500, color:highlight?'var(--caramel)':'var(--dark)', fontFamily:highlight?'Cormorant Garamond,serif':'DM Sans,sans-serif' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:back }} />
      <div style={wrapStyle}>
        <StepBar current={5} />
        <div style={{ maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>

          <SectionCard title="Paciente">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['Nome',client.name],['CPF',client.cpf],['E-mail',client.email],['Telefone',client.phone],['Responsável',employee]].map(([k,v])=>(
                <div key={k}><div style={{ fontSize:11, fontWeight:600, color:'var(--light)', textTransform:'uppercase', marginBottom:4 }}>{k}</div><div style={{ fontSize:14, color:'var(--dark)' }}>{v}</div></div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Procedimentos">
            {selected.map(p=><Row key={p.id} label={p.name} value={p.category} />)}
          </SectionCard>

          <SectionCard title="Hospital">
            <Row label="Hospital"           value={hospital.name} />
            <Row label="Forma de pagamento" value={hospPayType==='avista'?'À vista (Pix ou Dinheiro)':'Até 3x no Cartão'} />
            <Row label="Pernoite"           value={hospPernoite==='com'?'Com pernoite':'Sem pernoite'} />
            <Row label={<strong>Valor hospital</strong>} value={fmt(hospValor)} highlight />
          </SectionCard>

          <SectionCard title="Anestesia">
            <Row label="Tempo"              value={anestTempo.label} />
            <Row label="Forma de pagamento" value={anestPayType==='avista'?'À vista (Pix ou Dinheiro)':'Até 3x no Cartão'} />
            <Row label={<strong>Valor anestesia</strong>} value={fmt(anestValor)} highlight />
          </SectionCard>

          <div style={{ background:'var(--dark)', borderRadius:14, padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={{ fontSize:16, color:'rgba(255,255,255,.7)', fontWeight:500 }}>TOTAL GERAL</span>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:34, fontWeight:600, color:'var(--caramel2)' }}>{fmt(total)}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <button onClick={()=>save(false)} style={{ padding:13, borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'transparent', color:'white', fontSize:13, fontWeight:500, cursor:'pointer' }}>Salvar como rascunho</button>
              <button onClick={()=>save(true)} style={{ padding:13, borderRadius:10, border:'none', background:'var(--caramel)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}
                onMouseOver={e=>e.currentTarget.style.background='var(--caramel3)'}
                onMouseOut={e=>e.currentTarget.style.background='var(--caramel)'}>
                Gerar e enviar link →
              </button>
            </div>
          </div>

          {obs && <SectionCard title="Observações"><p style={{ fontSize:14, color:'var(--mid)', lineHeight:1.7 }}>{obs}</p></SectionCard>}
        </div>
      </div>
    </div>
  );
}
