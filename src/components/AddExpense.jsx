import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Euro, Check, CreditCard, Calendar } from 'lucide-react';

const AddExpense = ({ members, onClose, onAdd, currentUser }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUser);
  const [splitAmong, setSplitAmong] = useState([...members]);

  const toggleMember = (member) => {
    if (splitAmong.includes(member)) {
      setSplitAmong(splitAmong.filter(m => m !== member));
    } else {
      setSplitAmong([...splitAmong, member]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || splitAmong.length === 0) return;
    onAdd({
      description,
      amount: parseFloat(amount),
      paidBy,
      splitAmong
    });
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(5, 6, 8, 0.85)', 
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'flex-end', zIndex: 1000 
    }}>
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ 
          width: '100%', 
          padding: '2.5rem 1.5rem', 
          background: 'var(--bg-card)',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          border: '1px solid var(--border-bright)',
          borderBottom: 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>New Transaction</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>All fields are mandatory for synchronization.</p>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem', borderRadius: '12px' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>DESCRIPTION</label>
            <div className="modern-input-wrapper">
              <input 
                type="text" 
                placeholder="What was this for?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>AMOUNT (€)</label>
            <div className="modern-input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '0 1rem', color: 'var(--primary)' }}><Euro size={20} /></div>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: '1.5rem', fontWeight: 800 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>SOURCE</label>
              <div className="modern-input-wrapper">
                <select 
                  value={paidBy} 
                  onChange={(e) => setPaidBy(e.target.value)}
                  style={{ 
                    width: '100%', background: 'transparent', color: 'white', 
                    border: 'none', padding: '12px', fontSize: '0.9rem', outline: 'none' 
                  }}
                >
                  {members.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>SPLIT WITH</label>
              <div style={{ padding: '12px', background: 'var(--bg-deep)', borderRadius: '16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                {splitAmong.length} Members
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>SELECT BENEFICIARIES</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {members.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMember(m)}
                  className="btn"
                  style={{ 
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.8rem',
                    borderRadius: '14px',
                    background: splitAmong.includes(m) ? 'var(--primary)' : 'var(--bg-elevated)',
                    color: splitAmong.includes(m) ? 'white' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: splitAmong.includes(m) ? 'var(--primary)' : 'var(--border-subtle)'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: '18px' }}>
            <CreditCard size={20} /> Commit Transaction
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddExpense;
