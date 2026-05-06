import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, CheckCircle, TrendingUp, Send, MessageCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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

  const handleMarkAsPaid = (s) => {
    socket.emit('add_expense', {
      code,
      description: `Liquidación: ${s.from} ➔ ${s.to}`,
      amount: s.amount,
      paidBy: s.from,
      splitAmong: [s.to],
      category: 'ocio' // Usamos ocio por ahora como fallback
    });
    toast.success(`Pago de ${s.from} a ${s.to} registrado`);
  };

  if (!group) return <div className="app-container">Loading protocol...</div>;

  const categoryTotals = group.expenses.reduce((acc, curr) => {
    const cat = curr.category || 'otros';
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const COLORS = ['#6366f1', '#d946ef', '#f59e0b', '#10b981', '#64748b'];

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
        <div className="luxury-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <TrendingUp size={16} /> Distribución de Gastos
          </h4>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '12px' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            {chartData.map((entry, index) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="luxury-card" style={{ marginBottom: '1.5rem', background: 'var(--bg-deep)' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Estado de Cuentas</h4>
          {group.members.map(member => {
            const spent = group.expenses.filter(e => e.paidBy === member).reduce((acc, curr) => acc + curr.amount, 0);
            const shouldHavePaid = group.expenses.reduce((acc, curr) => {
              if (curr.customAmounts && (curr.customAmounts instanceof Map ? curr.customAmounts.get(member) : curr.customAmounts[member])) {
                return acc + (curr.customAmounts instanceof Map ? curr.customAmounts.get(member) : curr.customAmounts[member]);
              }
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

        {/* Nueva sección: Resumen de Deudas */}
        <div className="luxury-card" style={{ marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 800 }}>Deudas Pendientes</h4>
          {group.members.map(member => {
            const spent = group.expenses.filter(e => e.paidBy === member).reduce((acc, curr) => acc + curr.amount, 0);
            const shouldHavePaid = group.expenses.reduce((acc, curr) => {
              const custom = curr.customAmounts && (curr.customAmounts instanceof Map ? curr.customAmounts.get(member) : curr.customAmounts[member]);
              if (custom) return acc + custom;
              if (curr.splitAmong.includes(member)) return acc + (curr.amount / curr.splitAmong.length);
              return acc;
            }, 0);
            const bal = spent - shouldHavePaid;

            if (bal >= -0.01) return null; // No debe nada

            return (
              <div key={member} style={{ padding: '0.5rem 0', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 700 }}>{member}</span>: <span style={{ color: 'var(--accent-rose)', fontWeight: 800 }}>debe {Math.abs(bal).toFixed(2)}€</span>
              </div>
            );
          })}
          {group.members.every(m => {
            const spent = group.expenses.filter(e => e.paidBy === m).reduce((acc, curr) => acc + curr.amount, 0);
            const shouldHavePaid = group.expenses.reduce((acc, curr) => {
              const custom = curr.customAmounts && (curr.customAmounts instanceof Map ? curr.customAmounts.get(m) : curr.customAmounts[m]);
              if (custom) return acc + custom;
              if (curr.splitAmong.includes(m)) return acc + (curr.amount / curr.splitAmong.length);
              return acc;
            }, 0);
            return (spent - shouldHavePaid) >= -0.01;
          }) && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No hay deudas pendientes en este momento.</p>
          )}
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
                  <button 
                    onClick={() => handleMarkAsPaid(s)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: '12px', padding: '0.5rem', color: 'var(--accent-emerald)' }}
                    title="Marcar como pagado"
                  >
                    <CheckCircle size={20} />
                  </button>
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
