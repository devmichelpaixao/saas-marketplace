import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
}

const routeNames: Record<string, string> = {
  '': 'Dashboard',
  'products': 'Produtos',
  'orders': 'Pedidos',
  'departments': 'Departamentos',
  'users': 'Usuários',
  'shipping': 'Expedição',
  'tasks': 'Tarefas',
  'messages': 'Mensagens',
  'questions': 'Perguntas',
  'integrations': 'Integrações',
  'reports': 'Relatórios',
  'settings': 'Configurações',
  'audit-logs': 'Logs de Auditoria',
  'billing': 'Cobrança',
  'expedition': 'Expedição',
}

export default function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Início', path: '/' }
    ]

    let currentPath = ''
    pathnames.forEach((segment) => {
      currentPath += `/${segment}`
      const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({ label, path: currentPath })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Não mostrar breadcrumbs na home
  if (pathnames.length === 0) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4" aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.slice(1).map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 2
        
        return (
          <div key={breadcrumb.path} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {!isLast && breadcrumb.path ? (
              <Link
                to={breadcrumb.path}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {breadcrumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">
                {breadcrumb.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
