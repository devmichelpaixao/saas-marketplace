import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { 
  Shield, 
  Search, 
 
  Calendar,
  User,
  FileText,
  Activity,

} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Pagination from '../components/Pagination'

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId?: string
  changes?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    entity: '',
    action: '',
    userId: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.entity && { entity: filters.entity }),
        ...(filters.action && { action: filters.action }),
        ...(filters.userId && { userId: filters.userId }),
      })
      const res = await api.get(`/api/audit?${params}`)
      return res.data
    },
  })

  const { data: stats } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      const res = await api.get('/api/audit/stats')
      return res.data
    },
  })

  const actionLabels: Record<string, { label: string; color: string }> = {
    CREATE: { label: 'Criar', color: 'bg-green-100 text-green-700' },
    UPDATE: { label: 'Atualizar', color: 'bg-blue-100 text-blue-700' },
    DELETE: { label: 'Excluir', color: 'bg-red-100 text-red-700' },
    LOGIN: { label: 'Login', color: 'bg-purple-100 text-purple-700' },
    LOGOUT: { label: 'Logout', color: 'bg-gray-100 text-gray-700' },
  }

  const entityLabels: Record<string, string> = {
    product: 'Produto',
    order: 'Pedido',
    user: 'Usuário',
    department: 'Departamento',
    task: 'Tarefa',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in-top">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Logs de Auditoria
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Histórico completo de ações no sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-bottom">
        <div className="card hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Logs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalLogs || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Entidades</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.entityCounts?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ações</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.actionCounts?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card hover-lift">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hoje</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.recentActivity?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card animate-scale-in">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar logs..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <select
            className="input max-w-xs"
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
          >
            <option value="">Todas entidades</option>
            <option value="product">Produtos</option>
            <option value="order">Pedidos</option>
            <option value="user">Usuários</option>
            <option value="department">Departamentos</option>
            <option value="task">Tarefas</option>
          </select>

          <select
            className="input max-w-xs"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="">Todas ações</option>
            <option value="CREATE">Criar</option>
            <option value="UPDATE">Atualizar</option>
            <option value="DELETE">Excluir</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.logs?.map((log: AuditLog) => {
                const actionInfo = actionLabels[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700' }
                
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.user?.name || 'Sistema'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${actionInfo.color}`}>
                        {actionInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entityLabels[log.entity] || log.entity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {data?.logs?.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum log encontrado</p>
          </div>
        )}

        {data?.pagination && data.logs?.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <Pagination
              currentPage={page}
              totalPages={data.pagination.pages}
              totalItems={data.pagination.total}
              itemsPerPage={data.pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
