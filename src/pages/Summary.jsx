import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Send, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const socket = io(import.meta.env.VITE_API_URL);

const Summary = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [userName] = useState(localStorage.getItem(`user_${code}`));

  useEffect(() => {
    socket.emit('join_group', { code, username: userName });

    socket.on('group_updated', ({ group, settlements }) => {
      setGroup(group);
      setSettlements(settlements);
    });

    return () => {
      socket.off('group_updated');
    };
  }, [code, userName]);

  const handleShare = () => {
    if (!group) return;
    let message = `💎 *RESUMEN EJECUTIVO SPLITIFY: ${group.name}*\n\n`;
    if (settlements.length === 0) {
      message += "Cuentas equilibradas. Sin deudas pendientes. 🎉";
    } else {
      settlements.forEach(s => {
        message += `🔹 *${s.from}* paga a *${s.to}*: ${s.amount}€\n`;
      });
    }
    message += `\nSecure Access: ${window.location.origin}/group/${code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!group) return <div className="app-container">Loading protocol...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <header className="sticky-nav" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/group/${code}`)} style={{ padding: '0.6rem' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Protocolo de Liquidación</h2>
      </header>

      <div style={{ padding: '1rem 0' }}>
        <div className="luxury-card" style={{ marginBottom: '1.5rem', background: 'var(--bg-deep)' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Estado de Cuentas</h4>
          {group.members.map(member => {
            const spent = group.expenses.filter(e => e.paidBy === member).reduce((acc, curr) => acc + curr.amount, 0);
            const shouldHavePaid = group.expenses.reduce((acc, curr) => {
              if (curr.splitAmong.includes(member)) {
                return acc + (curr.amount / curr.splitAmong.length);
              }
              return acc;
            }, 0);
            const bal = spent - shouldHavePaid;

            return (
              <div key={member} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontWeight: 600 }}>{member}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: bal >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
                    {bal >= 0 ? '+' : ''}{bal.toFixed(2)}€
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>HA GASTADO {spent.toFixed(2)}€</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="luxury-card" style={{ borderTop: '4px solid var(--primary)', background: 'linear-gradient(to bottom, #1a1e26, #161920)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              background: 'var(--bg-elevated)', margin: '0 auto 1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border-bright)'
            }}>
              <TrendingUp size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Transacciones Sugeridas</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Optimización completada. Pagos mínimos calculados.</p>
          </div>
          
          {settlements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={64} color="var(--success)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 700 }}>Sistema Equilibrado</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No se requieren más acciones.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {settlements.map((s, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{ 
                    padding: '1.25rem', background: 'var(--bg-elevated)', 
                    borderRadius: '18px', border: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 800 }}>DEUDOR</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.from}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Send size={16} color="var(--primary)" style={{ opacity: 0.6 }} />
                    <div style={{ width: '1px', height: '10px', background: 'var(--border-bright)', margin: '4px 0' }}></div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{s.amount}€</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 800 }}>A {s.to.toUpperCase()}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleShare} 
          style={{ background: '#25D366', color: 'white', padding: '1.25rem', boxShadow: '0 10px 20px rgba(37, 211, 102, 0.2)' }}
        >
          <MessageCircle size={22} /> Compartir por WhatsApp
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/group/${code}`)} style={{ padding: '1rem' }}>
          Volver al Grupo
        </button>
      </div>
    </motion.div>
  );
};

export default Summary;
