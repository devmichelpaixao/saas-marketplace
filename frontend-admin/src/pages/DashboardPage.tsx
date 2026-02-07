import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  AlertCircle,
  LogOut,
  LayoutDashboard,
  BarChart3
} from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: async () => {
      const res = await api.get('/api/super-admin/stats')
      return res.data
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
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
              className="px-4 py-3 border-b-2 border-primary-600 text-primary-600 font-medium"
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
              className="px-4 py-3 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium"
            >
              Aprovações
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Tenants"
            value={stats?.totalTenants || 0}
            icon={<Building2 className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Tenants Ativos"
            value={stats?.activeTenants || 0}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Tenants Inativos"
            value={stats?.inactiveTenants || 0}
            icon={<AlertCircle className="w-6 h-6" />}
            color="red"
          />
          <StatCard
            title="Total de Usuários"
            value={stats?.totalUsers || 0}
            icon={<Users className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Tenants por Plano */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Distribuição por Plano
            </h3>
            <div className="space-y-3">
              {stats?.tenantsByPlan?.map((item: any) => (
                <div key={item.planId} className="flex items-center justify-between">
                  <span className="text-gray-700">{item.planName}</span>
                  <span className="font-semibold text-primary-600">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Últimos Tenants */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Últimos Tenants Criados</h3>
            <div className="space-y-3">
              {stats?.recentTenants?.map((tenant: any) => (
                <div key={tenant.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-500">{tenant.subdomain}</p>
                  </div>
                  <span className={`badge ${tenant.active ? 'badge-green' : 'badge-red'}`}>
                    {tenant.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/tenants" className="btn btn-primary">
              <Building2 className="w-4 h-4" />
              Ver Todos os Tenants
            </Link>
            <Link to="/plans" className="btn btn-secondary">
              <BarChart3 className="w-4 h-4" />
              Gerenciar Planos
            </Link>
            <Link to="/approvals" className="btn btn-warning">
              <AlertCircle className="w-4 h-4" />
              Aprovar Acessos
            </Link>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
              <TrendingUp className="w-4 h-4" />
              Atualizar Dados
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color as keyof typeof colors]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
