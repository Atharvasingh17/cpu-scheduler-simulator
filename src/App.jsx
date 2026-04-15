import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import InputSection from './components/InputSection';
import GanttChart from './components/GanttChart';
import ResultsTable from './components/ResultsTable';
import AnalyticsPanel from './components/AnalyticsPanel';
import AlgorithmComparison from './components/AlgorithmComparison';
import { runAlgorithm, compareAll } from './engine/schedulingAlgorithms';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [processes, setProcesses] = useState([]);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [view, setView] = useState('single'); // 'single' or 'compare'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleRun = () => {
    if (processes.length === 0) return;
    const res = runAlgorithm(algorithm, processes, timeQuantum);
    setResult(res);
    setComparison(null);
    setView('single');
  };

  const handleCompare = () => {
    if (processes.length === 0) return;
    const comp = compareAll(processes, timeQuantum);
    setComparison(comp);
    setResult(null);
    setView('compare');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
        <InputSection
          processes={processes}
          setProcesses={setProcesses}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          timeQuantum={timeQuantum}
          setTimeQuantum={setTimeQuantum}
          onRun={handleRun}
          onCompare={handleCompare}
        />

        <AnimatePresence mode="wait">
          {view === 'single' && result && (
            <div key="single">
              <GanttChart result={result} processes={processes} />
              <ResultsTable result={result} processes={processes} />
              <AnalyticsPanel result={result} processes={processes} />
            </div>
          )}

          {view === 'compare' && comparison && (
            <div key="compare">
              <AlgorithmComparison comparison={comparison} />
              {comparison.results.map((r) => (
                <div key={r.name} style={{ marginBottom: '8px' }}>
                  <GanttChart result={r} processes={processes} />
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--border)',
        marginTop: '40px',
      }}>
        <p>CPU Scheduler Simulator &mdash; CSE316 Project</p>
      </footer>
    </div>
  );
}
// Added main layout wrapper
