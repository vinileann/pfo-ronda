import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Análises combinadas de rondas de alunos e UTIs
router.get('/dashboard', async (req, res) => {
  try {
    const { data_inicio, data_fim, uti } = req.query;

    const where: any = {};

    if (data_inicio && data_fim) {
      where.data_plantao = {
        gte: new Date(data_inicio as string),
        lte: new Date(data_fim as string),
      };
    }

    if (uti) {
      where.uti = uti;
    }

    // Buscar dados de ronda de alunos
    const rondasAlunos = await prisma.pfRondaAluno.findMany({
      where,
      select: {
        data_plantao: true,
        uti: true,
        procedimentos_reais: true,
        procedimentos_simulados: true,
        must_feito: true,
        should_feito: true,
        qtd_pacientes_avaliados: true,
        preceptor_acompanhou: true,
        ociosidade: true,
        recebimento_de_plantao: true,
      },
    });

    // Buscar dados de ronda de UTI
    const rondasUtis = await prisma.pfRondaUti.findMany({
      where,
      select: {
        data_plantao: true,
        uti: true,
        procedimentos_previstos: true,
        procedimentos_reais: true,
        preceptores: true,
      },
    });

    // Calcular estatísticas
    const totalRondasAlunos = rondasAlunos.length;
    const totalRondasUtis = rondasUtis.length;

    const totalProcedimentosReaisAlunos = rondasAlunos.reduce(
      (sum, r) => sum + (r.procedimentos_reais || 0),
      0
    );

    const totalProcedimentosSimulados = rondasAlunos.reduce(
      (sum, r) => sum + (r.procedimentos_simulados || 0),
      0
    );

    const totalMustFeito = rondasAlunos.filter((r) => r.must_feito).length;
    const totalShouldFeito = rondasAlunos.filter((r) => r.should_feito).length;

    const totalPacientesAvaliados = rondasAlunos.reduce(
      (sum, r) => sum + (r.qtd_pacientes_avaliados || 0),
      0
    );

    const totalPreceptorAcompanhou = rondasAlunos.filter((r) => r.preceptor_acompanhou).length;
    const totalRecebimentoPlantao = rondasAlunos.filter((r) => r.recebimento_de_plantao).length;

    const mediaOciosidade =
      rondasAlunos.length > 0
        ? rondasAlunos.reduce((sum, r) => sum + (r.ociosidade || 0), 0) / rondasAlunos.length
        : 0;

    const totalProcedimentosPrevistosUti = rondasUtis.reduce(
      (sum, r) => sum + (r.procedimentos_previstos || 0),
      0
    );

    const totalProcedimentosReaisUti = rondasUtis.reduce(
      (sum, r) => sum + (r.procedimentos_reais || 0),
      0
    );

    // Contar rondas de UTI onde a lista de preceptores não está vazia
    const totalPreceptorPresenteUti = rondasUtis.filter((r) => r.preceptores && r.preceptores.length > 0).length;

    return res.json({
      alunos: {
        total_rondas: totalRondasAlunos,
        procedimentos_reais: totalProcedimentosReaisAlunos,
        procedimentos_simulados: totalProcedimentosSimulados,
        must_feito: totalMustFeito,
        should_feito: totalShouldFeito,
        pacientes_avaliados: totalPacientesAvaliados,
        preceptor_acompanhou: totalPreceptorAcompanhou,
        recebimento_plantao: totalRecebimentoPlantao,
        media_ociosidade: Math.round(mediaOciosidade * 100) / 100,
      },
      utis: {
        total_rondas: totalRondasUtis,
        procedimentos_previstos: totalProcedimentosPrevistosUti,
        procedimentos_reais: totalProcedimentosReaisUti,
        preceptor_presente: totalPreceptorPresenteUti,
      },
      detalhes: {
        rondas_alunos: rondasAlunos,
        rondas_utis: rondasUtis,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar análises:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
