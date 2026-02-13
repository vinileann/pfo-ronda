import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { plantoesService, rondaAlunoService } from '../lib/api';
import Layout from '../components/Layout';

interface Aluno {
  matricula: string;
  nome: string;
}

const UTIS = ['1', '2', '3', '4', '5', 'PA'];

export default function RondaAlunos() {
  const { user } = useAuth();
  const [step, setStep] = useState<'uti' | 'aluno' | 'form'>('uti');
  const [selectedUti, setSelectedUti] = useState('');
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    procedimentos_reais: '',
    procedimentos_simulados: '',
    must_feito: false,
    should_feito: false,
    qtd_pacientes_avaliados: '',
    preceptor_acompanhou: false,
    ociosidade: '5',
    recebimento_de_plantao: false,
  });

  useEffect(() => {
    if (selectedUti) {
      loadAlunos();
    }
  }, [selectedUti]);

  const loadAlunos = async () => {
    setLoading(true);
    try {
      // Data atual no fuso horário de São Paulo (GMT-3)
      const hoje = new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      });
      const [dia, mes, ano] = hoje.split('/');
      const dataFormatada = `${ano}-${mes}-${dia}`;

      const data = await plantoesService.getByDate(dataFormatada);
      setAlunos(data);
      setStep('aluno');
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      alert('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleUtiSelect = (uti: string) => {
    setSelectedUti(uti);
  };

  const handleAlunoSelect = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Validação de inteiros para campos numéricos
    if (type === 'number' && value !== '') {
      const numValue = parseFloat(value);
      if (!Number.isInteger(numValue)) {
        alert('Por favor, insira apenas números inteiros.');
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hoje = new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      });
      const [dia, mes, ano] = hoje.split('/');
      const dataFormatada = `${ano}-${mes}-${dia}`;

      const hora = new Date().toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
      });

      await rondaAlunoService.create({
        login: user?.login,
        matricula: selectedAluno?.matricula,
        data_plantao: dataFormatada,
        hora,
        uti: selectedUti,
        ...formData,
      });

      setSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar ronda:', error);
      alert('Erro ao salvar ronda');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('uti');
    setSelectedUti('');
    setSelectedAluno(null);
    setFormData({
      procedimentos_reais: '',
      procedimentos_simulados: '',
      must_feito: false,
      should_feito: false,
      qtd_pacientes_avaliados: '',
      preceptor_acompanhou: false,
      ociosidade: '5',
      recebimento_de_plantao: false,
    });
    setSuccess(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primaria mb-6">Ronda de Alunos</h1>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4">
            Ronda salva com sucesso!
          </div>
        )}

        {step === 'uti' && (
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Selecione a UTI</h2>
            <div className="grid grid-cols-2 gap-3">
              {UTIS.map((uti) => (
                <button
                  key={uti}
                  onClick={() => handleUtiSelect(uti)}
                  className="btn-primary py-4 text-lg"
                  disabled={loading}
                >
                  {uti === 'PA' ? 'PA' : `UTI ${uti}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'aluno' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                Selecione o Aluno - {selectedUti === 'PA' ? 'PA' : `UTI ${selectedUti}`}
              </h2>
              <button onClick={() => setStep('uti')} className="btn-secondary text-sm">
                Voltar
              </button>
            </div>

            {loading ? (
              <p className="text-center py-8">Carregando alunos...</p>
            ) : alunos.length === 0 ? (
              <p className="text-center py-8 text-texto/70">
                Nenhum aluno com plantão hoje
              </p>
            ) : (
              <div className="space-y-2">
                {alunos.map((aluno) => (
                  <button
                    key={aluno.matricula}
                    onClick={() => handleAlunoSelect(aluno)}
                    className="w-full btn-secondary text-left"
                  >
                    {aluno.nome} - {aluno.matricula}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'form' && selectedAluno && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {selectedAluno.nome} - {selectedUti === 'PA' ? 'PA' : `UTI ${selectedUti}`}
              </h2>
              <button onClick={() => setStep('aluno')} className="btn-secondary text-sm">
                Voltar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Procedimentos Reais
                </label>
                <input
                  type="number"
                  name="procedimentos_reais"
                  value={formData.procedimentos_reais}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Procedimentos Simulados
                </label>
                <input
                  type="number"
                  name="procedimentos_simulados"
                  value={formData.procedimentos_simulados}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantidade de Pacientes Avaliados
                </label>
                <input
                  type="number"
                  name="qtd_pacientes_avaliados"
                  value={formData.qtd_pacientes_avaliados}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Ociosidade</label>
                  <span className="text-2xl font-bold text-primaria">{formData.ociosidade}</span>
                </div>
                <input
                  type="range"
                  name="ociosidade"
                  value={formData.ociosidade}
                  onChange={handleInputChange}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-primaria"
                  min="1"
                  max="10"
                  step="1"
                  style={{
                    background: `linear-gradient(to right, #ADDAE0 0%, #ADDAE0 ${((parseInt(formData.ociosidade) - 1) / 9) * 100}%, #1B081F ${((parseInt(formData.ociosidade) - 1) / 9) * 100}%, #1B081F 100%)`
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="must_feito"
                    checked={formData.must_feito}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-primaria"
                  />
                  <span>Must Feito</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="should_feito"
                    checked={formData.should_feito}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-primaria"
                  />
                  <span>Should Feito</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="preceptor_acompanhou"
                    checked={formData.preceptor_acompanhou}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-primaria"
                  />
                  <span>Preceptor Acompanhou</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="recebimento_de_plantao"
                    checked={formData.recebimento_de_plantao}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-primaria"
                  />
                  <span>Recebimento de Plantão</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Ronda'}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
