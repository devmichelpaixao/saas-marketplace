import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { toast } from 'sonner'
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  XCircle, 
  CheckCircle,
  AlertCircle,
  Building2,
  Receipt
} from 'lucide-react'
import Pagination from '../components/Pagination'
import SkeletonLoader from '../components/SkeletonLoader'

interface Invoice {
  id: string
  numero: number
  serie: string
  chaveAcesso: string | null
  clienteNome: string
  clienteCpfCnpj: string
  valorTotal: number
  status: string
  dataEmissao: string
  dataAutorizacao: string | null
  company: {
    nomeFantasia: string
  }
}

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', currentPage, statusFilter],
    queryFn: async () => {
      const res = await api.get('/api/invoices', {
        params: {
          page: currentPage,
          limit: 20,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      })
      return res.data
    }
  })

  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const res = await api.get('/api/invoices/companies')
      return res.data[0] || null
    }
  })

  const emitMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/invoices/${id}/emit`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Nota fiscal emitida com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao emitir nota fiscal')
    }
  })

  const cancelMutation = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      await api.post(`/api/invoices/${id}/cancel`, { motivo })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Nota fiscal cancelada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao cancelar nota fiscal')
    }
  })

  const statusColors: Record<string, string> = {
    PENDENTE: 'bg-yellow-100 text-yellow-700',
    AUTORIZADA: 'bg-green-100 text-green-700',
    CANCELADA: 'bg-red-100 text-red-700',
    ERRO: 'bg-red-100 text-red-700'
  }

  const statusLabels: Record<string, string> = {
    PENDENTE: 'Pendente',
    AUTORIZADA: 'Autorizada',
    CANCELADA: 'Cancelada',
    ERRO: 'Erro'
  }

  const filteredInvoices = data?.invoices?.filter((invoice: Invoice) =>
    invoice.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clienteCpfCnpj.includes(searchTerm) ||
    invoice.numero.toString().includes(searchTerm)
  ) || []

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <SkeletonLoader type="stats" />
        <SkeletonLoader type="table" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notas Fiscais (NF-e)</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie a emissão de notas fiscais eletrônicas</p>
        </div>
        <div className="flex gap-2">
          {!company && (
            <button
              onClick={() => window.location.href = '/settings?tab=company'}
              className="btn-secondary flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Configurar Empresa
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
            disabled={!company}
          >
            <Plus className="w-4 h-4" />
            Nova NF-e
          </button>
        </div>
      </div>

      {/* Alert se não tem empresa configurada */}
      {!company && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Configuração Necessária</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Configure os dados da sua empresa nas configurações para começar a emitir notas fiscais.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de NF-e</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data?.total || 0}</p>
            </div>
            <FileText className="w-10 h-10 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Autorizadas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {data?.invoices?.filter((i: Invoice) => i.status === 'AUTORIZADA').length || 0}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {data?.invoices?.filter((i: Invoice) => i.status === 'PENDENTE').length || 0}
              </p>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {data?.invoices?.filter((i: Invoice) => i.status === 'CANCELADA').length || 0}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, cliente ou CNPJ..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="input w-full sm:w-48"
          >
            <option value="all">Todos os Status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota fiscal encontrada</h3>
          <p className="text-gray-600 mb-6">Comece emitindo sua primeira NF-e</p>
          {company && (
            <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Emitir Primeira NF-e
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF/CNPJ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice: Invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {invoice.numero.toString().padStart(6, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{invoice.clienteNome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono">{invoice.clienteCpfCnpj}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.valorTotal)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                        {statusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {invoice.status === 'PENDENTE' && (
                        <button
                          onClick={() => emitMutation.mutate(invoice.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Emitir NF-e"
                        >
                          <CheckCircle className="w-4 h-4 inline" />
                        </button>
                      )}
                      {invoice.status === 'AUTORIZADA' && (
                        <>
                          <button
                            onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                            className="text-primary-600 hover:text-primary-900"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => {
                              const motivo = prompt('Motivo do cancelamento:')
                              if (motivo) cancelMutation.mutate({ id: invoice.id, motivo })
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Cancelar NF-e"
                          >
                            <XCircle className="w-4 h-4 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
