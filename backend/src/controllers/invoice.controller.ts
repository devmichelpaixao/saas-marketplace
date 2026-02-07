import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import prisma from '../config/database'

// Listar empresas do tenant
export const getCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId

    const companies = await prisma.company.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    })

    res.json(companies)
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    res.status(500).json({ message: 'Erro ao buscar empresas' })
  }
}

// Criar/Atualizar empresa
export const upsertCompany = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId
    const data = req.body

    // Verificar se já existe empresa para este tenant
    const existing = await prisma.company.findFirst({
      where: { tenantId }
    })

    let company
    if (existing) {
      company = await prisma.company.update({
        where: { id: existing.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } else {
      company = await prisma.company.create({
        data: {
          ...data,
          tenantId
        }
      })
    }

    res.json(company)
  } catch (error: any) {
    console.error('Erro ao salvar empresa:', error)
    res.status(500).json({ message: error.message || 'Erro ao salvar empresa' })
  }
}

// Listar notas fiscais
export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId
    const { page = 1, limit = 20, status } = req.query

    const where: any = { tenantId }
    if (status) where.status = status

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          company: true,
          items: true,
          order: {
            select: {
              orderNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.invoice.count({ where })
    ])

    res.json({
      invoices,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error)
    res.status(500).json({ message: 'Erro ao buscar notas fiscais' })
  }
}

// Criar nota fiscal
export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user?.tenantId
    const { companyId, orderId, cliente, items } = req.body

    // Buscar empresa
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId }
    })

    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' })
    }

    // Calcular valores
    const valorProdutos = items.reduce((sum: number, item: any) => 
      sum + (item.quantidade * item.valorUnitario - item.valorDesconto), 0
    )
    const valorTotal = valorProdutos

    // Criar nota fiscal
    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        companyId,
        orderId,
        numero: company.proximoNumero,
        serie: company.serieNFe,
        
        // Cliente
        clienteCpfCnpj: cliente.cpfCnpj,
        clienteNome: cliente.nome,
        clienteEmail: cliente.email,
        clienteTelefone: cliente.telefone,
        clienteCep: cliente.cep,
        clienteLogradouro: cliente.logradouro,
        clienteNumero: cliente.numero,
        clienteBairro: cliente.bairro,
        clienteCidade: cliente.cidade,
        clienteUf: cliente.uf,
        
        // Valores
        valorProdutos,
        valorTotal,
        
        // Items
        items: {
          create: items.map((item: any) => ({
            codigoProduto: item.codigoProduto,
            descricao: item.descricao,
            ncm: item.ncm || '00000000',
            cfop: item.cfop || '5102',
            unidade: item.unidade || 'UN',
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.quantidade * item.valorUnitario - (item.valorDesconto || 0),
            valorDesconto: item.valorDesconto || 0
          }))
        },
        
        status: 'PENDENTE'
      },
      include: {
        items: true,
        company: true
      }
    })

    // Incrementar próximo número
    await prisma.company.update({
      where: { id: companyId },
      data: { proximoNumero: company.proximoNumero + 1 }
    })

    res.json(invoice)
  } catch (error: any) {
    console.error('Erro ao criar nota fiscal:', error)
    res.status(500).json({ message: error.message || 'Erro ao criar nota fiscal' })
  }
}

// Emitir nota fiscal (integração com API)
export const emitInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenantId

    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { company: true, items: true }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Nota fiscal não encontrada' })
    }

    // TODO: Integrar com API de NF-e (Focus NFe, Enotas, etc)
    // Exemplo com Focus NFe:
    // const response = await axios.post('https://api.focusnfe.com.br/v2/nfe', nfeData)

    // Simular emissão por enquanto
    const chaveAcesso = `35${new Date().getFullYear()}${invoice.company.cnpj}55${invoice.serie.padStart(3, '0')}${invoice.numero.toString().padStart(9, '0')}${Math.random().toString().slice(2, 10)}`
    
    await prisma.invoice.update({
      where: { id },
      data: {
        status: 'AUTORIZADA',
        chaveAcesso,
        protocolo: `999${Math.random().toString().slice(2, 12)}`,
        dataAutorizacao: new Date(),
        urlPDF: `/invoices/${id}/pdf`,
        urlXML: `/invoices/${id}/xml`,
        urlDanfe: `/invoices/${id}/danfe`
      }
    })

    res.json({ 
      message: 'Nota fiscal emitida com sucesso',
      chaveAcesso 
    })
  } catch (error: any) {
    console.error('Erro ao emitir nota fiscal:', error)
    res.status(500).json({ message: error.message || 'Erro ao emitir nota fiscal' })
  }
}

// Cancelar nota fiscal
export const cancelInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { motivo } = req.body
    const tenantId = req.user?.tenantId

    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId, status: 'AUTORIZADA' }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Nota fiscal não encontrada ou não pode ser cancelada' })
    }

    // TODO: Integrar cancelamento com API de NF-e

    await prisma.invoice.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        statusMotivo: motivo,
        dataCancelamento: new Date()
      }
    })

    res.json({ message: 'Nota fiscal cancelada com sucesso' })
  } catch (error) {
    console.error('Erro ao cancelar nota fiscal:', error)
    res.status(500).json({ message: 'Erro ao cancelar nota fiscal' })
  }
}

// Download PDF
export const downloadPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const tenantId = req.user?.tenantId

    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId, status: 'AUTORIZADA' }
    })

    if (!invoice || !invoice.urlPDF) {
      return res.status(404).json({ message: 'PDF não disponível' })
    }

    // TODO: Buscar PDF da API ou gerar localmente
    res.json({ url: invoice.urlPDF })
  } catch (error) {
    console.error('Erro ao buscar PDF:', error)
    res.status(500).json({ message: 'Erro ao buscar PDF' })
  }
}
