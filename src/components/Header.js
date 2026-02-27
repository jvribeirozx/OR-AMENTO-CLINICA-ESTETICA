import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ title, sub, action }) {
  const navigate = useNavigate();

  return (
    <header style={{
      background: 'var(--dark)',
      borderBottom: '3px solid var(--caramel)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }} onClick={() => navigate('/admin')}>
          <div style={{
            width:36, height:36, borderRadius:9,
            background:'var(--caramel)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, color:'white', fontWeight:700,
          }}>✦</div>
          <div>
            <div style={{ fontFamily:'Cormorant Garamond, serif', fontSize:17, color:'white', fontWeight:600, lineHeight:1.2 }}>
              Clínica Estética
            </div>
            {sub && <div style={{ fontSize:11, color:'var(--light)' }}>{sub}</div>}
          </div>
        </div>

        {action && (
          <button
            onClick={action.onClick}
            style={{
              padding:'8px 20px', borderRadius:8,
              background:'var(--caramel)', color:'white',
              fontSize:13, fontWeight:600,
              transition:'all .2s',
            }}
            onMouseOver={e => e.currentTarget.style.background='var(--caramel3)'}
            onMouseOut={e  => e.currentTarget.style.background='var(--caramel)'}
          >
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}
