import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { createContextLogger } from '../config/logger'

// Estender Request para incluir logger e requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string
      logger: ReturnType<typeof createContextLogger>
      startTime: number
    }
  }
}

/**
 * Middleware para adicionar request ID e logger contextual a cada request
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Gerar request ID único
  req.requestId = req.headers['x-request-id'] as string || uuidv4()
  req.startTime = Date.now()
  
  // Criar logger contextual com request ID
  const context: any = {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
  }
  
  // Adicionar tenant e user se disponíveis
  if ((req as any).tenantId) {
    context.tenantId = (req as any).tenantId
  }
  
  if ((req as any).userId) {
    context.userId = (req as any).userId
  }
  
  req.logger = createContextLogger(context)
  
  // Log da request
  req.logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers['user-agent'],
    body: shouldLogBody(req) ? sanitizeBody(req.body) : undefined,
  })
  
  // Adicionar request ID ao response header
  res.setHeader('X-Request-ID', req.requestId)
  
  // Interceptar response para logar
  const originalSend = res.send
  const originalJson = res.json
  
  res.send = function(data: any) {
    logResponse(req, res)
    return originalSend.call(this, data)
  }
  
  res.json = function(data: any) {
    logResponse(req, res)
    return originalJson.call(this, data)
  }
  
  // Log de erros não capturados
  res.on('finish', () => {
    if (res.statusCode >= 400 && !res.locals.logged) {
      logResponse(req, res)
    }
  })
  
  next()
}

/**
 * Logar resposta
 */
function logResponse(req: Request, res: Response) {
  if (res.locals.logged) return // Evitar log duplicado
  res.locals.logged = true
  
  const duration = Date.now() - req.startTime
  const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
  
  req.logger[level]('Request completed', {
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    contentLength: res.get('content-length'),
  })
}

/**
 * Verificar se deve logar body (evitar logar senhas, tokens, etc)
 */
function shouldLogBody(req: Request): boolean {
  // Não logar body em rotas sensíveis
  const sensitiveRoutes = ['/api/auth/login', '/api/auth/register', '/api/tenant/register']
  if (sensitiveRoutes.some(route => req.path.includes(route))) {
    return false
  }
  
  // Não logar body muito grande
  const contentLength = parseInt(req.headers['content-length'] || '0')
  if (contentLength > 10000) {
    return false
  }
  
  return req.method !== 'GET' && req.body && Object.keys(req.body).length > 0
}

/**
 * Remover campos sensíveis do body antes de logar
 */
function sanitizeBody(body: any): any {
  if (!body) return body
  
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken']
  const sanitized = { ...body }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***'
    }
  }
  
  return sanitized
}

/**
 * Middleware para logar erros
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Logar erro com contexto completo
  req.logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    statusCode: res.statusCode || 500,
    duration: `${Date.now() - req.startTime}ms`,
  })
  
  next(err)
}
