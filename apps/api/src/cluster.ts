import cluster from 'cluster';
import * as os from 'os';

/**
 * Cluster Mode for High Concurrency
 * 
 * Spawns multiple Node.js processes to utilize all CPU cores
 * Each process handles requests independently
 * This dramatically increases concurrent request capacity
 */

const numCPUs = parseInt(process.env.CLUSTER_WORKERS || String(os.cpus().length));

export async function bootstrap() {
  if (cluster.isPrimary) {
    console.log(`🚀 Master process ${process.pid} is running`);
    console.log(`📊 Spawning ${numCPUs} worker processes...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`❌ Worker ${worker.process.pid} died. Spawning a new one...`);
      cluster.fork();
    });

    cluster.on('online', (worker) => {
      console.log(`✅ Worker ${worker.process.pid} is online`);
    });
  } else {
    // Worker processes run the actual application
    const { bootstrap: appBootstrap } = await import('./main');
    await appBootstrap();
    console.log(`👷 Worker ${process.pid} started`);
  }
}

bootstrap();
