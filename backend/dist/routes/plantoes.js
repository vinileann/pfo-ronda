import express from 'express';
import prisma from '../lib/prisma.js';
const router = express.Router();
// Buscar alunos com plantão no dia
router.get('/dia/:data', async (req, res) => {
    try {
        const { data } = req.params; // Recebe no formato yyyy-mm-dd
        // Converter yyyy-mm-dd para dd/mm/yyyy
        const [ano, mes, dia] = data.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;
        const plantoes = await prisma.pfPlantoes.findMany({
            where: {
                data_plantao: dataFormatada,
            },
            select: {
                matricula: true,
                nome: true,
                telefone: true,
                status: true,
                moscow: true,
            },
            orderBy: {
                nome: 'asc',
            },
        });
        return res.json(plantoes);
    }
    catch (error) {
        console.error('Erro ao buscar plantões:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
export default router;
