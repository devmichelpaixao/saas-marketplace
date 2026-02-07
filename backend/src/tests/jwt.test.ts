import { describe, it, expect } from '@jest/globals'
import jwt from 'jsonwebtoken'

describe('JWT Utilities', () => {
  const secret = process.env.JWT_SECRET || 'test-secret'

  it('deve gerar token válido', () => {
    const payload = {
      userId: '123',
      email: 'test@test.com',
      tenantId: 'demo',
    }

    const token = jwt.sign(payload, secret, { expiresIn: '1h' })
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
  })

  it('deve verificar token válido', () => {
    const payload = {
      userId: '123',
      email: 'test@test.com',
    }

    const token = jwt.sign(payload, secret, { expiresIn: '1h' })
    const decoded = jwt.verify(token, secret) as any

    expect(decoded.userId).toBe('123')
    expect(decoded.email).toBe('test@test.com')
  })

  it('deve rejeitar token inválido', () => {
    const invalidToken = 'invalid.token.here'

    expect(() => {
      jwt.verify(invalidToken, secret)
    }).toThrow()
  })

  it('deve rejeitar token expirado', () => {
    const payload = { userId: '123' }
    const token = jwt.sign(payload, secret, { expiresIn: '-1h' })

    expect(() => {
      jwt.verify(token, secret)
    }).toThrow('jwt expired')
  })
})
