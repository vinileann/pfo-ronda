#!/usr/bin/env node

/**
 * Script de Verificação de Saúde
 * Execute: node check-health.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🏥 Verificação de Saúde do Backend\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let errors = 0;
let warnings = 0;

// 1. Verificar arquivos essenciais
console.log('📂 Verificando arquivos essenciais...');

const requiredFiles = [
  { path: 'package.json', critical: true },
  { path: '.env', critical: true },
  { path: 'dist/server.js', critical: true },
  { path: 'prisma/schema.prisma', critical: true },
];

requiredFiles.forEach(({ path, critical }) => {
  const fullPath = join(__dirname, path);
  if (existsSync(fullPath)) {
    console.log(`   ✅ ${path}`);
  } else {
    if (critical) {
      console.log(`   ❌ ${path} (OBRIGATÓRIO)`);
      errors++;
    } else {
      console.log(`   ⚠️  ${path} (Recomendado)`);
      warnings++;
    }
  }
});

console.log('');

// 2. Verificar variáveis de ambiente
console.log('⚙️  Verificando variáveis de ambiente...');

if (existsSync(join(__dirname, '.env'))) {
  const envContent = await import('fs').then(fs =>
    fs.promises.readFile(join(__dirname, '.env'), 'utf-8')
  );

  const requiredEnvVars = [
    'DATABASE_URL',
    'PORT',
    'JWT_SECRET',
    'NODE_ENV',
    'BASE_PATH',
    'CORS_ORIGIN'
  ];

  requiredEnvVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      console.log(`   ✅ ${varName}`);
    } else {
      console.log(`   ❌ ${varName} (NÃO DEFINIDO)`);
      errors++;
    }
  });
} else {
  console.log('   ❌ Arquivo .env não encontrado');
  errors++;
}

console.log('');

// 3. Verificar node_modules
console.log('📦 Verificando dependências...');

if (existsSync(join(__dirname, 'node_modules'))) {
  console.log('   ✅ node_modules/ existe');

  // Verificar dependências críticas
  const criticalDeps = [
    '@prisma/client',
    'express',
    'cors',
    'dotenv'
  ];

  criticalDeps.forEach(dep => {
    if (existsSync(join(__dirname, 'node_modules', dep))) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} (NÃO INSTALADO)`);
      errors++;
    }
  });
} else {
  console.log('   ❌ node_modules/ não encontrado');
  console.log('   Execute: npm install');
  errors++;
}

console.log('');

// 4. Testar import do servidor
console.log('🔧 Verificando build...');

try {
  const serverPath = join(__dirname, 'dist', 'server.js');
  if (existsSync(serverPath)) {
    console.log('   ✅ dist/server.js encontrado');
  } else {
    console.log('   ❌ dist/server.js não encontrado');
    console.log('   Execute: npm run build');
    errors++;
  }
} catch (error) {
  console.log(`   ❌ Erro ao verificar build: ${error.message}`);
  errors++;
}

console.log('');

// 5. Verificar configuração do Prisma
console.log('🔍 Verificando Prisma...');

// Verificar OpenSSL
try {
  const fs = await import('fs');
  const { execSync } = await import('child_process');

  const opensslVersion = execSync('openssl version', { encoding: 'utf-8' });
  console.log(`   ℹ️  OpenSSL: ${opensslVersion.trim()}`);

  // Verificar se Prisma Client foi gerado
  const prismaClientPath = join(__dirname, 'node_modules', '.prisma', 'client');
  if (existsSync(prismaClientPath)) {
    console.log('   ✅ Prisma Client gerado');
  } else {
    console.log('   ⚠️  Prisma Client não encontrado');
    console.log('   Execute: npx prisma generate');
    warnings++;
  }
} catch (error) {
  console.log('   ⚠️  Não foi possível verificar Prisma');
  warnings++;
}

console.log('');

// 6. Testar conexão com banco (opcional)
console.log('🔌 Testando conexão com banco de dados...');

try {
  // Carregar .env
  const dotenv = await import('dotenv');
  dotenv.config({ path: join(__dirname, '.env') });

  const { default: prisma } = await import('./dist/lib/prisma.js');

  await prisma.$connect();
  console.log('   ✅ Conectado ao banco de dados');

  await prisma.$queryRaw`SELECT 1`;
  console.log('   ✅ Query de teste executada');

  await prisma.$disconnect();
  console.log('   ✅ Desconectado com sucesso');
} catch (error) {
  console.log(`   ⚠️  Não foi possível conectar ao banco`);
  console.log(`   Erro: ${error.message}`);
  warnings++;
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Resultado final
if (errors === 0 && warnings === 0) {
  console.log('🎉 Tudo OK! Backend pronto para produção!\n');
  process.exit(0);
} else if (errors === 0) {
  console.log(`⚠️  ${warnings} aviso(s) encontrado(s)`);
  console.log('   O backend pode funcionar, mas verifique os avisos.\n');
  process.exit(0);
} else {
  console.log(`❌ ${errors} erro(s) crítico(s) encontrado(s)`);
  console.log(`⚠️  ${warnings} aviso(s) encontrado(s)`);
  console.log('\n   Corrija os erros antes de fazer deploy!\n');
  process.exit(1);
}
