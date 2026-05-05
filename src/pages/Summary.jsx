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
    let message = `💎 *SPLITIFY EXECUTIVE SUMMARY: ${group.name}*\n\n`;
    if (settlements.length === 0) {
      message += "All accounts balanced. Zero liabilities. 🎉";
    } else {
      settlements.forEach(s => {
        message += `🔹 *${s.from}* pays *${s.to}*: ${s.amount}€\n`;
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
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Settlement Protocol</h2>
      </header>

      <div style={{ padding: '1rem 0' }}>
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
            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Suggested Transactions</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Optimization complete. Minimum payments found.</p>
          </div>
          
          {settlements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={64} color="var(--success)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 700 }}>System Balanced</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No further actions required.</p>
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
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 800 }}>DEBTOR</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.from}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Send size={16} color="var(--primary)" style={{ opacity: 0.6 }} />
                    <div style={{ width: '1px', height: '10px', background: 'var(--border-bright)', margin: '4px 0' }}></div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{s.amount}€</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 800 }}>TO {s.to.toUpperCase()}</div>
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
          <MessageCircle size={22} /> Share via WhatsApp
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(`/group/${code}`)} style={{ padding: '1rem' }}>
          Dismiss Protocol
        </button>
      </div>
    </motion.div>
  );
};

export default Summary;
