import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { store, fmt, CATEGORIES, EMPLOYEES } from '../store';

export default function NovoOrcamento() {
  const navigate = useNavigate();
  const procedures = store.getProcedures();

  const [cat, setCat]       = useState('Todos');
  const [selected, setSel]  = useState([]);
  const [client, setClient] = useState({ name:'', email:'', phone:'', cpf:'' });
  const [employee, setEmp]  = useState(EMPLOYEES[0]);
  const [obs, setObs]       = useState('');
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  const filtered = procedures.filter(p =>
    (cat === 'Todos' || p.category === cat) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (p) =>
    setSel(prev => prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]);

  const total = selected.reduce((s, p) => s + p.price, 0);

  const validate = () => {
    const e = {};
    if (!client.name.trim())  e.name  = 'Nome obrigatório';
    if (!client.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'E-mail inválido';
    if (!client.phone.trim()) e.phone = 'Telefone obrigatório';
    if (!client.cpf.trim())   e.cpf   = 'CPF obrigatório';
    if (selected.length === 0) e.items = 'Selecione ao menos um procedimento';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const salvar = (sendLink) => {
    if (!validate()) return;
    const id = store.nextOrderId();
    store.addOrder({
      id, client, employee, obs,
      items: selected, total,
      status: sendLink ? 'sent' : 'draft',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      signedAt: null,
    });
    if (sendLink) {
      navigate(`/admin?highlight=${id}&copied=1`);
    } else {
      navigate('/admin');
    }
  };

  const inp = (field, val, clientField = true) => {
    if (clientField) setClient(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Header sub="Novo Orçamento" action={{ label:'← Voltar', onClick:() => navigate('/admin') }} />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px 64px' }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:30, color:'var(--dark)', marginBottom:4 }}>Novo Orçamento</h1>
          <p style={{ color:'var(--mid)', fontSize:14 }}>Preencha os dados do paciente e selecione os procedimentos</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:28, alignItems:'start' }}>
          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

            {/* Dados do paciente */}
            <section style={{ background:'var(--white)', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                <h2 style={{ fontSize:18, color:'var(--dark)' }}>Dados do Paciente</h2>
              </div>
              <div style={{ padding:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                {[
                  { key:'name',  label:'Nome completo',     placeholder:'Nome do paciente',   full:true  },
                  { key:'cpf',   label:'CPF',                placeholder:'000.000.000-00'               },
                  { key:'email', label:'E-mail',             placeholder:'email@exemplo.com'            },
                  { key:'phone', label:'Telefone / WhatsApp',placeholder:'(XX) 99999-0000'              },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: f.full ? '1/-1' : 'auto' }}>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--mid)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</label>
                    <input
                      value={client[f.key]}
                      onChange={e => inp(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      style={{
                        width:'100%', padding:'11px 14px', borderRadius:8,
                        border: errors[f.key] ? '1.5px solid var(--red)' : '1.5px solid var(--border)',
                        background:'var(--bg)', fontSize:14, color:'var(--dark)',
                        outline:'none', transition:'border .2s',
                      }}
                      onFocus={e  => e.target.style.borderColor = 'var(--caramel)'}
                      onBlur={e   => e.target.style.borderColor = errors[f.key] ? 'var(--red)' : 'var(--border)'}
                    />
                    {errors[f.key] && <span style={{ fontSize:11, color:'var(--red)', marginTop:4, display:'block' }}>{errors[f.key]}</span>}
                  </div>
                ))}

                {/* Responsável */}
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--mid)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Responsável pelo atendimento</label>
                  <select
                    value={employee}
                    onChange={e => setEmp(e.target.value)}
                    style={{ width:'100%', padding:'11px 14px', borderRadius:8, border:'1.5px solid var(--border)', background:'var(--bg)', fontSize:14, color:'var(--dark)', outline:'none' }}
                  >
                    {EMPLOYEES.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Procedimentos */}
            <section style={{ background:'var(--white)', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', background:'var(--warm)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                <h2 style={{ fontSize:18, color:'var(--dark)' }}>Procedimentos</h2>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar procedimento..."
                  style={{ padding:'8px 14px', borderRadius:8, border:'1.5px solid var(--border)', background:'white', fontSize:13, outline:'none', width:220 }}
                />
              </div>
              {errors.items && <div style={{ padding:'10px 24px', background:'var(--red-bg)', fontSize:13, color:'var(--red)' }}>{errors.items}</div>}

              {/* Tabs */}
              <div style={{ padding:'14px 24px 0', display:'flex', gap:8, flexWrap:'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCat(c)} style={{
                    padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:500,
                    border: cat===c ? 'none' : '1.5px solid var(--border)',
                    background: cat===c ? 'var(--caramel)' : 'white',
                    color: cat===c ? 'white' : 'var(--mid)',
                    transition:'all .15s',
                  }}>{c}</button>
                ))}
              </div>

              {/* Grid */}
              <div style={{ padding:24, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
                {filtered.map(p => {
                  const isSel = !!selected.find(x => x.id === p.id);
                  return (
                    <button key={p.id} onClick={() => toggle(p)} style={{
                      textAlign:'left', padding:16, borderRadius:12,
                      border: isSel ? '2px solid var(--caramel)' : '1.5px solid var(--border)',
                      background: isSel ? '#FFF8EE' : 'white',
                      position:'relative', transition:'all .2s',
                      boxShadow: isSel ? '0 4px 16px rgba(200,135,58,.15)' : 'none',
                    }}>
                      {isSel && (
                        <div style={{
                          position:'absolute', top:10, right:10,
                          width:20, height:20, borderRadius:'50%',
                          background:'var(--caramel)', color:'white',
                          fontSize:10, fontWeight:700,
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>✓</div>
                      )}
                      <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', marginBottom:6, fontWeight:600 }}>{p.category}</div>
                      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:16, fontWeight:600, color:'var(--dark)', marginBottom:6, lineHeight:1.3 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--mid)', marginBottom:12, lineHeight:1.5 }}>{p.desc}</div>
                      <div style={{ fontSize:15, fontWeight:700, color:'var(--caramel)' }}>{fmt(p.price)}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Observações */}
            <section style={{ background:'var(--white)', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden' }}>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', background:'var(--warm)' }}>
                <h2 style={{ fontSize:18, color:'var(--dark)' }}>Observações</h2>
              </div>
              <div style={{ padding:24 }}>
                <textarea
                  value={obs}
                  onChange={e => setObs(e.target.value)}
                  placeholder="Anotações internas, detalhes do procedimento, preferências do paciente..."
                  rows={4}
                  style={{ width:'100%', padding:'12px 14px', borderRadius:8, border:'1.5px solid var(--border)', background:'var(--bg)', fontSize:14, resize:'vertical', outline:'none', lineHeight:1.6 }}
                  onFocus={e => e.target.style.borderColor='var(--caramel)'}
                  onBlur={e  => e.target.style.borderColor='var(--border)'}
                />
              </div>
            </section>
          </div>

          {/* RIGHT — Resumo */}
          <aside style={{ background:'var(--dark)', borderRadius:16, padding:24, position:'sticky', top:80, color:'white' }}>
            <h2 style={{ fontSize:20, color:'white', marginBottom:18 }}>Resumo</h2>

            {selected.length === 0 ? (
              <div style={{ textAlign:'center', padding:'28px 0', color:'var(--light)' }}>
                <div style={{ fontSize:28, marginBottom:10, opacity:.4 }}>✦</div>
                <p style={{ fontSize:13, lineHeight:1.5 }}>Nenhum procedimento selecionado</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                {selected.map(p => (
                  <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    <div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,.9)', lineHeight:1.3 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--light)', marginTop:2 }}>{p.category}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--caramel2)' }}>{fmt(p.price)}</span>
                      <button onClick={() => toggle(p)} style={{
                        width:18, height:18, borderRadius:'50%',
                        background:'rgba(255,255,255,.08)', color:'var(--light)',
                        fontSize:9, display:'flex', alignItems:'center', justifyContent:'center',
                      }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ height:1, background:'rgba(255,255,255,.1)', marginBottom:14 }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <span style={{ fontSize:13, color:'var(--light)' }}>Total</span>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, fontWeight:600, color:'var(--caramel2)' }}>{fmt(total)}</span>
            </div>

            {/* Botão: Salvar rascunho */}
            <button
              onClick={() => salvar(false)}
              style={{
                width:'100%', padding:13, borderRadius:10,
                background:'rgba(255,255,255,.08)',
                border:'1px solid rgba(255,255,255,.15)',
                color:'white', fontSize:13, fontWeight:500,
                marginBottom:10, transition:'all .2s',
              }}
              onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.14)'}
              onMouseOut={e  => e.currentTarget.style.background='rgba(255,255,255,.08)'}
            >
              Salvar como rascunho
            </button>

            {/* Botão: Gerar e enviar link */}
            <button
              onClick={() => salvar(true)}
              style={{
                width:'100%', padding:13, borderRadius:10,
                background:'var(--caramel)', color:'white',
                fontSize:13, fontWeight:600, transition:'all .2s',
              }}
              onMouseOver={e => e.currentTarget.style.background='var(--caramel3)'}
              onMouseOut={e  => e.currentTarget.style.background='var(--caramel)'}
            >
              Gerar e enviar link →
            </button>

            <p style={{ fontSize:11, color:'var(--light)', textAlign:'center', marginTop:12, lineHeight:1.5 }}>
              O link de assinatura será gerado para envio ao paciente
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
