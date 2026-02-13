#!/usr/bin/env node

/**
 * Script Alternativo para Gerar Prisma Client
 * Use este script se "npm run generate" ou "npx prisma generate" falhar
 * Execute: node generate-prisma.js
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Gerando Prisma Client (método alternativo)...\n');

// Verificar se o schema.prisma existe
const schemaPath = join(__dirname, 'prisma', 'schema.prisma');
if (!existsSync(schemaPath)) {
  console.error('❌ Erro: prisma/schema.prisma não encontrado!');
  process.exit(1);
}

console.log('   ✅ Schema encontrado:', schemaPath);

// Verificar versão do Node.js
const nodeVersion = process.version;
console.log(`   ℹ️  Node.js: ${nodeVersion}`);

const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion === 19) {
  console.warn('   ⚠️  AVISO: Node.js 19.x pode ter problemas com Prisma');
  console.warn('   Recomendado: Node.js 18.x ou 20.x');
  console.warn('   Se der erro, mude a versão do Node.js no cPanel\n');
} else if (majorVersion >= 18) {
  console.log('   ✅ Versão do Node.js compatível\n');
}

// Verificar se Prisma CLI está instalado
const prismaCliPath = join(__dirname, 'node_modules', '.bin', 'prisma');
const prismaCliExists = existsSync(prismaCliPath) || existsSync(prismaCliPath + '.cmd');

if (!prismaCliExists) {
  console.error('❌ Erro: Prisma CLI não encontrado em node_modules/.bin/');
  console.error('   Execute primeiro: npm install');
  process.exit(1);
}

console.log('   ✅ Prisma CLI encontrado\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Métodos de geração (em ordem de preferência)
const methods = [
  {
    name: 'Método 1: npx prisma generate',
    command: 'npx prisma generate'
  },
  {
    name: 'Método 2: node_modules/.bin/prisma generate',
    command: process.platform === 'win32'
      ? 'node_modules\\.bin\\prisma.cmd generate'
      : 'node_modules/.bin/prisma generate'
  },
  {
    name: 'Método 3: node com Prisma CLI',
    command: 'node node_modules/prisma/build/index.js generate'
  }
];

let success = false;

for (let i = 0; i < methods.length && !success; i++) {
  const method = methods[i];
  console.log(`📝 Tentando: ${method.name}`);

  try {
    execSync(method.command, {
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        PRISMA_GENERATE_SKIP_AUTOINSTALL: 'true' // Evita tentativas de auto-install
      }
    });

    console.log(`\n✅ Sucesso com ${method.name}!\n`);
    success = true;
  } catch (error) {
    console.error(`\n❌ Falhou com ${method.name}`);
    if (i < methods.length - 1) {
      console.log('   Tentando próximo método...\n');
    }
  }
}

if (!success) {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ Todos os métodos falharam!\n');
  console.error('💡 Soluções possíveis:');
  console.error('   1. Mude a versão do Node.js no cPanel para 18.x ou 20.x');
  console.error('   2. Execute "npm install" novamente');
  console.error('   3. Gere o Prisma Client no seu PC e faça upload:');
  console.error('      - No PC: cd backend && npm run generate');
  console.error('      - Upload: backend/node_modules/.prisma/ → cPanel');
  console.error('\n');
  process.exit(1);
}

// Verificar se o Prisma Client foi gerado
const prismaClientPath = join(__dirname, 'node_modules', '.prisma', 'client');
if (existsSync(prismaClientPath)) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Prisma Client gerado com sucesso!');
  console.log(`📁 Localização: ${prismaClientPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
} else {
  console.warn('\n⚠️  AVISO: Prisma Client pode não ter sido gerado corretamente');
  console.warn(`   Pasta esperada não encontrada: ${prismaClientPath}\n`);
  process.exit(1);
}
