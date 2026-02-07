import { z } from 'zod'

/**
 * Schema para item de pedido
 */
const orderItemSchema = z.object({
  productId: z.string().uuid('ID de produto inválido'),
  quantity: z.number()
    .int('Quantidade deve ser um número inteiro')
    .positive('Quantidade deve ser positiva')
    .max(10000, 'Quantidade muito alta'),
  listingId: z.string()
    .optional()
    .nullable(),
})

/**
 * Schema para criação de pedido
 */
export const createOrderSchema = z.object({
  customerName: z.string()
    .min(3, 'Nome do cliente deve ter no mínimo 3 caracteres')
    .max(200, 'Nome do cliente deve ter no máximo 200 caracteres')
    .trim(),
  
  customerEmail: z.string()
    .email('Email inválido')
    .max(200, 'Email muito longo')
    .trim()
    .toLowerCase()
    .optional()
    .nullable(),
  
  customerPhone: z.string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(20, 'Telefone deve ter no máximo 20 dígitos')
    .regex(/^[0-9+\-() ]+$/, 'Telefone inválido')
    .optional()
    .nullable(),
  
  shippingAddress: z.string()
    .min(10, 'Endereço deve ter no mínimo 10 caracteres')
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .trim(),
  
  items: z.array(orderItemSchema)
    .min(1, 'Pedido deve ter no mínimo 1 item')
    .max(100, 'Pedido pode ter no máximo 100 itens'),
  
  shippingMethod: z.string()
    .max(100, 'Método de envio muito longo')
    .optional()
    .nullable(),
  
  shippingAmount: z.number()
    .min(0, 'Valor de frete não pode ser negativo')
    .max(10000, 'Valor de frete muito alto')
    .optional()
    .default(0),
  
  discountAmount: z.number()
    .min(0, 'Desconto não pode ser negativo')
    .max(100000, 'Desconto muito alto')
    .optional()
    .default(0),
  
  notes: z.string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
})

/**
 * Schema para query params de listagem
 */
export const getOrdersQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine(n => n > 0)
    .optional()
    .default('1'),
  
  limit: z.string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine(n => n > 0 && n <= 100)
    .optional()
    .default('20'),
  
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    .optional(),
  
  departmentId: z.string()
    .uuid()
    .optional(),
  
  search: z.string()
    .max(200)
    .optional(),
})

/**
 * Schema para atualização de status
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  notes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
})

/**
 * Schema para mover departamento
 */
export const moveToDepartmentSchema = z.object({
  departmentId: z.string().uuid('ID de departamento inválido'),
  notes: z.string()
    .max(500)
    .optional(),
})

/**
 * Schema para scan de código de barras
 */
export const scanBarcodeSchema = z.object({
  barcode: z.string()
    .min(8, 'Código de barras deve ter no mínimo 8 caracteres')
    .max(50, 'Código de barras deve ter no máximo 50 caracteres'),
})

/**
 * Schema para params de ID
 */
export const orderIdParamSchema = z.object({
  id: z.string().uuid('ID de pedido inválido'),
})
