import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
// Log para debug
console.log('🔍 Inicializando Prisma...');
console.log(`   DATABASE_URL presente: ${process.env.DATABASE_URL ? 'SIM' : 'NÃO'}`);
if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    const host = dbUrl.split('@')[1]?.split(':')[0] || 'desconhecido';
    const port = dbUrl.split('@')[1]?.split(':')[1]?.split('/')[0] || 'desconhecido';
    console.log(`   Host: ${host}:${port}`);
}
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
// Log de eventos do pool
pool.on('connect', () => {
    console.log('✅ Pool: Nova conexão estabelecida');
});
pool.on('error', (err) => {
    console.error('❌ Pool: Erro na conexão:', err.message);
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export default prisma;
