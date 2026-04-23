
import { compareAll, generateSampleProcesses } from '../src/engine/schedulingAlgorithms.js';

for (let i = 0; i < 100; i++) {
  try {
    const processes = generateSampleProcesses(Math.floor(Math.random() * 10) + 1);
    const timeQuantum = Math.floor(Math.random() * 5) + 1;
    const comp = compareAll(processes, timeQuantum);
    if (!comp || !comp.results || comp.results.length !== 9) {
      throw new Error('Invalid comparison result');
    }
    console.log(`Test ${i + 1} passed`);
  } catch (error) {
    console.error(`Test ${i + 1} FAILED:`, error);
    process.exit(1);
  }
}
console.log('All tests passed!');
