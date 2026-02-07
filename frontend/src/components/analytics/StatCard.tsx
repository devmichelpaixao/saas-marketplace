import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  subtitle?: string
  trend?: {
    value: number
    label: string
  }
  delay?: number
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  subtitle,
  trend,
  delay = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      className="card group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-3xl font-bold text-gray-900 mt-2 truncate"
          >
            {value}
          </motion.p>

          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">{trend.label}:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                trend.value >= 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className={`p-3 ${iconBgColor} rounded-xl group-hover:shadow-md transition-shadow`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </motion.div>
      </div>
    </motion.div>
  )
}
