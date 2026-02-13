-- Script para criar um usuário de teste no banco de dados
-- Execute este script no PostgreSQL para criar um usuário de teste

-- IMPORTANTE: A senha será 'teste123' (hash bcrypt já gerado)
-- Em produção, SEMPRE use senhas fortes!

INSERT INTO lovable.apps_usuarios (
    id,
    nome,
    email,
    login,
    senha,
    cargo,
    ronda,
    data_criacao
) VALUES (
    gen_random_uuid()::text,
    'Usuário Teste',
    'teste@exemplo.com',
    'teste',
    '$2a$10$YourBcryptHashHere', -- Substitua por um hash bcrypt real da senha
    'Médico',
    true,
    CURRENT_DATE
);

-- Para gerar o hash bcrypt da senha, você pode usar Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('sua_senha', 10);
-- console.log(hash);

-- Ou use este script Node.js:
-- node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('teste123', 10));"
