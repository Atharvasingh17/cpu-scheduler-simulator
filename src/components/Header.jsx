import { motion } from 'framer-motion';
import { Cpu, Moon, Sun, Github } from 'lucide-react';

export default function Header({ darkMode, toggleDarkMode }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            <Cpu size={22} style={{ color: 'white' }} />
          </motion.div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2 }}>
              <span style={{ background: 'linear-gradient(135deg, var(--brand-400), var(--brand-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CPU Scheduler</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>Intelligent Scheduling Simulator</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
