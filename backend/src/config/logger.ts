import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'

const { combine, timestamp, printf, colorize, errors, json } = winston.format

// Formato customizado para logs legíveis
const consoleFormat = printf(({ level, message, timestamp, requestId, userId, tenantId, ...metadata }) => {
  let log = `${timestamp} [${level}]`
  
  // Adicionar contexto se disponível
  if (requestId) log += ` [${requestId}]`
  if (tenantId) log += ` [tenant:${tenantId}]`
  if (userId) log += ` [user:${userId}]`
  
  log += `: ${message}`
  
  // Adicionar metadata extra
  const meta = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''
  if (meta) log += `\n${meta}`
  
  return log
})

// Formato JSON estruturado para arquivos
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
)

// Transports
const transports: winston.transport[] = [
  // Console (desenvolvimento)
  new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    ),
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
]

// Adicionar file transports apenas em produção ou se configurado
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
  const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
  
  // All logs (rotação diária)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: 'info',
    })
  )
  
  // Error logs (separado)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
      level: 'error',
    })
  )
  
  // Debug logs (apenas desenvolvimento)
  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new DailyRotateFile({
        filename: path.join(logDir, 'debug-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '50m',
        maxFiles: '7d',
        format: fileFormat,
        level: 'debug',
      })
    )
  }
}

// Criar logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports,
  // Não sair em exceções não capturadas
  exitOnError: false,
  // Adicionar handling de exceções
  exceptionHandlers: process.env.NODE_ENV === 'production' 
    ? [
        new DailyRotateFile({
          filename: path.join(process.env.LOG_DIR || 'logs', 'exceptions-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
        })
      ]
    : undefined,
  // Adicionar handling de promises rejeitadas
  rejectionHandlers: process.env.NODE_ENV === 'production'
    ? [
        new DailyRotateFile({
          filename: path.join(process.env.LOG_DIR || 'logs', 'rejections-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
        })
      ]
    : undefined,
})

// Helper para criar child logger com contexto
export const createContextLogger = (context: {
  requestId?: string
  userId?: string
  tenantId?: string
  [key: string]: any
}) => {
  return logger.child(context)
}

// Tipos para facilitar uso
export type Logger = typeof logger

// Export para uso simples
export default logger
