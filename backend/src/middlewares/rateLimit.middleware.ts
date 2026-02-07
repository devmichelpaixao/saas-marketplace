import rateLimit from 'express-rate-limit'
// import RedisStore from 'rate-limit-redis'
// import { redis } from '../config/redis'

// Rate limit geral - 100 requests por 15 minutos
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos',
    retryAfter: '15 minutos',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // store: new RedisStore({
  //   // @ts-expect-error - RedisStore aceita ioredis
  //   client: redis,
  //   prefix: 'rl:general:',
  // }),
  skip: (req) => {
    // Skip health checks
    return req.path.startsWith('/health')
  },
})

// Rate limit para autenticação - 20 tentativas por 15 minutos (mais permissivo para desenvolvimento)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true, // Não conta requests bem-sucedidos
  message: {
    error: 'Muitas tentativas de login, aguarde 15 minutos',
    retryAfter: '15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // store: new RedisStore({
  //   // @ts-expect-error - RedisStore aceita ioredis
  //   client: redis,
  //   prefix: 'rl:auth:',
  // }),
})

// Rate limit por tenant - 60 requests por minuto
export const tenantLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,
  message: {
    error: 'Limite de requisições do tenant excedido',
    retryAfter: '1 minuto',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    return req.tenantId || req.ip
  },
  // store: new RedisStore({
  //   // @ts-expect-error - RedisStore aceita ioredis
  //   client: redis,
  //   prefix: 'rl:tenant:',
  // }),
  skip: (req) => {
    // Skip para requisições internas e health checks
    return req.path.startsWith('/health') || req.path.startsWith('/metrics')
  },
})

// Rate limit para APIs públicas - 30 requests por minuto
export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'Limite de API pública excedido',
    retryAfter: '1 minuto',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // store: new RedisStore({
  //   // @ts-expect-error - RedisStore aceita ioredis
  //   client: redis,
  //   prefix: 'rl:public:',
  // }),
})

// Rate limit para criação de recursos - 10 por minuto
export const createResourceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'Muitas criações em sequência, aguarde um momento',
    retryAfter: '1 minuto',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => {
    return `${req.tenantId}:${req.userId}` || req.ip
  },
  // store: new RedisStore({
  //   // @ts-expect-error - RedisStore aceita ioredis
  //   client: redis,
  //   prefix: 'rl:create:',
  // }),
})
