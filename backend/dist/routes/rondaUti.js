import express from 'express';
import prisma from '../lib/prisma.js';
const router = express.Router();
// Criar nova ronda de UTI
router.post('/', async (req, res) => {
    try {
        const { login, data_plantao, hora, uti, preceptores, procedimentos_previstos, procedimentos_reais, } = req.body;
        if (!data_plantao) {
            return res.status(400).json({ error: 'O campo data_plantao é obrigatório.' });
        }
        const ronda = await prisma.pfRondaUti.create({
            data: {
                login,
                data_plantao: new Date(data_plantao),
                hora,
                uti,
                preceptores: Array.isArray(preceptores) ? preceptores : [],
                procedimentos_previstos: procedimentos_previstos ? parseInt(procedimentos_previstos) : null,
                procedimentos_reais: procedimentos_reais ? parseInt(procedimentos_reais) : null,
            },
        });
        return res.status(201).json(ronda);
    }
    catch (error) {
        console.error('Erro ao criar ronda de UTI:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Listar rondas de UTI com filtros
router.get('/', async (req, res) => {
    try {
        const { data_inicio, data_fim, uti } = req.query;
        const where = {};
        if (data_inicio && data_fim) {
            where.data_plantao = {
                gte: new Date(data_inicio),
                lte: new Date(data_fim),
            };
        }
        if (uti) {
            where.uti = uti;
        }
        const rondas = await prisma.pfRondaUti.findMany({
            where,
            orderBy: {
                data_plantao: 'desc',
            },
        });
        return res.json(rondas);
    }
    catch (error) {
        console.error('Erro ao listar rondas de UTI:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
export default router;
