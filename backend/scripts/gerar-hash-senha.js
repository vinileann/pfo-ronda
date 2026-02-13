// Script para gerar hash bcrypt de senha
// Uso: node backend/scripts/gerar-hash-senha.js sua_senha

import bcrypt from 'bcryptjs';

const senha = process.argv[2];

if (!senha) {
  console.error('❌ Erro: Forneça uma senha como argumento');
  console.log('Uso: node gerar-hash-senha.js sua_senha');
  process.exit(1);
}

const hash = bcrypt.hashSync(senha, 10);

console.log('\n✅ Hash gerado com sucesso!\n');
console.log('Senha original:', senha);
console.log('Hash bcrypt:', hash);
console.log('\nUse este hash no campo "senha" da tabela apps_usuarios\n');
