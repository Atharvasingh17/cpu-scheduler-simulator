
import { fcfs, sjfPreemptive } from '../src/engine/schedulingAlgorithms.js';

const processes = [
  { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
  { id: 'P2', arrivalTime: 2, burstTime: 3, priority: 2 },
  { id: 'P3', arrivalTime: 4, burstTime: 1, priority: 3 }
];

const resFCFS = fcfs(processes);
console.log('FCFS Fairness Index:', resFCFS.metrics.fairnessIndex);

const resSRTF = sjfPreemptive(processes);
console.log('SRTF Fairness Index:', resSRTF.metrics.fairnessIndex);
