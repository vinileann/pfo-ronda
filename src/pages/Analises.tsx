import { useState, useEffect } from 'react';
import { analisesService } from '../lib/api';
import Layout from '../components/Layout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const UTIS = ['Todas', '1', '2', '3', '4', '5', 'PA'];
const COLORS = ['#ADDAE0', '#CBC8E0', '#1B081F', '#FF8042', '#FFBB28', '#00C49F'];

export default function Analises() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: '',
    uti: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.data_inicio) params.data_inicio = filters.data_inicio;
      if (filters.data_fim) params.data_fim = filters.data_fim;
      if (filters.uti && filters.uti !== 'Todas') params.uti = filters.uti;

      const result = await analisesService.getDashboard(params);
      setData(result);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    loadData();
  };

  const pieDataAlunos = data
    ? [
        { name: 'Must Feito', value: data.alunos.must_feito },
        { name: 'Should Feito', value: data.alunos.should_feito },
        {
          name: 'Não Feito',
          value:
            data.alunos.total_rondas -
            data.alunos.must_feito -
            data.alunos.should_feito,
        },
      ]
    : [];

  const barDataProcedimentos = data
    ? [
        {
          name: 'Alunos',
          Reais: data.alunos.procedimentos_reais,
          Simulados: data.alunos.procedimentos_simulados,
        },
        {
          name: 'UTIs',
          Previstos: data.utis.procedimentos_previstos,
          Reais: data.utis.procedimentos_reais,
        },
      ]
    : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-primaria mb-6">Análises</h1>

        {/* Filtros */}
        <div className="card mb-6">
          <h2 className="text-lg font-medium mb-4">Filtros</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">Data Início</label>
                <input
                  type="date"
                  name="data_inicio"
                  value={filters.data_inicio}
                  onChange={handleFilterChange}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data Fim</label>
                <input
                  type="date"
                  name="data_fim"
                  value={filters.data_fim}
                  onChange={handleFilterChange}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">UTI</label>
              <select
                name="uti"
                value={filters.uti}
                onChange={handleFilterChange}
                className="select-field"
              >
                {UTIS.map((uti) => (
                  <option key={uti} value={uti === 'Todas' ? '' : uti}>
                    {uti === 'Todas' ? 'Todas' : uti === 'PA' ? 'PA' : `UTI ${uti}`}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Carregando...' : 'Aplicar Filtros'}
            </button>
          </div>
        </div>

        {/* Cards de Resumo */}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card">
                <p className="text-sm text-texto/70 mb-1">Total Rondas Alunos</p>
                <p className="text-3xl font-bold text-primaria">{data.alunos.total_rondas}</p>
              </div>

              <div className="card">
                <p className="text-sm text-texto/70 mb-1">Total Rondas UTIs</p>
                <p className="text-3xl font-bold text-primaria">{data.utis.total_rondas}</p>
              </div>

              <div className="card">
                <p className="text-sm text-texto/70 mb-1">Pacientes Avaliados</p>
                <p className="text-3xl font-bold text-primaria">
                  {data.alunos.pacientes_avaliados}
                </p>
              </div>

              <div className="card">
                <p className="text-sm text-texto/70 mb-1">Média Ociosidade (min)</p>
                <p className="text-3xl font-bold text-primaria">
                  {data.alunos.media_ociosidade}
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Pizza - Must/Should */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Must / Should Feitos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieDataAlunos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieDataAlunos.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Barras - Procedimentos */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Procedimentos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barDataProcedimentos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBC8E0" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#CBC8E0" />
                    <YAxis stroke="#CBC8E0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1B081F',
                        border: '1px solid #ADDAE0',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Reais" fill="#ADDAE0" />
                    <Bar dataKey="Simulados" fill="#CBC8E0" />
                    <Bar dataKey="Previstos" fill="#1B081F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Estatísticas Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Alunos</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Preceptor Acompanhou:</span>
                    <span className="font-medium text-primaria">
                      {data.alunos.preceptor_acompanhou}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recebimento de Plantão:</span>
                    <span className="font-medium text-primaria">
                      {data.alunos.recebimento_plantao}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium mb-4">UTIs</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Preceptor Presente:</span>
                    <span className="font-medium text-primaria">
                      {data.utis.preceptor_presente}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!data && !loading && (
          <div className="card text-center py-12">
            <p className="text-texto/70">Nenhum dado disponível. Aplique os filtros para visualizar.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
