import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from './auth.middleware';

export interface AuditData {
  action: string;
  entity: string;
  entityId?: string;
  changes?: any;
}

export async function createAuditLog(
  req: AuthRequest,
  data: AuditData
): Promise<void> {
  try {
    const { tenantId, userId } = req;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    await prisma.auditLog.create({
      data: {
        tenantId: tenantId!,
        userId: userId || null,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        changes: data.changes,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to create audit log:', error);
  }
}

// Middleware para audit log automático
export function auditLog(action: string, entity: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Salvar a resposta original
    const originalJson = res.json.bind(res);

    // Interceptar resposta para capturar dados
    res.json = function (body: any) {
      // Criar audit log após resposta bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = body?.id || req.params?.id;
        const changes = req.body;

        createAuditLog(req, {
          action,
          entity,
          entityId,
          changes,
        });
      }

      return originalJson(body);
    };

    next();
  };
}
