# 🚀 Deploy no cPanel (TurboCloud) - Rondagem de Novinhos

## 📋 Estrutura no cPanel

```
/home/seu-usuario/public_html/pfo-ronda/
├── index.html                  # Arquivo principal do React
├── assets/                     # JS e CSS do React
│   ├── index-[hash].js
│   └── index-[hash].css
├── logo-branca.svg            # Logos
├── logo-vinho.svg
├── .htaccess                  # Configuração Apache
└── backend/                   # API Node.js
    ├── dist/                  # JavaScript compilado
    ├── node_modules/          # Dependências (gerado no cPanel)
    ├── prisma/
    ├── .env                   # Configuração de produção
    └── package.json
```

---

## 🏗️ PARTE 1: Build Local (No seu PC)

### 1.1 Build do Frontend

```bash
# No diretório raiz do projeto
npm run build
```

Isso cria a pasta `dist/` com:
- `index.html`
- `assets/`
- `.htaccess`
- `logo-branca.svg`
- `logo-vinho.svg`

### 1.2 Build do Backend

```bash
cd backend
npm run build
```

Isso cria a pasta `backend/dist/` com o JavaScript compilado.

---

## 📤 PARTE 2: Upload dos Arquivos

### 2.1 Frontend

**Via Gerenciador de Arquivos do cPanel:**

1. Acesse **Gerenciador de Arquivos** no cPanel
2. Navegue até `/public_html/pfo-ronda/`
3. **Selecione TUDO dentro da pasta `dist/` do seu PC**
4. Faça upload para `/public_html/pfo-ronda/` (não crie pasta dist!)

**Estrutura final:**
```
/public_html/pfo-ronda/
├── index.html          ← direto na pasta pfo-ronda!
├── assets/             ← não dentro de dist!
├── .htaccess
└── logo-branca.svg
```

### 2.2 Backend

**Via Gerenciador de Arquivos do cPanel:**

1. Navegue até `/public_html/pfo-ronda/`
2. Crie a pasta `backend/`
3. Faça upload dos seguintes arquivos/pastas:
   - `backend/dist/` (JavaScript compilado)
   - `backend/prisma/`
   - `backend/package.json`
   - `backend/package-lock.json`
   - `backend/tsconfig.json`

**NÃO faça upload de:**
- ❌ `backend/src/` (código TypeScript - não é necessário)
- ❌ `backend/node_modules/` (vai instalar no cPanel)
- ❌ `backend/.env.local` (é só para desenvolvimento)

---

## ⚙️ PARTE 3: Configurar Backend no cPanel

### 3.1 Criar arquivo `.env` de Produção

**Via Terminal SSH ou Gerenciador de Arquivos:**

1. Navegue até `/public_html/pfo-ronda/backend/`
2. Crie o arquivo `.env` com o conteúdo:

```bash
# Configuração do Banco de Dados PostgreSQL
DATABASE_URL="postgresql://lovable:XqH+B5tdvyR-AebQ@35.199.101.38:5432/liberdade-medica?schema=lovable"

# Porta do servidor
PORT=3001

# Chave secreta para JWT
JWT_SECRET="GPBQTdxcFh3cXVg65DGeTbDGK4iFfxwGrcn1AjMBzfshFf76g9rEHjp2gBrn98Stkmjeo0uNZTG3mku1VoFKME"

# Ambiente
NODE_ENV=production

# Base path da aplicação
BASE_PATH=/pfo-ronda

# Origens permitidas para CORS
CORS_ORIGIN=https://lmedu.com.br
```

### 3.2 Instalar Dependências

**Via Terminal SSH:**

```bash
cd /home/seu-usuario/public_html/pfo-ronda/backend
npm install --production
```

**OU via cPanel Terminal (se disponível):**

```bash
cd public_html/pfo-ronda/backend
npm i
```

### 3.3 Gerar Prisma Client

```bash
cd /home/seu-usuario/public_html/pfo-ronda/backend
npx prisma generate
```

**OU:**

```bash
cd public_html/pfo-ronda/backend
npm run generate
```

**⚠️ IMPORTANTE - Binary Targets do Prisma:**

