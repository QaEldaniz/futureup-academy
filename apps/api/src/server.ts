import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 FutureUp API server running at http://${HOST}:${PORT}`);
    console.log(`📚 Health check: http://${HOST}:${PORT}/api/health`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
