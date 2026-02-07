import { z } from 'zod'

/**
 * Schema para criação de produto
 */
export const createProductSchema = z.object({
  sku: z.string()
    .min(3, 'SKU deve ter no mínimo 3 caracteres')
    .max(50, 'SKU deve ter no máximo 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'SKU deve conter apenas letras maiúsculas, números e hífen'),
  
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),
  
  description: z.string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .optional()
    .nullable(),
  
  cost: z.number()
    .positive('Custo deve ser positivo')
    .max(1000000, 'Custo muito alto')
    .optional()
    .nullable(),
  
  price: z.number()
    .positive('Preço deve ser positivo')
    .max(1000000, 'Preço muito alto'),
  
  stock: z.number()
    .int('Estoque deve ser um número inteiro')
    .min(0, 'Estoque não pode ser negativo')
    .max(999999, 'Estoque muito alto')
    .optional()
    .default(0),
  
  categoryId: z.string()
    .uuid('ID de categoria inválido')
    .optional()
    .nullable(),
  
  productGroupId: z.string()
    .uuid('ID de grupo de produto inválido')
    .optional()
    .nullable(),
  
  departmentId: z.string()
    .uuid('ID de departamento inválido')
    .optional()
    .nullable(),
  
  barcode: z.string()
    .min(8, 'Código de barras deve ter no mínimo 8 caracteres')
    .max(50, 'Código de barras deve ter no máximo 50 caracteres')
    .optional()
    .nullable(),
  
  images: z.array(z.string().url('URL de imagem inválida'))
    .max(10, 'Máximo de 10 imagens')
    .optional(),
  
  weight: z.number()
    .positive('Peso deve ser positivo')
    .max(10000, 'Peso muito alto (kg)')
    .optional()
    .nullable(),
  
  height: z.number()
    .positive('Altura deve ser positiva')
    .max(1000, 'Altura muito alta (cm)')
    .optional()
    .nullable(),
  
  width: z.number()
    .positive('Largura deve ser positiva')
    .max(1000, 'Largura muito alta (cm)')
    .optional()
    .nullable(),
  
  length: z.number()
    .positive('Comprimento deve ser positivo')
    .max(1000, 'Comprimento muito alto (cm)')
    .optional()
    .nullable(),
})

/**
 * Schema para atualização de produto
 */
export const updateProductSchema = createProductSchema.partial()

/**
 * Schema para query params de listagem
 */
export const getProductsQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'Page deve ser maior que 0')
    .optional()
    .default('1'),
  
  limit: z.string()
    .regex(/^\d+$/, 'Limit deve ser um número')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit deve estar entre 1 e 100')
    .optional()
    .default('20'),
  
  search: z.string()
    .max(200, 'Busca muito longa')
    .optional(),
  
  categoryId: z.string()
    .uuid('ID de categoria inválido')
    .optional(),
  
  productGroupId: z.string()
    .uuid('ID de grupo inválido')
    .optional(),
  
  active: z.string()
    .regex(/^(true|false)$/, 'Active deve ser true ou false')
    .transform(val => val === 'true')
    .optional(),
})

/**
 * Schema para params de ID
 */
export const productIdParamSchema = z.object({
  id: z.string().uuid('ID de produto inválido'),
})

/**
 * Schema para atualizar estoque físico
 */
export const updatePhysicalStockSchema = z.object({
  physicalStock: z.number()
    .int('Estoque físico deve ser um número inteiro')
    .min(0, 'Estoque físico não pode ser negativo')
    .max(999999, 'Estoque físico muito alto'),
})