O Prisma já está configurado para gerar os binários corretos para CentOS/RHEL. No arquivo `prisma/schema.prisma`, está definido:

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "client"
  binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x"]
}
```

Isso garante que o Prisma funcione tanto no seu PC (desenvolvimento) quanto no servidor cPanel (produção CentOS).

**Se der erro de "Prisma engine not found":**

1. Verifique a versão do OpenSSL no servidor:
   ```bash
   openssl version
   ```

2. Se necessário, ajuste o `binaryTargets` no schema.prisma conforme a versão do OpenSSL

---

## 🌐 PARTE 4: Configurar Node.js no cPanel

### 4.1 Criar Aplicação Node.js

1. No cPanel, acesse **Setup Node.js App** (ou "Aplicativos Node.js")
2. Clique em **Create Application**
3. Preencha:
   - **Node.js version**: Selecione a versão mais recente (18.x ou 20.x)
   - **Application mode**: `Production`
   - **Application root**: `pfo-ronda/backend`
   - **Application URL**: `lmedu.com.br/pfo-ronda/api` (ou deixe em branco)
   - **Application startup file**: `dist/server.js`
   - **Port**: `3001` (ou a porta que você configurou)

4. Clique em **Create**

### 4.2 Variáveis de Ambiente (Opcional)

Se o cPanel permitir, adicione as variáveis de ambiente:
- `NODE_ENV=production`
- `PORT=3001`
- `BASE_PATH=/pfo-ronda`

**Caso contrário, elas já estão no arquivo `.env`**

### 4.3 Iniciar Aplicação

1. Na lista de aplicações Node.js, localize sua app
2. Clique em **Start** ou **Restart**
3. Verifique se o status está **Running**

---

## 🔧 PARTE 5: Configurar Proxy no Apache (.htaccess)

### 5.1 Atualizar .htaccess na raiz do domínio

**Caminho**: `/public_html/.htaccess`

Adicione **ANTES** de qualquer outra regra:

```apache
# Proxy para API do backend (Node.js)
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/pfo-ronda/api
RewriteRule ^pfo-ronda/api/(.*)$ http://localhost:3001/pfo-ronda/api/$1 [P,L]
```

**OU**, se não funcionar, tente:

```apache
<IfModule mod_proxy.c>
  ProxyPreserveHost On
  ProxyPass /pfo-ronda/api http://localhost:3001/pfo-ronda/api
  ProxyPassReverse /pfo-ronda/api http://localhost:3001/pfo-ronda/api
</IfModule>
```

### 5.2 Verificar .htaccess do Frontend

**Caminho**: `/public_html/pfo-ronda/.htaccess`

Deve conter (já está no build):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /pfo-ronda/

  # Redireciona /pfo-donda para /pfo-ronda/
  RewriteCond %{REQUEST_URI} ^/pfo-donda(/.*)?$
  RewriteRule ^(.*)$ /pfo-ronda/$1 [R=301,L]

  # Se o arquivo ou diretório requisitado existe, serve-o diretamente
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Caso contrário, redireciona para index.html
  RewriteRule . /pfo-ronda/index.html [L]
</IfModule>
```

---

## ✅ PARTE 6: Testar Deploy

### 6.1 Testar Backend

**Via SSH ou cPanel Terminal:**

```bash
curl http://localhost:3001/pfo-ronda/api/health
```

**Ou no navegador:**
```
https://lmedu.com.br/pfo-ronda/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "API de Rondas funcionando!",
  "environment": "production",
  "basePath": "/pfo-ronda"
}
```

### 6.2 Testar Frontend

Acesse no navegador:
- ✅ `https://lmedu.com.br/pfo-ronda/`
- ✅ `https://lmedu.com.br/pfo-donda/` (deve redirecionar para /pfo-ronda/)

### 6.3 Testar Login

1. Acesse `https://lmedu.com.br/pfo-ronda/`
2. Faça login com suas credenciais
3. Se funcionar, **deploy completo!** 🎉

---

## 🔄 PARTE 7: Atualizações Futuras

### 7.1 Atualizar Frontend

```bash
# No seu PC
npm run build

# No cPanel, delete os arquivos antigos em /pfo-ronda/
# Faça upload dos novos arquivos de dist/
```

### 7.2 Atualizar Backend

```bash
# No seu PC
cd backend
npm run build

# No cPanel, faça upload de backend/dist/

# Via SSH, reinicie a aplicação:
cd /home/seu-usuario/public_html/pfo-ronda/backend
# Reinicie via cPanel Node.js App Manager
```

---

## 🐛 Troubleshooting

### ❌ Backend não inicia

1. **Verifique logs no cPanel:**
   - Acesse **Setup Node.js App**
   - Clique em **Show Log** na sua aplicação

2. **Verifique se o arquivo startup existe:**
   ```bash
   ls -la /home/seu-usuario/public_html/pfo-ronda/backend/dist/server.js
   ```

3. **Verifique permissões:**
   ```bash
   chmod -R 755 /home/seu-usuario/public_html/pfo-ronda/backend/
   ```

### ❌ Erro 502 Bad Gateway

1. **Verifique se a aplicação Node.js está rodando:**
   - No cPanel: **Setup Node.js App** → Status deve estar "Running"

2. **Verifique a porta:**
   - Certifique-se de que a porta no `.env` é a mesma configurada no cPanel

3. **Reinicie a aplicação:**
   - No cPanel: **Setup Node.js App** → **Restart**

### ❌ Frontend mostra página em branco

1. **Verifique se os arquivos estão na pasta correta:**
   - `index.html` deve estar em `/pfo-ronda/`, NÃO em `/pfo-ronda/dist/`

2. **Verifique o console do navegador (F12)**

3. **Verifique se o `.htaccess` está presente**

### ❌ API retorna 404

1. **Verifique o proxy no `.htaccess` da raiz**
2. **Verifique se a aplicação Node.js está rodando**
3. **Teste diretamente:**
   ```bash
   curl http://localhost:3001/pfo-ronda/api/health
   ```

