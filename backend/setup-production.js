#!/usr/bin/env node

/**
 * Script de Setup para Produção (cPanel)
 * Execute: node setup-production.js
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando setup de produção...\n');

// 1. Verificar se está na pasta backend
console.log('📂 Verificando diretório...');
if (!existsSync(join(__dirname, 'package.json'))) {
  console.error('❌ Erro: Execute este script na pasta backend/');
  process.exit(1);
}
console.log('✅ Diretório correto\n');

// 2. Verificar se .env existe
console.log('📄 Verificando arquivo .env...');
if (!existsSync(join(__dirname, '.env'))) {
  console.error('❌ Erro: Arquivo .env não encontrado!');
  console.error('   Crie o arquivo .env com as configurações de produção.');
  process.exit(1);
}
console.log('✅ Arquivo .env encontrado\n');

// 3. Instalar dependências
console.log('📦 Instalando dependências...');
try {
  execSync('npm install --production', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Dependências instaladas\n');
} catch (error) {
  console.error('❌ Erro ao instalar dependências');
  process.exit(1);
}

// 4. Verificar OpenSSL (importante para Prisma binary targets)
console.log('🔍 Verificando versão do OpenSSL...');
try {
  const opensslVersion = execSync('openssl version', { encoding: 'utf-8', cwd: __dirname });
  console.log(`   Versão: ${opensslVersion.trim()}`);

  if (opensslVersion.includes('1.0')) {
    console.log('   ℹ️  Binary target recomendado: rhel-openssl-1.0.x');
  } else if (opensslVersion.includes('1.1')) {
    console.log('   ℹ️  Binary target recomendado: rhel-openssl-1.1.x');
  } else if (opensslVersion.includes('3.0')) {
    console.log('   ℹ️  Binary target recomendado: rhel-openssl-3.0.x');
  }
  console.log('');
} catch (error) {
  console.log('   ⚠️  Não foi possível detectar a versão do OpenSSL');
  console.log('   Execute manualmente: openssl version\n');
}

// 5. Gerar Prisma Client
console.log('🔧 Gerando Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Prisma Client gerado\n');
} catch (error) {
  console.error('❌ Erro ao gerar Prisma Client');
  console.error('   Se o erro for "engine not found", verifique o binaryTarget no schema.prisma');
  process.exit(1);
}

// 6. Verificar se dist/ existe
console.log('📁 Verificando build...');
if (!existsSync(join(__dirname, 'dist', 'server.js'))) {
  console.error('❌ Erro: Arquivo dist/server.js não encontrado!');
  console.error('   Execute "npm run build" antes de fazer o upload.');
  process.exit(1);
}
console.log('✅ Build encontrado\n');

// 7. Testar conexão com banco (opcional)
console.log('🔌 Testando conexão com banco de dados...');
console.log('   (Você pode pular este teste pressionando Ctrl+C)\n');

try {
  const { default: prisma } = await import('./dist/lib/prisma.js');

  await prisma.$connect();
  console.log('✅ Conectado ao banco de dados');

  await prisma.$queryRaw`SELECT 1`;
  console.log('✅ Query de teste executada com sucesso');

  await prisma.$disconnect();
  console.log('✅ Desconectado do banco\n');
} catch (error) {
  console.error('⚠️  Aviso: Não foi possível conectar ao banco de dados');
  console.error(`   Erro: ${error.message}`);
  console.error('   Verifique o DATABASE_URL no arquivo .env\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 Setup concluído com sucesso!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📝 Próximos passos:');
console.log('   1. Configure o Node.js App no cPanel');
console.log('   2. Defina o startup file como: dist/server.js');
console.log('   3. Inicie a aplicação\n');
console.log('🔗 Teste: http://localhost:3001/pfo-ronda/api/health\n');
