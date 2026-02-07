import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
  LogOut,
  LayoutDashboard,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Users,
  Package,
  ShoppingCart
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  maxUsers: number
  maxProducts: number
  maxOrdersPerMonth: number
  features: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function PlansPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    maxUsers: 5,
    maxProducts: 50,
    maxOrdersPerMonth: 100,
    features: [] as string[],
    active: true
  })
  const [newFeature, setNewFeature] = useState('')

  // Fetch plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/api/super-admin/plans')
      return res.data as Plan[]
    }
  })

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPlan) {
        await api.put(`/api/super-admin/plans/${editingPlan.id}`, data)
      } else {
        await api.post('/api/super-admin/plans', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      closeModal()
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/super-admin/plans/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    }
  })

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api.patch(`/api/super-admin/plans/${id}/status`, { active })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    }
  })

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        maxUsers: plan.maxUsers,
        maxProducts: plan.maxProducts,
        maxOrdersPerMonth: plan.maxOrdersPerMonth,
        features: plan.features,
        active: plan.active
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        maxUsers: 5,
        maxProducts: 50,
        maxOrdersPerMonth: 100,
        features: [],
        active: true
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPlan(null)
    setNewFeature('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const handleDelete = (plan: Plan) => {
    if (confirm(`Tem certeza que deseja deletar o plano "${plan.name}"?`)) {
      deleteMutation.mutate(plan.id)
    }
  }

  const handleToggleActive = (plan: Plan) => {
    toggleActiveMutation.mutate({ id: plan.id, active: !plan.active })
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
                <p className="text-sm text-gray-600">Gestão de Planos</p>
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
              className="px-4 py-3 border-b-2 border-primary-600 text-primary-600 font-medium"
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
        {/* Header com botão criar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Planos Disponíveis</h2>
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Novo Plano
          </button>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <div key={plan.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  </div>
                  <span className={`badge ${plan.active ? 'badge-green' : 'badge-red'}`}>
                    {plan.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="text-3xl font-bold text-primary-600 mb-6">
                  R$ {plan.price.toFixed(2)}
                  <span className="text-sm text-gray-500 font-normal">/mês</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span className="text-sm">Até {plan.maxUsers} usuários</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Package className="w-4 h-4 text-primary-600" />
                    <span className="text-sm">Até {plan.maxProducts} produtos</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <ShoppingCart className="w-4 h-4 text-primary-600" />
                    <span className="text-sm">Até {plan.maxOrdersPerMonth} pedidos/mês</span>
                  </div>
                </div>

                {plan.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Recursos:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => openModal(plan)}
                    className="btn btn-secondary flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`btn ${plan.active ? 'btn-warning' : 'btn-success'} flex-1`}
                  >
                    {plan.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    className="btn btn-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingPlan ? 'Editar Plano' : 'Novo Plano'}
                  </h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Plano *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="Ex: Básico, Profissional, Enterprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input"
                      rows={3}
                      placeholder="Descrição do plano"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço Mensal (R$) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máx. Usuários *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.maxUsers}
                        onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máx. Produtos *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.maxProducts}
                        onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máx. Pedidos/Mês *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.maxOrdersPerMonth}
                        onChange={(e) => setFormData({ ...formData, maxOrdersPerMonth: parseInt(e.target.value) })}
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recursos/Funcionalidades
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        className="input flex-1"
                        placeholder="Digite um recurso e pressione Enter"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="btn btn-secondary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="flex-1 text-sm">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">
                      Plano ativo
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn btn-secondary flex-1"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="btn btn-primary flex-1"
                    >
                      <Save className="w-4 h-4" />
                      {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
