import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        console.log('🔍 Testando conexão com o banco de dados...');
        // Testa a conexão
        await prisma.$connect();
        console.log('✅ Conexão estabelecida com sucesso!');
        // Testa uma query simples
        console.log('\n🔍 Testando query no banco...');
        const count = await prisma.appsUsuarios.count();
        console.log(`✅ Query executada com sucesso! Total de usuários: ${count}`);
        console.log('\n✅ Configuração do banco concluída!');
        console.log('\n⚠️  IMPORTANTE: Agora execute "npx prisma migrate deploy" para aplicar as migrations.');
    }
    catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:');
        console.error(error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
