import { useState, useEffect } from 'react';
import { rondaAlunoService, rondaUtiService } from '../lib/api';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const UTIS_FILTRO = ['Todas', '1', '2', '3', '4', '5', 'PA'];
const ITEMS_PER_PAGE = 10;

type TabType = 'alunos' | 'utis';

export default function Rondas() {
  const [activeTab, setActiveTab] = useState<TabType>('alunos');
  const [loading, setLoading] = useState(false);
  const [rondasAlunos, setRondasAlunos] = useState<any[]>([]);
  const [rondasUtis, setRondasUtis] = useState<any[]>([]);
  const [selectedRonda, setSelectedRonda] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    data_inicio: '',
    data_fim: '',
    uti: '',
  });

  useEffect(() => {
    loadRondas();
  }, [activeTab]);

  const loadRondas = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.data_inicio) params.data_inicio = filters.data_inicio;
      if (filters.data_fim) params.data_fim = filters.data_fim;
      if (filters.uti && filters.uti !== 'Todas') params.uti = filters.uti;

      if (activeTab === 'alunos') {
        const data = await rondaAlunoService.list(params);
        setRondasAlunos(data);
      } else {
        const data = await rondaUtiService.list(params);
        setRondasUtis(data);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao carregar rondas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    loadRondas();
  };

  const currentRondas = activeTab === 'alunos' ? rondasAlunos : rondasUtis;
  const totalPages = Math.ceil(currentRondas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRondas = currentRondas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-primaria mb-6">Histórico de Rondas</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('alunos')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'alunos'
                ? 'bg-primaria text-fundo'
                : 'bg-secundaria text-texto border border-primaria/30'
            }`}
          >
            Alunos
          </button>
          <button
            onClick={() => setActiveTab('utis')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'utis'
                ? 'bg-primaria text-fundo'
                : 'bg-secundaria text-texto border border-primaria/30'
            }`}
          >
            UTIs
          </button>
        </div>

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
                {UTIS_FILTRO.map((uti) => (
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

        {/* Lista de Rondas */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-texto/70">Carregando rondas...</p>
          </div>
        ) : currentRondas.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-texto/70">Nenhuma ronda encontrada</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {paginatedRondas.map((ronda, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedRonda(ronda)}
                  className="card cursor-pointer hover:border-primaria transition-colors"
                >
                  {activeTab === 'alunos' ? (
                    <>
                      <h3 className="font-medium text-primaria mb-2">
                        {ronda.matricula}
                      </h3>
                      <p className="text-sm text-texto/70">
                        {formatDate(ronda.data_plantao)} - {ronda.hora}
                      </p>
                      <p className="text-sm text-texto/70">
                        {ronda.uti === 'PA' ? 'PA' : `UTI ${ronda.uti}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-medium text-primaria mb-2">
                        {ronda.uti === 'PA' ? 'PA' : `UTI ${ronda.uti}`}
                      </h3>
                      <p className="text-sm text-texto/70">
                        {formatDate(ronda.data_plantao)} - {ronda.hora}
                      </p>
                      <p className="text-sm text-texto/70">
                        {ronda.login}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-secundaria border border-primaria/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primaria/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primaria text-fundo'
                        : 'bg-secundaria border border-primaria/30 hover:bg-primaria/20'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-secundaria border border-primaria/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primaria/20 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal de Detalhes */}
        <Modal isOpen={!!selectedRonda} onClose={() => setSelectedRonda(null)}>
          {selectedRonda && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primaria mb-4">
                Detalhes da Ronda
              </h2>

              {activeTab === 'alunos' ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-texto/70">Matrícula:</span>
                    <span className="font-medium">{selectedRonda.matricula}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Data:</span>
                    <span className="font-medium">{formatDate(selectedRonda.data_plantao)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Hora:</span>
                    <span className="font-medium">{selectedRonda.hora}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">UTI:</span>
                    <span className="font-medium">
                      {selectedRonda.uti === 'PA' ? 'PA' : `UTI ${selectedRonda.uti}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Login:</span>
                    <span className="font-medium">{selectedRonda.login}</span>
                  </div>
                  <hr className="border-primaria/20" />
                  <div className="flex justify-between">
                    <span className="text-texto/70">Procedimentos Reais:</span>
                    <span className="font-medium">{selectedRonda.procedimentos_reais || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Procedimentos Simulados:</span>
                    <span className="font-medium">{selectedRonda.procedimentos_simulados || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Pacientes Avaliados:</span>
                    <span className="font-medium">{selectedRonda.qtd_pacientes_avaliados || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Ociosidade:</span>
                    <span className="font-medium">{selectedRonda.ociosidade || 0}</span>
                  </div>
                  <hr className="border-primaria/20" />
                  <div className="flex justify-between">
                    <span className="text-texto/70">Must Feito:</span>
                    <span className="font-medium">{selectedRonda.must_feito ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Should Feito:</span>
                    <span className="font-medium">{selectedRonda.should_feito ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Preceptor Acompanhou:</span>
                    <span className="font-medium">{selectedRonda.preceptor_acompanhou ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Recebimento de Plantão:</span>
                    <span className="font-medium">{selectedRonda.recebimento_de_plantao ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-texto/70">UTI:</span>
                    <span className="font-medium">
                      {selectedRonda.uti === 'PA' ? 'PA' : `UTI ${selectedRonda.uti}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Data:</span>
                    <span className="font-medium">{formatDate(selectedRonda.data_plantao)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Hora:</span>
                    <span className="font-medium">{selectedRonda.hora}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Login:</span>
                    <span className="font-medium">{selectedRonda.login}</span>
                  </div>
                  <hr className="border-primaria/20" />
                  <div className="flex justify-between">
                    <span className="text-texto/70">Procedimentos Previstos:</span>
                    <span className="font-medium">{selectedRonda.procedimentos_previstos || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto/70">Procedimentos Reais:</span>
                    <span className="font-medium">{selectedRonda.procedimentos_reais || 0}</span>
                  </div>
                  <hr className="border-primaria/20" />
                  <div>
                    <span className="text-texto/70">Preceptores:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRonda.preceptores && selectedRonda.preceptores.length > 0 ? (
                        selectedRonda.preceptores.map((prec: string, idx: number) => (
                          <span key={idx} className="bg-primaria/20 text-primaria px-3 py-1 rounded-full text-sm">
                            {prec}
                          </span>
                        ))
                      ) : (
                        <span className="text-texto/50">Nenhum preceptor selecionado</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
