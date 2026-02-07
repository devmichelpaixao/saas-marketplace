import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { toast } from 'sonner'
import ImageUpload from '../components/ImageUpload'
import ConfirmModal from '../components/ConfirmModal'
import { useDebounce } from '../hooks/useDebounce'
import { exportToExcel, exportToCSV, ExportColumn, formatters } from '../utils/export'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  X,
  Save,
  AlertCircle,
  FileSpreadsheet,
  FileText
} from 'lucide-react'

interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  cost: number
  price: number
  stock: number
  barcode: string | null
  images: string[]
  active: boolean
  createdAt: string
  category?: { id: string; name: string }
  productGroup?: { id: string; name: string }
  department?: { id: string; name: string }
}

interface ProductFormData {
  sku: string
  name: string
  description: string
  cost: string
  price: string
  stock: string
  barcode: string
  categoryId: string
  productGroupId: string
  departmentId: string
  images: string[]
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Debounce de 300ms
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    description: '',
    cost: '',
    price: '',
    stock: '',
    barcode: '',
    categoryId: '',
    productGroupId: '',
    departmentId: '',
    images: []
  })

  // Queries
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/api/products')
      return res.data
    }
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/api/products/categories')
      return res.data
    }
  })

  const { data: productGroups = [] } = useQuery({
    queryKey: ['product-groups'],
    queryFn: async () => {
      const res = await api.get('/api/products/groups')
      return res.data
    }
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/api/departments')
      return res.data
    }
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await api.post('/api/products', {
        ...data,
        cost: parseFloat(data.cost),
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        images: data.images
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto criado com sucesso!')
      setShowModal(false)
      resetForm()
    },
    onError: () => {
      toast.error('Erro ao criar produto')
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      await api.put(`/api/products/${id}`, {
        ...data,
        cost: parseFloat(data.cost),
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        images: data.images
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto atualizado com sucesso!')
      setShowModal(false)
      resetForm()
    },
    onError: () => {
      toast.error('Erro ao atualizar produto')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto excluído com sucesso!')
      setShowDeleteConfirm(false)
      setSelectedProduct(null)
    },
    onError: () => {
      toast.error('Erro ao excluir produto')
    }
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await api.post('/api/products/bulk-delete', { ids })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`${data.count} produtos excluídos com sucesso!`)
      setShowBulkDeleteConfirm(false)
      setSelectedIds([])
    },
    onError: () => {
      toast.error('Erro ao excluir produtos')
    }
  })

  // Handlers
  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      cost: '',
      price: '',
      stock: '',
      barcode: '',
      categoryId: '',
      productGroupId: '',
      departmentId: '',
      images: []
    })
    setSelectedProduct(null)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      cost: product.cost.toString(),
      price: product.price.toString(),
      stock: product.stock.toString(),
      barcode: product.barcode || '',
      categoryId: product.category?.id || '',
      productGroupId: product.productGroup?.id || '',
      departmentId: product.department?.id || '',
      images: product.images || []
    })
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id)
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedProducts.map((p: Product) => p.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      bulkDeleteMutation.mutate(selectedIds)
    }
  }

  const handleExportExcel = (selectedOnly = false) => {
    try {
      const productsToExport = selectedOnly
        ? filteredProducts.filter((p: Product) => selectedIds.includes(p.id))
        : filteredProducts

      if (productsToExport.length === 0) {
        toast.error('Nenhum produto para exportar')
        return
      }

      const columns: ExportColumn[] = [
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Nome', key: 'name', width: 30 },
        { header: 'Descrição', key: 'description', width: 40 },
        { header: 'Categoria', key: 'category', format: (cat) => cat?.name || '-', width: 20 },
        { header: 'Departamento', key: 'department', format: (dep) => dep?.name || '-', width: 20 },
        { header: 'Custo (R$)', key: 'cost', format: formatters.currency, width: 15 },
        { header: 'Preço (R$)', key: 'price', format: formatters.currency, width: 15 },
        { header: 'Estoque', key: 'stock', width: 12 },
        { 
          header: 'Margem (%)', 
          key: 'price', 
          format: (_, row) => formatters.number(((row.price - row.cost) / row.cost * 100), 1) + '%',
          width: 12 
        },
        { 
          header: 'Valor Total (R$)', 
          key: 'stock', 
          format: (_, row) => formatters.currency(row.price * row.stock),
          width: 15 
        },
        { header: 'Ativo', key: 'active', format: formatters.boolean, width: 10 },
        { header: 'Criado em', key: 'createdAt', format: formatters.date, width: 15 },
      ]

      exportToExcel(productsToExport, {
        filename: selectedOnly ? 'produtos-selecionados' : 'produtos',
        sheetName: 'Produtos',
        columns,
        autoFilter: true,
        freezeHeader: true
      })

      toast.success(`${productsToExport.length} produtos exportados com sucesso!`)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar produtos')
    }
  }

  const handleExportCSV = (selectedOnly = false) => {
    try {
      const productsToExport = selectedOnly
        ? filteredProducts.filter((p: Product) => selectedIds.includes(p.id))
        : filteredProducts

      if (productsToExport.length === 0) {
        toast.error('Nenhum produto para exportar')
        return
      }

      const columns: ExportColumn[] = [
        { header: 'SKU', key: 'sku' },
        { header: 'Nome', key: 'name' },
        { header: 'Custo', key: 'cost', format: formatters.number },
        { header: 'Preço', key: 'price', format: formatters.number },
        { header: 'Estoque', key: 'stock' },
        { 
          header: 'Margem %', 
          key: 'price', 
          format: (_, row) => formatters.number(((row.price - row.cost) / row.cost * 100), 1)
        },
      ]

      exportToCSV(productsToExport, {
        filename: selectedOnly ? 'produtos-selecionados' : 'produtos',
        columns
      })

      toast.success(`${productsToExport.length} produtos exportados!`)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar produtos')
    }
  }

  // Filters
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
    const matchesStock = filterStock === 'all' ? true :
                        filterStock === 'low' ? product.stock > 0 && product.stock < 10 :
                        product.stock === 0
    
    return matchesSearch && matchesStock
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats
  const stats = {
    total: products.length,
    lowStock: products.filter((p: Product) => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter((p: Product) => p.stock === 0).length,
    totalValue: products.reduce((sum: number, p: Product) => sum + (p.price * p.stock), 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <div className="flex gap-2">
          {/* Dropdown de Exportação */}
          <div className="relative group">
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleExportExcel(false)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                Excel (todos)
              </button>
              <button
                onClick={() => handleExportCSV(false)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                CSV (todos)
              </button>
              {selectedIds.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => handleExportExcel(true)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Excel (selecionados)
                  </button>
                  <button
                    onClick={() => handleExportCSV(true)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    CSV (selecionados)
                  </button>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn-primary flex items-center gap-2"
            data-action="new-product"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between animate-slide-in-top">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.length === paginatedProducts.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-primary-900">
              {selectedIds.length} produto(s) selecionado(s)
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Selecionados
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleExportExcel(true)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Excel ({selectedIds.length} itens)
                </button>
                <button
                  onClick={() => handleExportCSV(true)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  CSV ({selectedIds.length} itens)
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Deletar Selecionados
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.lowStock}</p>
            </div>
            <TrendingDown className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalValue)}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou SKU..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStock('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStock === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStock('low')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStock === 'low'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Estoque Baixo
              </button>
              <button
                onClick={() => setFilterStock('out')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStock === 'out'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sem Estoque
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {paginatedProducts.length === 0 && searchTerm === '' && filterStock === 'all' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
          <p className="text-gray-600 mb-6">Comece adicionando seu primeiro produto ao catálogo</p>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Produto
          </button>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-600 mb-4">Tente ajustar os filtros ou termo de busca</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterStock('all')
            }}
            className="btn-secondary"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <>
          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estoque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Margem
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProducts.map((product: Product) => {
                    const margin = ((product.price - product.cost) / product.cost * 100).toFixed(1)
                    const isSelected = selectedIds.includes(product.id)
                    return (
                      <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(product.id)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                              {product.images?.length > 0 ? (
                                <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded object-cover" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category?.name || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 font-mono">{product.sku}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Custo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.cost)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock === 0
                              ? 'bg-red-100 text-red-800'
                              : product.stock < 10
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.stock} un
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${parseFloat(margin) >= 30 ? 'text-green-600' : 'text-gray-900'}`}>
                            {margin}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowDeleteConfirm(true)
                            }}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> de{' '}
                <span className="font-medium">{filteredProducts.length}</span> resultados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
                >
                  Anterior
                </button>
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input"
                    placeholder="ABC123"
                  />
                </div>
                <div>
                  <label className="label">Código de Barras</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="input"
                    placeholder="7891234567890"
                  />
                </div>
              </div>

              <div>
                <label className="label">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Nome do produto"
                />
              </div>

              <div>
                <label className="label">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Descrição detalhada do produto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Custo *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="label">Preço de Venda *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                  {formData.cost && formData.price && parseFloat(formData.price) > 0 && parseFloat(formData.cost) > 0 && (
                    <p className="text-xs mt-1 text-gray-600">
                      Margem: {(((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.cost)) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">Estoque *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Categoria</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input"
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Grupo</label>
                  <select
                    value={formData.productGroupId}
                    onChange={(e) => setFormData({ ...formData, productGroupId: e.target.value })}
                    className="input"
                  >
                    <option value="">Selecione...</option>
                    {productGroups.map((group: any) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Departamento</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="input"
                  >
                    <option value="">Selecione...</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload de Imagens */}
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData({ ...formData, images })}
                maxImages={5}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {selectedProduct ? 'Atualizar' : 'Criar'} Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setSelectedProduct(null)
        }}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={
          <>
            Tem certeza que deseja excluir o produto <strong>{selectedProduct?.name}</strong>?
            <p className="text-sm text-gray-600 mt-2">Esta ação não pode ser desfeita</p>
          </>
        }
        confirmText="Excluir Produto"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Confirmar Exclusão em Massa"
        message={
          <>
            Tem certeza que deseja excluir <strong>{selectedIds.length} produtos</strong>?
            <p className="text-sm text-gray-600 mt-2">Esta ação não pode ser desfeita</p>
          </>
        }
        confirmText={`Excluir ${selectedIds.length} Produtos`}
        variant="danger"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}
