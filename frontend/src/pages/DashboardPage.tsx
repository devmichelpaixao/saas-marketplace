import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { 
  TrendingUp, 

  ShoppingCart, 
  DollarSign, 
  Package,
  AlertCircle,

  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import SkeletonLoader from '../components/SkeletonLoader'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats')
      return res.data
    },
  })

  const { data: productGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['product-groups-report'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/product-groups')
      return res.data
    },
  })

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const res = await api.get('/api/orders', { params: { limit: 5 } })
      return res.data?.orders || []
    },
  })

  const { data: products } = useQuery({
    queryKey: ['products-summary'],
    queryFn: async () => {
      const res = await api.get('/api/products')
      return res.data
    },
  })

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  // Calcular estatísticas de produtos
  const productStats = {
    total: products?.length || 0,
    lowStock: products?.filter((p: any) => p.stock > 0 && p.stock < 10).length || 0,
    outOfStock: products?.filter((p: any) => p.stock === 0).length || 0,
    totalValue: products?.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0) || 0
  }

  // Calcular crescimento
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const revenueGrowth = Number(calculateGrowth(stats?.revenue?.today || 0, stats?.revenue?.yesterday || 0))
  const ordersGrowth = Number(calculateGrowth(stats?.orders?.today || 0, stats?.orders?.yesterday || 0))

  if (statsLoading || groupsLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <SkeletonLoader type="stats" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
        <SkeletonLoader type="table" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="animate-slide-in-top">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div id="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-in-bottom">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Faturamento Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">
                R$ {(stats?.revenue?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Hoje:</span>
                <span className="text-sm font-semibold text-gray-900">
                  R$ {(stats?.revenue?.today || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {revenueGrowth !== 0 && (
                  <span className={`inline-flex items-center text-xs font-medium ${
                    revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {revenueGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(revenueGrowth)}%
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.orders?.total || 0}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Hoje:</span>
                <span className="text-sm font-semibold text-gray-900">{stats?.orders?.today || 0}</span>
                {ordersGrowth !== 0 && (
                  <span className={`inline-flex items-center text-xs font-medium ${
                    ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ordersGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(ordersGrowth)}%
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Produção</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats?.orders?.inProduction || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Pendentes: {stats?.orders?.pending || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prontos p/ Envio</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.orders?.readyToShip || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Aguardando expedição</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards Secundários - Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in-left" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total de Produtos</p>
              <p className="text-3xl font-bold mt-1">{productStats.total}</p>
            </div>
            <Package className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-sm p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Estoque Baixo</p>
              <p className="text-3xl font-bold mt-1">{productStats.lowStock}</p>
            </div>
            <AlertCircle className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Sem Estoque</p>
              <p className="text-3xl font-bold mt-1">{productStats.outOfStock}</p>
            </div>
            <XCircle className="w-10 h-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Valor Estoque</p>
              <p className="text-2xl font-bold mt-1">
                R$ {(productStats.totalValue / 1000).toFixed(1)}k
              </p>
            </div>
            <DollarSign className="w-10 h-10 opacity-80" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-scale-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
        {/* Vendas por Dia */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Faturamento dos Últimos 7 Dias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.salesByDay || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Faturamento"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pedidos por Status */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            Pedidos por Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.ordersByStatus || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vendas por Grupo de Produto */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Vendas por Grupo de Produto
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productGroups?.groups || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="revenue"
              >
                {(productGroups?.groups || []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pedidos Recentes */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Pedidos Recentes
          </h3>
          <div className="space-y-3">
            {recentOrders?.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{order.customerName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-semibold text-gray-900">
                    R$ {Number(order.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'DELIVERED' && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Alertas e Notificações</h3>
        </div>
        <div className="space-y-3">
          {(stats?.orders?.pending || 0) > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Você tem <span className="font-semibold">{stats?.orders?.pending}</span> pedidos pendentes de confirmação
              </p>
            </div>
          )}
          {(stats?.orders?.readyToShip || 0) > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Você tem <span className="font-semibold">{stats?.orders?.readyToShip}</span> pedidos prontos para envio
              </p>
            </div>
          )}
          {!stats?.orders?.pending && !stats?.orders?.readyToShip && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                Nenhum alerta no momento. Tudo está em ordem! ✅
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
