import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Receipt, ArrowLeft, Share2, Calculator, MoreVertical, Bell, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import AddExpense from '../components/AddExpense';
import ExpenseList from '../components/ExpenseList';
import QRDisplay from '../components/QRDisplay';

const socket = io(import.meta.env.VITE_API_URL);

const Group = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [userName] = useState(localStorage.getItem(`user_${code}`));

  useEffect(() => {
    if (!userName) {
      navigate('/');
      return;
    }

    socket.emit('join_group', { code, username: userName });

    socket.on('group_updated', ({ group }) => {
      setGroup(group);
    });

    socket.on('error_message', (msg) => {
      toast.error(msg);
      navigate('/');
    });

    return () => {
      socket.off('group_updated');
      socket.off('error_message');
    };
  }, [code, userName, navigate]);

  const handleAddExpense = (expenseData) => {
    socket.emit('add_expense', { code, ...expenseData });
    setShowAddModal(false);
    toast.success('Transacción sincronizada');
  };

  if (!group) return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: '40px', height: '40px', border: '3px solid var(--border-bright)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}
      />
    </div>
  );

  const totalSpent = group.expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="sticky-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '0.6rem', borderRadius: '12px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{group.name}</h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>SINCRONIZACIÓN ACTIVA</div>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowQR(true)} style={{ padding: '0.6rem', borderRadius: '12px' }}>
          <Share2 size={20} />
        </button>
      </header>

      <div style={{ padding: '1rem 0 2rem' }}>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="luxury-card brand-gradient" 
          style={{ position: 'relative', overflow: 'hidden', padding: '2rem' }}
        >
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}>
            <Wallet size={200} color="white" />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Gasto Total del Grupo</p>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0.2rem 0', color: 'white' }}>{totalSpent.toFixed(2)}€</h1>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                <Bell size={20} color="white" />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>MIEMBROS ACTIVOS</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{group.members.length}</p>
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>ID DEL GRUPO</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{group.code}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
        <h3 style={{ fontSize: '0.8rem' }}>HISTORIAL DE TRANSACCIONES</h3>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary" 
          onClick={() => setShowAddModal(true)} 
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', borderRadius: '14px' }}
        >
          <Plus size={16} /> Nuevo Gasto
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ExpenseList expenses={group.expenses} />
      </div>

      <div style={{ height: '8rem' }}></div>

      <div style={{ position: 'fixed', bottom: '2rem', left: '1.25rem', right: '1.25rem', zIndex: 10 }}>
        <button 
          className="btn btn-primary" 
          style={{ 
            width: '100%', padding: '1.25rem', fontSize: '1.1rem',
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)',
            borderRadius: '20px'
          }}
          onClick={() => navigate(`/group/${code}/summary`)}
        >
          <Calculator size={22} /> Liquidar Cuentas
        </button>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddExpense 
            members={group.members} 
            onClose={() => setShowAddModal(false)} 
            onAdd={handleAddExpense} 
            currentUser={userName}
          />
        )}
        {showQR && (
          <QRDisplay 
            code={code} 
            groupName={group.name} 
            onClose={() => setShowQR(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Group;
