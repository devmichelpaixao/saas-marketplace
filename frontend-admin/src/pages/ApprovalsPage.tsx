import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
  LogOut,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Calendar,
  User,
  Mail,
  Globe
} from 'lucide-react'

interface PendingTenant {
  id: string
  name: string
  subdomain: string
  adminName: string
  adminEmail: string
  requestedPlan?: string
  createdAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export default function ApprovalsPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING')
  const [selectedTenant, setSelectedTenant] = useState<PendingTenant | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('')

  // Fetch pending tenants
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['pending-tenants', filter],
    queryFn: async () => {
      const res = await api.get(`/api/super-admin/approvals?status=${filter}`)
      return res.data as PendingTenant[]
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

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ tenantId, planId }: { tenantId: string; planId: string }) => {
      await api.post(`/api/super-admin/approvals/${tenantId}/approve`, { planId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-tenants'] })
      setSelectedTenant(null)
      setSelectedPlan('')
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ tenantId, reason }: { tenantId: string; reason: string }) => {
      await api.post(`/api/super-admin/approvals/${tenantId}/reject`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-tenants'] })
      setSelectedTenant(null)
    }
  })

  const handleApprove = (tenant: PendingTenant) => {
    setSelectedTenant(tenant)
  }

  const confirmApproval = () => {
    if (selectedTenant && selectedPlan) {
      approveMutation.mutate({ tenantId: selectedTenant.id, planId: selectedPlan })
    }
  }

  const handleReject = (tenant: PendingTenant) => {
    const reason = prompt('Motivo da rejeição:')
    if (reason) {
      rejectMutation.mutate({ tenantId: tenant.id, reason })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-yellow flex items-center gap-1"><Clock className="w-3 h-3" />Pendente</span>
      case 'APPROVED':
        return <span className="badge badge-green flex items-center gap-1"><CheckCircle className="w-3 h-3" />Aprovado</span>
      case 'REJECTED':
        return <span className="badge badge-red flex items-center gap-1"><XCircle className="w-3 h-3" />Rejeitado</span>
      default:
        return null
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
                <p className="text-sm text-gray-600">Aprovações de Acesso</p>
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
              className="px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
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
              className="px-4 py-3 border-b-2 border-primary-600 text-primary-600 font-medium"
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
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'PENDING'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        {/* Tenants List */}
        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : tenants && tenants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-5 h-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                      {getStatusBadge(tenant.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span>{tenant.subdomain}.seudominio.com</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(tenant.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{tenant.adminName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{tenant.adminEmail}</span>
                      </div>
                    </div>

                    {tenant.requestedPlan && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-4">
                        <span className="text-sm text-blue-800">
                          <strong>Plano solicitado:</strong> {tenant.requestedPlan}
                        </span>
                      </div>
                    )}
                  </div>

                  {tenant.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(tenant)}
                        className="btn btn-success"
                        title="Aprovar"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(tenant)}
                        className="btn btn-danger"
                        title="Rejeitar"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'PENDING' ? 'Nenhuma aprovação pendente' : 'Nenhum registro encontrado'}
            </p>
          </div>
        )}

        {/* Approval Modal */}
        {selectedTenant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Aprovar Tenant</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Tenant:</strong> {selectedTenant.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Admin:</strong> {selectedTenant.adminName} ({selectedTenant.adminEmail})
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione o Plano *
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Escolha um plano...</option>
                  {plans?.filter((p: any) => p.active).map((plan: any) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.price.toFixed(2)}/mês
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmApproval}
                  disabled={!selectedPlan || approveMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  {approveMutation.isPending ? 'Aprovando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
