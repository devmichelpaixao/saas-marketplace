import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlans() {
  console.log('🌱 Criando planos padrão...');

  const plans = [
    {
      name: 'Gratuito',
      description: 'Plano básico para testar a plataforma',
      price: 0,
      maxUsers: 2,
      maxProducts: 10,
      maxOrdersPerMonth: 20,
      features: [
        'Até 2 usuários',
        'Até 10 produtos',
        'Até 20 pedidos/mês',
        'Suporte por email',
        'Dashboard básico'
      ],
      active: true
    },
    {
      name: 'Básico',
      description: 'Ideal para pequenas empresas começando',
      price: 49.90,
      maxUsers: 5,
      maxProducts: 100,
      maxOrdersPerMonth: 200,
      features: [
        'Até 5 usuários',
        'Até 100 produtos',
        'Até 200 pedidos/mês',
        'Suporte por email e chat',
        'Dashboard completo',
        'Relatórios básicos',
        'Integrações básicas'
      ],
      active: true
    },
    {
      name: 'Profissional',
      description: 'Para empresas em crescimento',
      price: 149.90,
      maxUsers: 15,
      maxProducts: 500,
      maxOrdersPerMonth: 1000,
      features: [
        'Até 15 usuários',
        'Até 500 produtos',
        'Até 1000 pedidos/mês',
        'Suporte prioritário 24/7',
        'Dashboard avançado',
        'Relatórios completos',
        'Todas as integrações',
        'API completa',
        'Múltiplos departamentos',
        'Personalização de marca'
      ],
      active: true
    },
    {
      name: 'Enterprise',
      description: 'Solução completa para grandes empresas',
      price: 499.90,
      maxUsers: 100,
      maxProducts: 5000,
      maxOrdersPerMonth: 10000,
      features: [
        'Usuários ilimitados',
        'Produtos ilimitados',
        'Até 10.000 pedidos/mês',
        'Suporte dedicado 24/7',
        'Dashboard personalizado',
        'Relatórios avançados e BI',
        'Todas as integrações premium',
        'API completa com webhooks',
        'Múltiplos departamentos',
        'White-label completo',
        'SLA garantido',
        'Gerente de conta dedicado',
        'Treinamento personalizado',
        'Backup e recuperação avançados'
      ],
      active: true
    },
    {
      name: 'Trial',
      description: 'Período de teste de 14 dias',
      price: 0,
      maxUsers: 3,
      maxProducts: 50,
      maxOrdersPerMonth: 50,
      features: [
        'Teste gratuito por 14 dias',
        'Acesso a todos os recursos do plano Profissional',
        'Até 3 usuários',
        'Até 50 produtos',
        'Até 50 pedidos/mês',
        'Suporte por email'
      ],
      active: true
    }
  ];

  for (const planData of plans) {
    try {
      const existingPlan = await prisma.plans.findUnique({
        where: { name: planData.name }
      });

      if (existingPlan) {
        console.log(`⚠️  Plano "${planData.name}" já existe, pulando...`);
        continue;
      }

      const plan = await prisma.plans.create({
        data: planData
      });

      console.log(`✅ Plano "${plan.name}" criado - R$ ${plan.price.toFixed(2)}/mês`);
    } catch (error) {
      console.error(`❌ Erro ao criar plano "${planData.name}":`, error);
    }
  }

  console.log('\n🎉 Seed de planos concluído!');
}

seedPlans()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
