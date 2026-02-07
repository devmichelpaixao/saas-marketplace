import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { io } from '../server';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      sku,
      name,
      description,
      cost,
      price,
      stock,
      categoryId,
      productGroupId,
      departmentId,
      barcode,
      images,
      weight,
      height,
      width,
      length,
    } = req.body;

    req.logger.info('Creating product', { sku, name, categoryId });

    const product = await prisma.product.create({
      data: {
        tenantId: req.tenantId!,
        sku,
        name,
        description,
        cost,
        price,
        stock: stock || 0,
        categoryId,
        productGroupId,
        departmentId,
        barcode,
        weight,
        height,
        width,
        length,
        images: images
          ? {
              create: images.map((url: string, index: number) => ({
                url,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        category: true,
        productGroup: true,
        department: true,
      },
    });

    req.logger.info('Product created successfully', { productId: product.id, sku: product.sku });

    res.status(201).json(product);
  } catch (error: any) {
    req.logger.error('Failed to create product', { error: error.message, sku: req.body.sku });
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      productGroupId,
      active,
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
        { barcode: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (productGroupId) where.productGroupId = productGroupId;
    if (active !== undefined) where.active = active === 'true';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          category: true,
          productGroup: true,
          department: true,
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
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

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        productGroup: true,
        department: true,
        listings: {
          include: {
            integration: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        images: data.images
          ? {
              deleteMany: {},
              create: data.images.map((url: string, index: number) => ({
                url,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        category: true,
        productGroup: true,
        department: true,
      },
    });

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePhysicalStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { physicalStock } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { physicalStock },
      include: {
        department: true,
      },
    });

    // Se tem estoque físico, notificar para mover para expedição
    if (physicalStock > 0) {
      io.emit('physical-stock-updated', {
        productId: id,
        physicalStock,
        message: `Produto ${product.name} tem ${physicalStock} unidades prontas`,
      });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
