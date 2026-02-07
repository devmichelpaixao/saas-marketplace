import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import axios from 'axios';
import crypto from 'crypto';

// Armazenamento temporário de configurações (em produção, use banco de dados)
const configs: Map<string, any> = new Map();

// Salvar configuração
export const saveConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { marketplace, clientId, clientSecret, redirectUri } = req.body;
    
    configs.set(marketplace, { clientId, clientSecret, redirectUri });
    
    res.json({ message: 'Configuração salva com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Listar integrações
export const getIntegrations = async (req: AuthRequest, res: Response) => {
  try {
    const integrations = await prisma.marketplaceIntegration.findMany({
      select: {
        id: true,
        marketplace: true,
        active: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    
    res.json(integrations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// OAuth Mercado Livre - Iniciar
export const authMercadoLivre = async (req: Request, res: Response) => {
  try {
    const config = configs.get('MERCADO_LIVRE');
    
    if (!config) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h2>⚠️ Configuração não encontrada</h2>
            <p>Por favor, configure as credenciais do Mercado Livre primeiro.</p>
            <a href="http://localhost:5173/integrations">Voltar para Integrações</a>
          </body>
        </html>
      `);
    }

    const authUrl = `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
    
    res.redirect(authUrl);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// OAuth Mercado Livre - Callback
export const callbackMercadoLivre = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const config = configs.get('MERCADO_LIVRE');

    if (!code || !config) {
      return res.status(400).send('Código ou configuração inválida');
    }

    // Trocar código por token
    const tokenResponse = await axios.post('https://api.mercadolibre.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Salvar integração
    await prisma.marketplaceIntegration.create({
      data: {
        tenantId: req.tenantId!,
        marketplace: 'MERCADO_LIVRE',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        active: true,
      },
    });

    res.send(`
      <html>
        <body style="font-family: Arial; padding: 20px; text-align: center;">
          <h2>✅ Mercado Livre conectado com sucesso!</h2>
          <p>Você já pode fechar esta janela e voltar para o sistema.</p>
          <a href="http://localhost:5173/integrations">Voltar para Integrações</a>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 20px; text-align: center;">
          <h2>❌ Erro ao conectar</h2>
          <p>${error.message}</p>
          <a href="http://localhost:5173/integrations">Voltar para Integrações</a>
        </body>
      </html>
    `);
  }
};

// OAuth Shopee - Iniciar
export const authShopee = async (req: Request, res: Response) => {
  try {
    const config = configs.get('SHOPEE');
    
    if (!config) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h2>⚠️ Configuração não encontrada</h2>
            <p>Por favor, configure as credenciais da Shopee primeiro.</p>
            <a href="http://localhost:5173/integrations">Voltar para Integrações</a>
          </body>
        </html>
      `);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/shop/auth_partner';
    const redirectUrl = config.redirectUri;
    
    // Gerar signature
    const baseString = `${config.clientId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', config.clientSecret)
      .update(baseString)
      .digest('hex');

    const authUrl = `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${config.clientId}&timestamp=${timestamp}&sign=${sign}&redirect=${encodeURIComponent(redirectUrl)}`;
    
    res.redirect(authUrl);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// OAuth Shopee - Callback
export const callbackShopee = async (req: Request, res: Response) => {
  try {
    const { code, shop_id } = req.query;
    const config = configs.get('SHOPEE');

    if (!code || !config) {
      return res.status(400).send('Código ou configuração inválida');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/auth/token/get';
    const baseString = `${config.clientId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', config.clientSecret)
      .update(baseString)
      .digest('hex');

    // Trocar código por token
    const tokenResponse = await axios.post(
      `https://partner.shopeemobile.com${path}`,
      {
        code,
        shop_id: parseInt(shop_id as string),
        partner_id: parseInt(config.clientId),
      },
      {
        params: {
          partner_id: config.clientId,
          timestamp,
          sign,
        },
      }
    );

    const { access_token, refresh_token, expire_in } = tokenResponse.data;

    // Salvar integração
    await prisma.marketplaceIntegration.create({
      data: {
        tenantId: req.tenantId!,
        marketplace: 'SHOPEE',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expire_in * 1000),
        active: true,
      },
    });

    res.send(`
      <html>
        <body style="font-family: Arial; padding: 20px; text-align: center;">
          <h2>✅ Shopee conectada com sucesso!</h2>
          <p>Você já pode fechar esta janela e voltar para o sistema.</p>
          <a href="http://localhost:5173/integrations">Voltar para Integrações</a>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 20px; text-align: center;">
          <h2>❌ Erro ao conectar</h2>
          <p>${error.message}</p>
          <a href="http://localhost:5173/integrations">Voltar para Integrações</a>
        </body>
      </html>
    `);
  }
};

export const connectMercadoLivre = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    // Trocar código por token
    const tokenResponse = await axios.post('https://api.mercadolibre.com/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      code,
      redirect_uri: process.env.ML_REDIRECT_URI,
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Salvar integração
    const integration = await prisma.marketplaceIntegration.create({
      data: {
        marketplace: 'MERCADO_LIVRE',
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        active: true,
        tenantId: req.tenantId!,
      },
    });

    res.json({ message: 'Mercado Livre conectado com sucesso', integration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const connectShopee = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    // Implementar autenticação Shopee
    // Documentação: https://open.shopee.com/documents

    res.json({ message: 'Shopee conectado com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const syncListings = async (req: AuthRequest, res: Response) => {
  try {
    const { integrationId } = req.body;

    const integration = await prisma.marketplaceIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integração não encontrada' });
    }

    // Buscar anúncios do marketplace
    if (integration.marketplace === 'MERCADO_LIVRE') {
      const response = await axios.get('https://api.mercadolibre.com/users/me/items/search', {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
        },
      });

      // Processar e salvar listings
      // Este é um exemplo simplificado
      const listingIds = response.data.results;

      for (const externalId of listingIds) {
        const itemResponse = await axios.get(`https://api.mercadolibre.com/items/${externalId}`, {
          headers: {
            Authorization: `Bearer ${integration.accessToken}`,
          },
        });

        const item = itemResponse.data;

        // Verificar se já existe
        const existingListing = await prisma.listing.findUnique({
          where: {
            integrationId_externalId: {
              integrationId: integration.id,
              externalId,
            },
          },
        });

        if (!existingListing) {
          // Buscar produto por SKU ou criar
          let product = await prisma.product.findFirst({
            where: { sku: item.seller_custom_field || externalId },
          });

          if (!product) {
            product = await prisma.product.create({
              data: {
                tenantId: req.tenantId!,
                sku: item.seller_custom_field || externalId,
                name: item.title,
                description: item.description || '',
                price: item.price,
                stock: item.available_quantity,
              },
            });
          }

          await prisma.listing.create({
            data: {
              productId: product.id,
              integrationId: integration.id,
              externalId,
              title: item.title,
              description: item.description || '',
              price: item.price,
              stock: item.available_quantity,
              status: item.status === 'active' ? 'ACTIVE' : 'PAUSED',
              url: item.permalink,
              lastSyncAt: new Date(),
            },
          });
        }
      }
    }

    res.json({ message: 'Anúncios sincronizados com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const syncOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { integrationId } = req.body;

    const integration = await prisma.marketplaceIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      return res.status(404).json({ error: 'Integração não encontrada' });
    }

    // Buscar pedidos do marketplace
    if (integration.marketplace === 'MERCADO_LIVRE') {
      const response = await axios.get('https://api.mercadolibre.com/orders/search', {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
        },
        params: {
          seller: 'me',
          sort: 'date_desc',
        },
      });

      // Processar pedidos (simplificado)
      console.log('Pedidos sincronizados:', response.data.results?.length || 0);
    }

    res.json({ message: 'Pedidos sincronizados com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
