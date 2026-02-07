const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('\n========================================');
    console.log('   CRIANDO SUPER ADMIN NO BANCO');
    console.log('========================================\n');

    const senha = 'SuperAdmin@2024';
    const hash = bcrypt.hashSync(senha, 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@sistema.com',
        password: hash,
        name: 'Super Administrador',
        role: 'SUPER_ADMIN',
        active: true,
        tenantId: null
      }
    });

    console.log('✅ SUPER ADMIN CRIADO COM SUCESSO!\n');
    console.log('========================================');
    console.log('DADOS DO SUPER ADMIN:');
    console.log('========================================');
    console.log('ID:', superAdmin.id);
    console.log('Email:', superAdmin.email);
    console.log('Nome:', superAdmin.name);
    console.log('Role:', superAdmin.role);
    console.log('TenantId:', superAdmin.tenantId || 'NULL ✅');
    console.log('Ativo:', superAdmin.active);
    console.log('\n========================================');
    console.log('CREDENCIAIS DE ACESSO:');
    console.log('========================================');
    console.log('Email: superadmin@sistema.com');
    console.log('Senha: SuperAdmin@2024');
    console.log('URL Admin: http://localhost:5175');
    console.log('========================================\n');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO ao criar super admin:', error.message);
    
    if (error.code === 'P2002') {
      console.error('\n⚠️  Super admin já existe no banco!');
      console.error('Email: superadmin@sistema.com já está cadastrado.\n');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

createSuperAdmin();
