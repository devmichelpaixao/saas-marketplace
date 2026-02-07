import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { format } from 'date-fns'
import { useState } from 'react'
import { Search, Filter, CheckCircle2 } from 'lucide-react'
import Pagination from '../components/Pagination'

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/api/tasks')
      return res.data
    },
  })

  // Filtros
  const filteredTasks = tasks?.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  // Paginação
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'IN_PROGRESS', label: 'Em Progresso' },
    { value: 'COMPLETED', label: 'Concluída' }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tarefas</h1>
        <p className="text-sm text-gray-600 mt-1">Gerencie suas tarefas e acompanhe o progresso</p>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Buscar tarefas..."
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="input w-full sm:w-48"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando tarefas...</p>
        </div>
      ) : paginatedTasks.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa cadastrada'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros' : 'Tarefas aparecerão aqui quando criadas'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:gap-4">
            {paginatedTasks.map((task: any) => (
          <div key={task.id} className="card">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{task.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{task.description}</p>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span>Prazo: {format(new Date(task.dueDate), 'dd/MM/yyyy')}</span>
                  {task.order && <span>Pedido: {task.order.orderNumber}</span>}
                  {task.department && <span className="truncate">Depto: {task.department.name}</span>}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap self-start ${
                task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTasks.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}
