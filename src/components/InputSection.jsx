import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Sparkles, RotateCcw, Play, ChevronDown } from 'lucide-react';
import { generateSampleProcesses } from '../engine/schedulingAlgorithms';

const ALGORITHMS = [
  { value: 'FCFS', label: 'First Come First Serve (FCFS)' },
  { value: 'SJF', label: 'Shortest Job First (Non-Preemptive)' },
  { value: 'SRTF', label: 'Shortest Remaining Time First (Preemptive SJF)' },
  { value: 'Priority', label: 'Priority Scheduling (Non-Preemptive)' },
  { value: 'Priority-P', label: 'Priority Scheduling (Preemptive)' },
  { value: 'RR', label: 'Round Robin' },
  { value: 'HRRN', label: 'Highest Response Ratio Next' },
];

export default function InputSection({ processes, setProcesses, algorithm, setAlgorithm, timeQuantum, setTimeQuantum, onRun, onCompare }) {
  const [newProcess, setNewProcess] = useState({ id: '', arrivalTime: '', burstTime: '', priority: '' });

  const addProcess = () => {
    const id = newProcess.id || `P${processes.length + 1}`;
    const at = parseInt(newProcess.arrivalTime) || 0;
    const bt = parseInt(newProcess.burstTime);
    const pr = parseInt(newProcess.priority) || 1;
    if (!bt || bt <= 0) return;
    setProcesses([...processes, { id, arrivalTime: at, burstTime: bt, priority: pr }]);
    setNewProcess({ id: `P${processes.length + 2}`, arrivalTime: '', burstTime: '', priority: '' });
  };

  const removeProcess = (index) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const loadSample = () => {
    setProcesses(generateSampleProcesses(5));
  };

  const clearAll = () => {
    setProcesses([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addProcess();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '28px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Process Configuration</span>
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={loadSample} style={btnSecondary}>
            <Sparkles size={15} /> Sample Data
          </button>
          <button onClick={clearAll} style={btnDanger}>
            <RotateCcw size={15} /> Clear
          </button>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: algorithm === 'RR' ? '1fr 200px' : '1fr', gap: '14px', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <label style={labelStyle}>Scheduling Algorithm</label>
          <div style={{ position: 'relative' }}>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              style={selectStyle}
            >
              {ALGORITHMS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
        </div>
        {algorithm === 'RR' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <label style={labelStyle}>Time Quantum</label>
            <input
              type="number"
              value={timeQuantum}
              onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              style={inputStyle}
              placeholder="2"
            />
          </motion.div>
        )}
      </div>

      {/* Add Process Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', marginBottom: '16px', alignItems: 'end' }}>
        <div>
          <label style={labelStyle}>Process ID</label>
          <input
            type="text"
            value={newProcess.id}
            onChange={(e) => setNewProcess({ ...newProcess, id: e.target.value })}
            placeholder={`P${processes.length + 1}`}
            style={inputStyle}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div>
          <label style={labelStyle}>Arrival Time</label>
          <input
            type="number"
            value={newProcess.arrivalTime}
            onChange={(e) => setNewProcess({ ...newProcess, arrivalTime: e.target.value })}
            placeholder="0"
            min="0"
            style={inputStyle}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div>
          <label style={labelStyle}>Burst Time</label>
          <input
            type="number"
            value={newProcess.burstTime}
            onChange={(e) => setNewProcess({ ...newProcess, burstTime: e.target.value })}
            placeholder="1"
            min="1"
            style={inputStyle}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <input
            type="number"
            value={newProcess.priority}
            onChange={(e) => setNewProcess({ ...newProcess, priority: e.target.value })}
            placeholder="1"
            min="1"
            style={inputStyle}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button onClick={addProcess} style={btnPrimary} title="Add Process">
          <Plus size={18} />
        </button>
      </div>

      {/* Process List */}
      <AnimatePresence>
        {processes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: '20px' }}
          >
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)' }}>
                    <th style={thStyle}>Process ID</th>
                    <th style={thStyle}>Arrival Time</th>
                    <th style={thStyle}>Burst Time</th>
                    <th style={thStyle}>Priority</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.map((p, i) => (
                    <motion.tr
                      key={p.id + i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td style={tdStyle}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--brand-500)' }}>{p.id}</span>
                      </td>
                      <td style={tdStyle}>{p.arrivalTime}</td>
                      <td style={tdStyle}>{p.burstTime}</td>
                      <td style={tdStyle}>{p.priority}</td>
                      <td style={tdStyle}>
                        <button onClick={() => removeProcess(i)} style={{ ...btnIcon, color: 'var(--danger)' }}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Run Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={onRun}
          disabled={processes.length === 0}
          style={processes.length === 0 ? { ...btnRunPrimary, opacity: 0.5, cursor: 'not-allowed' } : btnRunPrimary}
        >
          <Play size={16} /> Run Simulation
        </button>
        <button
          onClick={onCompare}
          disabled={processes.length === 0}
          style={processes.length === 0 ? { ...btnRunSecondary, opacity: 0.5, cursor: 'not-allowed' } : btnRunSecondary}
        >
          <Sparkles size={16} /> Compare All Algorithms
        </button>
      </div>
    </motion.div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--border)',
  background: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  fontSize: '0.92rem',
  fontFamily: 'var(--font-mono)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  paddingRight: '36px',
  cursor: 'pointer',
};

const thStyle = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: '10px 16px',
  color: 'var(--text-primary)',
};

const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 16px',
  borderRadius: 'var(--radius-md)',
  border: 'none',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: 'var(--font-sans)',
};

const btnPrimary = {
  ...btnBase,
  background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
  color: 'white',
  padding: '10px 14px',
  boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
};

const btnSecondary = {
  ...btnBase,
  background: 'var(--bg-tertiary)',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border)',
};

const btnDanger = {
  ...btnBase,
  background: 'rgba(239,68,68,0.1)',
  color: 'var(--danger)',
  border: '1px solid rgba(239,68,68,0.2)',
};

const btnIcon = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '6px',
  display: 'inline-flex',
  transition: 'background 0.2s',
};

const btnRunPrimary = {
  ...btnBase,
  background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
  color: 'white',
  padding: '12px 28px',
  fontSize: '0.95rem',
  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
};

const btnRunSecondary = {
  ...btnBase,
  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
  color: 'white',
  padding: '12px 28px',
  fontSize: '0.95rem',
  boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
};
