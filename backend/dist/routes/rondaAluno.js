import express from 'express';
import prisma from '../lib/prisma.js';
const router = express.Router();
// Criar nova ronda de aluno
router.post('/', async (req, res) => {
    try {
        const { login, matricula, data_plantao, hora, uti, procedimentos_reais, procedimentos_simulados, must_feito, should_feito, qtd_pacientes_avaliados, preceptor_acompanhou, ociosidade, recebimento_de_plantao, } = req.body;
        if (!data_plantao) {
            return res.status(400).json({ error: 'O campo data_plantao é obrigatório.' });
        }
        const ronda = await prisma.pfRondaAluno.create({
            data: {
                login,
                matricula,
                data_plantao: new Date(data_plantao),
                hora,
                uti,
                procedimentos_reais: procedimentos_reais ? parseInt(procedimentos_reais) : null,
                procedimentos_simulados: procedimentos_simulados ? parseInt(procedimentos_simulados) : null,
                must_feito: must_feito === true || must_feito === 'true',
                should_feito: should_feito === true || should_feito === 'true',
                qtd_pacientes_avaliados: qtd_pacientes_avaliados ? parseInt(qtd_pacientes_avaliados) : null,
                preceptor_acompanhou: preceptor_acompanhou === true || preceptor_acompanhou === 'true',
                ociosidade: ociosidade ? parseInt(ociosidade) : null,
                recebimento_de_plantao: recebimento_de_plantao === true || recebimento_de_plantao === 'true',
            },
        });
        return res.status(201).json(ronda);
    }
    catch (error) {
        console.error('Erro ao criar ronda de aluno:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Listar rondas de alunos com filtros
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
        const rondas = await prisma.pfRondaAluno.findMany({
            where,
            orderBy: {
                data_plantao: 'desc',
            },
        });
        return res.json(rondas);
    }
    catch (error) {
        console.error('Erro ao listar rondas de aluno:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
export default router;
