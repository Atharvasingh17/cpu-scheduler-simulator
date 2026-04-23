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

export function populateResponseTime(processes, timeline) {
  const firstAppearances = {};
  for (const entry of timeline) {
    if (entry.processId !== 'Idle' && !firstAppearances.hasOwnProperty(entry.processId)) {
      firstAppearances[entry.processId] = entry.start;
    }
  }

  for (const proc of processes) {
    proc.responseTime = (firstAppearances[proc.id] ?? 0) - proc.arrivalTime;
  }
}

function calculateFairnessIndex(waitingTimes) {
  const n = waitingTimes.length;
  if (n === 0) return 100;
  
  // If all waiting times are 0, it's perfectly fair
  if (waitingTimes.every(w => w === 0)) return 100;

  const sum = waitingTimes.reduce((a, b) => a + b, 0);
  const sumSq = waitingTimes.reduce((a, b) => a + b * b, 0);
  
  // Jain's Fairness Index: (Σx)² / (n * Σx²)
  const index = (sum * sum) / (n * sumSq);
  return Math.round(index * 10000) / 100; // Return as percentage
}

function calculateMetrics(processes, timeline) {
  const n = processes.length;
  
  // Ensure response times are populated if they haven't been already
  if (processes.length > 0 && processes[0].responseTime === undefined) {
    populateResponseTime(processes, timeline);
  }

  const totalBurst = processes.reduce((sum, p) => sum + p.burstTime, 0);
  const maxCompletion = Math.max(...processes.map(p => p.completionTime));
  const minArrival = Math.min(...processes.map(p => p.arrivalTime));
  const totalTime = maxCompletion - minArrival;

  const waitingTimes = processes.map(p => p.waitingTime);
  const avgWaitingTime = waitingTimes.reduce((sum, w) => sum + w, 0) / n;
  const avgTurnaroundTime = processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / n;
  const avgResponseTime = processes.reduce((sum, p) => sum + p.responseTime, 0) / n;
  const cpuUtilization = totalTime > 0 ? (totalBurst / totalTime) * 100 : 0;
  const throughput = totalTime > 0 ? n / totalTime : 0;
  const fairnessIndex = calculateFairnessIndex(waitingTimes);

  return {
    avgWaitingTime: Math.round(avgWaitingTime * 100) / 100,
    avgTurnaroundTime: Math.round(avgTurnaroundTime * 100) / 100,
    avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    cpuUtilization: Math.round(cpuUtilization * 100) / 100,
    throughput: Math.round(throughput * 1000) / 1000,
    fairnessIndex,
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

  populateResponseTime(processes, timeline);
  return {
    name: 'SRTF',
    fullName: 'Shortest Remaining Time First (Preemptive SJF)',
    processes: processes.map(({ remaining, responseTime, ...rest }) => ({ ...rest, responseTime })),
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

  populateResponseTime(processes, timeline);
  return {
    name: 'RR',
    fullName: `Round Robin (Q=${timeQuantum})`,
    processes: processes.map(({ remaining, responseTime, ...rest }) => ({ ...rest, responseTime })),
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
 * Longest Job First (Non-Preemptive)
 */
export function ljfNonPreemptive(inputProcesses) {
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
      const remainingProcesses = processes.filter((_, i) => !completed[i]);
      if (remainingProcesses.length === 0) break;
      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      
      timeline.push({ processId: 'Idle', start: currentTime, end: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    // Pick the process with the longest burst time
    available.sort((a, b) => b.burstTime - a.burstTime || a.arrivalTime - b.arrivalTime);
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
    name: 'LJF',
    fullName: 'Longest Job First (Non-Preemptive)',
    processes,
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Priority Scheduling (Preemptive)
 */
export function priorityPreemptive(inputProcesses) {
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
      const remainingProcesses = processes.filter(p => p.remaining > 0);
      if (remainingProcesses.length === 0) break;
      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      if (timeline.length > 0 && timeline[timeline.length - 1].processId === 'Idle') {
        timeline[timeline.length - 1].end = nextArrival;
      } else {
        timeline.push({ processId: 'Idle', start: currentTime, end: nextArrival });
      }
      currentTime = nextArrival;
      prev = -1;
      continue;
    }

    available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
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

  populateResponseTime(processes, timeline);
  return {
    name: 'Priority (P)',
    fullName: 'Priority Scheduling (Preemptive)',
    processes: processes.map(({ remaining, responseTime, ...rest }) => ({ ...rest, responseTime })),
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Longest Remaining Time First (Preemptive)
 */
export function lrtfPreemptive(inputProcesses) {
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
      const remainingProcesses = processes.filter(p => p.remaining > 0);
      if (remainingProcesses.length === 0) break;
      const nextArrival = Math.min(...remainingProcesses.map(p => p.arrivalTime));
      if (timeline.length > 0 && timeline[timeline.length - 1].processId === 'Idle') {
        timeline[timeline.length - 1].end = nextArrival;
      } else {
        timeline.push({ processId: 'Idle', start: currentTime, end: nextArrival });
      }
      currentTime = nextArrival;
      prev = -1;
      continue;
    }

    // Pick process with the longest remaining time
    available.sort((a, b) => b.remaining - a.remaining || a.arrivalTime - b.arrivalTime);
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

  populateResponseTime(processes, timeline);
  return {
    name: 'LRTF',
    fullName: 'Longest Remaining Time First (Preemptive LJF)',
    processes: processes.map(({ remaining, responseTime, ...rest }) => ({ ...rest, responseTime })),
    timeline,
    metrics: calculateMetrics(processes, timeline),
  };
}

/**
 * Run all algorithms and pick the best
 */
export function compareAll(inputProcesses, timeQuantum = 2) {
  const results = [
    fcfs(inputProcesses),
    sjfNonPreemptive(inputProcesses),
    sjfPreemptive(inputProcesses),
    priorityScheduling(inputProcesses),
    roundRobin(inputProcesses, timeQuantum),
    hrrn(inputProcesses),
    priorityPreemptive(inputProcesses),
    ljfNonPreemptive(inputProcesses),
    lrtfPreemptive(inputProcesses),
  ];

  let bestWT = results[0];
  let bestTAT = results[0];
  let bestRT = results[0];
  let bestFairness = results[0];

  for (const r of results) {
    if (r.metrics.avgWaitingTime < bestWT.metrics.avgWaitingTime) bestWT = r;
    if (r.metrics.avgTurnaroundTime < bestTAT.metrics.avgTurnaroundTime) bestTAT = r;
    if (r.metrics.avgResponseTime < bestRT.metrics.avgResponseTime) bestRT = r;
    if (r.metrics.fairnessIndex > bestFairness.metrics.fairnessIndex) bestFairness = r;
  }

  // Pick overall best based on a weighted score (lower is better)
  // Weights: WT (0.4), TAT (0.3), RT (0.2), Fairness (0.1 - inverse)
  const calculateScore = (r) => {
    return (r.metrics.avgWaitingTime * 0.4) + 
           (r.metrics.avgTurnaroundTime * 0.3) + 
           (r.metrics.avgResponseTime * 0.2) + 
           ((100 - r.metrics.fairnessIndex) * 0.1);
  };

  let overallBest = results[0];
  let minScore = calculateScore(results[0]);

  for (const r of results) {
    const score = calculateScore(r);
    if (score < minScore) {
      minScore = score;
      overallBest = r;
    }
  }

  return {
    results,
    recommendation: {
      byWaitingTime: bestWT,
      byTurnaroundTime: bestTAT,
      byResponseTime: bestRT,
      byFairness: bestFairness,
      overall: overallBest,
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
    case 'Priority-P': return priorityPreemptive(processes);
    case 'RR': return roundRobin(processes, timeQuantum);
    case 'HRRN': return hrrn(processes);
    case 'LJF': return ljfNonPreemptive(processes);
    case 'LRTF': return lrtfPreemptive(processes);
    default: return fcfs(processes);
  }
}
