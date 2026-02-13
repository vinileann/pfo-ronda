import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { rondaUtiService } from '../lib/api';
import Layout from '../components/Layout';

const UTIS = ['1', '2', '3', '4', '5', 'PA'];
const PRECEPTORES = [
  'Candido',
  'Lucas Gabriel',
  'Léia',
  'João Paulo',
  'Ana Beatriz',
  'Arthur',
  'João Pedro',
  'Humberto',
  'Gutembergue',
  'Walter',
  'Fernando',
  'Lucas Lacerda',
  'Guilherme Assis',
];

export default function RondaUtis() {
  const { user } = useAuth();
  const [step, setStep] = useState<'uti' | 'form'>('uti');
  const [selectedUti, setSelectedUti] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    preceptores: [] as string[],
    procedimentos_previstos: '',
    procedimentos_reais: '',
  });

  const handleUtiSelect = (uti: string) => {
    setSelectedUti(uti);
    setStep('form');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

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
      [name]: value,
    }));
  };

  const handlePreceptorToggle = (preceptor: string) => {
    setFormData((prev) => ({
      ...prev,
      preceptores: prev.preceptores.includes(preceptor)
        ? prev.preceptores.filter((p) => p !== preceptor)
        : [...prev.preceptores, preceptor],
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

      await rondaUtiService.create({
        login: user?.login,
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
    setFormData({
      preceptores: [],
      procedimentos_previstos: '',
      procedimentos_reais: '',
    });
    setSuccess(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primaria mb-6">Ronda de UTIs</h1>

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
                >
                  {uti === 'PA' ? 'PA' : `UTI ${uti}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                Ronda - {selectedUti === 'PA' ? 'PA' : `UTI ${selectedUti}`}
              </h2>
              <button onClick={() => setStep('uti')} className="btn-secondary text-sm">
                Voltar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Procedimentos Previstos
                </label>
                <input
                  type="number"
                  name="procedimentos_previstos"
                  value={formData.procedimentos_previstos}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>

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
                <label className="block text-sm font-medium mb-3">Preceptores</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRECEPTORES.map((preceptor) => (
                    <label
                      key={preceptor}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-primaria/10"
                    >
                      <input
                        type="checkbox"
                        checked={formData.preceptores.includes(preceptor)}
                        onChange={() => handlePreceptorToggle(preceptor)}
                        className="w-4 h-4 accent-primaria"
                      />
                      <span className="text-sm">{preceptor}</span>
                    </label>
                  ))}
                </div>
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
