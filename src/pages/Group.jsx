import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, Share2, Calculator, Bell, Wallet, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AddExpense from '../components/AddExpense';
import ExpenseList from '../components/ExpenseList';
import QRDisplay from '../components/QRDisplay';

// Modal de confirmación para borrar
const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(5, 6, 8, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '1.5rem'
  }}>
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      style={{
        background: '#161920',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '24px',
        padding: '2rem',
        width: '100%',
        maxWidth: '320px',
        textAlign: 'center'
      }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem'
      }}>
        <Trash2 size={24} color="#ef4444" />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
        ¿Eliminar este gasto?
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.75rem' }}>
        Esta acción es permanente y no se puede deshacer.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '0.875rem', borderRadius: '14px',
            background: '#1f232d', color: 'white',
            border: '1px solid rgba(255,255,255,0.08)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem'
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, padding: '0.875rem', borderRadius: '14px',
            background: '#ef4444', color: 'white', border: 'none',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
          }}
        >
          Eliminar
        </button>
      </div>
    </motion.div>
  </div>
);

const Group = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // ID del gasto a borrar
  const [userName] = useState(localStorage.getItem(`user_${code}`));

  useEffect(() => {
    if (!userName) {
      navigate('/');
      return;
    }

    // Crear socket dentro del componente para garantizar reconexión
    const socket = io(import.meta.env.VITE_API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join_group', { code, username: userName });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      toast.error('Error de conexión. Reintentando...', { id: 'connect-error' });
    });

    socket.on('group_updated', ({ group }) => {
      setGroup(group);
    });

    // NO navegar a / en errores — solo mostrar el mensaje
    socket.on('error_message', (msg) => {
      toast.error(msg || 'Ha ocurrido un error');
    });

    return () => {
      socket.disconnect();
    };
  }, [code, userName, navigate]);

  const handleAddExpense = (expenseData) => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      toast.error('Sin conexión al servidor');
      return;
    }
    if (editingExpense) {
      socket.emit('edit_expense', { code, expenseId: editingExpense._id, updatedData: expenseData });
      setEditingExpense(null);
      toast.success('Transacción actualizada');
    } else {
      socket.emit('add_expense', { code, ...expenseData });
      toast.success('Transacción sincronizada');
    }
    setShowAddModal(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  // Paso 1: pedir confirmación (muestra el modal)
  const handleDeleteRequest = (expenseId) => {
    console.log('Delete requested for expense:', expenseId);
    setDeleteTarget(expenseId);
  };

  // Paso 2: el usuario confirma → emitir delete
  const handleDeleteConfirm = () => {
    const socket = socketRef.current;
    if (!socket?.connected) {
      toast.error('Sin conexión al servidor. Recarga la página.');
      setDeleteTarget(null);
      return;
    }
    console.log('Emitting delete_expense:', { code, expenseId: deleteTarget });
    socket.emit('delete_expense', { code, expenseId: deleteTarget });
    toast.success('Gasto eliminado');
    setDeleteTarget(null);
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

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="modern-input-wrapper" style={{ padding: '0.2rem 1rem' }}>
          <input
            type="text"
            placeholder="Buscar gasto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ExpenseList
          expenses={group.expenses.filter(e => e.description.toLowerCase().includes(searchTerm.toLowerCase()))}
          onDelete={handleDeleteRequest}
          onEdit={handleEditExpense}
        />
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
        {/* Modal de confirmación de borrado */}
        {deleteTarget && (
          <ConfirmDeleteModal
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {showAddModal && (
          <AddExpense
            onClose={() => {
              setShowAddModal(false);
              setEditingExpense(null);
            }}
            onAdd={handleAddExpense}
            members={group.members}
            currentUser={userName}
            editData={editingExpense}
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
