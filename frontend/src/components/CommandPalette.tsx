import { useEffect } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Home,
  Package,
  ShoppingCart,
  Users,
  Building2,
  Settings,
  Plus,
  TrendingUp,
  Download,
  X
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()

  // Buscar dados recentes para quick actions
  const { data: products = [] } = useQuery({
    queryKey: ['products-search'],
    queryFn: async () => {
      const res = await api.get('/api/products', { params: { limit: 5 } })
      return res.data
    },
    enabled: isOpen
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['orders-search'],
    queryFn: async () => {
      const res = await api.get('/api/orders', { params: { limit: 5 } })
      return res.data?.orders || []
    },
    enabled: isOpen
  })

  // Fechar com ESC
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onClose])

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Command Palette */}
          <div className="absolute inset-0 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <Command className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center border-b border-gray-200 px-4">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <Command.Input
                    placeholder="Buscar ações, páginas, produtos..."
                    className="w-full h-14 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400"
                    autoFocus
                  />
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                  <Command.Empty className="py-12 text-center text-gray-500">
                    Nenhum resultado encontrado
                  </Command.Empty>

                  {/* Navegação */}
                  <Command.Group heading="Navegação" className="px-2 py-2">
                    <p className="text-xs font-semibold text-gray-500 mb-2">NAVEGAÇÃO</p>
                    
                    <CommandItem
                      icon={<Home className="w-4 h-4" />}
                      label="Dashboard"
                      description="Visão geral do negócio"
                      onSelect={() => handleAction(() => navigate('/'))}
                      keywords={['home', 'inicio', 'principal']}
                    />
                    
                    <CommandItem
                      icon={<Package className="w-4 h-4" />}
                      label="Produtos"
                      description="Gerenciar catálogo e estoque"
                      onSelect={() => handleAction(() => navigate('/products'))}
                      keywords={['produtos', 'estoque', 'catalogo']}
                    />
                    
                    <CommandItem
                      icon={<ShoppingCart className="w-4 h-4" />}
                      label="Pedidos"
                      description="Visualizar e gerenciar pedidos"
                      onSelect={() => handleAction(() => navigate('/orders'))}
                      keywords={['pedidos', 'vendas', 'orders']}
                    />
                    
                    <CommandItem
                      icon={<Users className="w-4 h-4" />}
                      label="Usuários"
                      description="Gerenciar equipe"
                      onSelect={() => handleAction(() => navigate('/users'))}
                      keywords={['usuarios', 'equipe', 'colaboradores']}
                    />
                    
                    <CommandItem
                      icon={<Building2 className="w-4 h-4" />}
                      label="Departamentos"
                      description="Organizar setores"
                      onSelect={() => handleAction(() => navigate('/departments'))}
                      keywords={['departamentos', 'setores']}
                    />
                    
                    <CommandItem
                      icon={<Settings className="w-4 h-4" />}
                      label="Configurações"
                      description="Ajustar preferências"
                      onSelect={() => handleAction(() => navigate('/settings'))}
                      keywords={['configuracoes', 'settings', 'preferencias']}
                    />
                  </Command.Group>

                  {/* Ações Rápidas */}
                  <Command.Group heading="Ações" className="px-2 py-2">
                    <p className="text-xs font-semibold text-gray-500 mb-2 mt-4">AÇÕES RÁPIDAS</p>
                    
                    <CommandItem
                      icon={<Plus className="w-4 h-4" />}
                      label="Novo Produto"
                      description="Adicionar ao catálogo"
                      onSelect={() => handleAction(() => navigate('/products?new=true'))}
                      keywords={['novo', 'criar', 'adicionar', 'produto']}
                    />
                    
                    <CommandItem
                      icon={<Plus className="w-4 h-4" />}
                      label="Novo Pedido"
                      description="Registrar venda"
                      onSelect={() => handleAction(() => navigate('/orders?new=true'))}
                      keywords={['novo', 'criar', 'pedido', 'venda']}
                    />
                    
                    <CommandItem
                      icon={<Download className="w-4 h-4" />}
                      label="Exportar Produtos"
                      description="Download em Excel/CSV"
                      onSelect={() => handleAction(() => navigate('/products?export=true'))}
                      keywords={['exportar', 'download', 'excel', 'csv']}
                    />
                    
                    <CommandItem
                      icon={<TrendingUp className="w-4 h-4" />}
                      label="Ver Relatórios"
                      description="Análises e métricas"
                      onSelect={() => handleAction(() => navigate('/reports'))}
                      keywords={['relatorios', 'analytics', 'metricas']}
                    />
                  </Command.Group>

                  {/* Produtos Recentes */}
                  {products.length > 0 && (
                    <Command.Group heading="Produtos" className="px-2 py-2">
                      <p className="text-xs font-semibold text-gray-500 mb-2 mt-4">PRODUTOS RECENTES</p>
                      {products.slice(0, 5).map((product: any) => (
                        <CommandItem
                          key={product.id}
                          icon={<Package className="w-4 h-4" />}
                          label={product.name}
                          description={`R$ ${product.price.toFixed(2)} • Estoque: ${product.stock}`}
                          onSelect={() => handleAction(() => navigate(`/products/${product.id}`))}
                          keywords={[product.name, product.sku]}
                        />
                      ))}
                    </Command.Group>
                  )}

                  {/* Pedidos Recentes */}
                  {orders.length > 0 && (
                    <Command.Group heading="Pedidos" className="px-2 py-2">
                      <p className="text-xs font-semibold text-gray-500 mb-2 mt-4">PEDIDOS RECENTES</p>
                      {orders.slice(0, 5).map((order: any) => (
                        <CommandItem
                          key={order.id}
                          icon={<ShoppingCart className="w-4 h-4" />}
                          label={`Pedido #${order.id.slice(0, 8)}`}
                          description={`${order.customer} • R$ ${order.total?.toFixed(2) || '0.00'}`}
                          onSelect={() => handleAction(() => navigate(`/orders/${order.id}`))}
                          keywords={[order.customer, order.id]}
                        />
                      ))}
                    </Command.Group>
                  )}
                </Command.List>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑↓</kbd>
                        Navegar
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↵</kbd>
                        Selecionar
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">ESC</kbd>
                        Fechar
                      </span>
                    </div>
                  </div>
                </div>
              </Command>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Component helper para items
function CommandItem({
  icon,
  label,
  description,
  onSelect,
  keywords = []
}: {
  icon: React.ReactNode
  label: string
  description?: string
  onSelect: () => void
  keywords?: string[]
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 aria-selected:bg-primary-50 aria-selected:text-primary-600"
    >
      <div className="flex-shrink-0 text-gray-400 aria-selected:text-primary-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {label}
        </div>
        {description && (
          <div className="text-xs text-gray-500 truncate">
            {description}
          </div>
        )}
      </div>
    </Command.Item>
  )
}
