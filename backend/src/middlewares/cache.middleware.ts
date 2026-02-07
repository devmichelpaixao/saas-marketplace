import { Request, Response, NextFunction } from 'express'
import { redis } from '../config/redis'

interface CacheOptions {
  ttl?: number // Time to live em segundos (padrão: 300 = 5 minutos)
  keyPrefix?: string // Prefixo para a chave do cache
  varyBy?: string[] // Campos para variar o cache (ex: ['tenantId', 'userId'])
  excludeQuery?: string[] // Query params para ignorar na chave
}

/**
 * Middleware de cache com Redis
 * Cacheia respostas de GET requests automaticamente
 * 
 * @example
 * router.get('/products', cache({ ttl: 600 }), getProducts)
 */
export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutos padrão
    keyPrefix = 'cache',
    varyBy = [],
    excludeQuery = ['_', 'timestamp', 'nocache'],
  } = options

  return async (req: Request, res: Response, next: NextFunction) => {
    // Só cacheia GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Skip se nocache=1 na query
    if (req.query.nocache) {
      return next()
    }

    try {
      // Gerar chave do cache baseada na URL e variações
      const cacheKey = generateCacheKey(req, keyPrefix, varyBy, excludeQuery)
      
      // Tentar obter do cache
      const cachedData = await redis.get(cacheKey)
      
      if (cachedData) {
        // Cache hit!
        const data = JSON.parse(cachedData)
        
        // Adicionar header indicando cache hit
        res.setHeader('X-Cache', 'HIT')
        res.setHeader('X-Cache-Key', cacheKey)
        
        return res.json(data)
      }

      // Cache miss - interceptar res.json para cachear resposta
      const originalJson = res.json.bind(res)
      
      res.json = function(data: any) {
        // Só cacheia respostas 200
        if (res.statusCode === 200) {
          // Cachear de forma assíncrona (não bloquear resposta)
          redis.setex(cacheKey, ttl, JSON.stringify(data)).catch(err => {
            console.error('Cache set error:', err)
          })
        }
        
        // Adicionar headers
        res.setHeader('X-Cache', 'MISS')
        res.setHeader('X-Cache-Key', cacheKey)
        res.setHeader('X-Cache-TTL', ttl.toString())
        
        return originalJson(data)
      }

      next()
    } catch (error) {
      // Em caso de erro no Redis, continuar normalmente
      console.error('Cache middleware error:', error)
      next()
    }
  }
}

/**
 * Invalidar cache por padrão
 * 
 * @example
 * await invalidateCache('cache:products:*')
 * await invalidateCache('cache:orders:tenant:abc123:*')
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern)
    
    if (keys.length === 0) {
      return 0
    }
    
    const deleted = await redis.del(...keys)
    console.log(`Cache invalidated: ${deleted} keys matching ${pattern}`)
    
    return deleted
  } catch (error) {
    console.error('Cache invalidation error:', error)
    return 0
  }
}

/**
 * Invalidar cache de múltiplos padrões
 * 
 * @example
 * await invalidateCacheMultiple(['cache:products:*', 'cache:dashboard:*'])
 */
export async function invalidateCacheMultiple(patterns: string[]): Promise<number> {
  let totalDeleted = 0
  
  for (const pattern of patterns) {
    const deleted = await invalidateCache(pattern)
    totalDeleted += deleted
  }
  
  return totalDeleted
}

/**
 * Invalidar cache por tenant
 * 
 * @example
 * await invalidateCacheByTenant('abc123', 'products')
 */
export async function invalidateCacheByTenant(
  tenantId: string, 
  resource?: string
): Promise<number> {
  const pattern = resource 
    ? `cache:*:tenant:${tenantId}:${resource}:*`
    : `cache:*:tenant:${tenantId}:*`
  
  return invalidateCache(pattern)
}

/**
 * Middleware para invalidar cache automaticamente em POST/PUT/DELETE
 * 
 * @example
 * router.post('/products', invalidateCacheOn(['products', 'dashboard']), createProduct)
 */
export const invalidateCacheOn = (resources: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Só invalidar em métodos que modificam dados
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next()
    }

    // Adicionar hook para invalidar após resposta
    const originalJson = res.json.bind(res)
    
    res.json = function(data: any) {
      // Só invalidar em respostas de sucesso
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidar de forma assíncrona
        const tenantId = (req as any).tenantId
        
        const patterns = resources.map(resource => {
          if (tenantId) {
            return `cache:${resource}:tenant:${tenantId}:*`
          }
          return `cache:${resource}:*`
        })
        
        invalidateCacheMultiple(patterns).catch(err => {
          console.error('Auto-invalidation error:', err)
        })
      }
      
      return originalJson(data)
    }

    next()
  }
}

/**
 * Obter estatísticas do cache
 */
export async function getCacheStats() {
  try {
    const info = await redis.info('stats')
    const keyspace = await redis.info('keyspace')
    
    // Parse info
    const totalKeys = await redis.dbsize()
    const cacheKeys = await redis.keys('cache:*')
    
    return {
      totalKeys,
      cacheKeys: cacheKeys.length,
      hitRate: parseStat(info, 'keyspace_hits') / 
              (parseStat(info, 'keyspace_hits') + parseStat(info, 'keyspace_misses')) * 100,
      memory: parseMemory(info),
    }
  } catch (error) {
    console.error('Cache stats error:', error)
    return null
  }
}

// Helper functions
function generateCacheKey(
  req: Request, 
  prefix: string, 
  varyBy: string[], 
  excludeQuery: string[]
): string {
  const parts = [prefix]
  
  // Adicionar path
  parts.push(req.path.replace(/\//g, ':'))
  
  // Adicionar variações (tenantId, userId, etc)
  for (const field of varyBy) {
    const value = (req as any)[field] || req.query[field] || req.params[field]
    if (value) {
      parts.push(`${field}:${value}`)
    }
  }
  
  // Adicionar query params (ordenados e filtrados)
  const queryParams = { ...req.query }
  excludeQuery.forEach(key => delete queryParams[key])
  
  const sortedQuery = Object.keys(queryParams)
    .sort()
    .map(key => `${key}:${queryParams[key]}`)
    .join(':')
  
  if (sortedQuery) {
    parts.push(sortedQuery)
  }
  
  return parts.join(':')
}

function parseStat(info: string, stat: string): number {
  const match = info.match(new RegExp(`${stat}:(\\d+)`))
  return match ? parseInt(match[1]) : 0
}

function parseMemory(info: string): string {
  const match = info.match(/used_memory_human:([^\r\n]+)/)
  return match ? match[1].trim() : 'unknown'
}
