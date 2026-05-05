import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const QRDisplay = ({ code, groupName, onClose }) => {
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}/group/${code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    toast.success('Access link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(5, 6, 8, 0.9)', 
      backdropFilter: 'blur(25px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 1000 
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="luxury-card"
        style={{ width: '100%', maxWidth: '380px', textAlign: 'center', background: 'var(--bg-card)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem', borderRadius: '12px' }}><X size={24} /></button>
        </div>

        <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
          <ShieldCheck size={48} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Group Access Protocol</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>
          Scan the encrypted key or share the unique access link to join <strong>{groupName}</strong>.
        </p>

        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '24px', 
          display: 'inline-block', 
          marginBottom: '2.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          border: '8px solid var(--bg-elevated)'
        }}>
          <QRCodeSVG value={joinUrl} size={180} />
        </div>

        <div style={{ 
          background: 'var(--bg-deep)', 
          padding: '1.25rem', 
          borderRadius: '20px', 
          marginBottom: '2.5rem',
          border: '1px solid var(--border-bright)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>CRYPTO ACCESS KEY</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '6px', color: 'var(--primary)' }}>{code}</div>
        </div>

        <button className="btn btn-primary" onClick={copyToClipboard} style={{ width: '100%', padding: '1.1rem', borderRadius: '18px' }}>
          {copied ? <Check size={20} /> : <Copy size={20} />}
          {copied ? 'LINK COPIED' : 'COPY ACCESS LINK'}
        </button>
      </motion.div>
    </div>
  );
};

export default QRDisplay;
