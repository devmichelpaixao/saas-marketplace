import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Power,
  PowerOff,
  LogOut,
  LayoutDashboard,
  Building2,
  AlertCircle
} from 'lucide-react'

export default function TenantsPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  // Fetch tenants
  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ['tenants', page, search, statusFilter, planFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(planFilter && { planId: planFilter })
      })
      const res = await api.get(`/api/super-admin/tenants?${params}`)
      return res.data
    }
  })

  // Fetch plans
  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/api/super-admin/plans')
      return res.data
    }
  })

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api.patch(`/api/super-admin/tenants/${id}/status`, { active })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    }
  })

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      await api.patch(`/api/super-admin/tenants/${id}/plan`, { planId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/super-admin/tenants/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    }
  })

  const handleToggleStatus = (tenant: any) => {
    if (confirm(`Tem certeza que deseja ${tenant.active ? 'desativar' : 'ativar'} o tenant "${tenant.name}"?`)) {
      toggleStatusMutation.mutate({ id: tenant.id, active: !tenant.active })
    }
  }

  const handleDelete = (tenant: any) => {
    if (confirm(`ATENÇÃO: Tem certeza que deseja DELETAR o tenant "${tenant.name}"? Esta ação é IRREVERSÍVEL e deletará todos os usuários e dados associados!`)) {
      if (prompt('Digite "CONFIRMAR" para deletar:') === 'CONFIRMAR') {
        deleteMutation.mutate(tenant.id)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
                <p className="text-sm text-gray-600">Painel de Gestão</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button onClick={logout} className="btn btn-secondary">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <Link
              to="/"
              className="px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/tenants"
              className="px-4 py-3 border-b-2 border-primary-600 text-primary-600 font-medium"
            >
              Tenants
            </Link>
            <Link
              to="/plans"
              className="px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              Planos
            </Link>
            <Link
              to="/approvals"
              className="px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              Aprovações
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome ou subdomínio..."
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>
            </div>

            {/* Plan Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plano
              </label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="input"
              >
                <option value="">Todos os planos</option>
                {plans?.map((plan: any) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({plan._count?.tenants || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-xl">Carregando...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Subdomínio</th>
                      <th>Plano</th>
                      <th>Usuários</th>
                      <th>Status</th>
                      <th>Criado em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantsData?.data?.map((tenant: any) => (
                      <tr key={tenant.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{tenant.name}</p>
                              {tenant.ownerEmail && (
                                <p className="text-sm text-gray-500">{tenant.ownerEmail}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {tenant.subdomain}
                          </code>
                        </td>
                        <td>
                          <span className="badge badge-blue">
                            {tenant.subscription?.plan?.name || 'Sem plano'}
                          </span>
                        </td>
                        <td className="text-center">{tenant._count?.users || 0}</td>
                        <td>
                          <span className={`badge ${tenant.active ? 'badge-green' : 'badge-red'}`}>
                            {tenant.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="text-sm text-gray-600">
                          {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(tenant)}
                              className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                              title={tenant.active ? 'Desativar' : 'Ativar'}
                            >
                              {tenant.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(tenant)}
                              className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                              title="Deletar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {tenantsData?.totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Página {tenantsData.page} de {tenantsData.totalPages} 
                    ({tenantsData.total} registros)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(tenantsData.totalPages, p + 1))}
                      disabled={page === tenantsData.totalPages}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
