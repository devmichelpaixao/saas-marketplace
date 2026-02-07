import { motion } from 'framer-motion'
import { Package, AlertCircle, FileText } from 'lucide-react'

interface EmptyStateProps {
  type: 'products' | 'orders' | 'general'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const icons = {
  products: Package,
  orders: FileText,
  general: AlertCircle
}

const defaultMessages = {
  products: {
    title: 'Nenhum produto encontrado',
    description: 'Comece adicionando seu primeiro produto ao catálogo'
  },
  orders: {
    title: 'Nenhum pedido ainda',
    description: 'Os pedidos dos seus clientes aparecerão aqui'
  },
  general: {
    title: 'Nenhum resultado',
    description: 'Tente ajustar os filtros da sua pesquisa'
  }
}

export default function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const Icon = icons[type]
  const message = defaultMessages[type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary-100 rounded-full blur-2xl opacity-50 animate-pulse" />
        <div className="relative p-6 bg-primary-50 rounded-full">
          <Icon className="w-16 h-16 text-primary-600" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-6 max-w-md"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {title || message.title}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {description || message.description}
        </p>
      </motion.div>

      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="btn-primary mt-6"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
