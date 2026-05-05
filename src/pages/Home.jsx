import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Users, ArrowRight, Wallet, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [groupName, setGroupName] = useState('');
  const [userName, setUserName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || !userName) return toast.error('Rellena todos los campos');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, creator: userName }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem(`user_${data.code}`, userName);
        navigate(`/group/${data.code}`);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const handleJoinGroup = (e) => {
    e.preventDefault();
    if (!joinCode || !userName) return toast.error('Rellena tu nombre y el código');
    localStorage.setItem(`user_${joinCode.toUpperCase()}`, userName);
    navigate(`/group/${joinCode.toUpperCase()}`);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <header style={{ textAlign: 'center', margin: '4rem 0' }}>
        <motion.div variants={itemVariants} style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ 
            width: '80px', height: '80px', 
            background: 'linear-gradient(135deg, var(--primary), #d946ef)', 
            borderRadius: '24px', margin: '0 auto 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)'
          }}>
            <Wallet size={36} color="white" />
          </div>
          <div style={{ position: 'absolute', top: -10, right: -10 }}>
            <Sparkles size={24} color="var(--warning)" />
          </div>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-gradient" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
          Splitify
        </motion.h1>
        <motion.p variants={itemVariants} style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '1rem' }}>
          Finance shared with elegance.
        </motion.p>
      </header>

      <motion.div variants={itemVariants} className="luxury-card">
        <div style={{ 
          display: 'flex', background: 'var(--bg-deep)', 
          padding: '6px', borderRadius: '18px', marginBottom: '2.5rem' 
        }}>
          <button 
            className="btn"
            onClick={() => setIsJoining(false)}
            style={{ 
              flex: 1, 
              background: !isJoining ? 'var(--bg-card)' : 'transparent',
              color: !isJoining ? 'white' : 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}
          >
            Create Group
          </button>
          <button 
            className="btn"
            onClick={() => setIsJoining(true)}
            style={{ 
              flex: 1, 
              background: isJoining ? 'var(--bg-card)' : 'transparent',
              color: isJoining ? 'white' : 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}
          >
            Join Existing
          </button>
        </div>

        {!isJoining ? (
          <form onSubmit={handleCreateGroup}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>GROUP NAME</label>
              <div className="modern-input-wrapper">
                <input 
                  type="text" 
                  placeholder="The Weekend Trip" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>YOUR NAME</label>
              <div className="modern-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Marcos" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
              Initialize Experience <ArrowRight size={20} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinGroup}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>ACCESS CODE</label>
              <div className="modern-input-wrapper">
                <input 
                  type="text" 
                  placeholder="X7Y2Z9" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  style={{ letterSpacing: '4px', fontWeight: 800, textAlign: 'center' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>YOUR NAME</label>
              <div className="modern-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Luis" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
              Access Group <ArrowRight size={20} />
            </button>
          </form>
        )}
      </motion.div>

      <motion.footer 
        variants={itemVariants}
        style={{ marginTop: 'auto', padding: '3rem 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}
      >
        <p>ENCRYPTED END-TO-END • ZERO REGISTRATION • SPLITIFY OS v4.0</p>
      </motion.footer>
    </motion.div>
  );
};

export default Home;
