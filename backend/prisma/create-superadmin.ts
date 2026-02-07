import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createSuperAdmin() {
  console.log('\n🔐 CRIAÇÃO DE SUPER ADMIN DA PLATAFORMA SAAS\n');
  console.log('Este usuário terá acesso total a todos os tenants.\n');

  try {
    // Verificar se já existe um Super Admin
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Já existe um Super Admin cadastrado!');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Nome: ${existingSuperAdmin.name}\n`);
      
      const confirm = await question('Deseja criar outro Super Admin? (s/n): ');
      if (confirm.toLowerCase() !== 's') {
        console.log('\n❌ Operação cancelada.\n');
        rl.close();
        await prisma.$disconnect();
        process.exit(0);
      }
    }

    // Buscar ou criar tenant "platform" para o Super Admin
    let platformTenant = await prisma.tenant.findFirst({
      where: { subdomain: 'platform' }
    });

    if (!platformTenant) {
      console.log('\n📦 Criando tenant da plataforma...');
      platformTenant = await prisma.tenant.create({
        data: {
          id: 'tenant-platform',
          name: 'SaaS Platform',
          subdomain: 'platform',
          active: true
        }
      });
      console.log('✅ Tenant da plataforma criado!\n');
    }

    // Coletar informações do Super Admin
    const name = await question('Nome do Super Admin: ');
    const email = await question('Email: ');
    const password = await question('Senha: ');

    // Verificar se o email já existe
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      console.log('\n❌ Erro: Este email já está em uso!\n');
      rl.close();
      await prisma.$disconnect();
      process.exit(1);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar Super Admin
    const superAdmin = await prisma.user.create({
      data: {
        tenantId: platformTenant.id,
        name,
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true
      }
    });

    console.log('\n✅ Super Admin criado com sucesso!\n');
    console.log('📋 INFORMAÇÕES DE ACESSO:');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Nome: ${superAdmin.name}`);
    console.log(`   Role: SUPER_ADMIN`);
    console.log(`   ID: ${superAdmin.id}\n`);
    console.log('🌐 Para acessar o painel de Super Admin:');
    console.log('   URL: http://localhost:5173/superadmin');
    console.log('   Login: Use o email e senha cadastrados\n');

  } catch (error) {
    console.error('\n❌ Erro ao criar Super Admin:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createSuperAdmin();
