import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  Users,
  Send,
  CheckSquare,
  MessageSquare,
  HelpCircle,
  Plug,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
  Search,
  Receipt,
} from 'lucide-react'
import { useState } from 'react'
import Logo from '../Logo'
import NotificationCenter from '../NotificationCenter'
import Breadcrumbs from '../Breadcrumbs'
import CommandPalette from '../CommandPalette'
import { useCommandPalette } from '../../hooks/useCommandPalette'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isOpen, open, close } = useCommandPalette()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, id: 'nav-dashboard' },
    { name: 'Produtos', href: '/products', icon: Package, id: 'nav-products' },
    { name: 'Pedidos', href: '/orders', icon: ShoppingCart, id: 'nav-orders' },
    { name: 'Notas Fiscais', href: '/invoices', icon: Receipt, id: 'nav-invoices' },
    { name: 'Departamentos', href: '/departments', icon: Building2, id: 'nav-departments' },
    { name: 'Usuários', href: '/users', icon: Users, id: 'nav-users' },
    { name: 'Expedição', href: '/expedition', icon: Send, id: 'nav-expedition' },
    { name: 'Tarefas', href: '/tasks', icon: CheckSquare, id: 'nav-tasks' },
    { name: 'Mensagens', href: '/messages', icon: MessageSquare, id: 'nav-messages' },
    { name: 'Perguntas', href: '/questions', icon: HelpCircle, id: 'nav-questions' },
    { name: 'Integrações', href: '/integrations', icon: Plug, id: 'nav-integrations' },
    { name: 'Relatórios', href: '/reports', icon: BarChart3, id: 'nav-reports' },
  ]

  const adminNavigation = user?.role === 'ADMIN' ? [
    { name: 'Logs de Auditoria', href: '/audit-logs', icon: Settings, id: 'nav-audit' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 lg:bg-none lg:from-transparent lg:to-transparent">
            <Logo className="h-8" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 lg:hover:bg-gray-100 text-white lg:text-gray-700 transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {[...navigation, ...adminNavigation].map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  id={item.id}
                  to={item.href}
                  className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 text-sm md:text-base ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                to="/settings"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="transition-all duration-200 lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-colors">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="flex-1 hidden sm:block" />
            
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <button
                onClick={open}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title="Abrir busca rápida (Cmd+K)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Buscar...</span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded">
                  ⌘K
                </kbd>
              </button>
              <NotificationCenter />
              <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
                <span className="hidden sm:inline">Bem-vindo, </span>
                <span className="font-semibold text-gray-900">{user?.name}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Command Palette */}
      <CommandPalette isOpen={isOpen} onClose={close} />
    </div>
  )
}
