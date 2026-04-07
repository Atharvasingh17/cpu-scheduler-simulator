import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Zap, Clock, Award } from 'lucide-react';

const ALGO_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'];

export default function AlgorithmComparison({ comparison }) {
  if (!comparison) return null;

  const { results, recommendation } = comparison;

  const wtCompare = results.map((r, i) => ({
    name: r.name,
    value: r.metrics.avgWaitingTime,
    color: ALGO_COLORS[i],
    fullName: r.fullName,
  }));

  const tatCompare = results.map((r, i) => ({
    name: r.name,
    value: r.metrics.avgTurnaroundTime,
    color: ALGO_COLORS[i],
    fullName: r.fullName,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{data.fullName}</p>
          <p style={{ fontFamily: 'var(--font-mono)', color: data.color, fontSize: '0.9rem' }}>
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
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '28px',
        marginBottom: '24px',
      }}
    >
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Trophy size={22} style={{ color: 'var(--warning)' }} />
        <span style={{ background: 'linear-gradient(135deg, var(--warning), #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Algorithm Comparison
        </span>
      </h2>

      {/* Recommendation Card */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
          borderRadius: 'var(--radius-lg)',
          padding: '22px',
          border: '1px solid rgba(99,102,241,0.2)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Award size={18} style={{ color: 'var(--brand-400)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-400)' }}>AI Recommendation</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <div style={recCard}>
            <Clock size={16} style={{ color: 'var(--warning)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Best Waiting Time</div>
              <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '1rem' }}>{recommendation.byWaitingTime.fullName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>Avg WT: {recommendation.byWaitingTime.metrics.avgWaitingTime}</div>
            </div>
          </div>
          <div style={recCard}>
            <Zap size={16} style={{ color: 'var(--info)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Best Turnaround Time</div>
              <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '1rem' }}>{recommendation.byTurnaroundTime.fullName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--info)', fontFamily: 'var(--font-mono)' }}>Avg TAT: {recommendation.byTurnaroundTime.metrics.avgTurnaroundTime}</div>
            </div>
          </div>
          <div style={{ ...recCard, background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Trophy size={16} style={{ color: 'var(--success)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Overall Best</div>
              <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--success)', fontSize: '1rem' }}>{recommendation.overall.fullName}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Comparison Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px', textAlign: 'center' }}>
            Avg Waiting Time Comparison
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wtCompare} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Avg WT" radius={[6, 6, 0, 0]} animationDuration={800}>
                {wtCompare.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px', textAlign: 'center' }}>
            Avg Turnaround Time Comparison
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tatCompare} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Avg TAT" radius={[6, 6, 0, 0]} animationDuration={800}>
                {tatCompare.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Table */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={thStyle}>Algorithm</th>
              <th style={thStyle}>Avg WT</th>
              <th style={thStyle}>Avg TAT</th>
              <th style={thStyle}>CPU Util %</th>
              <th style={thStyle}>Throughput</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const isBest = r.name === recommendation.overall.name;
              return (
                <tr key={r.name} style={{
                  borderBottom: '1px solid var(--border)',
                  background: isBest ? 'rgba(34,197,94,0.06)' : 'transparent',
                }}>
                  <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: ALGO_COLORS[i] }} />
                    <span style={{ fontWeight: 700 }}>{r.fullName}</span>
                    {isBest && <Trophy size={14} style={{ color: 'var(--success)' }} />}
                  </td>
                  <td style={tdMono}>{r.metrics.avgWaitingTime}</td>
                  <td style={tdMono}>{r.metrics.avgTurnaroundTime}</td>
                  <td style={tdMono}>{r.metrics.cpuUtilization}%</td>
                  <td style={tdMono}>{r.metrics.throughput}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

const recCard = {
  display: 'flex', alignItems: 'flex-start', gap: '10px',
  padding: '14px', borderRadius: 'var(--radius-md)',
  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
};

const thStyle = {
  padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem',
  fontWeight: 700, color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
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
