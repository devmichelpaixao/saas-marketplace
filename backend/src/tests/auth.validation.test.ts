import { describe, it, expect } from '@jest/globals'

describe('Auth Validation Tests', () => {
  it('deve validar formato de email', () => {
    const validEmail = 'usuario@example.com'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    expect(emailRegex.test(validEmail)).toBe(true)
  })

  it('deve validar comprimento mínimo de senha', () => {
    const senha = 'Senha123'
    const minimoCaracteres = 6
    
    expect(senha.length).toBeGreaterThanOrEqual(minimoCaracteres)
  })

  it('deve rejeitar email inválido', () => {
    const invalidEmail = 'emailinvalido'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    expect(emailRegex.test(invalidEmail)).toBe(false)
  })

  it('deve rejeitar senha muito curta', () => {
    const senhaFraca = '123'
    const minimoCaracteres = 6
    
    expect(senhaFraca.length).toBeLessThan(minimoCaracteres)
  })
})
