import { Redis } from 'ioredis'

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Não conectar automaticamente
  retryStrategy(times: number) {
    // Desabilitar reconexão automática
    return null
  },
  reconnectOnError(err: Error) {
    return false
  },
}

export const redis = new Redis(redisConfig)

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (error) => {
  console.warn('⚠️  Redis não disponível (continuando sem cache):', error.message)
})

redis.on('close', () => {
  console.log('⚠️ Redis connection closed')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await redis.quit()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await redis.quit()
  process.exit(0)
})
