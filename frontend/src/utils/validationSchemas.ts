import { z } from 'zod'

export const productSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  
  sku: z.string()
    .min(2, 'O SKU deve ter no mínimo 2 caracteres')
    .max(50, 'O SKU deve ter no máximo 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'SKU deve conter apenas letras maiúsculas, números e hífens'),
  
  barcode: z.string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: 'Código de barras deve conter apenas números',
    }),
  
  price: z.number()
    .positive('O preço deve ser maior que zero')
    .max(1000000, 'O preço não pode exceder R$ 1.000.000'),
  
  cost: z.number()
    .nonnegative('O custo não pode ser negativo')
    .max(1000000, 'O custo não pode exceder R$ 1.000.000'),
  
  stock: z.number()
    .int('O estoque deve ser um número inteiro')
    .nonnegative('O estoque não pode ser negativo')
    .max(999999, 'O estoque não pode exceder 999.999'),
  
  minStock: z.number()
    .int('O estoque mínimo deve ser um número inteiro')
    .nonnegative('O estoque mínimo não pode ser negativo')
    .max(999999, 'O estoque mínimo não pode exceder 999.999')
    .optional(),
  
  description: z.string()
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional(),
  
  productGroupId: z.string()
    .uuid('Selecione um grupo de produto válido')
    .optional(),
  
  image: z.string()
    .url('URL da imagem inválida')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.cost <= data.price, {
  message: 'O custo não pode ser maior que o preço de venda',
  path: ['cost'],
})

export type ProductFormData = z.infer<typeof productSchema>

export const userSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  
  email: z.string()
    .email('Digite um e-mail válido')
    .max(100, 'O e-mail deve ter no máximo 100 caracteres'),
  
  password: z.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100, 'A senha deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  role: z.enum(['ADMIN', 'USER'], {
    errorMap: () => ({ message: 'Selecione um papel válido' }),
  }),
  
  departmentId: z.string()
    .uuid('Selecione um departamento válido')
    .optional(),
  
  phone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido. Use o formato (99) 99999-9999')
    .optional()
    .or(z.literal('')),
})

export type UserFormData = z.infer<typeof userSchema>

export const orderSchema = z.object({
  customerName: z.string()
    .min(3, 'O nome do cliente deve ter no mínimo 3 caracteres')
    .max(100, 'O nome do cliente deve ter no máximo 100 caracteres'),
  
  customerEmail: z.string()
    .email('Digite um e-mail válido')
    .max(100, 'O e-mail deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  customerPhone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido. Use o formato (99) 99999-9999')
    .optional()
    .or(z.literal('')),
  
  shippingAddress: z.string()
    .min(10, 'O endereço deve ter no mínimo 10 caracteres')
    .max(200, 'O endereço deve ter no máximo 200 caracteres')
    .optional(),
  
  notes: z.string()
    .max(500, 'As observações devem ter no máximo 500 caracteres')
    .optional(),
  
  items: z.array(z.object({
    productId: z.string().uuid('Produto inválido'),
    quantity: z.number()
      .int('A quantidade deve ser um número inteiro')
      .positive('A quantidade deve ser maior que zero')
      .max(9999, 'A quantidade não pode exceder 9.999'),
    price: z.number()
      .positive('O preço deve ser maior que zero'),
  })).min(1, 'Adicione pelo menos um item ao pedido'),
})

export type OrderFormData = z.infer<typeof orderSchema>

export const departmentSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  
  description: z.string()
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional(),
  
  code: z.string()
    .min(2, 'O código deve ter no mínimo 2 caracteres')
    .max(20, 'O código deve ter no máximo 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hífens')
    .optional()
    .or(z.literal('')),
})

export type DepartmentFormData = z.infer<typeof departmentSchema>
