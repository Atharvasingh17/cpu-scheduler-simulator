
import { compareAll } from '../src/engine/schedulingAlgorithms.js';

try {
  const processes = [{ id: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 }];
  const comp = compareAll(processes, 2);
  console.log('Comparison for 1 process passed');
  console.log('Results length:', comp.results.length);
} catch (error) {
  console.error('Comparison for 1 process FAILED:', error);
}
