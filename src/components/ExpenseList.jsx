import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, User, ArrowUpRight, Clock, Trash2 } from 'lucide-react';

const ExpenseList = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ width: '80px', height: '80px', background: 'var(--bg-elevated)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--border-subtle)' }}
        >
          <Receipt size={32} color="var(--text-tertiary)" />
        </motion.div>
        <p style={{ fontWeight: 700, color: 'white' }}>Sin historial de transacciones</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>El libro de cuentas de tu grupo está actualmente vacío.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[...expenses].reverse().map((exp, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="luxury-card"
          style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ 
              width: '44px', height: '44px', background: 'var(--bg-elevated)', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)',
              border: '1px solid var(--border-subtle)'
            }}>
              <ArrowUpRight size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{exp.description}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={12} /> <span style={{ fontWeight: 600, color: 'white' }}>{exp.paidBy}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{exp.amount.toFixed(2)}€</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.5px' }}>
                REPARTIDO: {exp.splitAmong.length} MIEMBROS
              </div>
            </div>
            <button 
              onClick={() => onDelete(exp._id)}
              style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: 'none', padding: '0.5rem', borderRadius: '10px' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ExpenseList;
