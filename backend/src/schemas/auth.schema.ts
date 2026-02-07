import { z } from 'zod'

/**
 * Schema para registro de usuário
 */
export const registerSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .max(200, 'Email muito longo')
    .trim()
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),
  
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR'])
    .optional()
    .default('OPERATOR'),
})

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  
  password: z.string()
    .min(1, 'Senha é obrigatória'),
})

/**
 * Schema para alteração de senha
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Senha atual é obrigatória'),
  
  newPassword: z.string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})

/**
 * Schema para recuperação de senha
 */
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
})

/**
 * Schema para reset de senha
 */
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Token é obrigatório'),
  
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  
  confirmPassword: z.string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})
