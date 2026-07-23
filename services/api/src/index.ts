import http from 'node:http';
import { env } from './env.js';
import { createHttpApp } from './http.js';
import { attachSocketServer } from './socket.js';

const app = createHttpApp();
const server = http.createServer(app);

attachSocketServer(server);

server.listen(env.PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://0.0.0.0:${env.PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received; closing API server`);
  server.close((error) => process.exit(error ? 1 : 0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
