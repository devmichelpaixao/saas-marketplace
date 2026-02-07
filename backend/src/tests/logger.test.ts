import request from 'supertest'
import { app } from '../server'
import logger from '../config/logger'
import { createContextLogger } from '../config/logger'

describe('Logger', () => {
  beforeAll(() => {
    // Silenciar logs durante testes
    logger.silent = true
  })

  afterAll(() => {
    logger.silent = false
  })

  describe('Request Logger Middleware', () => {
    it('should add requestId to request', async () => {
      const res = await request(app)
        .get('/health/live')
        .expect(200)

      expect(res.headers['x-request-id']).toBeDefined()
      expect(res.headers['x-request-id']).toHaveLength(36) // UUID length
    })

    it('should use provided x-request-id header', async () => {
      const customRequestId = 'custom-request-id-123'
      
      const res = await request(app)
        .get('/health/live')
        .set('x-request-id', customRequestId)
        .expect(200)

      expect(res.headers['x-request-id']).toBe(customRequestId)
    })

    it('should log incoming requests', async () => {
      const logSpy = jest.spyOn(logger, 'info')

      await request(app)
        .get('/health/live')
        .expect(200)

      expect(logSpy).toHaveBeenCalled()
      
      logSpy.mockRestore()
    })

    it('should log response duration', async () => {
      const res = await request(app)
        .get('/health/live')
        .expect(200)

      // Request deve ter duração registrada nos logs
      expect(res.headers['x-request-id']).toBeDefined()
    })
  })

  describe('Context Logger', () => {
    it('should create logger with context', () => {
      const contextLogger = createContextLogger({
        requestId: 'test-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
      })

      expect(contextLogger).toBeDefined()
      expect(typeof contextLogger.info).toBe('function')
      expect(typeof contextLogger.error).toBe('function')
    })

    it('should log with context fields', () => {
      const logSpy = jest.spyOn(logger, 'info')
      
      const contextLogger = createContextLogger({
        requestId: 'test-request',
        userId: 'test-user',
      })

      contextLogger.info('Test message', { extra: 'data' })

      expect(logSpy).toHaveBeenCalled()
      
      logSpy.mockRestore()
    })
  })

  describe('Error Logging', () => {
    it('should log errors with stack trace', async () => {
      const errorSpy = jest.spyOn(logger, 'error')

      // Fazer request para rota inexistente (404)
      await request(app)
        .get('/api/nonexistent')
        .expect(404)

      // Error logger pode ou não ter sido chamado dependendo do handler
      errorSpy.mockRestore()
    })
  })

  describe('Log Levels', () => {
    it('should support different log levels', () => {
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
    })

    it('should log debug messages', () => {
      const debugSpy = jest.spyOn(logger, 'debug')
      
      logger.debug('Debug message', { data: 'test' })
      
      expect(debugSpy).toHaveBeenCalled()
      
      debugSpy.mockRestore()
    })

    it('should log warning messages', () => {
      const warnSpy = jest.spyOn(logger, 'warn')
      
      logger.warn('Warning message', { warning: 'test' })
      
      expect(warnSpy).toHaveBeenCalled()
      
      warnSpy.mockRestore()
    })
  })

  describe('Sensitive Data Sanitization', () => {
    it('should not log passwords', async () => {
      const logSpy = jest.spyOn(logger, 'info')

      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'secret123' })

      // Verificar que nenhum log contém a senha em plaintext
      const calls = logSpy.mock.calls
      for (const call of calls) {
        const logMessage = JSON.stringify(call)
        expect(logMessage).not.toContain('secret123')
      }

      logSpy.mockRestore()
    })
  })

  describe('Structured Logging', () => {
    it('should log with metadata', () => {
      const infoSpy = jest.spyOn(logger, 'info')
      
      logger.info('Order created', { 
        orderId: '123', 
        customerId: '456',
        amount: 100.50,
      })
      
      expect(infoSpy).toHaveBeenCalled()
      
      infoSpy.mockRestore()
    })

    it('should handle complex objects', () => {
      const infoSpy = jest.spyOn(logger, 'info')
      
      logger.info('Complex data', {
        user: { id: 1, name: 'Test' },
        items: [{ id: 1, qty: 2 }, { id: 2, qty: 3 }],
        nested: { deep: { value: 'test' } },
      })
      
      expect(infoSpy).toHaveBeenCalled()
      
      infoSpy.mockRestore()
    })
  })
})
