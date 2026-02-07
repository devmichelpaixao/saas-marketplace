import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Criar plano
  const plan = await prisma.plans.upsert({
    where: { name: 'Starter' },
    update: {},
    create: {
      name: 'Starter',
      description: 'Plano inicial perfeito para começar',
      price: 149.00,
      maxUsers: 2,
      maxProducts: 50,
      maxOrdersPerMonth: 300,
      features: {},
      active: true
    }
  })
  console.log('✅ Plano criado')

  // 2. Criar tenant demo
  const tenant = await prisma.tenants.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      id: 'tenant-demo',
      name: 'Empresa Demo',
      subdomain: 'demo',
      active: true
    }
  })
  console.log('✅ Tenant criado')

  // 3. Criar subscription
  const endDate = new Date()
  endDate.setFullYear(endDate.getFullYear() + 1)
  
  await prisma.subscriptions.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: endDate
    }
  })
  console.log('✅ Subscription criada')

  // 4. Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.users.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@example.com'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      active: true
    }
  })
  console.log('✅ Usuário admin criado')

  console.log('\n========================================')
  console.log('SEED CONCLUÍDO!')
  console.log('========================================')
  console.log('\nCredenciais de acesso:')
  console.log('Email: admin@example.com')
  console.log('Senha: admin123\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
