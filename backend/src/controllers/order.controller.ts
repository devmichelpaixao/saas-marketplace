import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { io } from '../server';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      shippingMethod,
      shippingAmount,
      discountAmount,
      notes,
    } = req.body;

    req.logger.info('Creating order', { customerName, itemCount: items.length });

    // Calcular total
    let totalAmount = Number(shippingAmount || 0) - Number(discountAmount || 0);
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { department: true },
      });

      if (!product) {
        req.logger.warn('Product not found', { productId: item.productId });
        return res.status(404).json({ error: `Produto ${item.productId} não encontrado` });
      }

      const itemTotal = Number(product.price) * Number(item.quantity);
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        listingId: item.listingId,
      });
    }

    // Gerar número de pedido e código de barras
    const orderNumber = `ORD-${Date.now()}`;
    const barcode = uuidv4().replace(/-/g, '').substring(0, 13);

    // Determinar departamento inicial
    const firstProduct = await prisma.product.findUnique({
      where: { id: items[0].productId },
      include: { department: true },
    });

    // Verificar se tem estoque físico
    const hasPhysicalStock = items.every((item: any) => {
      const product = prisma.product.findUnique({ where: { id: item.productId } });
      return product && (product as any).physicalStock >= item.quantity;
    });

    // Se tem estoque físico, vai direto para expedição
    let currentDepartmentId = firstProduct?.departmentId;
    if (hasPhysicalStock) {
      const expeditionDept = await prisma.departments.findFirst({
        where: { name: { contains: 'Expedição', mode: 'insensitive' } },
      });
      if (expeditionDept) {
        currentDepartmentId = expeditionDept.id;
      }
    }

    const order = await prisma.order.create({
      data: {
        tenantId: req.tenantId!,
        orderNumber,
        barcode,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        totalAmount,
        shippingAmount: shippingAmount || 0,
        discountAmount: discountAmount || 0,
        shippingMethod,
        notes,
        currentDepartmentId,
        createdById: req.user!.userId,
        status: 'CONFIRMED',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        currentDepartment: true,
      },
    });

    // Registrar histórico
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        toStatus: 'CONFIRMED',
        notes: 'Pedido criado',
      },
    });

    // Notificar em tempo real
    if (currentDepartmentId) {
      io.to(`department-${currentDepartmentId}`).emit('new-order', order);
    }

    req.logger.info('Order created successfully', { 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
    });

    res.status(201).json(order);
  } catch (error: any) {
    req.logger.error('Failed to create order', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      departmentId,
      search,
      startDate,
      endDate,
    } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (departmentId) where.currentDepartmentId = departmentId;
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search as string, mode: 'insensitive' } },
        { customerName: { contains: search as string, mode: 'insensitive' } },
        { barcode: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { take: 1 },
                },
              },
            },
          },
          currentDepartment: true,
          integration: true,
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        currentDepartment: true,
        integration: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
        },
        shippingLabels: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedById: req.user!.userId,
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
      include: {
        currentDepartment: true,
      },
    });

    // Registrar histórico
    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: currentOrder.status,
        toStatus: status,
        notes,
      },
    });

    // Notificar em tempo real
    io.emit('order-status-updated', { orderId: id, status });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const moveToDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { departmentId, notes } = req.body;

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { currentDepartment: true },
    });

    if (!currentOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Buscar próximo departamento no workflow
    const nextDepartment = await prisma.departments.findUnique({
      where: { id: departmentId },
    });

    if (!nextDepartment) {
      return res.status(404).json({ error: 'Departamento não encontrado' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        currentDepartmentId: departmentId,
        updatedById: req.user!.userId,
      },
      include: {
        currentDepartment: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Registrar no histórico
    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: currentOrder.status,
        toStatus: order.status,
        departmentId,
        notes: notes || `Movido para ${nextDepartment.name}`,
      },
    });

    // Notificar departamento anterior e novo
    if (currentOrder.currentDepartmentId) {
      io.to(`department-${currentOrder.currentDepartmentId}`).emit('order-left', { orderId: id });
    }
    io.to(`department-${departmentId}`).emit('order-arrived', order);

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const scanBarcode = async (req: AuthRequest, res: Response) => {
  try {
    const { barcode } = req.body;

    const order = await prisma.order.findUnique({
      where: { 
        tenantId_barcode: {
          tenantId: req.tenantId!,
          barcode
        }
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        currentDepartment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado com este código de barras' });
    }

    // Buscar próximo departamento no workflow
    if (order.currentDepartmentId) {
      const workflow = await prisma.workflowStep.findFirst({
        where: {
          fromDepartmentId: order.currentDepartmentId,
          active: true,
        },
        include: {
          toDepartment: true,
        },
        orderBy: { order: 'asc' },
      });

      if (workflow) {
        // Mover automaticamente para próximo departamento
        await prisma.order.update({
          where: { id: order.id },
          data: {
            currentDepartmentId: workflow.toDepartmentId,
            updatedById: req.user!.userId,
          },
        });

        await prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: order.status,
            departmentId: workflow.toDepartmentId,
            notes: `Movido automaticamente para ${workflow.toDepartment.name}`,
          },
        });

        // Notificar transição
        io.to(`department-${workflow.toDepartmentId}`).emit('order-arrived', {
          ...order,
          currentDepartmentId: workflow.toDepartmentId,
        });

        return res.json({
          order,
          movedTo: workflow.toDepartment,
          message: `Pedido movido para ${workflow.toDepartment.name}`,
        });
      }
    }

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const printShippingLabel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Aqui você integraria com a API de transportadora para gerar etiqueta
    // Por enquanto, vamos simular
    const trackingCode = `BR${Date.now()}`;
    
    const shippingLabel = await prisma.shippingLabel.create({
      data: {
        orderId: id,
        trackingCode,
        carrier: order.shippingMethod || 'Correios',
        labelUrl: `https://example.com/labels/${trackingCode}.pdf`,
        printed: true,
        printedAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id },
      data: {
        trackingCode,
        status: 'READY_TO_SHIP',
      },
    });

    res.json({
      message: 'Etiqueta gerada com sucesso',
      shippingLabel,
      printCommand: {
        type: 'thermal-printer',
        data: {
          trackingCode,
          customerName: order.customerName,
          address: order.shippingAddress,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
