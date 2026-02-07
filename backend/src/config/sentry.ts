import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { Application } from 'express'

export const initSentry = (app: Application) => {
  const dsn = process.env.SENTRY_DSN
  
  if (!dsn) {
    console.log('⚠️  Sentry não configurado (SENTRY_DSN não definido)')
    return
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    
    integrations: [
      // Performance Monitoring
      Sentry.httpIntegration(),
      nodeProfilingIntegration(),
      
      // Rastreamento de requisições Express
      Sentry.expressIntegration({ app }),
    ],
    
    // Performance
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Antes de enviar
    beforeSend(event, hint) {
      // Não enviar em desenvolvimento (a menos que forçado)
      if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV) {
        console.log('🐛 Sentry (dev):', event.message || event.exception)
        return null
      }
      
      return event
    },
  })

  console.log('✅ Sentry inicializado')
}

// Middleware para rastreamento de requisições
export const sentryRequestHandler = () => {
  if (!process.env.SENTRY_DSN) {
    return (req: any, res: any, next: any) => next()
  }
  return Sentry.expressIntegration
}

// Middleware de trackeamento
export const sentryTracingHandler = () => {
  if (!process.env.SENTRY_DSN) {
    return (req: any, res: any, next: any) => next()
  }
  return Sentry.expressIntegration
}

// Middleware para captura de erros
export const sentryErrorHandler = () => {
  if (!process.env.SENTRY_DSN) {
    return (err: any, req: any, res: any, next: any) => next(err)
  }
  return (err: any, req: any, res: any, next: any) => next(err)
}

// Definir usuário no contexto
export const setSentryUser = (userId: string, email: string, tenantId: string) => {
  Sentry.setUser({
    id: userId,
    email,
  })
  Sentry.setTag('tenant_id', tenantId)
}

// Capturar exceção manualmente
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  })
}

// Capturar mensagem
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level)
}
