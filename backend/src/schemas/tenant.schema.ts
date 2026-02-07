import { z } from 'zod'

/**
 * Schema para registro de tenant
 */
export const registerTenantSchema = z.object({
  companyName: z.string()
    .min(3, 'Nome da empresa deve ter no mínimo 3 caracteres')
    .max(200, 'Nome da empresa deve ter no máximo 200 caracteres')
    .trim(),
  
  subdomain: z.string()
    .min(3, 'Subdomínio deve ter no mínimo 3 caracteres')
    .max(50, 'Subdomínio deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras minúsculas, números e hífen')
    .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Subdomínio não pode começar ou terminar com hífen')
    .refine(
      val => !['admin', 'api', 'www', 'app', 'staging', 'prod', 'production', 'dev', 'development'].includes(val),
      'Subdomínio reservado'
    )
    .trim()
    .toLowerCase(),
  
  adminName: z.string()
    .min(3, 'Nome do administrador deve ter no mínimo 3 caracteres')
    .max(200, 'Nome do administrador deve ter no máximo 200 caracteres')
    .trim(),
  
  adminEmail: z.string()
    .email('Email inválido')
    .max(200, 'Email muito longo')
    .trim()
    .toLowerCase(),
  
  adminPassword: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  
  planId: z.string()
    .uuid('ID de plano inválido')
    .optional()
    .nullable(),
  
  phone: z.string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(20, 'Telefone deve ter no máximo 20 dígitos')
    .regex(/^[0-9+\-() ]+$/, 'Telefone inválido')
    .optional()
    .nullable(),
  
  cnpj: z.string()
    .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos')
    .optional()
    .nullable(),
})

/**
 * Schema para verificação de subdomínio
 */
export const checkSubdomainSchema = z.object({
  subdomain: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .trim()
    .toLowerCase(),
})

/**
 * Schema para atualização de tenant
 */
export const updateTenantSchema = z.object({
  companyName: z.string()
    .min(3)
    .max(200)
    .trim()
    .optional(),
  
  phone: z.string()
    .min(10)
    .max(20)
    .regex(/^[0-9+\-() ]+$/)
    .optional()
    .nullable(),
  
  cnpj: z.string()
    .regex(/^\d{14}$/)
    .optional()
    .nullable(),
  
  active: z.boolean()
    .optional(),
}).strict()
