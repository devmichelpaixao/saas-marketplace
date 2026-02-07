import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Criando tenant e usuário Super Admin...')

  // Buscar plano Starter (mais barato) para o tenant da plataforma
  const starterPlan = await prisma.plan.findFirst({
    orderBy: { price: 'asc' }
  })

  if (!starterPlan) {
    throw new Error('Nenhum plano encontrado. Execute o seed principal primeiro.')
  }

  // Criar tenant especial para a plataforma
  const platformTenant = await prisma.tenant.upsert({
    where: { subdomain: 'platform' },
    update: {
      name: 'Plataforma',
      active: true,
      updatedAt: new Date()
    },
    create: {
      id: 'tenant-platform',
      name: 'Plataforma',
      subdomain: 'platform',
      active: true,
      updatedAt: new Date()
    }
  })

  console.log('✅ Tenant da plataforma criado:', platformTenant.subdomain)

  // Criar subscription para o tenant (obrigatório)
  await prisma.subscription.upsert({
    where: { tenantId: platformTenant.id },
    update: {},
    create: {
      id: `sub-${platformTenant.id}`,
      tenantId: platformTenant.id,
      planId: starterPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      updatedAt: new Date()
    }
  })

  console.log('✅ Subscription criada para a plataforma')

  // Hash da senha
  const hashedPassword = await bcrypt.hash('superadmin123', 10)

  // Criar Super Admin
  const superAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: platformTenant.id,
        email: 'superadmin@plataforma.com'
      }
    },
    update: {
      password: hashedPassword,
      active: true,
      role: 'SUPER_ADMIN'
    },
    create: {
      id: `user-superadmin`,
      tenantId: platformTenant.id,
      email: 'superadmin@plataforma.com',
      password: hashedPassword,
      name: 'Super Administrador',
      role: 'SUPER_ADMIN',
      active: true
    }
  })

  console.log('✅ Super Admin criado/atualizado:', {
    email: superAdmin.email,
    name: superAdmin.name,
    role: superAdmin.role
  })

  console.log('\n📋 Credenciais de acesso:')
  console.log('Email: superadmin@plataforma.com')
  console.log('Senha: superadmin123')
  console.log('\n🔐 Use estas credenciais para acessar o painel Super Admin')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
