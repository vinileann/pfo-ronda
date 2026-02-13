import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

process.env.NODE_ENV = 'production';

const authRoutes = (await import('../backend/dist/routes/auth.js')).default;
const rondaAlunoRoutes = (await import('../backend/dist/routes/rondaAluno.js')).default;
const rondaUtiRoutes = (await import('../backend/dist/routes/rondaUti.js')).default;
const plantoesRoutes = (await import('../backend/dist/routes/plantoes.js')).default;
const analisesRoutes = (await import('../backend/dist/routes/analises.js')).default;

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['https://ronda.lmedu.com.br', 'http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/ronda-aluno', rondaAlunoRoutes);
app.use('/ronda-uti', rondaUtiRoutes);
app.use('/plantoes', plantoesRoutes);
app.use('/analises', analisesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API de Rondas funcionando!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', path: req.path });
});

export default app;
