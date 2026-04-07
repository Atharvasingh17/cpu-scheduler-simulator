import { motion } from 'framer-motion';
import { getProcessColor } from '../engine/schedulingAlgorithms';

export default function GanttChart({ result, processes }) {
  if (!result || !result.timeline || result.timeline.length === 0) return null;

  const timeline = result.timeline;
  const maxTime = Math.max(...timeline.map(t => t.end));
  const processIds = [...new Set(processes.map(p => p.id))];

  const getColor = (pid) => {
    if (pid === 'Idle') return '#475569';
    const idx = processIds.indexOf(pid);
    return getProcessColor(idx >= 0 ? idx : 0);
  };

  const totalWidth = Math.max(maxTime * 60, 500);

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
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-500)', display: 'inline-block' }} />
        Gantt Chart
        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 'auto' }}>{result.fullName}</span>
      </h2>

      <div style={{ overflowX: 'auto', paddingBottom: '12px' }}>
        <div style={{ minWidth: `${totalWidth}px`, position: 'relative' }}>
          {/* Bars */}
          <div style={{ display: 'flex', height: '56px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            {timeline.map((block, i) => {
              const widthPercent = ((block.end - block.start) / maxTime) * 100;
              const color = getColor(block.processId);
              const isIdle = block.processId === 'Idle';

              return (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  style={{
                    width: `${widthPercent}%`,
                    height: '100%',
                    background: isIdle
                      ? 'repeating-linear-gradient(45deg, var(--bg-tertiary), var(--bg-tertiary) 4px, var(--bg-accent) 4px, var(--bg-accent) 8px)'
                      : `linear-gradient(135deg, ${color}, ${color}cc)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: widthPercent < 5 ? '0.65rem' : '0.85rem',
                    color: isIdle ? 'var(--text-muted)' : 'white',
                    fontFamily: 'var(--font-mono)',
                    borderRight: '1px solid rgba(255,255,255,0.15)',
                    position: 'relative',
                    transformOrigin: 'left',
                    textShadow: isIdle ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                    cursor: 'default',
                    minWidth: '20px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  title={`${block.processId}: ${block.start} - ${block.end}`}
                >
                  {block.processId}
                </motion.div>
              );
            })}
          </div>

          {/* Time Labels */}
          <div style={{ display: 'flex', position: 'relative', marginTop: '4px' }}>
            {timeline.map((block, i) => {
              const leftPercent = (block.start / maxTime) * 100;
              const widthPercent = ((block.end - block.start) / maxTime) * 100;

              return (
                <div key={i} style={{ width: `${widthPercent}%`, position: 'relative', height: '24px' }}>
                  <span style={{
                    position: 'absolute', left: '-1px', top: '2px',
                    fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)', fontWeight: 500,
                  }}>{block.start}</span>
                  {i === timeline.length - 1 && (
                    <span style={{
                      position: 'absolute', right: '-1px', top: '2px',
                      fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)', fontWeight: 500,
                    }}>{block.end}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
        {processIds.map((pid, i) => (
          <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: getProcessColor(i) }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{pid}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: 'repeating-linear-gradient(45deg, #94a3b8, #94a3b8 2px, #64748b 2px, #64748b 4px)' }} />
          <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Idle</span>
        </div>
      </div>
    </motion.div>
  );
}
