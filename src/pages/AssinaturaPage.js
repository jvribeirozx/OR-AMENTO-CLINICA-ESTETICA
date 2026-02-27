import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store, fmt, STATUS_LABEL } from '../store';

export default function AssinaturaPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [done, setDone]       = useState(false);
  const order = store.getOrder(id);

  useEffect(() => {
    if (order?.status === 'signed') setDone(true);
  }, [order]);

  if (!order) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', gap:16 }}>
      <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, color:'var(--dark)' }}>Orçamento não encontrado</div>
      <button onClick={() => navigate('/admin')} style={{ padding:'10px 24px', borderRadius:8, border:'1.5px solid var(--border)', background:'white', color:'var(--mid)', fontSize:14 }}>← Voltar</button>
    </div>
  );

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return { x: (s.clientX - r.left) * (canvas.width / r.width), y: (s.clientY - r.top) * (canvas.height / r.height) };
  };
  const startDraw = (e) => { e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = getPos(e, canvasRef.current); ctx.beginPath(); ctx.moveTo(p.x, p.y); setDrawing(true); };
  const draw = (e) => { e.preventDefault(); if (!drawing) return; const ctx = canvasRef.current.getContext('2d'); ctx.strokeStyle='#2C2416'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.lineJoin='round'; const p = getPos(e, canvasRef.current); ctx.lineTo(p.x, p.y); ctx.stroke(); setHasSig(true); };
  const stopDraw = () => setDrawing(false);
  const clearSig = () => { const ctx = canvasRef.current.getContext('2d'); ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height); setHasSig(false); };

  const handleSign = () => {
    if (!hasSig || !agreed) return;
    store.signOrder(id);
    setDone(true);
  };

  const handlePrint = () => window.print();

  if (done) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="fade-up" style={{ textAlign:'center', maxWidth:460, padding:24 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--green)', color:'white', fontSize:30, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>✓</div>
        <h1 style={{ fontSize:32, color:'var(--dark)', marginBottom:12 }}>Orçamento assinado!</h1>
        <p style={{ fontSize:15, color:'var(--mid)', marginBottom:8, lineHeight:1.6 }}>
          Obrigado, <strong>{order.client.name}</strong>.<br />
          Seu orçamento foi confirmado com sucesso.
        </p>
        <div style={{ display:'flex', justifyContent:'center', gap:10, fontSize:13, color:'var(--caramel)', background:'var(--warm)', padding:'12px 24px', borderRadius:10, marginBottom:28 }}>
          <span>{order.id}</span><span>·</span><span>{fmt(order.total)}</span><span>·</span><span>{order.items.length} procedimento{order.items.length>1?'s':''}</span>
        </div>
        <button onClick={handlePrint} style={{ padding:'12px 28px', borderRadius:10, border:'none', background:'var(--caramel)', color:'white', fontSize:14, fontWeight:600 }}>
          Imprimir / Salvar PDF
        </button>
      </div>
    </div>
  );

  const st = STATUS_LABEL[order.status];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Header */}
      <header style={{ background:'var(--dark)', borderBottom:'3px solid var(--caramel)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:'var(--caramel)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'white', fontWeight:700 }}>✦</div>
            <div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:17, color:'white', fontWeight:600 }}>Clínica Estética</div>
              <div style={{ fontSize:11, color:'var(--light)' }}>Assinatura de Orçamento</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--caramel2)', background:'rgba(200,135,58,.15)', padding:'6px 14px', borderRadius:20 }}>#{order.id}</span>
            <button onClick={handlePrint} style={{ padding:'7px 16px', borderRadius:8, border:'1.5px solid rgba(255,255,255,.2)', background:'transparent', color:'white', fontSize:12, fontWeight:500 }}>
              🖨 Imprimir PDF
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'36px 24px 64px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:28, alignItems:'start' }}>

          {/* DOCUMENTO */}
          <div style={{ background:'white', borderRadius:16, border:'1px solid var(--border)', overflow:'hidden' }} id="print-area">

            {/* Doc header */}
            <div style={{ background:'var(--dark)', padding:'28px 32px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--caramel2)', marginBottom:4 }}>ORÇAMENTO</div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, color:'white', fontWeight:500 }}>#{order.id}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:12, color:'var(--light)', marginBottom:4 }}>Emitido em <span style={{ color:'var(--caramel2)' }}>{order.createdAt}</span></div>
                <div style={{ fontSize:12, color:'var(--light)' }}>Validade <span style={{ color:'var(--caramel2)' }}>30 dias</span></div>
                <span style={{ marginTop:8, display:'inline-block', padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, background:st.bg, color:st.color }}>{st.label}</span>
              </div>
            </div>

            {/* Cliente */}
            <div style={{ padding:'22px 32px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--light)', fontWeight:600, marginBottom:12 }}>PACIENTE</div>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:500, color:'var(--dark)', marginBottom:6 }}>{order.client.name}</div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:13, color:'var(--mid)' }}>
                <span>{order.client.email}</span>
                <span>·</span>
                <span>{order.client.phone}</span>
                <span>·</span>
                <span>CPF: {order.client.cpf}</span>
              </div>
              <div style={{ marginTop:8, fontSize:13, color:'var(--mid)' }}>Responsável: <strong style={{ color:'var(--dark)' }}>{order.employee}</strong></div>
            </div>

            {/* Procedimentos */}
            <div style={{ padding:'22px 32px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--light)', fontWeight:600, marginBottom:14 }}>PROCEDIMENTOS</div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {['Procedimento','Categoria','Valor'].map(h => (
                      <th key={h} style={{ padding:'0 0 12px', textAlign: h==='Valor' ? 'right' : 'left', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--light)', fontWeight:600, borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={item.id} style={{ background: i%2===0 ? 'var(--warm)' : 'transparent' }}>
                      <td style={{ padding:'13px 0', fontSize:14, color:'var(--dark)' }}>{item.name}</td>
                      <td style={{ padding:'13px 0' }}><span style={{ fontSize:11, fontWeight:600, background:'var(--warm)', color:'var(--mid)', padding:'3px 8px', borderRadius:5 }}>{item.category}</span></td>
                      <td style={{ padding:'13px 0', textAlign:'right', fontSize:14, color:'var(--mid)' }}>{fmt(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{ paddingTop:16, fontWeight:700, fontSize:15, borderTop:'2px solid var(--border)', color:'var(--dark)' }}>Total</td>
                    <td style={{ paddingTop:16, textAlign:'right', borderTop:'2px solid var(--border)', fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:600, color:'var(--caramel)' }}>{fmt(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observações */}
            {order.obs && (
              <div style={{ padding:'22px 32px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--light)', fontWeight:600, marginBottom:10 }}>OBSERVAÇÕES</div>
                <p style={{ fontSize:13, color:'var(--mid)', lineHeight:1.7, background:'var(--warm)', padding:16, borderRadius:8 }}>{order.obs}</p>
              </div>
            )}

            {/* Termo */}
            <div style={{ padding:'22px 32px' }}>
              <div style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--light)', fontWeight:600, marginBottom:14 }}>TERMO DE ACEITE</div>
              <div style={{ background:'var(--bg)', borderRadius:10, padding:20, display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  `Ao assinar este documento, o(a) paciente ${order.client.name} declara estar ciente e de acordo com todos os procedimentos, valores e condições descritos neste orçamento.`,
                  `Os procedimentos serão realizados pela equipe da Clínica Estética, conforme agendamento a ser confirmado após a assinatura. O pagamento deverá ser realizado conforme combinado com a equipe.`,
                  `Este documento possui validade jurídica. O registro de assinatura, data, hora e endereço IP são armazenados para fins de confirmação e segurança das partes.`,
                ].map((p, i) => (
                  <p key={i} style={{ fontSize:13, color:'var(--mid)', lineHeight:1.75 }}>{p}</p>
                ))}
              </div>
            </div>
          </div>

          {/* PAINEL ASSINATURA */}
          <div style={{ background:'var(--dark)', borderRadius:16, padding:28, position:'sticky', top:80, color:'white' }}>
            <h2 style={{ fontSize:22, color:'white', marginBottom:20 }}>Assinar orçamento</h2>

            <div style={{ background:'rgba(255,255,255,.05)', borderRadius:10, padding:16, marginBottom:20, display:'flex', flexDirection:'column', gap:10 }}>
              {[['Orçamento', `#${order.id}`], ['Valor total', fmt(order.total)], ['Data', new Date().toLocaleDateString('pt-BR')]].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'var(--light)' }}>{k}</span>
                  <span style={{ color: k==='Valor total' ? 'var(--caramel2)' : 'rgba(255,255,255,.9)', fontWeight: k==='Valor total' ? 700 : 400, fontSize: k==='Valor total' ? 16 : 13 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Canvas */}
            <div style={{ background:'white', borderRadius:10, padding:12, marginBottom:16, position:'relative' }}>
              <div style={{ fontSize:11, color:'var(--light)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Assine abaixo</div>
              <canvas
                ref={canvasRef} width={580} height={160}
                style={{ display:'block', width:'100%', height:130, border:'1.5px dashed var(--border)', borderRadius:8, cursor:'crosshair', touchAction:'none' }}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
              />
              {hasSig && (
                <button onClick={clearSig} style={{ position:'absolute', top:12, right:12, background:'var(--warm)', border:'1px solid var(--border)', color:'var(--mid)', fontSize:11, padding:'4px 10px', borderRadius:6 }}>Limpar</button>
              )}
              {!hasSig && (
                <div style={{ fontSize:11, color:'var(--light)', textAlign:'center', marginTop:8, fontStyle:'italic' }}>← Desenhe sua assinatura aqui</div>
              )}
            </div>

            <label style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'rgba(255,255,255,.8)', cursor:'pointer', marginBottom:16 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width:16, height:16, accentColor:'var(--caramel)', cursor:'pointer', flexShrink:0 }} />
              <span>Li e concordo com o termo de aceite</span>
            </label>

            <button
              onClick={handleSign}
              disabled={!hasSig || !agreed}
              style={{
                width:'100%', padding:14, borderRadius:10, border:'none',
                background: hasSig && agreed ? 'var(--caramel)' : 'rgba(255,255,255,.1)',
                color: hasSig && agreed ? 'white' : 'rgba(255,255,255,.3)',
                fontSize:14, fontWeight:600, transition:'all .2s',
                cursor: hasSig && agreed ? 'pointer' : 'not-allowed',
              }}
            >
              ✓ Confirmar e assinar
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:11, color:'var(--light)', marginTop:14, justifyContent:'center' }}>
              <span style={{ width:7, height:7, background:'var(--green)', borderRadius:'50%', flexShrink:0 }} />
              Assinatura com registro de data, hora e IP
            </div>
          </div>
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
          header, aside, button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
