/**
 * CPU Scheduling Algorithms Engine
 * Implements FCFS, SJF (Non-preemptive & Preemptive), Priority, and Round Robin
 */

const PROCESS_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#a855f7', '#d946ef', '#f472b6', '#fb923c', '#a3e635',
];

export function getProcessColor(index) {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}

function calculateMetrics(processes, timeline) {
  const n = processes.length;
  const totalBurst = processes.reduce((sum, p) => sum + p.burstTime, 0);
  const maxCompletion = Math.max(...processes.map(p => p.completionTime));
  const minArrival = Math.min(...processes.map(p => p.arrivalTime));
  const totalTime = maxCompletion - minArrival;

  const avgWaitingTime = processes.reduce((sum, p) => sum + p.waitingTime, 0) / n;
  const avgTurnaroundTime = processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / n;
  const cpuUtilization = totalTime > 0 ? (totalBurst / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? n / totalTime : 0;

  return {
    avgWaitingTime: Math.round(avgWaitingTime * 100) / 100,
    avgTurnaroundTime: Math.round(avgTurnaroundTime * 100) / 100,
    cpuUtilization: Math.round(cpuUtilization * 100) / 100,
    throughput: Math.round(throughput * 1000) / 1000,
  };
}

/**
 * First Come First Serve (FCFS)
 */
export function fcfs(inputProcesses) {
  const processes = inputProcesses.map(p => ({ ...p }));
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id);

  const timeline = [];
  let currentTime = 0;

  for (const proc of processes) {
    if (currentTime < proc.arrivalTime) {
      timeline.push({ processId: 'Idle', start: currentTime, end: proc.arrivalTime });
      currentTime = proc.arrivalTime;
    }
    const start = currentTime;
    const end = currentTime + proc.burstTime;
    timeline.push({ processId: proc.id, start, end });
    proc.completionTime = end;
    proc.turnaroundTime = proc.completionTime - proc.arrivalTime;
    proc.waitingTime = proc.turnaroundTime - proc.burstTime;
    currentTime = end;
  }

  return {
    name: 'FCFS',
    fullName: 'First Come First Serve',
    processes,
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Shortest Job First (Non-Preemptive)
 */
export function sjfNonPreemptive(inputProcesses) {
  const processes = inputProcesses.map(p => ({ ...p }));
  const n = processes.length;
  const completed = new Array(n).fill(false);
  const timeline = [];
  let currentTime = 0;
  let done = 0;

  while (done < n) {
    const available = processes
      .map((p, i) => ({ ...p, idx: i }))
      .filter((p, i) => !completed[p.idx] && p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrival = Math.min(
        ...processes.filter((_, i) => !completed[i]).map(p => p.arrivalTime)
      );
      timeline.push({ processId: 'Idle', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const chosen = available[0];
    const start = currentTime;
    const end = currentTime + chosen.burstTime;

    timeline.push({ processId: chosen.id, start, end });
    processes[chosen.idx].completionTime = end;
    processes[chosen.idx].turnaroundTime = end - chosen.arrivalTime;
    processes[chosen.idx].waitingTime = processes[chosen.idx].turnaroundTime - chosen.burstTime;
    completed[chosen.idx] = true;
    currentTime = end;
    done++;
  }

  return {
    name: 'SJF',
    fullName: 'Shortest Job First (Non-Preemptive)',
    processes,
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Shortest Job First (Preemptive / SRTF)
 */
export function sjfPreemptive(inputProcesses) {
  const processes = inputProcesses.map(p => ({ ...p, remaining: p.burstTime }));
  const n = processes.length;
  const timeline = [];
  let currentTime = 0;
  let done = 0;
  let prev = -1;
  const maxTime = Math.max(...processes.map(p => p.arrivalTime)) + processes.reduce((s, p) => s + p.burstTime, 0) + 1;

  while (done < n && currentTime < maxTime) {
    const available = processes
      .map((p, i) => ({ ...p, idx: i }))
      .filter(p => p.arrivalTime <= currentTime && p.remaining > 0);

    if (available.length === 0) {
      const nextArrival = Math.min(
        ...processes.filter(p => p.remaining > 0).map(p => p.arrivalTime)
      );
      if (timeline.length > 0 && timeline[timeline.length - 1].processId === 'Idle') {
        timeline[timeline.length - 1].end = nextArrival;
      } else {
        timeline.push({ processId: 'Idle', start: currentTime, end: nextArrival });
      }
      currentTime = nextArrival;
      prev = -1;
      continue;
    }

    available.sort((a, b) => a.remaining - b.remaining || a.arrivalTime - b.arrivalTime);
    const chosen = available[0];

    if (prev !== chosen.idx) {
      timeline.push({ processId: chosen.id, start: currentTime, end: currentTime + 1 });
    } else {
      timeline[timeline.length - 1].end = currentTime + 1;
    }

    processes[chosen.idx].remaining--;
    if (processes[chosen.idx].remaining === 0) {
      processes[chosen.idx].completionTime = currentTime + 1;
      processes[chosen.idx].turnaroundTime = processes[chosen.idx].completionTime - chosen.arrivalTime;
      processes[chosen.idx].waitingTime = processes[chosen.idx].turnaroundTime - chosen.burstTime;
      done++;
    }

    prev = chosen.idx;
    currentTime++;
  }

  return {
    name: 'SRTF',
    fullName: 'Shortest Remaining Time First (Preemptive SJF)',
    processes: processes.map(({ remaining, ...rest }) => rest),
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Priority Scheduling (Non-Preemptive) - lower number = higher priority
 */
export function priorityScheduling(inputProcesses) {
  const processes = inputProcesses.map(p => ({ ...p }));
  const n = processes.length;
  const completed = new Array(n).fill(false);
  const timeline = [];
  let currentTime = 0;
  let done = 0;

  while (done < n) {
    const available = processes
      .map((p, i) => ({ ...p, idx: i }))
      .filter((p, i) => !completed[p.idx] && p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrival = Math.min(
        ...processes.filter((_, i) => !completed[i]).map(p => p.arrivalTime)
      );
      timeline.push({ processId: 'Idle', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
    const chosen = available[0];
    const start = currentTime;
    const end = currentTime + chosen.burstTime;

    timeline.push({ processId: chosen.id, start, end });
    processes[chosen.idx].completionTime = end;
    processes[chosen.idx].turnaroundTime = end - chosen.arrivalTime;
    processes[chosen.idx].waitingTime = processes[chosen.idx].turnaroundTime - chosen.burstTime;
    completed[chosen.idx] = true;
    currentTime = end;
    done++;
  }

  return {
    name: 'Priority',
    fullName: 'Priority Scheduling (Non-Preemptive)',
    processes,
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Round Robin
 */
export function roundRobin(inputProcesses, timeQuantum = 2) {
  const processes = inputProcesses.map(p => ({ ...p, remaining: p.burstTime }));
  const n = processes.length;
  const timeline = [];
  let currentTime = 0;
  let done = 0;

  const queue = [];
  const inQueue = new Array(n).fill(false);
  const sorted = processes.map((p, i) => i).sort((a, b) => processes[a].arrivalTime - processes[b].arrivalTime || a - b);

  // Add initial processes
  for (const i of sorted) {
    if (processes[i].arrivalTime <= currentTime) {
      queue.push(i);
      inQueue[i] = true;
    }
  }

  while (done < n) {
    if (queue.length === 0) {
      const nextArrival = Math.min(
        ...processes.filter(p => p.remaining > 0).map(p => p.arrivalTime)
      );
      timeline.push({ processId: 'Idle', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      for (const i of sorted) {
        if (!inQueue[i] && processes[i].remaining > 0 && processes[i].arrivalTime <= currentTime) {
          queue.push(i);
          inQueue[i] = true;
        }
      }
      continue;
    }

    const idx = queue.shift();
    const execTime = Math.min(timeQuantum, processes[idx].remaining);
    const start = currentTime;
    const end = currentTime + execTime;

    timeline.push({ processId: processes[idx].id, start, end });
    processes[idx].remaining -= execTime;
    currentTime = end;

    // Add newly arrived processes to queue before re-adding current
    for (const i of sorted) {
      if (!inQueue[i] && processes[i].remaining > 0 && processes[i].arrivalTime <= currentTime) {
        queue.push(i);
        inQueue[i] = true;
      }
    }

    if (processes[idx].remaining > 0) {
      queue.push(idx);
    } else {
      processes[idx].completionTime = end;
      processes[idx].turnaroundTime = end - processes[idx].arrivalTime;
      processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
      done++;
    }
  }

  return {
    name: 'RR',
    fullName: `Round Robin (Q=${timeQuantum})`,
    processes: processes.map(({ remaining, ...rest }) => rest),
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Highest Response Ratio Next (HRRN) - Non-Preemptive
 */
export function hrrn(inputProcesses) {
  const processes = inputProcesses.map(p => ({ ...p }));
  const n = processes.length;
  const completed = new Array(n).fill(false);
  const timeline = [];
  let currentTime = 0;
  let done = 0;

  while (done < n) {
    const available = processes
      .map((p, i) => ({ ...p, idx: i }))
      .filter((p) => !completed[p.idx] && p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrivalTimes = processes.filter((_, i) => !completed[i]).map(p => p.arrivalTime);
      const nextArrival = Math.min(...nextArrivalTimes);
      
      timeline.push({ processId: 'Idle', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    // Calculate Response Ratio for all available
    // Response Ratio = (Waiting Time + Burst Time) / Burst Time
    const availableWithRR = available.map(p => {
      const waitingTime = currentTime - p.arrivalTime;
      const responseRatio = (waitingTime + p.burstTime) / p.burstTime;
      return { ...p, responseRatio };
    });

    availableWithRR.sort((a, b) => b.responseRatio - a.responseRatio || a.arrivalTime - b.arrivalTime);
    const chosen = availableWithRR[0];
    const start = currentTime;
    const end = currentTime + chosen.burstTime;

    timeline.push({ processId: chosen.id, start, end });
    processes[chosen.idx].completionTime = end;
    processes[chosen.idx].turnaroundTime = end - chosen.arrivalTime;
    processes[chosen.idx].waitingTime = processes[chosen.idx].turnaroundTime - chosen.burstTime;
    completed[chosen.idx] = true;
    currentTime = end;
    done++;
  }

  return {
    name: 'HRRN',
    fullName: 'Highest Response Ratio Next (Non-Preemptive)',
    processes,
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Run all algorithms and pick the best
 */
export function compareAll(inputProcesses, timeQuantum = 2) {
  const results = [
    sjfPreemptive(inputProcesses),
    priorityScheduling(inputProcesses),
    roundRobin(inputProcesses, timeQuantum),
    hrrn(inputProcesses),
  ];

  let bestWT = results[0];
  let bestTAT = results[0];
  for (const r of results) {
    if (r.metrics.avgWaitingTime < bestWT.metrics.avgWaitingTime) bestWT = r;
    if (r.metrics.avgTurnaroundTime < bestTAT.metrics.avgTurnaroundTime) bestTAT = r;
  }

  return {
    results,
    recommendation: {
      byWaitingTime: bestWT,
      byTurnaroundTime: bestTAT,
      overall: bestWT.metrics.avgWaitingTime + bestWT.metrics.avgTurnaroundTime <=
               bestTAT.metrics.avgWaitingTime + bestTAT.metrics.avgTurnaroundTime ? bestWT : bestTAT,
    },
  };
}

/**
 * Generate sample processes
 */
export function generateSampleProcesses(count = 5) {
  const processes = [];
  for (let i = 0; i < count; i++) {
    processes.push({
      id: `P${i + 1}`,
      arrivalTime: Math.floor(Math.random() * (count * 2)),
      burstTime: Math.floor(Math.random() * 10) + 1,
      priority: Math.floor(Math.random() * 5) + 1,
    });
  }
  return processes;
}

export function runAlgorithm(name, processes, timeQuantum) {
  switch (name) {
    case 'FCFS': return fcfs(processes);
    case 'SJF': return sjfNonPreemptive(processes);
    case 'SRTF': return sjfPreemptive(processes);
    case 'Priority': return priorityScheduling(processes);
    case 'RR': return roundRobin(processes, timeQuantum);
    case 'HRRN': return hrrn(processes);
    default: return fcfs(processes);
  }
}
