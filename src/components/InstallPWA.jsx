import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';

const InstallPWA = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Detectar si ya está instalada (en modo standalone)
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
      const hasDismissed = localStorage.getItem('pwa_dismissed');
      if (!hasDismissed) {
        setShow(true);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem',
          zIndex: 9999, background: 'var(--bg-card)', padding: '1.5rem',
          borderRadius: '24px', border: '1px solid var(--border-bright)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
        }}
      >
        <button 
          onClick={() => {
            setShow(false);
            localStorage.setItem('pwa_dismissed', 'true');
          }}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-tertiary)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '16px' }}>
            <Smartphone size={24} color="white" />
          </div>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Instalar Splitify</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Añádela a tu pantalla de inicio para una experiencia nativa.</p>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            1. Pulsa el botón <strong>Compartir</strong> <Share size={16} color="#007AFF" /> en Safari.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            2. Selecciona <strong>Añadir a pantalla de inicio</strong> <PlusSquare size={16} />.
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPWA;
