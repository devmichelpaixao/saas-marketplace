const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('  GERADOR DE HASH PARA SUPER ADMIN');
console.log('========================================');
console.log('');

rl.question('Digite a senha para o Super Admin: ', (senha) => {
  if (!senha || senha.length < 8) {
    console.log('');
    console.log('❌ Erro: A senha deve ter no mínimo 8 caracteres!');
    rl.close();
    process.exit(1);
  }

  console.log('');
  console.log('🔐 Gerando hash...');
  console.log('');
  
  const hash = bcrypt.hashSync(senha, 10);
  
  console.log('✅ Hash gerado com sucesso!');
  console.log('');
  console.log('========================================');
  console.log('HASH GERADO:');
  console.log('========================================');
  console.log(hash);
  console.log('');
  console.log('========================================');
  console.log('SQL PARA EXECUTAR NO POSTGRESQL:');
  console.log('========================================');
  console.log('');
  console.log(`INSERT INTO users (
    id, "tenantId", email, password, name, role, active, "createdAt", "updatedAt"
)
VALUES (
    gen_random_uuid(),
    NULL,
    'superadmin@sistema.com',
    '${hash}',
    'Super Administrador',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
);`);
  console.log('');
  console.log('========================================');
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   1. Copie o SQL acima');
  console.log('   2. Execute no PostgreSQL');
  console.log('   3. Use o email: superadmin@sistema.com');
  console.log('   4. Use a senha que você digitou');
  console.log('');
  
  rl.close();
});
