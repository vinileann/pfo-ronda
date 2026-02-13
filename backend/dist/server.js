import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// IMPORTANTE: Carregar .env ANTES de importar qualquer módulo que use variáveis de ambiente!
// Limpa a variável BASE_PATH antes de carregar o .env
delete process.env.BASE_PATH;
// Carrega .env.local em desenvolvimento, .env em produção
if (process.env.NODE_ENV === 'development') {
    const envPath = join(__dirname, '..', '.env.local');
    const result = dotenv.config({ path: envPath });
    console.log('📝 Modo: DESENVOLVIMENTO');
    console.log(`   Arquivo: ${envPath}`);
    console.log(`   Carregado: ${result.error ? '❌ ERRO' : '✅ OK'}`);
    if (result.error) {
        console.log(`   Erro: ${result.error.message}`);
    }
}
else {
    dotenv.config();
    console.log('📝 Modo: PRODUÇÃO - carregando .env');
}
// AGORA sim, importar as rotas (que dependem do Prisma que depende do .env)
const authRoutes = (await import('./routes/auth.js')).default;
const rondaAlunoRoutes = (await import('./routes/rondaAluno.js')).default;
const rondaUtiRoutes = (await import('./routes/rondaUti.js')).default;
const plantoesRoutes = (await import('./routes/plantoes.js')).default;
const analisesRoutes = (await import('./routes/analises.js')).default;
const app = express();
const PORT = process.env.PORT || 3001;
// Base path - vazio em desenvolvimento, /pfo-ronda em produção
const BASE_PATH = process.env.BASE_PATH || '';
console.log('🔧 Configurações carregadas do arquivo .env:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   PORT: ${PORT}`);
console.log(`   BASE_PATH definido no .env: "${process.env.BASE_PATH}"`);
console.log(`   BASE_PATH usado (com fallback): "${BASE_PATH}"`);
console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'padrão: http://localhost:5173, https://lmedu.com.br'}`);
// Configuração do CORS
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'https://lmedu.com.br'];
const corsOptions = {
    origin: (origin, callback) => {
        // Permite requisições sem origin (como Postman) em desenvolvimento
        if (!origin && process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`❌ CORS bloqueado para origem: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
// Middleware de log para debug
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});
// Teste de conexão com o banco de dados
async function testDatabaseConnection() {
    console.log('\n🔌 Testando conexão com o banco de dados...');
    try {
        const prisma = (await import('./lib/prisma.js')).default;
        await prisma.$connect();
        console.log('✅ Banco de dados conectado com sucesso!');
        // Testa uma query simples
        await prisma.$queryRaw `SELECT 1`;
        console.log('✅ Query de teste executada com sucesso!\n');
    }
    catch (error) {
        console.error('❌ Falha ao conectar ao banco de dados:');
        console.error(`   Código: ${error.code || 'desconhecido'}`);
        console.error(`   Mensagem: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️  Possíveis causas:');
            console.error('   1. PostgreSQL não está rodando');
            console.error('   2. Firewall bloqueando a porta 5432');
            console.error('   3. IP não está na whitelist do servidor');
            console.error('   4. DATABASE_URL incorreta');
        }
        console.error('\n💡 O servidor vai iniciar, mas as requisições ao banco vão falhar.\n');
    }
}
// Rotas
console.log('🛤️  Registrando rotas:');
console.log(`   ${BASE_PATH}/api/auth`);
console.log(`   ${BASE_PATH}/api/ronda-aluno`);
console.log(`   ${BASE_PATH}/api/ronda-uti`);
console.log(`   ${BASE_PATH}/api/plantoes`);
console.log(`   ${BASE_PATH}/api/analises`);
console.log(`   ${BASE_PATH}/api/health`);
app.use(`${BASE_PATH}/api/auth`, authRoutes);
app.use(`${BASE_PATH}/api/ronda-aluno`, rondaAlunoRoutes);
app.use(`${BASE_PATH}/api/ronda-uti`, rondaUtiRoutes);
app.use(`${BASE_PATH}/api/plantoes`, plantoesRoutes);
app.use(`${BASE_PATH}/api/analises`, analisesRoutes);
app.get(`${BASE_PATH}/api/health`, (req, res) => {
    res.json({
        status: 'ok',
        message: 'API de Rondas funcionando!',
        environment: process.env.NODE_ENV,
        basePath: BASE_PATH
    });
});
app.listen(PORT, async () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}${BASE_PATH}/api/health`);
    // Testa conexão com banco de dados
    await testDatabaseConnection();
});
