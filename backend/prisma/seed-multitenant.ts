import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados multi-tenant...');

  // ==================== CRIAR PLANOS ====================
  console.log('\n📋 Criando planos...');
  
  const basicPlan = await prisma.plan.upsert({
    where: { id: 'plan-basic' },
    update: {
      name: 'Starter',
      description: 'Perfeito para começar suas vendas online',
      price: 149.00,
      billingCycle: 'monthly',
      maxUsers: 2,
      maxProducts: 50,
      maxOrders: 300,
      features: {
        marketplace_integrations: 1,
        departments: 3,
        storage_gb: 2,
        support: 'email',
        api_access: false,
        reports: 'basic',
        mobile_app: false
      },
      active: true
    },
    create: {
      id: 'plan-basic',
      name: 'Starter',
      description: 'Perfeito para começar suas vendas online',
      price: 149.00,
      billingCycle: 'monthly',
      maxUsers: 2,
      maxProducts: 50,
      maxOrders: 300,
      features: {
        marketplace_integrations: 1,
        departments: 3,
        storage_gb: 2,
        support: 'email',
        api_access: false,
        reports: 'basic',
        mobile_app: false
      },
      active: true
    }
  });

  const professionalPlan = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {
      name: 'Professional',
      description: 'Ideal para empresas em crescimento',
      price: 299.00,
      billingCycle: 'monthly',
      maxUsers: 5,
      maxProducts: 500,
      maxOrders: 2000,
      features: {
        marketplace_integrations: 3,
        departments: 10,
        storage_gb: 20,
        support: 'priority',
        api_access: true,
        custom_domain: false,
        reports: 'advanced',
        mobile_app: true,
        automation: 'basic'
      },
      active: true
    },
    create: {
      id: 'plan-pro',
      name: 'Professional',
      description: 'Ideal para empresas em crescimento',
      price: 299.00,
      billingCycle: 'monthly',
      maxUsers: 5,
      maxProducts: 500,
      maxOrders: 2000,
      features: {
        marketplace_integrations: 3,
        departments: 10,
        storage_gb: 20,
        support: 'priority',
        api_access: true,
        custom_domain: false,
        reports: 'advanced',
        mobile_app: true,
        automation: 'basic'
      },
      active: true
    }
  });

  const businessPlan = await prisma.plan.upsert({
    where: { id: 'plan-business' },
    update: {
      name: 'Business',
      description: 'Recursos avançados para empresas estabelecidas',
      price: 599.00,
      billingCycle: 'monthly',
      maxUsers: 15,
      maxProducts: 2000,
      maxOrders: 10000,
      features: {
        marketplace_integrations: 'unlimited',
        departments: 'unlimited',
        storage_gb: 100,
        support: 'priority_phone',
        api_access: true,
        custom_domain: true,
        reports: 'premium',
        mobile_app: true,
        automation: 'advanced',
        multi_warehouse: true,
        analytics: 'advanced'
      },
      active: true
    },
    create: {
      id: 'plan-business',
      name: 'Business',
      description: 'Recursos avançados para empresas estabelecidas',
      price: 599.00,
      billingCycle: 'monthly',
      maxUsers: 15,
      maxProducts: 2000,
      maxOrders: 10000,
      features: {
        marketplace_integrations: 'unlimited',
        departments: 'unlimited',
        storage_gb: 100,
        support: 'priority_phone',
        api_access: true,
        custom_domain: true,
        reports: 'premium',
        mobile_app: true,
        automation: 'advanced',
        multi_warehouse: true,
        analytics: 'advanced'
      },
      active: true
    }
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: 'plan-enterprise' },
    update: {
      name: 'Enterprise',
      description: 'Solução corporativa completa e escalável',
      price: 1299.00,
      billingCycle: 'monthly',
      maxUsers: 50,
      maxProducts: 10000,
      maxOrders: 100000,
      features: {
        marketplace_integrations: 'unlimited',
        departments: 'unlimited',
        storage_gb: 500,
        support: '24/7_dedicated',
        api_access: true,
        custom_domain: true,
        white_label: true,
        dedicated_support: true,
        reports: 'premium',
        mobile_app: true,
        automation: 'enterprise',
        multi_warehouse: true,
        analytics: 'enterprise',
        custom_integrations: true,
        sla_guaranteed: true
      },
      active: true
    },
    create: {
      id: 'plan-enterprise',
      name: 'Enterprise',
      description: 'Solução corporativa completa e escalável',
      price: 1299.00,
      billingCycle: 'monthly',
      maxUsers: 50,
      maxProducts: 10000,
      maxOrders: 100000,
      features: {
        marketplace_integrations: 'unlimited',
        departments: 'unlimited',
        storage_gb: 500,
        support: '24/7_dedicated',
        api_access: true,
        custom_domain: true,
        white_label: true,
        dedicated_support: true,
        reports: 'premium',
        mobile_app: true,
        automation: 'enterprise',
        multi_warehouse: true,
        analytics: 'enterprise',
        custom_integrations: true,
        sla_guaranteed: true
      },
      active: true
    }
  });

  console.log('✅ Planos criados:', basicPlan.name, professionalPlan.name, businessPlan.name, enterprisePlan.name);

  // ==================== CRIAR TENANT DEMO ====================
  console.log('\n🏢 Criando tenant demo...');

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 30 dias de trial

  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      id: 'tenant-demo',
      name: 'Empresa Demo',
      subdomain: 'demo',
      active: true,
      trialEndsAt
    }
  });

  console.log('✅ Tenant criado:', demoTenant.name, `(${demoTenant.subdomain})`);

  // ==================== CRIAR SUBSCRIPTION ====================
  console.log('\n💳 Criando subscription...');

  const now = new Date();
  const periodEnd = new Date(trialEndsAt);

  await prisma.subscription.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      tenantId: demoTenant.id,
      planId: professionalPlan.id,
      status: 'TRIAL',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd
    }
  });

  console.log('✅ Subscription criada: Trial até', trialEndsAt.toLocaleDateString());

  // ==================== CRIAR USUÁRIO ADMIN ====================
  console.log('\n👤 Criando usuário admin...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: demoTenant.id,
        email: 'admin@example.com'
      }
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      active: true
    }
  });

  console.log('✅ Admin criado:', admin.email);

  // ==================== CRIAR DEPARTAMENTOS ====================
  console.log('\n🏭 Criando departamentos...');

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { id: 'dept-1' },
      update: {},
      create: {
        id: 'dept-1',
        tenantId: demoTenant.id,
        name: 'Criação',
        description: 'Design e criação de artes',
        order: 1,
        color: '#3b82f6'
      }
    }),
    prisma.department.upsert({
      where: { id: 'dept-2' },
      update: {},
      create: {
        id: 'dept-2',
        tenantId: demoTenant.id,
        name: 'Pré-impressão',
        description: 'Preparação para impressão',
        order: 2,
        color: '#8b5cf6'
      }
    }),
    prisma.department.upsert({
      where: { id: 'dept-3' },
      update: {},
      create: {
        id: 'dept-3',
        tenantId: demoTenant.id,
        name: 'Impressão',
        description: 'Impressão dos produtos',
        order: 3,
        color: '#f59e0b'
      }
    }),
    prisma.department.upsert({
      where: { id: 'dept-4' },
      update: {},
      create: {
        id: 'dept-4',
        tenantId: demoTenant.id,
        name: 'Expedição',
        description: 'Embalagem e envio',
        order: 4,
        color: '#10b981'
      }
    })
  ]);

  console.log('✅ Departamentos criados:', departments.map(d => d.name).join(', '));

  // ==================== CRIAR GRUPO DE PRODUTOS ====================
  console.log('\n📦 Criando grupos de produtos...');

  const productGroup = await prisma.productGroup.upsert({
    where: { id: 'group-1' },
    update: {},
    create: {
      id: 'group-1',
      tenantId: demoTenant.id,
      name: 'Camisetas',
      description: 'Camisetas personalizadas'
    }
  });

  console.log('✅ Grupo criado:', productGroup.name);

  // ==================== CRIAR CATEGORIA ====================
  console.log('\n🏷️ Criando categorias...');

  const category = await prisma.category.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: {
      id: 'cat-1',
      tenantId: demoTenant.id,
      name: 'Vestuário',
      description: 'Roupas e acessórios'
    }
  });

  console.log('✅ Categoria criada:', category.name);

  // ==================== CRIAR PRODUTOS DE EXEMPLO ====================
  console.log('\n🛍️ Criando produtos de exemplo...');

  const product1 = await prisma.product.upsert({
    where: {
      tenantId_sku: {
        tenantId: demoTenant.id,
        sku: 'CAM-001'
      }
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      sku: 'CAM-001',
      name: 'Camiseta Personalizada',
      description: 'Camiseta 100% algodão com impressão personalizada',
      cost: 15.00,
      price: 45.00,
      stock: 50,
      physicalStock: 10,
      minStock: 5,
      categoryId: category.id,
      productGroupId: productGroup.id,
      departmentId: departments[0].id,
      active: true
    }
  });

  const product2 = await prisma.product.upsert({
    where: {
      tenantId_sku: {
        tenantId: demoTenant.id,
        sku: 'CAM-002'
      }
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      sku: 'CAM-002',
      name: 'Camiseta Premium',
      description: 'Camiseta premium com acabamento especial',
      cost: 25.00,
      price: 75.00,
      stock: 30,
      physicalStock: 5,
      minStock: 3,
      categoryId: category.id,
      productGroupId: productGroup.id,
      departmentId: departments[0].id,
      active: true
    }
  });

  console.log('✅ Produtos criados:', product1.name, product2.name);

  console.log('\n✨ Seed concluído com sucesso!\n');
  console.log('📝 Informações de acesso:');
  console.log('   Subdomínio: demo');
  console.log('   Email: admin@example.com');
  console.log('   Senha: admin123');
  console.log('   URL Dev: http://localhost:5173');
  console.log(`   Trial até: ${trialEndsAt.toLocaleDateString('pt-BR')}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
