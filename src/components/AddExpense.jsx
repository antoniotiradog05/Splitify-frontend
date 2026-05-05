import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Euro, Check, CreditCard, Calendar, ArrowRight } from 'lucide-react';

const AddExpense = ({ members, onClose, onAdd, currentUser, editData }) => {
  const [description, setDescription] = useState(editData ? editData.description : '');
  const [amount, setAmount] = useState(editData ? editData.amount.toString() : '');
  const [paidBy, setPaidBy] = useState(editData ? editData.paidBy : currentUser);
  const [splitAmong, setSplitAmong] = useState(editData ? [...editData.splitAmong] : [...members]);
  const [category, setCategory] = useState(editData ? editData.category : 'otros');

  const categories = [
    { id: 'comida', label: 'Comida', icon: '🍕' },
    { id: 'transporte', label: 'Transporte', icon: '🚗' },
    { id: 'ocio', label: 'Ocio', icon: '🍹' },
    { id: 'casa', label: 'Casa', icon: '🏠' },
    { id: 'otros', label: 'Otros', icon: '📦' }
  ];

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
      splitAmong,
      category
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editData ? 'Editar Transacción' : 'Nueva Transacción'}</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{editData ? 'Modifica los detalles del gasto.' : 'Todos los campos son obligatorios para la sincronización.'}</p>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem', borderRadius: '12px' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>DESCRIPCIÓN</label>
            <div className="modern-input-wrapper">
              <input 
                type="text" 
                placeholder="¿En qué se gastó?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>IMPORTE (€)</label>
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
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>CATEGORÍA</label>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  style={{ 
                    padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid',
                    whiteSpace: 'nowrap', fontSize: '0.8rem',
                    background: category === cat.id ? 'var(--primary)' : 'var(--bg-elevated)',
                    borderColor: category === cat.id ? 'var(--primary)' : 'var(--border-subtle)',
                    color: category === cat.id ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>PAGADO POR</label>
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
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>DIVIDIR CON</label>
              <div style={{ padding: '12px', background: 'var(--bg-deep)', borderRadius: '16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                {splitAmong.length} Miembros
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>SELECCIONAR BENEFICIARIOS</label>
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
            {editData ? 'Guardar Cambios' : 'Sincronizar Gasto'} <ArrowRight size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddExpense;
