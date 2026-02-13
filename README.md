# PFO Ronda - Sistema de Rondagem

Sistema de rondagem para controle de plantões de alunos e UTIs, com análises e relatórios.

## 🚀 Tecnologias

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticação

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts (gráficos)
- Axios

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## 🔧 Instalação

### 1. Instalar dependências do Frontend

```bash
npm install
```

### 2. Instalar dependências do Backend

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

#### Backend (.env no diretório `backend/`)

Copie o arquivo `.env.example` para `.env` e preencha:

```env
DATABASE_URL="postgresql://usuario:senha@host:porta/banco?schema=lovable"
PORT=3001
JWT_SECRET="sua-chave-secreta-forte"
NODE_ENV=development
```

#### Frontend (.env na raiz do projeto)

```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Configurar banco de dados

As tabelas já devem existir no PostgreSQL. O schema do Prisma está configurado para usar o schema `lovable`.

Gere o cliente Prisma:

```bash
cd backend
npm run prisma:generate
```

## 🎯 Executar em Desenvolvimento

### Backend

```bash
cd backend
npm run dev
```

O servidor rodará em `http://localhost:3001`

### Frontend

```bash
npm run dev
```

O app rodará em `http://localhost:5173`

## 📦 Build para Produção

### Frontend

```bash
npm run build
```

Os arquivos de build estarão em `dist/`

### Backend

```bash
cd backend
npm run build
npm start
```

## 🌐 Estrutura do Projeto

```
rondagem-de-novinhos/
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── plantoes.ts
│   │   │   ├── rondaAluno.ts
│   │   │   ├── rondaUti.ts
│   │   │   └── analises.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── RondaAlunos.tsx
│   │   ├── RondaUtis.tsx
│   │   └── Analises.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── logo-vinho.svg
├── .env
└── package.json
```

## 🎨 Cores do Tema

- Fundo: `#331107`
- Texto: `#CBC8E0`
- Primária: `#ADDAE0`
- Secundária: `#1B081F`
- Fonte: Roboto

## 📱 Funcionalidades

### Login
- Autenticação com login e senha
- Apenas usuários com permissão de ronda (campo `ronda = true`)

### Ronda de Alunos
1. Selecionar UTI (1-5 ou PA)
2. Selecionar aluno do dia
3. Preencher formulário com métricas
4. Salvar ronda

### Ronda de UTIs
1. Selecionar UTI
2. Preencher dados da ronda
3. Selecionar preceptores presentes
4. Salvar ronda

### Análises
- Filtros por data e UTI
- Cards com resumo de estatísticas
- Gráficos de pizza e barras
- Dados consolidados de alunos e UTIs

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Rotas protegidas no frontend e backend
- CORS configurado

## 🌍 Deploy em Produção

O app está configurado para rodar na URL: `https://lmedu.com.br/pfo-ronda`

### Deploy na Vercel (Recomendado)

📖 **Guia completo:** [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md)

**Resumo:**
1. Conecte seu repositório Git à Vercel
2. Configure as variáveis de ambiente (veja `.env.example`)
3. Deploy automático! 🚀

**Vantagens:**
- ✅ Deploy automático via Git
- ✅ HTTPS e SSL automáticos
- ✅ Serverless Functions
- ✅ CDN global
- ✅ Grátis para sempre (plano Hobby)

### Deploy no cPanel

📖 **Guia completo:** [DEPLOY-CPANEL.md](DEPLOY-CPANEL.md)

Alternativamente, você pode fazer deploy em servidor tradicional com cPanel.

## 📄 Licença

Propriedade privada.
