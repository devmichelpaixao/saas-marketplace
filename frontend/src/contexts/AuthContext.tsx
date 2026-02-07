import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'
import { setSentryUser } from '../config/sentry'

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  tenantId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 AuthContext: Inicializando...')
    try {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      console.log('📦 Token no localStorage:', token ? 'SIM' : 'NÃO')
      console.log('📦 User no localStorage:', savedUser ? 'SIM' : 'NÃO')
      
      if (token && savedUser) {
        const user = JSON.parse(savedUser)
        setUser(user)
        console.log('✅ Usuário restaurado:', user.email)
      }
    } catch (error) {
      console.error('❌ Erro ao ler localStorage:', error)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password }, {
      headers: {
        'X-Tenant-ID': 'demo'
      }
    })
    const { token, user } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    
    // Registrar usuário no Sentry
    setSentryUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    
    // Limpar usuário do Sentry
    setSentryUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
