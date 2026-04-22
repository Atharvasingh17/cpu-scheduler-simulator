import { lrtfPreemptive } from '../src/engine/schedulingAlgorithms.js';

const processes = [
  { id: 'P1', arrivalTime: 0, burstTime: 4, priority: 1 },
  { id: 'P2', arrivalTime: 1, burstTime: 5, priority: 1 },
  { id: 'P3', arrivalTime: 2, burstTime: 2, priority: 1 },
];

try {
  const result = lrtfPreemptive(processes);
  console.log('LRTF Result:', JSON.stringify(result, null, 2));
  
  if (result.timeline.length > 0 && result.metrics) {
    console.log('Verification Success: LRTF produced a timeline and metrics.');
  } else {
    console.error('Verification Failure: Empty timeline or missing metrics.');
  }
} catch (error) {
  console.error('Verification Error:', error);
}
