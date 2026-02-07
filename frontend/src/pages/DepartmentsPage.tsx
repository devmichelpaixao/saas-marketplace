import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { Building2, Plus, Edit, Trash2, X, Search } from 'lucide-react'
import { useState } from 'react'
import Pagination from '../components/Pagination'

interface DepartmentForm {
  name: string
  description: string
  color: string
}

export default function DepartmentsPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [formData, setFormData] = useState<DepartmentForm>({
    name: '',
    description: '',
    color: '#3B82F6',
  })

  const queryClient = useQueryClient()

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/api/departments')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: DepartmentForm) => {
      const res = await api.post('/api/departments', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setShowModal(false)
      resetForm()
      alert('Departamento criado com sucesso!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Erro ao criar departamento')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DepartmentForm }) => {
      const res = await api.put(`/api/departments/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setShowModal(false)
      resetForm()
      alert('Departamento atualizado com sucesso!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Erro ao atualizar departamento')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/departments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      alert('Departamento removido com sucesso!')
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Erro ao remover departamento')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
    })
    setEditingDept(null)
  }

  const handleOpenModal = (dept?: any) => {
    if (dept) {
      setEditingDept(dept)
      setFormData({
        name: dept.name,
        description: dept.description || '',
        color: dept.color,
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o departamento "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  // Filtros e paginação
  const filteredDepartments = departments?.filter((dept: any) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage)
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Departamentos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Gerencie os departamentos da empresa</p>
        </div>
        <button 
          className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto" 
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-5 h-5" />
          Novo Departamento
        </button>
      </div>

      {/* Busca */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Buscar departamentos..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {paginatedDepartments.length === 0 && searchTerm === '' ? (
        <div className="card text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum departamento cadastrado</h3>
          <p className="text-gray-600 mb-6">Comece criando seu primeiro departamento</p>
          <button 
            className="btn btn-primary inline-flex items-center gap-2"
            onClick={() => handleOpenModal()}
          >
            <Plus className="w-5 h-5" />
            Criar Departamento
          </button>
        </div>
      ) : paginatedDepartments.length === 0 ? (
        <div className="card text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-600 mb-4">Tente ajustar o termo de busca</p>
          <button 
            className="btn btn-secondary"
            onClick={() => setSearchTerm('')}
          >
            Limpar Busca
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedDepartments.map((dept: any) => (
          <div key={dept.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 sm:p-3 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color + '20' }}>
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: dept.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{dept.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{dept.description}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
              <div className="flex gap-4">
                <span>{dept._count.orders} pedidos</span>
                <span>{dept._count.users} usuários</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(dept)}
                  className="text-primary-600 hover:text-primary-700 p-1"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(dept.id, dept.name)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDepartments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDept ? 'Editar Departamento' : 'Novo Departamento'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Ex: Vendas, Financeiro, TI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Descrição do departamento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input flex-1"
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
