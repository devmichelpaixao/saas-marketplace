import { beforeAll, afterAll } from '@jest/globals'

// Mock do processo
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-testing-only'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/saas_test'

beforeAll(() => {
  // Setup global antes dos testes
})

afterAll(() => {
  // Cleanup global após os testes
})
