import * as Sentry from '@sentry/react'

export const initSentry = () => {
  // Só inicializar em produção ou se DSN estiver configurado
  const dsn = import.meta.env.VITE_SENTRY_DSN
  
  if (!dsn) {
    console.log('Sentry não configurado (VITE_SENTRY_DSN não definido)')
    return
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    
    // Integração com React
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% das sessões
    replaysOnErrorSampleRate: 1.0, // 100% quando tem erro
    
    // Ignorar erros conhecidos/esperados
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
    ],
    
    // Antes de enviar, adicionar contexto
    beforeSend(event, hint) {
      // Não enviar erros de desenvolvimento
      if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_SENTRY_DEV) {
        return null
      }
      
      // Adicionar informações extras
      const error = hint.originalException
      if (error && typeof error === 'object') {
        event.extra = {
          ...event.extra,
          errorInfo: error,
        }
      }
      
      return event
    },
  })
}

// Definir usuário quando logar
export const setSentryUser = (user: {
  id: string
  email: string
  name: string
  tenantId: string
  role: string
} | null) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    })
    
    Sentry.setTag('tenant_id', user.tenantId)
    Sentry.setTag('user_role', user.role)
  } else {
    Sentry.setUser(null)
  }
}

// Capturar erro manualmente
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  })
}

// Capturar mensagem (não erro, mas importante)
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level)
}

// Adicionar breadcrumb (rastro de navegação)
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  })
}
