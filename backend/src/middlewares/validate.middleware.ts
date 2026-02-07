import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

/**
 * Middleware de validação com Zod
 * Valida body, query ou params de uma request
 * 
 * @example
 * router.post('/products', validate(productSchema), createProduct)
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar dados
      const validated = await schema.parseAsync(req[source])
      
      // Substituir dados originais com dados validados
      req[source] = validated
      
      // Log de validação (se logger disponível)
      if ((req as any).logger) {
        (req as any).logger.debug('Validation successful', {
          source,
          fields: Object.keys(validated),
        })
      }
      
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatar erros do Zod
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }))
        
        // Log de erro de validação
        if ((req as any).logger) {
          (req as any).logger.warn('Validation failed', {
            source,
            errors,
          })
        }
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        })
      }
      
      // Erro desconhecido
      next(error)
    }
  }
}

/**
 * Validar múltiplas fontes ao mesmo tempo
 * 
 * @example
 * router.get('/products/:id', 
 *   validateMultiple({
 *     params: productParamsSchema,
 *     query: paginationSchema,
 *   }), 
 *   getProduct
 * )
 */
export const validateMultiple = (schemas: {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: any[] = []
      
      // Validar body
      if (schemas.body) {
        try {
          req.body = await schemas.body.parseAsync(req.body)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map(err => ({
              source: 'body',
              field: err.path.join('.'),
              message: err.message,
            })))
          }
        }
      }
      
      // Validar query
      if (schemas.query) {
        try {
          req.query = await schemas.query.parseAsync(req.query)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map(err => ({
              source: 'query',
              field: err.path.join('.'),
              message: err.message,
            })))
          }
        }
      }
      
      // Validar params
      if (schemas.params) {
        try {
          req.params = await schemas.params.parseAsync(req.params)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map(err => ({
              source: 'params',
              field: err.path.join('.'),
              message: err.message,
            })))
          }
        }
      }
      
      // Se houver erros, retornar
      if (errors.length > 0) {
        if ((req as any).logger) {
          (req as any).logger.warn('Validation failed', { errors })
        }
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        })
      }
      
      next()
    } catch (error) {
      next(error)
    }
  }
}
