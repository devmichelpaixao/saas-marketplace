import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { redis } from '../config/redis'

describe('Redis Connection', () => {
  afterAll(async () => {
    await redis.quit()
  })

  it('deve conectar ao Redis', async () => {
    const pong = await redis.ping()
    expect(pong).toBe('PONG')
  })

  it('deve armazenar e recuperar valor', async () => {
    await redis.set('test-key', 'test-value')
    const value = await redis.get('test-key')
    expect(value).toBe('test-value')
    await redis.del('test-key')
  })

  it('deve definir TTL em chave', async () => {
    await redis.setex('test-ttl', 60, 'expires-in-60s')
    const ttl = await redis.ttl('test-ttl')
    expect(ttl).toBeGreaterThan(0)
    expect(ttl).toBeLessThanOrEqual(60)
    await redis.del('test-ttl')
  })
})
