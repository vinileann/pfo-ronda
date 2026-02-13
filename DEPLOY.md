# 🚀 Guia de Deploy - Rondagem de Novinhos

## 📋 Pré-requisitos

- Node.js instalado no servidor
- Acesso SSH ao servidor
- Apache configurado
- PostgreSQL acessível

---

## 🏗️ 1. Build do Projeto

### Frontend

```bash
# No diretório raiz do projeto
npm install
npm run build
```

Isso vai gerar a pasta `dist/` com os arquivos estáticos.

### Backend

```bash
cd backend
npm install
npm run build
npm run generate
```

Isso vai:
- Instalar dependências
- Compilar TypeScript para JavaScript (pasta `dist/`)
- Gerar os tipos do Prisma

**⚠️ IMPORTANTE - Binary Targets do Prisma:**

O arquivo `prisma/schema.prisma` está configurado com múltiplos binary targets para garantir compatibilidade entre desenvolvimento e produção:

```prisma
generator client {
  provider = "prisma-client-js"
  engineType = "client"
  binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x"]
}
```

- `native`: para o seu PC (Windows/Mac/Linux)
- `rhel-openssl-*`: para servidores CentOS/RHEL com diferentes versões de OpenSSL

Se você estiver deployando em outro sistema operacional (Debian, Ubuntu, Alpine), pode ser necessário ajustar os binary targets. Consulte: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options

---

## ⚙️ 2. Configuração do Backend em Produção

### Criar arquivo `.env` no servidor

No servidor, em `/caminho/para/backend/.env`:

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

---

## 📦 3. Upload dos Arquivos

### Frontend

Upload da pasta `dist/` para:
```
/var/www/html/lmedu.com.br/pfo-ronda/
```

Estrutura final:
```
/var/www/html/lmedu.com.br/pfo-ronda/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── logo-branca.svg
├── logo-vinho.svg
└── .htaccess
```

### Backend

Upload da pasta `backend/` para o servidor:
```
/var/www/rondagem-backend/
├── dist/           # JavaScript compilado
├── node_modules/   # Dependências (ou rodar npm install no servidor)
├── prisma/
├── .env           # Arquivo de produção
└── package.json
```

---

## 🌐 4. Configuração do Apache

### Arquivo `.htaccess` (já está em `dist/.htaccess`)

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

### Configuração do VirtualHost (Apache)

Adicione ao VirtualHost de `lmedu.com.br`:

```apache
# Proxy para API do backend
ProxyPass /pfo-ronda/api http://localhost:3001/pfo-ronda/api
ProxyPassReverse /pfo-ronda/api http://localhost:3001/pfo-ronda/api
```

Ou, se preferir usar Nginx:

```nginx
location /pfo-ronda/api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 🔄 5. Iniciar o Backend em Produção

### Opção 1: PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
cd /var/www/rondagem-backend
pm2 start dist/server.js --name "rondagem-api"

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Ver logs
pm2 logs rondagem-api

# Reiniciar
pm2 restart rondagem-api
```

### Opção 2: Systemd Service

Criar arquivo `/etc/systemd/system/rondagem-api.service`:

```ini
[Unit]
Description=Rondagem API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/rondagem-backend
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Ativar e iniciar:

```bash
sudo systemctl enable rondagem-api
sudo systemctl start rondagem-api
sudo systemctl status rondagem-api
```

---

## ✅ 6. Verificação

### Testar Backend

```bash
curl http://localhost:3001/pfo-ronda/api/health
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

### Testar Frontend

Acesse:
- https://lmedu.com.br/pfo-ronda/
- https://lmedu.com.br/pfo-donda/ (deve redirecionar para /pfo-ronda/)

---

## 🔧 7. Troubleshooting

### Backend não inicia

```bash
# Verificar logs do PM2
pm2 logs rondagem-api

# Ou systemd
sudo journalctl -u rondagem-api -f
```

### Erro de conexão com banco

1. Verificar se o IP do servidor está na whitelist do PostgreSQL
2. Testar conexão manualmente:
   ```bash
   psql "postgresql://lovable:senha@35.199.101.38:5432/liberdade-medica"
   ```

### Frontend não carrega assets

1. Verificar se o `.htaccess` está na pasta `/pfo-ronda/`
2. Verificar permissões dos arquivos:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/lmedu.com.br/pfo-ronda/
   sudo chmod -R 755 /var/www/html/lmedu.com.br/pfo-ronda/
   ```

### API retorna 502 Bad Gateway

1. Verificar se o backend está rodando:
   ```bash
   pm2 status
   ```
2. Verificar se o Apache/Nginx está fazendo proxy corretamente
3. Verificar firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 3001
   ```

---

## 📊 Estrutura Final no Servidor

```
Servidor (lmedu.com.br)
│
├── Frontend (Apache/Nginx serve arquivos estáticos)
│   /var/www/html/lmedu.com.br/pfo-ronda/
│   └── index.html, assets/, .htaccess
│
├── Backend (Node.js rodando na porta 3001)
│   /var/www/rondagem-backend/
│   └── dist/, node_modules/, .env
│
└── Proxy (Apache/Nginx)
    /pfo-ronda/api → localhost:3001/pfo-ronda/api
```

---

## 🔒 Segurança

1. **HTTPS**: Certifique-se de que o site usa HTTPS
2. **Firewall**: Apenas a porta 443/80 deve estar aberta (3001 deve ser interno)
3. **Variáveis de ambiente**: Nunca commitar `.env` no git
4. **JWT_SECRET**: Use uma chave forte e única

---

## 📝 Comandos Úteis

```bash
# Ver status do PM2
pm2 status

# Reiniciar API
pm2 restart rondagem-api

# Ver logs em tempo real
pm2 logs rondagem-api --lines 100

# Rebuild do frontend
npm run build

# Rebuild do backend
cd backend && npm run build

# Testar conexão com API
curl http://localhost:3001/pfo-ronda/api/health
```

---

## 🎯 Checklist de Deploy

- [ ] Build do frontend (`npm run build`)
- [ ] Build do backend (`cd backend && npm run build`)
- [ ] Upload dos arquivos do frontend para `/pfo-ronda/`
- [ ] Upload do backend para o servidor
- [ ] Criar arquivo `.env` de produção no backend
- [ ] Instalar dependências no servidor (`npm install --production`)
- [ ] Gerar tipos do Prisma (`npm run generate`)
- [ ] Configurar proxy no Apache/Nginx
- [ ] Iniciar backend com PM2 ou systemd
- [ ] Testar endpoint `/api/health`
- [ ] Testar login no frontend
- [ ] Verificar redirecionamento `/pfo-donda` → `/pfo-ronda`
- [ ] Configurar SSL/HTTPS
- [ ] Configurar PM2 para iniciar no boot (`pm2 startup && pm2 save`)

---

**🎉 Deploy Completo!**
