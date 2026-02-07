import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './config/sentry';
import { 
  generalLimiter, 
  authLimiter, 
  tenantLimiter, 
  createResourceLimiter 
} from './middlewares/rateLimit.middleware';
import { requestLogger, errorLogger } from './middlewares/requestLogger.middleware';
import logger from './config/logger';

// Importar rotas
import authRoutes from './routes/auth.routes';
import tenantRoutes from './routes/tenant.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import departmentRoutes from './routes/department.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import dashboardRoutes from './routes/dashboard.routes';
import taskRoutes from './routes/task.routes';
import messageRoutes from './routes/message.routes';
import questionRoutes from './routes/question.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';
import exportRoutes from './routes/export.routes';
import auditRoutes from './routes/audit.routes';
import invoiceRoutes from './routes/invoice.routes';
import healthRoutes from './routes/health.routes';import superadminRoutes from './routes/superadmin.routes';
// Carregar variáveis de ambiente
dotenv.config();

// Exportar app antes para que logger.test.ts possa importar
const app: Application = express();
const httpServer = createServer(app);

// Inicializar Sentry (ANTES de tudo)
initSentry(app);
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// Configurar Socket.io para atualizações em tempo real
const socketOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  'http://devmichelpaixao.sys.net:5173',
  'http://localhost:5173'
];
if (process.env.NOIP_DOMAIN) {
  socketOrigins.push(`http://${process.env.NOIP_DOMAIN}`);
  socketOrigins.push(`https://${process.env.NOIP_DOMAIN}`);
}

export const io = new Server(httpServer, {
  cors: {
    origin: socketOrigins,
    methods: ['GET', 'POST'],
  },
});

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: [
        "'self'",
        process.env.CORS_ORIGIN || 'http://localhost:5173',
        'http://devmichelpaixao.sys.net:5173',
        'http://devmichelpaixao.sys.net:3000'
      ],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
}));

// CORS configurado
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://devmichelpaixao.sys.net:5173',
    'http://devmichelpaixao.sys.net:3000',
    'https://devmichelpaixao.infinityfreeapp.com',
    'http://devmichelpaixao.infinityfreeapp.com'
  ];

// Adicionar domínio No-IP se configurado
if (process.env.NOIP_DOMAIN) {
  allowedOrigins.push(`http://${process.env.NOIP_DOMAIN}`);
  allowedOrigins.push(`https://${process.env.NOIP_DOMAIN}`);
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (Postman, apps mobile, etc)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Request-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
  maxAge: 86400, // 24 horas
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (adiciona requestId e logger a cada request)
app.use(requestLogger);

// Rate limiting geral
app.use('/api/', generalLimiter);
app.use('/api/', tenantLimiter);

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Health Check Routes (sem rate limiting)
app.use('/health', healthRoutes);

// Rotas da API
app.use('/api/super-admin', superadminRoutes);
app.use('/api/tenant', createResourceLimiter, tenantRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', createResourceLimiter, orderRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/integrations', marketplaceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/invoices', invoiceRoutes);

// Socket.io - Eventos em tempo real
io.on('connection', (socket) => {
  logger.info('Socket connected', { socketId: socket.id });

  socket.on('join-department', (departmentId: string) => {
    socket.join(`department-${departmentId}`);
    logger.debug('Socket joined department', { socketId: socket.id, departmentId });
  });

  socket.on('disconnect', () => {
    logger.info('Socket disconnected', { socketId: socket.id });
  });
});

// Middleware de erro do Sentry (ANTES do handler customizado)
app.use(sentryErrorHandler());

// Error logger (loga erros antes de responder)
app.use(errorLogger);

// Middleware de erro global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    requestId: req.requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Permite conexões externas

httpServer.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    host: HOST,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    noipDomain: process.env.NOIP_DOMAIN || 'not configured',
    publicUrl: process.env.PUBLIC_URL || `http://localhost:${PORT}`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app };
export default app;