### ❌ Erro de conexão com banco de dados

1. **Verifique se o IP do servidor está na whitelist do PostgreSQL**
2. **Teste a conexão via SSH:**
   ```bash
   psql "postgresql://lovable:senha@35.199.101.38:5432/liberdade-medica"
   ```
3. **Verifique o arquivo `.env` no backend**

### ❌ Erro "Prisma engine not found" ou "Query engine library not found"

Este erro acontece quando o Prisma não encontra o binário correto para o sistema operacional do servidor.

**Solução:**

1. **Verifique a versão do OpenSSL no servidor:**
   ```bash
   openssl version
   ```

   Exemplo de saída:
   - `OpenSSL 1.0.2k-fips` → use `rhel-openssl-1.0.x`
   - `OpenSSL 1.1.1g` → use `rhel-openssl-1.1.x`
   - `OpenSSL 3.0.7` → use `rhel-openssl-3.0.x`

2. **Atualize o `prisma/schema.prisma` com o binaryTarget correto:**
   ```prisma
   generator client {
     provider = "prisma-client-js"
     binaryTargets = ["native", "rhel-openssl-1.1.x"]  // ajuste conforme sua versão
   }
   ```

3. **Regenere o Prisma Client:**
   ```bash
   cd public_html/pfo-ronda/backend
   npx prisma generate
   ```

4. **Reinicie a aplicação Node.js**

**Nota:** O schema.prisma já vem com múltiplos targets configurados, então geralmente isso não é necessário.

### ❌ Erro ao executar "npm run generate" ou "npx prisma generate"

Se o comando `npx prisma generate` falhar com erro interno do Prisma:

**Solução Alternativa:**

1. **Use o script manual de geração:**
   ```bash
   cd public_html/pfo-ronda/backend
   node generate-prisma.js
   ```

2. **Ou execute diretamente:**
   ```bash
   cd public_html/pfo-ronda/backend
   node node_modules/@prisma/client/generator-build/index.js generate --schema=./prisma/schema.prisma
   ```

3. **Verifique a versão do Node.js:**
   ```bash
   node --version
   ```

   - Recomendado: Node.js 18.x ou 20.x
   - Se estiver usando Node.js 19.x, tente mudar para 18.x ou 20.x no cPanel

4. **Se ainda assim não funcionar, gere o Prisma Client localmente e faça upload:**
   ```bash
   # No seu PC (Windows/Mac):
   cd backend
   npm run generate

   # Faça upload da pasta node_modules/.prisma/ para o cPanel
   # Caminho no cPanel: /pfo-ronda/backend/node_modules/.prisma/
   ```

---

## 📝 Comandos Úteis no cPanel

```bash
# Navegar para o backend
cd public_html/pfo-ronda/backend

# Instalar dependências
npm i

# Gerar Prisma
npm run generate

# Ver logs (se disponível)
tail -f logs/application.log

# Verificar se o servidor está rodando
ps aux | grep node

# Testar API
curl http://localhost:3001/pfo-ronda/api/health
```

---

## 🎯 Checklist de Deploy cPanel

- [ ] Build do frontend (`npm run build`)
- [ ] Build do backend (`cd backend && npm run build`)
- [ ] Upload do conteúdo de `dist/` para `/pfo-ronda/` (SEM pasta dist!)
- [ ] Upload do `backend/` para `/pfo-ronda/backend/` (incluindo `prisma/schema.prisma`)
- [ ] Criar `.env` de produção em `/pfo-ronda/backend/.env`
- [ ] Instalar dependências (`npm i` via SSH/Terminal)
- [ ] Gerar Prisma com binary targets corretos (`npm run generate`)
- [ ] Verificar se Prisma Client foi gerado corretamente
- [ ] Configurar Node.js App no cPanel
- [ ] Iniciar aplicação Node.js
- [ ] Configurar proxy no `.htaccess` raiz
- [ ] Verificar `.htaccess` do frontend em `/pfo-ronda/`
- [ ] Testar `/pfo-ronda/api/health`
- [ ] Testar frontend em `/pfo-ronda/`
- [ ] Testar login
- [ ] Verificar redirecionamento `/pfo-donda` → `/pfo-ronda`

---

## 💡 Dicas Importantes

1. **Não faça upload do `node_modules/`** - Instale via `npm i` no servidor
2. **Não faça upload do `src/`** do backend - Só precisa do `dist/`
3. **Sempre teste o health endpoint** antes de testar o frontend
4. **Use HTTPS** em produção para segurança
5. **Mantenha o `.env` seguro** - Nunca commite no git
6. **Reinicie a app Node.js** após qualquer mudança no backend

---

**🎉 Deploy no cPanel Completo!**

**URLs Finais:**
- Frontend: `https://lmedu.com.br/pfo-ronda/`
- API: `https://lmedu.com.br/pfo-ronda/api/health`
- Alias: `https://lmedu.com.br/pfo-donda/` → `/pfo-ronda/`
