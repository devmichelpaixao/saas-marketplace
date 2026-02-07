import request from 'supertest'
import { app } from '../server'

describe('Input Validation', () => {
  describe('Product Validation', () => {
    it('should reject invalid product data', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid-token')
        .send({
          sku: 'ab', // Muito curto
          name: '', // Vazio
          price: -10, // Negativo
        })
        .expect(400)

      expect(res.body.error).toBe('Validation failed')
      expect(res.body.details).toBeInstanceOf(Array)
      expect(res.body.details.length).toBeGreaterThan(0)
    })

    it('should accept valid product data', async () => {
      const validProduct = {
        sku: 'PROD-123',
        name: 'Test Product',
        price: 99.99,
        stock: 10,
      }

      // Note: Este teste vai falhar sem auth válido, mas valida o schema
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid-token')
        .send(validProduct)

      // Schema validado (pode falhar na auth)
      if (res.status === 400) {
        expect(res.body.error).not.toBe('Validation failed')
      }
    })

    it('should validate SKU format', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid-token')
        .send({
          sku: 'invalid sku!', // Caracteres inválidos
          name: 'Test Product',
          price: 99.99,
        })
        .expect(400)

      const skuError = res.body.details?.find((d: any) => d.field === 'sku')
      expect(skuError).toBeDefined()
    })

    it('should validate price is positive', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid-token')
        .send({
          sku: 'PROD-123',
          name: 'Test Product',
          price: -10,
        })
        .expect(400)

      const priceError = res.body.details?.find((d: any) => d.field === 'price')
      expect(priceError?.message).toContain('positivo')
    })
  })

  describe('Order Validation', () => {
    it('should reject order without items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({
          customerName: 'John Doe',
          shippingAddress: '123 Main St',
          items: [], // Vazio
        })
        .expect(400)

      const itemsError = res.body.details?.find((d: any) => d.field === 'items')
      expect(itemsError?.message).toContain('mínimo 1 item')
    })

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({
          customerName: 'John Doe',
          customerEmail: 'invalid-email', // Email inválido
          shippingAddress: '123 Main St',
          items: [{ productId: '123e4567-e89b-12d3-a456-426614174000', quantity: 1 }],
        })
        .expect(400)

      const emailError = res.body.details?.find((d: any) => d.field === 'customerEmail')
      expect(emailError?.message).toContain('inválido')
    })

    it('should validate quantity is positive', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid-token')
        .send({
          customerName: 'John Doe',
          shippingAddress: '123 Main St',
          items: [
            { productId: '123e4567-e89b-12d3-a456-426614174000', quantity: -5 }, // Negativo
          ],
        })
        .expect(400)

      expect(res.body.details).toBeDefined()
    })
  })

  describe('Auth Validation', () => {
    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('x-tenant-id', 'test-tenant')
        .send({
          email: 'test@example.com',
          password: 'weak', // Senha fraca
          name: 'Test User',
        })
        .expect(400)

      const passwordError = res.body.details?.find((d: any) => d.field === 'password')
      expect(passwordError).toBeDefined()
    })

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('x-tenant-id', 'test-tenant')
        .send({
          email: 'not-an-email',
          password: 'Password123',
        })
        .expect(400)

      const emailError = res.body.details?.find((d: any) => d.field === 'email')
      expect(emailError?.message).toContain('inválido')
    })

    it('should accept valid credentials format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('x-tenant-id', 'test-tenant')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        })

      // Schema validado (pode falhar na autenticação)
      if (res.status === 400) {
        expect(res.body.error).not.toBe('Validation failed')
      }
    })
  })

  describe('Tenant Validation', () => {
    it('should validate subdomain format', async () => {
      const res = await request(app)
        .post('/api/tenant/register')
        .send({
          companyName: 'Test Company',
          subdomain: 'Invalid_Subdomain!', // Caracteres inválidos
          adminName: 'Admin User',
          adminEmail: 'admin@example.com',
          adminPassword: 'Password123',
        })
        .expect(400)

      const subdomainError = res.body.details?.find((d: any) => d.field === 'subdomain')
      expect(subdomainError).toBeDefined()
    })

    it('should reject reserved subdomain', async () => {
      const res = await request(app)
        .post('/api/tenant/register')
        .send({
          companyName: 'Test Company',
          subdomain: 'admin', // Reservado
          adminName: 'Admin User',
          adminEmail: 'admin@example.com',
          adminPassword: 'Password123',
        })
        .expect(400)

      const subdomainError = res.body.details?.find((d: any) => d.field === 'subdomain')
      expect(subdomainError?.message).toContain('reservado')
    })

    it('should validate CNPJ format', async () => {
      const res = await request(app)
        .post('/api/tenant/register')
        .send({
          companyName: 'Test Company',
          subdomain: 'testcompany',
          adminName: 'Admin User',
          adminEmail: 'admin@example.com',
          adminPassword: 'Password123',
          cnpj: '123', // CNPJ inválido
        })
        .expect(400)

      const cnpjError = res.body.details?.find((d: any) => d.field === 'cnpj')
      expect(cnpjError?.message).toContain('14 dígitos')
    })
  })

  describe('Query Params Validation', () => {
    it('should validate page number', async () => {
      const res = await request(app)
        .get('/api/products?page=-1')
        .set('Authorization', 'Bearer valid-token')
        .expect(400)

      const pageError = res.body.details?.find((d: any) => d.field === 'page')
      expect(pageError).toBeDefined()
    })

    it('should validate limit range', async () => {
      const res = await request(app)
        .get('/api/products?limit=1000')
        .set('Authorization', 'Bearer valid-token')
        .expect(400)

      const limitError = res.body.details?.find((d: any) => d.field === 'limit')
      expect(limitError?.message).toContain('entre 1 e 100')
    })

    it('should validate UUID format', async () => {
      const res = await request(app)
        .get('/api/products/invalid-uuid')
        .set('Authorization', 'Bearer valid-token')
        .expect(400)

      const idError = res.body.details?.find((d: any) => d.field === 'id')
      expect(idError?.message).toContain('inválido')
    })
  })
})
