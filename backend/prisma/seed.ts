import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  })
  console.log('✅ Usuário admin criado:', admin.email)

  // Criar departamentos
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'Criação',
        description: 'Departamento de criação e design',
        order: 1,
        color: '#3b82f6',
      },
    }),
    prisma.department.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Pré-Impressão',
        description: 'Preparação para impressão',
        order: 2,
        color: '#10b981',
      },
    }),
    prisma.department.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        name: 'Impressão',
        description: 'Impressão dos produtos',
        order: 3,
        color: '#f59e0b',
      },
    }),
    prisma.department.upsert({
      where: { id: '4' },
      update: {},
      create: {
        id: '4',
        name: 'Expedição',
        description: 'Preparação e envio',
        order: 4,
        color: '#ef4444',
      },
    }),
  ])
  console.log('✅ Departamentos criados:', departments.length)

  // Criar workflow entre departamentos
  const workflows = await Promise.all([
    prisma.workflowStep.create({
      data: {
        fromDepartmentId: '1',
        toDepartmentId: '2',
        order: 1,
      },
    }),
    prisma.workflowStep.create({
      data: {
        fromDepartmentId: '2',
        toDepartmentId: '3',
        order: 2,
      },
    }),
    prisma.workflowStep.create({
      data: {
        fromDepartmentId: '3',
        toDepartmentId: '4',
        order: 3,
      },
    }),
  ])
  console.log('✅ Workflow criado:', workflows.length, 'etapas')

  // Criar categorias
  const categoria = await prisma.category.create({
    data: {
      name: 'Impressos',
      description: 'Produtos impressos',
    },
  })
  console.log('✅ Categoria criada:', categoria.name)

  // Criar grupo de produtos
  const grupo = await prisma.productGroup.create({
    data: {
      name: 'Personalizados',
      description: 'Produtos personalizados',
    },
  })
  console.log('✅ Grupo de produtos criado:', grupo.name)

  // Criar produtos de exemplo
  const produtos = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'CANECA-001',
        name: 'Caneca Personalizada',
        description: 'Caneca branca personalizada com sua imagem',
        cost: 15.00,
        price: 39.90,
        stock: 100,
        physicalStock: 10,
        categoryId: categoria.id,
        productGroupId: grupo.id,
        departmentId: '1',
        barcode: '7891234567890',
      },
    }),
    prisma.product.create({
      data: {
        sku: 'CAMISA-001',
        name: 'Camiseta Personalizada',
        description: 'Camiseta 100% algodão personalizada',
        cost: 25.00,
        price: 59.90,
        stock: 50,
        physicalStock: 5,
        categoryId: categoria.id,
        productGroupId: grupo.id,
        departmentId: '1',
        barcode: '7891234567891',
      },
    }),
  ])
  console.log('✅ Produtos criados:', produtos.length)

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
