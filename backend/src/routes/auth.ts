import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }

    // Buscar usuário
    const usuario = await prisma.appsUsuarios.findFirst({
      where: {
        login: login,
        ronda: true, // Apenas usuários com permissão de ronda
      },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha || '');

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, login: usuario.login, nome: usuario.nome },
      process.env.JWT_SECRET || 'secret-key-default',
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
      },
    });
  } catch (error: any) {
    console.error('Erro no login:', error);

    // Erro de conexão com banco de dados
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Não foi possível conectar ao banco de dados PostgreSQL');
      console.error(`   Host: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'desconhecido'}`);
      return res.status(500).json({
        error: 'Erro de conexão com o banco de dados',
        details: 'Não foi possível conectar ao PostgreSQL'
      });
    }

    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
