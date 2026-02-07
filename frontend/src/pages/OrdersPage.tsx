import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { Search, Filter, Package } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import Pagination from '../components/Pagination'
import SkeletonLoader from '../components/SkeletonLoader'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, status],
    queryFn: async () => {
      const res = await api.get('/api/orders', {
        params: { page, limit: 20, search, status: status || undefined },
      })
      return res.data
    },
  })

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    IN_PRODUCTION: 'bg-purple-100 text-purple-700',
    READY_TO_SHIP: 'bg-green-100 text-green-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    IN_PRODUCTION: 'Em Produção',
    READY_TO_SHIP: 'Pronto para Envio',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelado',
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Gerencie todos os seus pedidos</p>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input w-full sm:w-48 text-sm"
            >
              <option value="">Todos os Status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <SkeletonLoader type="table" />
        ) : (
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Pedido</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">Depto</th>
                </tr>
              </thead>
              <tbody>
                {data?.orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 sm:px-4">
                      <p className="text-sm sm:text-base font-medium text-gray-900">{order.orderNumber}</p>
                      {order.barcode && (
                        <p className="text-xs text-gray-500 truncate">Cód: {order.barcode}</p>
                      )}
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <p className="text-xs sm:text-sm text-gray-900 truncate">{order.customerName}</p>
                      {order.customerEmail && (
                        <p className="text-xs text-gray-500 truncate hidden sm:block">{order.customerEmail}</p>
                      )}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600">
                      {format(new Date(order.createdAt), 'dd/MM/yy')}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-900">
                      R$ {Number(order.totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 truncate">
                      {order.currentDepartment?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data?.orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">
              {search || status ? 'Tente ajustar os filtros' : 'Ainda não há pedidos cadastrados'}
            </p>
          </div>
        )}

        {/* Paginação */}
        {data && data.orders.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={data.pagination.pages}
              totalItems={data.pagination.total}
              itemsPerPage={20}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
