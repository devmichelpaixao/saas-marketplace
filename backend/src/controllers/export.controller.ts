import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middlewares/auth.middleware'
import ExcelJS from 'exceljs'

const prisma = new PrismaClient()

export const exportProductsToExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant não identificado' })
    }

    // Buscar produtos
    const products = await prisma.product.findMany({
      where: { tenantId },
      include: {
        category: true,
        productGroup: true,
        department: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Criar workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Produtos')

    // Definir colunas
    worksheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Grupo', key: 'group', width: 20 },
      { header: 'Departamento', key: 'department', width: 20 },
      { header: 'Custo', key: 'cost', width: 12 },
      { header: 'Preço', key: 'price', width: 12 },
      { header: 'Estoque', key: 'stock', width: 10 },
      { header: 'Margem (%)', key: 'margin', width: 12 },
      { header: 'Código de Barras', key: 'barcode', width: 18 }
    ]

    // Estilizar header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    }

    // Adicionar dados
    products.forEach(product => {
      const margin = ((product.price - product.cost) / product.cost * 100).toFixed(2)
      worksheet.addRow({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category: product.category?.name || '-',
        group: product.productGroup?.name || '-',
        department: product.department?.name || '-',
        cost: product.cost,
        price: product.price,
        stock: product.stock,
        margin: margin,
        barcode: product.barcode || ''
      })
    })

    // Formatar números
    worksheet.getColumn('cost').numFmt = 'R$ #,##0.00'
    worksheet.getColumn('price').numFmt = 'R$ #,##0.00'

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=produtos-${Date.now()}.xlsx`)
    res.send(buffer)
  } catch (error) {
    console.error('Erro ao exportar produtos:', error)
    res.status(500).json({ message: 'Erro ao exportar produtos' })
  }
}

export const exportOrdersToExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant não identificado' })
    }

    // Buscar pedidos
    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: {
        currentDepartment: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Criar workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pedidos')

    // Definir colunas
    worksheet.columns = [
      { header: 'Número', key: 'orderNumber', width: 15 },
      { header: 'Cliente', key: 'customer', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefone', key: 'phone', width: 15 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Departamento', key: 'department', width: 20 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Frete', key: 'shipping', width: 12 },
      { header: 'Desconto', key: 'discount', width: 12 },
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Itens', key: 'items', width: 10 }
    ]

    // Estilizar header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    }

    // Status labels
    const statusLabels: Record<string, string> = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      IN_PRODUCTION: 'Em Produção',
      READY_TO_SHIP: 'Pronto para Envio',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado'
    }

    // Adicionar dados
    orders.forEach(order => {
      worksheet.addRow({
        orderNumber: order.orderNumber,
        customer: order.customerName,
        email: order.customerEmail || '',
        phone: order.customerPhone || '',
        status: statusLabels[order.status] || order.status,
        department: order.currentDepartment?.name || '-',
        total: Number(order.totalAmount),
        shipping: Number(order.shippingAmount || 0),
        discount: Number(order.discountAmount || 0),
        date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
        items: order.items.length
      })
    })

    // Formatar números
    worksheet.getColumn('total').numFmt = 'R$ #,##0.00'
    worksheet.getColumn('shipping').numFmt = 'R$ #,##0.00'
    worksheet.getColumn('discount').numFmt = 'R$ #,##0.00'

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=pedidos-${Date.now()}.xlsx`)
    res.send(buffer)
  } catch (error) {
    console.error('Erro ao exportar pedidos:', error)
    res.status(500).json({ message: 'Erro ao exportar pedidos' })
  }
}

export const exportUsersToExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req

    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant não identificado' })
    }

    // Buscar usuários
    const users = await prisma.users.findMany({
      where: { tenantId },
      include: {
        department: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Criar workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Usuários')

    // Definir colunas
    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Cargo', key: 'role', width: 15 },
      { header: 'Departamento', key: 'department', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Data de Cadastro', key: 'createdAt', width: 15 }
    ]

    // Estilizar header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    }

    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrador',
      USER: 'Usuário',
      MANAGER: 'Gerente'
    }

    // Adicionar dados
    users.forEach(user => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        role: roleLabels[user.role] || user.role,
        department: user.department?.name || '-',
        status: user.active ? 'Ativo' : 'Inativo',
        createdAt: new Date(user.createdAt).toLocaleDateString('pt-BR')
      })
    })

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=usuarios-${Date.now()}.xlsx`)
    res.send(buffer)
  } catch (error) {
    console.error('Erro ao exportar usuários:', error)
    res.status(500).json({ message: 'Erro ao exportar usuários' })
  }
}
