import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const junitEnabled = args.includes('--junit');

const nodeArgs = ['--test', '--test-concurrency=1'];

if (junitEnabled) {
  await mkdir('reports', { recursive: true });
  nodeArgs.push(
    '--test-reporter=spec',
    '--test-reporter-destination=stdout',
    '--test-reporter=junit',
    '--test-reporter-destination=reports/junit.xml',
  );
}

nodeArgs.push('tests/**/*.test.js');

const child = spawn(process.execPath, nodeArgs, {
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Test runner stopped by signal ${signal}`);
    process.exit(1);
  }

  if (junitEnabled) {
    console.log('JUnit report: reports/junit.xml');
  }

  process.exit(code ?? 1);
});
