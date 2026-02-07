import { Router, Request, Response } from 'express'
import { prisma } from '../config/database'
import { redis } from '../config/redis'

const router = Router()

// Liveness Probe - Sistema está vivo?
// Usado por Kubernetes/Docker para saber se precisa reiniciar o container
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'saas-marketplace-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Readiness Probe - Sistema pode receber tráfego?
// Verifica se todas as dependências estão funcionando
router.get('/ready', async (req: Request, res: Response) => {
  const checks: Record<string, any> = {
    database: { status: 'unknown', message: '', responseTime: 0 },
    redis: { status: 'unknown', message: '', responseTime: 0 },
    sentry: { status: 'unknown', message: '' },
  }

  let allHealthy = true

  // Check Database
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1 as health`
    const responseTime = Date.now() - start
    
    checks.database = {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime: `${responseTime}ms`,
    }
  } catch (error: any) {
    allHealthy = false
    checks.database = {
      status: 'unhealthy',
      message: error.message || 'Database connection failed',
      responseTime: 0,
    }
  }

  // Check Redis
  try {
    const start = Date.now()
    const pong = await redis.ping()
    const responseTime = Date.now() - start
    
    if (pong === 'PONG') {
      checks.redis = {
        status: 'healthy',
        message: 'Redis connection successful',
        responseTime: `${responseTime}ms`,
      }
    } else {
      allHealthy = false
      checks.redis = {
        status: 'unhealthy',
        message: 'Redis ping failed',
        responseTime: `${responseTime}ms`,
      }
    }
  } catch (error: any) {
    allHealthy = false
    checks.redis = {
      status: 'unhealthy',
      message: error.message || 'Redis connection failed',
      responseTime: 0,
    }
  }

  // Check Sentry
  if (process.env.SENTRY_DSN) {
    checks.sentry = {
      status: 'configured',
      message: 'Sentry monitoring is active',
    }
  } else {
    checks.sentry = {
      status: 'not_configured',
      message: 'Sentry DSN not set (monitoring disabled)',
    }
  }

  const statusCode = allHealthy ? 200 : 503
  const overallStatus = allHealthy ? 'ready' : 'not_ready'

  res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  })
})

// Health Check Detalhado - Informações completas
router.get('/health', async (req: Request, res: Response) => {
  const checks: Record<string, any> = {
    service: 'saas-marketplace-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(process.uptime()),
      formatted: formatUptime(process.uptime()),
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
      },
      cpu: process.cpuUsage(),
    },
    dependencies: {
      database: { status: 'unknown', responseTime: 0 },
      redis: { status: 'unknown', responseTime: 0 },
      sentry: { status: 'unknown' },
    },
  }

  let allHealthy = true

  // Database Check
  try {
    const start = Date.now()
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        COUNT(*) as total_connections,
        pg_database_size(current_database()) as db_size
      FROM pg_stat_activity
    `
    const responseTime = Date.now() - start
    
    checks.dependencies.database = {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      activeConnections: Number(result[0]?.total_connections || 0),
      databaseSize: `${Math.round(Number(result[0]?.db_size || 0) / 1024 / 1024)}MB`,
    }
  } catch (error: any) {
    allHealthy = false
    checks.dependencies.database = {
      status: 'unhealthy',
      error: error.message,
      responseTime: 0,
    }
  }

  // Redis Check
  try {
    const start = Date.now()
    const [pong, info] = await Promise.all([
      redis.ping(),
      redis.info('memory'),
    ])
    const responseTime = Date.now() - start
    
    // Parse memory info
    const usedMemory = info.match(/used_memory_human:([^\r\n]+)/)?.[1]
    
    checks.dependencies.redis = {
      status: pong === 'PONG' ? 'healthy' : 'unhealthy',
      responseTime: `${responseTime}ms`,
      memoryUsed: usedMemory?.trim() || 'unknown',
    }
  } catch (error: any) {
    allHealthy = false
    checks.dependencies.redis = {
      status: 'unhealthy',
      error: error.message,
      responseTime: 0,
    }
  }

  // Sentry Check
  checks.dependencies.sentry = {
    status: process.env.SENTRY_DSN ? 'configured' : 'not_configured',
    dsn: process.env.SENTRY_DSN ? 'set' : 'not_set',
    environment: process.env.NODE_ENV,
  }

  const statusCode = allHealthy ? 200 : 503
  checks.status = allHealthy ? 'healthy' : 'unhealthy'

  res.status(statusCode).json(checks)
})

// Metrics Endpoint - Métricas básicas (compatível com Prometheus)
router.get('/metrics', async (req: Request, res: Response) => {
  const metrics = {
    timestamp: Date.now(),
    uptime_seconds: Math.floor(process.uptime()),
    memory_usage_bytes: process.memoryUsage(),
    cpu_usage: process.cpuUsage(),
  }

  // Adicionar métricas de banco de dados
  try {
    const dbMetrics = await prisma.$queryRaw<any[]>`
      SELECT 
        (SELECT COUNT(*) FROM tenants) as total_tenants,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections
    `
    
    Object.assign(metrics, {
      database: dbMetrics[0],
    })
  } catch (error) {
    // Ignorar erros silenciosamente
  }

  // Adicionar métricas de Redis
  try {
    const redisInfo = await redis.info('stats')
    const totalCommands = redisInfo.match(/total_commands_processed:(\d+)/)?.[1]
    
    Object.assign(metrics, {
      redis: {
        total_commands: Number(totalCommands) || 0,
      },
    })
  } catch (error) {
    // Ignorar erros silenciosamente
  }

  res.json(metrics)
})

// Helper function
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${secs}s`)

  return parts.join(' ')
}

export default router
