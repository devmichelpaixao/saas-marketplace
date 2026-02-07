import axios from 'axios'
import { errorHandler } from './errorHandler'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token e tenant
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Adicionar X-Tenant-ID para requisições de tenant (exceto superadmin)
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      // Só adiciona X-Tenant-ID se não for Super Admin e não for rota de superadmin
      if (user.role !== 'SUPER_ADMIN' && !config.url?.includes('/superadmin')) {
        // Extrair subdomain do tenantId (tenant-demo -> demo)
        const subdomain = user.tenantId?.replace('tenant-', '') || 'demo'
        config.headers['X-Tenant-ID'] = subdomain
      }
    } catch (e) {
      console.error('Erro ao parsear user do localStorage:', e)
    }
  } else {
    // Se não tiver usuário logado, usar tenant padrão em desenvolvimento
    if (!config.url?.includes('/superadmin')) {
      config.headers['X-Tenant-ID'] = 'demo'
    }
  }
  
  return config
})

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Para erros 401, limpar localStorage e redirecionar
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    // Usar o error handler global para tratamento consistente
    // Mas apenas para ações (mutations), não para queries
    const isQuery = error.config?.method === 'get'
    errorHandler.handle(error, !isQuery)
    
    return Promise.reject(error)
  }
)

export default api
