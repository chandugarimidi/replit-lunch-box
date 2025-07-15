const { exec } = require('child_process');
const path = require('path');

// Start the server
const server = exec('node --loader ts-node/esm server/index.ts', {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' }
});

server.stdout.on('data', (data) => {
  console.log(data.toString());
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Start the frontend
const frontend = exec('npx vite', {
  cwd: path.join(__dirname, 'client'),
  env: { ...process.env, NODE_ENV: 'development' }
});

frontend.stdout.on('data', (data) => {
  console.log('[Frontend]', data.toString());
});

frontend.stderr.on('data', (data) => {
  console.error('[Frontend]', data.toString());
});

frontend.on('exit', (code) => {
  console.log(`Frontend exited with code ${code}`);
});