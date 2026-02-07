import { describe, it, expect } from '@jest/globals'
import request from 'supertest'
import app from '../server'

describe('Health Check Endpoints', () => {
  describe('GET /health/live', () => {
    it('deve retornar status ok (liveness)', async () => {
      const response = await request(app).get('/health/live')
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'ok')
      expect(response.body).toHaveProperty('service', 'saas-marketplace-backend')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('GET /health/ready', () => {
    it('deve retornar readiness check com dependências', async () => {
      const response = await request(app).get('/health/ready')
      
      expect([200, 503]).toContain(response.status)
      expect(response.body).toHaveProperty('status')
      expect(response.body).toHaveProperty('checks')
      expect(response.body.checks).toHaveProperty('database')
      expect(response.body.checks).toHaveProperty('redis')
      expect(response.body.checks).toHaveProperty('sentry')
    })

    it('deve incluir tempo de resposta para database', async () => {
      const response = await request(app).get('/health/ready')
      
      if (response.body.checks.database.status === 'healthy') {
        expect(response.body.checks.database).toHaveProperty('responseTime')
        expect(response.body.checks.database.responseTime).toMatch(/\d+ms/)
      }
    })
  })

  describe('GET /health/health', () => {
    it('deve retornar health check detalhado', async () => {
      const response = await request(app).get('/health/health')
      
      expect([200, 503]).toContain(response.status)
      expect(response.body).toHaveProperty('service', 'saas-marketplace-backend')
      expect(response.body).toHaveProperty('uptime')
      expect(response.body).toHaveProperty('system')
      expect(response.body).toHaveProperty('dependencies')
    })

    it('deve incluir informações de memória', async () => {
      const response = await request(app).get('/health/health')
      
      expect(response.body.system).toHaveProperty('memory')
      expect(response.body.system.memory).toHaveProperty('heapUsed')
      expect(response.body.system.memory).toHaveProperty('heapTotal')
    })

    it('deve incluir versão do Node.js', async () => {
      const response = await request(app).get('/health/health')
      
      expect(response.body.system).toHaveProperty('nodeVersion')
      expect(response.body.system.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/)
    })
  })

  describe('GET /health/metrics', () => {
    it('deve retornar métricas do sistema', async () => {
      const response = await request(app).get('/health/metrics')
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime_seconds')
      expect(response.body).toHaveProperty('memory_usage_bytes')
      expect(response.body).toHaveProperty('cpu_usage')
    })

    it('deve incluir métricas de memória', async () => {
      const response = await request(app).get('/health/metrics')
      
      expect(response.body.memory_usage_bytes).toHaveProperty('heapUsed')
      expect(response.body.memory_usage_bytes).toHaveProperty('heapTotal')
      expect(response.body.memory_usage_bytes).toHaveProperty('rss')
    })
  })
})
