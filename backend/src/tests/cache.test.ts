import request from 'supertest'
import { app } from '../server'
import { redis } from '../config/redis'
import { invalidateCache, getCacheStats } from '../middlewares/cache.middleware'

describe('Cache Middleware', () => {
  beforeAll(async () => {
    // Limpar cache antes dos testes
    await redis.flushdb()
  })

  afterAll(async () => {
    await redis.flushdb()
    await redis.quit()
  })

  describe('Cache Hit/Miss', () => {
    it('should cache GET requests', async () => {
      // Primeira request - cache MISS
      const res1 = await request(app)
        .get('/api/tenant/plans')
        .expect(200)

      expect(res1.headers['x-cache']).toBe('MISS')
      expect(res1.headers['x-cache-key']).toContain('plans')

      // Segunda request - cache HIT
      const res2 = await request(app)
        .get('/api/tenant/plans')
        .expect(200)

      expect(res2.headers['x-cache']).toBe('HIT')
      expect(res2.body).toEqual(res1.body)
    })

    it('should respect TTL', async () => {
      // Mock de rota com TTL curto (1 segundo)
      await request(app)
        .get('/api/tenant/plans')
        .expect(200)

      // Aguardar TTL expirar
      await new Promise(resolve => setTimeout(resolve, 1100))

      // Cache deve ter expirado
      const res = await request(app)
        .get('/api/tenant/plans')
        .expect(200)

      expect(res.headers['x-cache']).toBe('MISS')
    })

    it('should skip cache when nocache=1', async () => {
      const res1 = await request(app)
        .get('/api/tenant/plans?nocache=1')
        .expect(200)

      expect(res1.headers['x-cache']).toBeUndefined()

      const res2 = await request(app)
        .get('/api/tenant/plans?nocache=1')
        .expect(200)

      expect(res2.headers['x-cache']).toBeUndefined()
    })
  })

  describe('Cache Invalidation', () => {
    it('should invalidate cache by pattern', async () => {
      // Criar cache
      await redis.set('cache:products:1', JSON.stringify({ id: 1 }))
      await redis.set('cache:products:2', JSON.stringify({ id: 2 }))
      await redis.set('cache:orders:1', JSON.stringify({ id: 1 }))

      // Invalidar produtos
      const deleted = await invalidateCache('cache:products:*')

      expect(deleted).toBe(2)

      // Verificar que produtos foram deletados
      const prod1 = await redis.get('cache:products:1')
      const prod2 = await redis.get('cache:products:2')
      const order1 = await redis.get('cache:orders:1')

      expect(prod1).toBeNull()
      expect(prod2).toBeNull()
      expect(order1).not.toBeNull() // Order ainda existe
    })

    it('should auto-invalidate on POST/PUT/DELETE', async () => {
      // Criar produto e cachear lista
      const token = 'valid_token' // Mock token

      // Criar cache de produtos
      await redis.set('cache:products:tenant:abc123:*', JSON.stringify([]))

      // Criar produto (deve invalidar cache)
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Product', price: 100 })

      // Aguardar invalidação assíncrona
      await new Promise(resolve => setTimeout(resolve, 100))

      // Cache deve ter sido invalidado
      const cached = await redis.get('cache:products:tenant:abc123:*')
      expect(cached).toBeNull()
    })
  })

  describe('Cache Stats', () => {
    it('should return cache statistics', async () => {
      const stats = await getCacheStats()

      expect(stats).toHaveProperty('totalKeys')
      expect(stats).toHaveProperty('cacheKeys')
      expect(stats).toHaveProperty('hitRate')
      expect(stats).toHaveProperty('memory')
    })
  })

  describe('Vary By Parameters', () => {
    it('should cache separately by tenantId', async () => {
      // Criar cache para tenant1
      await redis.set('cache:products:tenant:tenant1:*', JSON.stringify([{ id: 1 }]))
      
      // Criar cache para tenant2
      await redis.set('cache:products:tenant:tenant2:*', JSON.stringify([{ id: 2 }]))

      const cache1 = await redis.get('cache:products:tenant:tenant1:*')
      const cache2 = await redis.get('cache:products:tenant:tenant2:*')

      expect(JSON.parse(cache1!)).toEqual([{ id: 1 }])
      expect(JSON.parse(cache2!)).toEqual([{ id: 2 }])
    })

    it('should cache separately by query params', async () => {
      const res1 = await request(app)
        .get('/api/tenant/plans?plan=basic')
        .expect(200)

      const res2 = await request(app)
        .get('/api/tenant/plans?plan=premium')
        .expect(200)

      // Devem ter chaves diferentes
      expect(res1.headers['x-cache-key']).not.toBe(res2.headers['x-cache-key'])
    })
  })

  describe('Error Handling', () => {
    it('should continue on Redis error', async () => {
      // Simular erro no Redis (desconectar)
      await redis.disconnect()

      // Request deve funcionar sem cache
      const res = await request(app)
        .get('/api/tenant/plans')
        .expect(200)

      expect(res.body).toBeDefined()
      expect(res.headers['x-cache']).toBeUndefined()

      // Reconectar
      await redis.connect()
    })
  })
})
