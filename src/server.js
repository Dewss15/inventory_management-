require('dotenv').config();
const net = require('net');
const app = require('./app');
const { connectDB } = require('./config/db');

const PREFERRED_PORT = parseInt(process.env.PORT, 10) || 3000;

/**
 * Probe ports starting from `startPort` until a free one is found.
 * Resolves with the first port that is not in use.
 */
function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref(); // don't keep the event loop alive
    probe.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findFreePort(startPort + 1)); // try the next port
      } else {
        reject(err);
      }
    });
    probe.listen(startPort, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

connectDB()
  .then(() => findFreePort(PREFERRED_PORT))
  .then((port) => {
    app.listen(port, () => {
      if (port !== PREFERRED_PORT) {
        console.warn(`[warn] Port ${PREFERRED_PORT} is already in use — switched to port ${port}`);
      }
      console.log(`[info] Flux IMS server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('[error] Startup failed:', err.message);
    process.exit(1);
  });
