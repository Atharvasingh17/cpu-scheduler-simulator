import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { getProcessColor } from '../engine/schedulingAlgorithms';

export default function ResultsTable({ result, processes }) {
  if (!result || !result.processes) return null;

  const processIds = [...new Set(processes.map(p => p.id))];

  const downloadCSV = () => {
    const headers = ['Process ID', 'Arrival Time', 'Burst Time', 'Priority', 'Completion Time', 'Turnaround Time', 'Waiting Time'];
    const rows = result.processes.map(p => [
      p.id,
      p.arrivalTime,
      p.burstTime,
      p.priority,
      p.completionTime,
      p.turnaroundTime,
      p.waitingTime
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${result.name}_results.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card animate-fade-in"
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
          Process Results - {result.fullName}
        </h2>
        <button 
          onClick={downloadCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-500)';
            e.currentTarget.style.color = 'var(--brand-500)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={thStyle}>Process</th>
              <th style={thStyle}>Arrival</th>
              <th style={thStyle}>Burst</th>
              <th style={thStyle}>Priority</th>
              <th style={thStyle}>Completion</th>
              <th style={thStyle}>Turnaround</th>
              <th style={thStyle}>Waiting</th>
            </tr>
          </thead>
          <tbody>
            {result.processes.map((p, i) => {
              const origIdx = processIds.indexOf(p.id);
              const color = getProcessColor(origIdx >= 0 ? origIdx : i);
              return (
                <motion.tr
                  key={p.id + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>{p.id}</span>
                    </div>
                  </td>
                  <td style={tdMono}>{p.arrivalTime}</td>
                  <td style={tdMono}>{p.burstTime}</td>
                  <td style={tdMono}>{p.priority}</td>
                  <td style={tdMono}>{p.completionTime}</td>
                  <td style={{ ...tdMono, color: 'var(--info)' }}>{p.turnaroundTime}</td>
                  <td style={{ ...tdMono, color: p.waitingTime === 0 ? 'var(--success)' : 'var(--warning)' }}>{p.waitingTime}</td>
                </motion.tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'var(--bg-tertiary)', fontWeight: 700 }}>
              <td colSpan={5} style={{ ...tdStyle, textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Averages</td>
              <td style={{ ...tdMono, color: 'var(--info)', fontWeight: 800 }}>{result.metrics.avgTurnaroundTime}</td>
              <td style={{ ...tdMono, color: 'var(--warning)', fontWeight: 800 }}>{result.metrics.avgWaitingTime}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '20px' }}>
        <MetricCard label="Avg Waiting Time" value={result.metrics.avgWaitingTime} unit="units" color="var(--warning)" />
        <MetricCard label="Avg Turnaround Time" value={result.metrics.avgTurnaroundTime} unit="units" color="var(--info)" />
        <MetricCard label="CPU Utilization" value={result.metrics.cpuUtilization} unit="%" color="var(--success)" />
        <MetricCard label="Throughput" value={result.metrics.throughput} unit="proc/unit" color="var(--brand-500)" />
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, unit, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      style={{
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px',
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{unit}</div>
    </motion.div>
  );
}

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: '12px 16px',
};

const tdMono = {
  ...tdStyle,
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  fontSize: '0.92rem',
};
