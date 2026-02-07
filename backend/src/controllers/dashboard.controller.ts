import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado' });
    }

    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);
    const startMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);

    const yesterday = subDays(today, 1);
    const startYesterday = startOfDay(yesterday);
    const endYesterday = endOfDay(yesterday);

    const [
      totalOrders,
      ordersToday,
      ordersYesterday,
      ordersThisMonth,
      revenue,
      revenueToday,
      revenueYesterday,
      revenueThisMonth,
      pendingOrders,
      inProductionOrders,
      readyToShipOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.order.count({ where: { tenantId } }),
      prisma.order.count({
        where: {
          tenantId,
          createdAt: { gte: startToday, lte: endToday },
        },
      }),
      prisma.order.count({
        where: {
          tenantId,
          createdAt: { gte: startYesterday, lte: endYesterday },
        },
      }),
      prisma.order.count({
        where: {
          tenantId,
          createdAt: { gte: startMonth, lte: endMonth },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          tenantId,
          status: { in: ['DELIVERED', 'SHIPPED'] },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          tenantId,
          createdAt: { gte: startToday, lte: endToday },
          status: { in: ['DELIVERED', 'SHIPPED'] },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          tenantId,
          createdAt: { gte: startYesterday, lte: endYesterday },
          status: { in: ['DELIVERED', 'SHIPPED'] },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          tenantId,
          createdAt: { gte: startMonth, lte: endMonth },
          status: { in: ['DELIVERED', 'SHIPPED'] },
        },
      }),
      prisma.order.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.order.count({ where: { tenantId, status: 'IN_PRODUCTION' } }),
      prisma.order.count({ where: { tenantId, status: 'READY_TO_SHIP' } }),
      prisma.order.count({ where: { tenantId, status: 'CONFIRMED' } }),
      prisma.order.count({ where: { tenantId, status: 'SHIPPED' } }),
      prisma.order.count({ where: { tenantId, status: 'DELIVERED' } }),
      prisma.order.count({ where: { tenantId, status: 'CANCELLED' } }),
    ]);

    // Vendas por dia nos últimos 7 dias
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
    const salesByDay = await Promise.all(
      last7Days.map(async (day) => {
        const start = startOfDay(day);
        const end = endOfDay(day);
        const total = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          _count: true,
          where: {
            tenantId,
            createdAt: { gte: start, lte: end },
            status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
          },
        });
        return {
          date: day.toISOString().split('T')[0],
          revenue: Number(total._sum.totalAmount || 0),
          orders: total._count,
        };
      })
    );

    // Pedidos por status para gráfico
    const ordersByStatus = [
      { status: 'Pendentes', count: pendingOrders },
      { status: 'Confirmados', count: confirmedOrders },
      { status: 'Produção', count: inProductionOrders },
      { status: 'Prontos', count: readyToShipOrders },
      { status: 'Enviados', count: shippedOrders },
      { status: 'Entregues', count: deliveredOrders },
      { status: 'Cancelados', count: cancelledOrders },
    ];

    res.json({
      orders: {
        total: totalOrders,
        today: ordersToday,
        yesterday: ordersYesterday,
        thisMonth: ordersThisMonth,
        pending: pendingOrders,
        inProduction: inProductionOrders,
        readyToShip: readyToShipOrders,
      },
      revenue: {
        total: Number(revenue._sum.totalAmount || 0),
        today: Number(revenueToday._sum.totalAmount || 0),
        yesterday: Number(revenueYesterday._sum.totalAmount || 0),
        thisMonth: Number(revenueThisMonth._sum.totalAmount || 0),
      },
      salesByDay,
      ordersByStatus,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSalesReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                productGroup: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = orders.length;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalRevenue,
      totalOrders,
      averageTicket,
      orders,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductGroupReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                productGroup: true,
              },
            },
          },
        },
      },
    });

    // Agrupar por grupo de produtos
    const groupStats: any = {};
    let totalRevenue = 0;

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const groupName = item.product.productGroup?.name || 'Sem Grupo';
        const itemTotal = Number(item.totalPrice);
        
        if (!groupStats[groupName]) {
          groupStats[groupName] = {
            name: groupName,
            revenue: 0,
            quantity: 0,
            orders: 0,
          };
        }

        groupStats[groupName].revenue += itemTotal;
        groupStats[groupName].quantity += item.quantity;
        groupStats[groupName].orders += 1;
        totalRevenue += itemTotal;
      });
    });

    // Calcular percentuais
    const groups = Object.values(groupStats).map((group: any) => ({
      ...group,
      percentage: totalRevenue > 0 ? (group.revenue / totalRevenue) * 100 : 0,
    }));

    // Ordenar por receita
    groups.sort((a: any, b: any) => b.revenue - a.revenue);

    res.json({
      totalRevenue,
      groups,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
