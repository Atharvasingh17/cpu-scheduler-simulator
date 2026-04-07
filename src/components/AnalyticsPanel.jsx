import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getProcessColor } from '../engine/schedulingAlgorithms';

export default function AnalyticsPanel({ result, processes }) {
  if (!result || !result.processes) return null;

  const processIds = [...new Set(processes.map(p => p.id))];

  const wtData = result.processes.map((p, i) => ({
    name: p.id,
    value: p.waitingTime,
    color: getProcessColor(processIds.indexOf(p.id) >= 0 ? processIds.indexOf(p.id) : i),
  }));

  const tatData = result.processes.map((p, i) => ({
    name: p.id,
    value: p.turnaroundTime,
    color: getProcessColor(processIds.indexOf(p.id) >= 0 ? processIds.indexOf(p.id) : i),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '4px', color: 'var(--text-primary)' }}>{label}</p>
          <p style={{ fontFamily: 'var(--font-mono)', color: payload[0].color, fontSize: '0.9rem' }}>
            {payload[0].value} units
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '28px',
        marginBottom: '24px',
      }}
    >
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} />
        Analytics
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* Waiting Time Chart */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px', textAlign: 'center' }}>
            Waiting Time by Process
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wtData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Waiting Time" radius={[6, 6, 0, 0]} animationDuration={800}>
                {wtData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Turnaround Time Chart */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px', textAlign: 'center' }}>
            Turnaround Time by Process
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tatData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Turnaround Time" radius={[6, 6, 0, 0]} animationDuration={800}>
                {tatData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
