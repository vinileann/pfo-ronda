import axios from 'axios';

// Detecta automaticamente o ambiente
// Em desenvolvimento (localhost): usa /api que será proxied pelo Vite para http://localhost:3001/api
// Em produção: usa /pfo-ronda/api que é servido pelo servidor web
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serviços de Auth
export const authService = {
  login: async (login: string, senha: string) => {
    const response = await api.post('/auth/login', { login, senha });
    return response.data;
  },
};

// Serviços de Plantões
export const plantoesService = {
  getByDate: async (data: string) => {
    const response = await api.get(`/plantoes/dia/${data}`);
    return response.data;
  },
};

// Serviços de Ronda de Aluno
export const rondaAlunoService = {
  create: async (data: any) => {
    const response = await api.post('/ronda-aluno', data);
    return response.data;
  },
  list: async (filters?: { data_inicio?: string; data_fim?: string; uti?: string }) => {
    const response = await api.get('/ronda-aluno', { params: filters });
    return response.data;
  },
};

// Serviços de Ronda de UTI
export const rondaUtiService = {
  create: async (data: any) => {
    const response = await api.post('/ronda-uti', data);
    return response.data;
  },
  list: async (filters?: { data_inicio?: string; data_fim?: string; uti?: string }) => {
    const response = await api.get('/ronda-uti', { params: filters });
    return response.data;
  },
};

// Serviços de Análises
export const analisesService = {
  getDashboard: async (filters?: { data_inicio?: string; data_fim?: string; uti?: string }) => {
    const response = await api.get('/analises/dashboard', { params: filters });
    return response.data;
  },
};
