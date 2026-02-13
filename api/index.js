/**
 * Vercel Serverless Function
 * Este arquivo adapta o Express app para rodar como Serverless Function na Vercel
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

// Força NODE_ENV para production
process.env.NODE_ENV = 'production';
process.env.BASE_PATH = '/pfo-ronda';

// Importa as rotas dinamicamente
const authRoutes = (await import('../backend/dist/routes/auth.js')).default;
const rondaAlunoRoutes = (await import('../backend/dist/routes/rondaAluno.js')).default;
const rondaUtiRoutes = (await import('../backend/dist/routes/rondaUti.js')).default;
const plantoesRoutes = (await import('../backend/dist/routes/plantoes.js')).default;
const analisesRoutes = (await import('../backend/dist/routes/analises.js')).default;

const app = express();
const BASE_PATH = process.env.BASE_PATH || '/pfo-ronda';

// Configuração do CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['https://lmedu.com.br', 'http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS bloqueado para origem: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Registra as rotas
app.use('/auth', authRoutes);
app.use('/ronda-aluno', rondaAlunoRoutes);
app.use('/ronda-uti', rondaUtiRoutes);
app.use('/plantoes', plantoesRoutes);
app.use('/analises', analisesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API de Rondas funcionando na Vercel!',
    environment: process.env.NODE_ENV,
    basePath: BASE_PATH,
    platform: 'Vercel Serverless'
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Export para Vercel
export default app;
