import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { lazy, Suspense, useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { OnboardingProvider } from './contexts/OnboardingContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import SkeletonLoader from './components/SkeletonLoader'
import SplashScreen from './components/SplashScreen'
import { AnimatePresence } from 'framer-motion'

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout'

// Pages - Eager load (autenticação)
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Pages - Lazy load (otimização)
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'))
const ExpeditionPage = lazy(() => import('./pages/ExpeditionPage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const QuestionsPage = lazy(() => import('./pages/QuestionsPage'))
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const BillingPage = lazy(() => import('./pages/BillingPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'))
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'))

function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <SkeletonLoader type="stats" />
        <SkeletonLoader type="card" />
      </div>
    }>
      {children}
    </Suspense>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ErrorBoundary>
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
      
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <OnboardingProvider>
              <SocketProvider>
                <Toaster position="top-right" richColors />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <DashboardLayout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<LazyRoute><DashboardPage /></LazyRoute>} />
                    <Route path="products" element={<LazyRoute><ProductsPage /></LazyRoute>} />
                    <Route path="orders" element={<LazyRoute><OrdersPage /></LazyRoute>} />
                    <Route path="departments" element={<LazyRoute><DepartmentsPage /></LazyRoute>} />
                    <Route path="expedition" element={<LazyRoute><ExpeditionPage /></LazyRoute>} />
                    <Route path="tasks" element={<LazyRoute><TasksPage /></LazyRoute>} />
                    <Route path="messages" element={<LazyRoute><MessagesPage /></LazyRoute>} />
                    <Route path="questions" element={<LazyRoute><QuestionsPage /></LazyRoute>} />
                    <Route path="integrations" element={<LazyRoute><IntegrationsPage /></LazyRoute>} />
                    <Route path="reports" element={<LazyRoute><ReportsPage /></LazyRoute>} />
                    <Route path="billing" element={<LazyRoute><BillingPage /></LazyRoute>} />
                    <Route path="settings" element={<LazyRoute><SettingsPage /></LazyRoute>} />
                    <Route path="users" element={<LazyRoute><UsersPage /></LazyRoute>} />
                    <Route path="audit-logs" element={<LazyRoute><AuditLogsPage /></LazyRoute>} />
                    <Route path="invoices" element={<LazyRoute><InvoicesPage /></LazyRoute>} />
                  </Route>
                </Routes>
              </SocketProvider>
            </OnboardingProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
