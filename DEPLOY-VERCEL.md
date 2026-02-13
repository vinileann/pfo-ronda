# 🚀 Deploy na Vercel - Rondagem de Novinhos

## 🎯 Por que Vercel?

- ✅ Deploy automático via Git (GitHub/GitLab/Bitbucket)
- ✅ Serverless Functions para o backend
- ✅ SSL/HTTPS automático
- ✅ CDN global
- ✅ Preview deploys para cada PR
- ✅ Rollback instantâneo
- ✅ Zero configuração de servidor
- ✅ Suporta PostgreSQL externo perfeitamente

---

## 📋 Pré-requisitos

1. Conta na Vercel (https://vercel.com) - é grátis!
2. Repositório Git com o código (GitHub, GitLab ou Bitbucket)
3. Domínio configurado (lmedu.com.br)

---

## 🚀 PARTE 1: Preparação do Código

### 1.1 Verificar arquivos de configuração

Certifique-se de que estes arquivos existem na raiz do projeto:

- ✅ `vercel.json` - Configuração da Vercel
- ✅ `.vercelignore` - Arquivos a ignorar no deploy
- ✅ `api/index.js` - Serverless function do backend
- ✅ `api/package.json` - Configuração ES modules

### 1.2 Commit e Push para o Git

```bash
git add .
git commit -m "Configuração para deploy na Vercel

- Adiciona vercel.json com rewrites para /pfo-ronda
- Cria serverless function em /api
- Configura build do backend e frontend

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin main
```

---

## 🌐 PARTE 2: Deploy na Vercel

### 2.1 Criar Projeto na Vercel

1. Acesse https://vercel.com e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório:
   - Se for GitHub: autorize a Vercel e selecione o repositório
   - Se for GitLab/Bitbucket: conecte e selecione o repositório

### 2.2 Configurar o Projeto

Na tela de configuração:

**Configure Project:**
- **Framework Preset**: Vite
- **Root Directory**: `./` (deixe como está)
- **Build Command**: `npm run vercel-build` (já está configurado)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Environment Variables** (adicione todas):

```bash
# Banco de Dados
DATABASE_URL=postgresql://lovable:XqH+B5tdvyR-AebQ@35.199.101.38:5432/liberdade-medica?schema=lovable

# JWT
JWT_SECRET=GPBQTdxcFh3cXVg65DGeTbDGK4iFfxwGrcn1AjMBzfshFf76g9rEHjp2gBrn98Stkmjeo0uNZTG3mku1VoFKME

# Ambiente
NODE_ENV=production

# Base Path
BASE_PATH=/pfo-ronda

# CORS
CORS_ORIGIN=https://lmedu.com.br
```

**IMPORTANTE:** Adicione cada variável clicando em "Add" para cada uma.

### 2.3 Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (leva cerca de 2-3 minutos)
3. 🎉 Deploy concluído!

Você receberá uma URL temporária tipo: `https://seu-projeto.vercel.app`

---

## 🔗 PARTE 3: Configurar Domínio Customizado

### 3.1 Adicionar Domínio na Vercel

1. No painel do projeto, vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite: `lmedu.com.br`
4. Clique em **"Add"**

### 3.2 Configurar DNS

A Vercel vai fornecer os registros DNS. Configure no seu provedor de domínio:

**Opção 1: CNAME (Recomendado)**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Opção 2: A Record**
```
Type: A
Name: @
Value: 76.76.21.21
```

E para www (opcional):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3.3 Aguardar Propagação

- DNS pode levar de alguns minutos a 48h para propagar
- A Vercel emite automaticamente um certificado SSL/HTTPS
- Você receberá um email quando estiver pronto

---

## ✅ PARTE 4: Testar o Deploy

### 4.1 Testar Backend

Acesse no navegador:
```
https://lmedu.com.br/pfo-ronda/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "API de Rondas funcionando na Vercel!",
  "environment": "production",
  "basePath": "/pfo-ronda",
  "platform": "Vercel Serverless"
}
```

### 4.2 Testar Frontend

Acesse:
- ✅ `https://lmedu.com.br/pfo-ronda/`
- ✅ `https://lmedu.com.br/pfo-donda/` (deve redirecionar para /pfo-ronda/)

### 4.3 Testar Login

1. Acesse `https://lmedu.com.br/pfo-ronda/`
2. Faça login com suas credenciais
3. Navegue pela aplicação
4. Se tudo funcionar, **deploy completo!** 🎉

---

## 🔄 PARTE 5: Atualizações Futuras

### Deploy Automático

Toda vez que você fizer push para o branch principal, a Vercel faz deploy automaticamente!

```bash
# Faça suas alterações
git add .
git commit -m "Mensagem do commit"
git push origin main

# A Vercel detecta automaticamente e faz deploy!
```

### Preview Deploys

Cada Pull Request gera automaticamente um deploy de preview com uma URL única para testes.

### Rollback

Se algo der errado:

1. Vá em **Deployments** no painel da Vercel
2. Encontre um deploy anterior que funcionava
3. Clique nos 3 pontinhos → **"Promote to Production"**
4. Deploy anterior é restaurado instantaneamente!

---

## 📊 PARTE 6: Monitoramento

### 6.1 Logs

Para ver logs em tempo real:

1. Vá em **Deployments** → selecione o deploy ativo
2. Clique em **"Functions"**
3. Selecione `/api/index.func`
4. Veja os logs em tempo real

### 6.2 Analytics

A Vercel fornece analytics gratuitos:
- Pageviews
- Top pages
- Top referrers
- Devices
- Browsers

Acesse em **Analytics** no menu do projeto.

---

## 🐛 Troubleshooting

### ❌ Erro 404 nas rotas da API

**Solução:**
- Verifique se o `vercel.json` está na raiz do projeto
- Verifique se a pasta `api/` existe com `index.js`
- Force redeploy: Settings → General → Redeploy

### ❌ Erro de CORS

**Solução:**
1. Vá em **Settings** → **Environment Variables**
2. Verifique se `CORS_ORIGIN=https://lmedu.com.br`
3. Se alterou, clique em **Redeploy**

### ❌ Erro de conexão com banco de dados

**Solução:**
1. Verifique se o IP da Vercel está na whitelist do PostgreSQL
2. IPs da Vercel mudam, então use `0.0.0.0/0` (todos os IPs) ou configure o banco para aceitar todas as conexões
3. Teste a `DATABASE_URL` em **Settings** → **Environment Variables**

### ❌ Build falha

**Possíveis causas:**
1. **Erro no backend build:**
   - Veja os logs de build
   - Teste localmente: `npm run build:backend`

2. **Erro no frontend build:**
   - Teste localmente: `npm run build:frontend`

3. **Prisma generate falha:**
   - A Vercel usa Linux, os binary targets já estão configurados
   - Verifique se o `schema.prisma` tem os binary targets corretos

### ❌ Aplicação lenta

**Soluções:**
- Serverless functions têm cold start (primeira execução lenta)
- Considere upgrade para Vercel Pro ($20/mês) que tem menos cold starts
- Use caching quando possível

---

## 💰 Custos

### Plano Hobby (Grátis)
- ✅ Perfeito para este projeto
- 100 GB bandwidth/mês
- Serverless Functions: 100h/mês
- Domínios customizados ilimitados
- HTTPS automático
- Preview deploys

### Plano Pro ($20/mês)
- 1 TB bandwidth/mês
- Serverless Functions: 1000h/mês
- Menos cold starts
- Suporte prioritário

**Para este projeto, o plano Hobby (grátis) é mais que suficiente!**

---

## 📝 Comandos Úteis

```bash
# Instalar Vercel CLI (opcional, para deploy local)
npm i -g vercel

# Login na Vercel
vercel login

# Deploy de preview
vercel

# Deploy de produção
vercel --prod

# Ver logs em tempo real
vercel logs

# Ver deployments
vercel ls

# Remover projeto
vercel remove
```

---

## 🎯 Checklist de Deploy Vercel

- [ ] Código commitado e pushed para Git
- [ ] Projeto criado na Vercel
- [ ] Repositório conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Domínio customizado adicionado
- [ ] DNS configurado
- [ ] SSL/HTTPS ativo
- [ ] Testar `/pfo-ronda/api/health`
- [ ] Testar frontend `/pfo-ronda/`
- [ ] Testar login
- [ ] Testar redirecionamento `/pfo-donda` → `/pfo-ronda`
- [ ] Verificar logs para erros

---

## 🔐 Segurança

### Variáveis de Ambiente

**NUNCA** commite arquivos `.env` no Git!

As variáveis estão seguras na Vercel e são injetadas durante o build e runtime.

### Whitelist do Banco de Dados

A Vercel usa IPs dinâmicos. Opções:

1. **Opção 1:** Liberar todos os IPs no PostgreSQL (menos seguro, mas mais simples)
2. **Opção 2:** Usar um banco de dados gerenciado que aceite conexões de qualquer lugar (Supabase, Neon, etc.)
3. **Opção 3:** Migrar o banco para Vercel Postgres (pago)

### CORS

Já configurado para aceitar apenas `https://lmedu.com.br`.

---

## 🎉 Pronto!

**URLs Finais:**
- Frontend: `https://lmedu.com.br/pfo-ronda/`
- API: `https://lmedu.com.br/pfo-ronda/api/health`
- Alias: `https://lmedu.com.br/pfo-donda/` → `/pfo-ronda/`

**Painel Vercel:**
- https://vercel.com/dashboard

**Vantagens do Deploy na Vercel:**
- 🚀 Deploy em ~3 minutos (vs horas no cPanel)
- 🔄 Deploy automático a cada commit
- 🔙 Rollback com 1 clique
- 📊 Analytics inclusos
- 🌐 CDN global
- 🔒 HTTPS automático
- 💰 Grátis para sempre (plano Hobby)

---

**Dúvidas?**
- Documentação Vercel: https://vercel.com/docs
- Comunidade: https://github.com/vercel/vercel/discussions
