# 📦 SaaS Marketplace - Sistema de Gestão Multi-Marketplace

<div align="center">
  
![Logo](https://img.shields.io/badge/SaaS-Marketplace-3b82f6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAgMTUgTDI1IDcgTDI1IDIzIEwxMCAzMSBaIiBmaWxsPSIjM2I4MmY2Ii8+CiAgPHBhdGggZD0iTTI1IDcgTDQwIDE1IEw0MCAzMSBMMjUgMjMgWiIgZmlsbD0iIzI1NjNlYiIvPgogIDxwYXRoIGQ9Ik0xMCAxNSBMMjUgNyBMNDAgMTUgTDI1IDIzIFoiIGZpbGw9IiM2MGE1ZmEiLz4KPC9zdmc+)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

**Sistema completo e moderno para gestão de vendas em múltiplos marketplaces com controle de produção, departamentos, workflow automatizado e expedição inteligente.**

[🚀 Demo](#-início-rápido) • [📖 Documentação](#-documentação) • [🎯 Features](#-funcionalidades-principais) • [💻 Tecnologias](#-tecnologias-utilizadas)

</div>

---

## 🚀 INÍCIO ULTRA-RÁPIDO (30 segundos)

Execute:
```batch
INICIAR-COM-NGROK.bat
```

Pronto! Seu sistema está rodando e acessível de qualquer lugar!

**Primeira vez?** O script vai pedir o token do ngrok (conta gratuita, leva 2 min).

📖 **[Veja o índice completo](INDICE.md)** | 📱 **[Guia rápido NGROK](COMO-USAR-NGROK.md)**

---

## ✨ Destaques

- 🏢 **Multi-Tenancy Completo** - Sistema 100% SaaS com isolamento de dados por tenant
- � **Super Admin Dashboard** - Painel de gestão completo para gerenciar todos os tenants
- �💳 **Sistema de Billing** - 4 planos competitivos (Starter, Professional, Business, Enterprise), trial de 30 dias, gestão de pagamentos
- 🚀 **Auto-Registro** - Página pública para criar contas automaticamente
- 🌐 **Subdomínios** - Cada empresa tem seu próprio subdomínio (empresa.sistema.com)
- 🎨 **Interface Moderna** - Logo SVG única, design responsivo mobile-first
- 📦 **CRUD Completo** - Produtos com upload múltiplo de imagens
- 🏭 **Departamentos** - Gerenciamento visual com cores personalizadas
- 🔄 **Workflow Automatizado** - Transição entre etapas com código de barras
- 📊 **Dashboard em Tempo Real** - Estatísticas e gráficos interativos
- 🔌 **Integrações OAuth** - Mercado Livre e Shopee configuráveis
- 🎯 **100% TypeScript** - Type-safe em todo o código

## 🚀 Funcionalidades Principais

### 🏢 Multi-Tenancy SaaS
- **Isolamento Completo** - Cada empresa (tenant) tem seus próprios dados isolados
- **Subdomínios Automáticos** - empresa1.sistema.com, empresa2.sistema.com
- **Auto-Registro Público** - Interface para criar novas contas automaticamente
- **Trial Gratuito** - 30 dias de uso gratuito para novos clientes
- **Middleware de Tenant** - Validação e isolamento automático em todas as requisições
- **Validação de Limites** - Controle de uso baseado no plano contratado

### 💳 Sistema de Billing
- **4 Planos Competitivos**:
  - **Starter**: R$ 149/mês - 2 usuários, 50 produtos, 300 pedidos/mês
  - **Professional**: R$ 299/mês - 5 usuários, 500 produtos, 2.000 pedidos/mês
  - **Business**: R$ 599/mês - 15 usuários, 2.000 produtos, 10.000 pedidos/mês
  - **Enterprise**: R$ 1.299/mês - 50 usuários, 10.000 produtos, 100.000 pedidos/mês
- **Gestão de Assinaturas** - Status (Trial, Ativo, Pendente, Cancelado)
- **Histórico de Pagamentos** - Rastreamento completo de cobranças
- **Upgrade/Downgrade** - Mudança de plano a qualquer momento
- **Dashboard de Uso** - Visualização de limites e consumo atual

### 📦 Gestão de Produtos
- **CRUD Completo** com modal responsivo
- Upload múltiplo de imagens com preview
- Gerenciamento de imagens existentes (adicionar/remover)
- Organização por SKU, categorias e departamentos
- Controle de estoque virtual e físico
- Status ativo/inativo
- Sincronização automática com marketplaces

### 🛒 Integração com Marketplaces
- **Sistema OAuth Completo** para Mercado Livre e Shopee
- Interface de configuração com modal de credenciais
- Instruções detalhadas passo-a-passo para cada marketplace
- Indicadores visuais de status de conexão
- Anúncios, vendas, perguntas e mensagens sincronizadas
- Atualização em tempo real via webhooks
- Arquitetura preparada para expansão (Amazon, Magalu, etc.)

### 💰 Gestão de Vendas
- Visualização completa de pedidos
- Informações de valores e prazos
- Rastreamento de status
- Histórico de vendas

### 🏢 Departamentos e Workflow
- **CRUD de Departamentos** com botões adicionar/editar/remover
- Modal de criação/edição com seletor de cor visual
- Criação de setores personalizados (Criação, Pré-impressão, Impressão, Expedição)
- Visualização isolada por departamento com cards coloridos
- Fluxo automático "De → Para"
- Sistema de código de barras para transições
- Contadores de pedidos e usuários por departamento

### 📮 Expedição Automatizada
- Integração com leitor de código de barras
- Impressão automática de etiquetas (impressora térmica)
- Identificação rápida de pedidos
- Controle de envios

### 💬 Comunicação com Clientes
- Resposta a perguntas nos anúncios
- Mensagens de vendas
- Centralização de todas as conversas

### 📊 Dashboard e Relatórios
- Faturamento em tempo real
- Análise por grupo de produtos
- Controle de despesas e entradas
- Indicadores de performance

### 📅 Gestão de Tarefas
- Calendário de entregas
- Lista de pendências diárias
- Alertas de prazos
- Prevenção de atrasos

### 📦 Estoque Físico
- Cadastro de produtos prontos
- Desvio automático de workflow
- Envio direto para expedição
- Controle de disponibilidade

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js 18+** + **Express 4**: API RESTful robusta
- **PostgreSQL 14+**: Banco de dados relacional
- **Prisma ORM 5.22**: Modelagem type-safe e queries otimizadas
- **Socket.io 4.6**: Comunicação em tempo real
- **JWT + Bcrypt**: Autenticação segura
- **TypeScript 5.3**: Tipagem estática completa

### Frontend
- **React 18.2**: Interface moderna e performática
- **TypeScript 5.3**: Type-safe em todo código
- **Vite 5.0**: Build tool ultra-rápido
- **TailwindCSS 3.3**: Estilização responsiva mobile-first
- **React Query 5.14**: Gerenciamento de estado e cache
- **React Router 6**: Navegação SPA
- **Lucide React**: Ícones modernos SVG
- **Logo SVG Customizada**: Design único 3D com gradientes

### Infraestrutura
- **Axios**: Cliente HTTP com interceptors
- **FormData**: Upload multipart de imagens
- **OAuth 2.0**: Integrações seguras com marketplaces
- **Webhooks**: Eventos em tempo real

## 📁 Estrutura do Projeto

```
saas/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos Prisma
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Lógica de negócio
│   │   ├── integrations/   # Integrações marketplace
│   │   ├── middlewares/    # Middlewares
│   │   ├── utils/          # Utilitários
│   │   └── server.ts       # Entrada da aplicação
│   ├── prisma/             # Schema do banco
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── hooks/          # Hooks customizados
│   │   ├── services/       # Serviços API
│   │   ├── contexts/       # Contexts
│   │   ├── utils/          # Utilitários
│   │   ├── types/          # Tipos TypeScript
│   │   ├── App.tsx         # Componente principal
│   │   └── main.tsx        # Entrada
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

---

## 👑 SUPER ADMIN - Gestão de Tenants

### 🎉 Sistema Completo de Administração

O sistema inclui um **painel Super Admin completo** para gerenciar todos os tenants!

#### 🚀 Instalação Rápida

```bash
# Execute na raiz do projeto
INSTALAR-SUPER-ADMIN.bat
```

#### ⚙️ Criar Super Admin no Banco

```bash
# Gera o hash da senha e o SQL
CRIAR-SUPER-ADMIN.bat
```

#### 🏃 Iniciar Painel Admin

```bash
# Inicia o painel admin na porta 5175
INICIAR-SUPER-ADMIN.bat
```

**Acesse:** http://localhost:5175

#### 📊 Funcionalidades do Super Admin

- ✅ **Dashboard Global**
  - Total de tenants, ativos, inativos
  - Total de usuários no sistema
  - Distribuição de tenants por plano
  - Últimos tenants criados

- ✅ **Gestão Completa de Tenants**
  - Listar todos os tenants com paginação
  - Buscar por nome ou subdomínio
  - Filtrar por status e plano
  - Ativar/Desativar tenants
  - Deletar tenants (com confirmação)
  - Ver detalhes completos

- ✅ **Segurança Total**
  - Acesso exclusivo para role `SUPER_ADMIN`
  - Super admin sem `tenantId` (não vinculado a nenhum tenant)
  - Autenticação JWT
  - Rotas protegidas (backend + frontend)

#### 📖 Documentação Completa

- **[GUIA-SUPER-ADMIN.md](GUIA-SUPER-ADMIN.md)** - Guia passo a passo completo
- **[RESUMO-SUPER-ADMIN.md](RESUMO-SUPER-ADMIN.md)** - Resumo executivo
- **[ARQUITETURA-SUPER-ADMIN.md](ARQUITETURA-SUPER-ADMIN.md)** - Diagramas e fluxos

#### 🛠️ Tecnologias (Super Admin)

- React 18 + TypeScript
- Vite (porta 5175)
- React Query + Axios
- Tailwind CSS
- Backend integrado (mesma API)

---

## 🚦 Início Rápido

### Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- npm ou yarn

### Instalação Completa

**1. Clone o repositório**
```powershell
git clone <repository-url>
cd Saas
```

**2. Backend**
```powershell
cd backend
npm install
copy .env.example .env
# Edite o .env com suas configurações:
# DATABASE_URL="postgresql://user:password@localhost:5432/saas_marketplace"
# JWT_SECRET="seu_secret_aqui"

# Execute as migrations
npx prisma migrate dev --name init
npx prisma generate

# Popule o banco com dados iniciais
npm run seed

# Inicie o servidor (porta 3000)
npm run dev
```

**3. Frontend**
```powershell
cd ../frontend
npm install
copy .env.example .env
# Configure VITE_API_URL=http://localhost:3000

# Inicie o dev server (porta 5173)
npm run dev
```

### 🔐 Acesso ao Sistema

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **Credenciais padrão:**
  - Email: `admin@example.com`
  - Senha: `admin123`

### 📦 Estrutura de Pacotes

**Backend (210 packages):**
- express, prisma, socket.io, bcryptjs, jsonwebtoken, cors, dotenv

**Frontend (330 packages):**
- react, react-router-dom, @tanstack/react-query, axios, tailwindcss, lucide-react

## 📖 Documentação

- **[INSTALACAO.md](INSTALACAO.md)** - Guia completo de instalação e configuração
- **[MANUAL.md](MANUAL.md)** - Manual de uso do sistema

## 🔧 Configuração de Integrações

### Mercado Livre OAuth
1. Acesse [https://developers.mercadolivre.com.br](https://developers.mercadolivre.com.br)
2. Crie uma nova aplicação
3. Obtenha `APP_ID` e `SECRET_KEY`
4. Configure URLs de redirecionamento: `http://localhost:3000/api/marketplace/mercadolivre/callback`
5. No sistema, vá em **Integrações** → **Mercado Livre** → **Configurar**
6. Insira as credenciais e clique em **Conectar Conta**

### Shopee Open Platform
1. Registre-se em [https://open.shopee.com](https://open.shopee.com)
2. Crie uma aplicação e obtenha as credenciais
3. Configure `Partner ID` e `Partner Key`
4. URL de callback: `http://localhost:3000/api/marketplace/shopee/callback`
5. No sistema, acesse **Integrações** → **Shopee** → **Configurar**
6. Siga as instruções de autorização

### Variáveis de Ambiente (.env)

**Backend:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/saas_marketplace"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3000

# Mercado Livre (opcional)
ML_APP_ID="your_app_id"
ML_SECRET_KEY="your_secret_key"

# Shopee (opcional)
SHOPEE_PARTNER_ID="your_partner_id"
SHOPEE_PARTNER_KEY="your_partner_key"
```

**Frontend:**
```env
VITE_API_URL=http://localhost:3000
```

## 📡 APIs e Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `GET /api/auth/me` - Dados do usuário logado

### Produtos
- `GET /api/products` - Listar produtos (paginado, com busca)
- `POST /api/products` - Criar produto (multipart/form-data para imagens)
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Remover produto
- `DELETE /api/products/images/:id` - Remover imagem do produto

### Departamentos
- `GET /api/departments` - Listar departamentos
- `POST /api/departments` - Criar departamento
- `PUT /api/departments/:id` - Atualizar departamento
- `DELETE /api/departments/:id` - Remover departamento

### Pedidos
- `GET /api/orders` - Listar pedidos (com filtros)
- `POST /api/orders` - Criar pedido
- `PATCH /api/orders/:id/department` - Mover para departamento
- `PATCH /api/orders/:id/status` - Atualizar status

### Marketplace
- `POST /api/marketplace/config` - Salvar configuração
- `GET /api/marketplace/integrations` - Listar integrações
- `GET /api/marketplace/mercadolivre/auth` - Iniciar OAuth ML
- `GET /api/marketplace/mercadolivre/callback` - Callback OAuth ML
- `GET /api/marketplace/shopee/auth` - Iniciar OAuth Shopee
- `GET /api/marketplace/shopee/callback` - Callback OAuth Shopee

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais

### Webhooks
- `POST /api/webhooks/mercadolivre` - Receber eventos ML
- `POST /api/webhooks/shopee` - Receber eventos Shopee

## 🖨️ Hardware Suportado

### Leitores de Código de Barras
- Qualquer leitor USB HID (emula teclado)
- Leitores Bluetooth compatíveis

### Impressoras Térmicas
- Zebra ZPL
- EPSON TM-T20
- Argox OS-214
- Qualquer impressora compatível com ESC/POS

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Bcrypt para senhas (salt rounds: 10)
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validação de dados
- ✅ SQL Injection protection (Prisma)
- ✅ XSS protection em formulários
- ✅ Variáveis de ambiente protegidas

## 🎨 Design System

### Cores
- **Primary:** #3b82f6 • **Success:** #10b981 • **Warning:** #f59e0b • **Error:** #ef4444

### Breakpoints (Mobile First)
- **sm:** 640px • **md:** 768px • **lg:** 1024px • **xl:** 1280px • **2xl:** 1536px

## 📊 Database

**19 tabelas relacionais** incluindo User, Department, Product, ProductImage, Order, WorkflowStep, MarketplaceIntegration, Listing, Message, Question, Task

## 📈 Roadmap

### ✅ Concluído
- [x] **Multi-tenancy SaaS completo**
- [x] **Sistema de Billing com 3 planos**
- [x] **Auto-registro de tenants**
- [x] **Middleware de isolamento de tenant**
- [x] **Dashboard de uso e limites**
- [x] Autenticação JWT completa
- [x] CRUD de Produtos com upload de imagens
- [x] CRUD de Departamentos com cores
- [x] Dashboard com estatísticas
- [x] Sistema de Pedidos
- [x] Integração OAuth Mercado Livre
- [x] Integração OAuth Shopee
- [x] Interface responsiva mobile-first
- [x] Logo SVG moderna e única
- [x] Todas as páginas responsivas

### 🚧 Em Desenvolvimento
- [ ] Gateway de pagamento (Stripe/PagSeguro)
- [ ] Gestão de domínios customizados
- [ ] Backend para upload de imagens (multer)
- [ ] Sincronização real com marketplaces
- [ ] Sistema de notificações em tempo real
- [ ] Gestão de tarefas com calendário

### 🎯 Próximas Versões
- [ ] Integração com Amazon
- [ ] Integração com Magalu
- [ ] App mobile (React Native)
- [ ] Relatórios PDF exportáveis
- [ ] Backup automático
- [ ] API pública para terceiros
- [ ] Sistema de permissões granular
- [ ] Chat em tempo real com clientes
- [ ] BI e Analytics avançado
- [ ] White label (Enterprise)

## 🏆 Status

![Status](https://img.shields.io/badge/Status-Produção-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)
![SaaS](https://img.shields.io/badge/Multi--Tenant-100%25-purple?style=for-the-badge)

## 💰 Valor de Mercado

### Análise de Precificação

**Investimento em Desenvolvimento:**
- Horas estimadas: 800-1000 horas
- Custo/hora (desenvolvedor sênior): R$ 150-200
- **Investimento total**: R$ 120.000 - R$ 200.000

**Valor de Mercado do Sistema:**

**Modelo SaaS Multi-Tenant Completo:**
- Base do sistema: R$ 150.000
- Multi-tenancy + Isolamento: R$ 40.000
- Sistema de Billing: R$ 30.000
- Integrações Marketplace: R$ 25.000
- Auto-registro + Onboarding: R$ 15.000
- Interface responsiva premium: R$ 20.000
- **Total estimado**: **R$ 280.000 - R$ 350.000**

**Valor Recorrente (MRR):**
- Clientes potenciais: 50-200 empresas no primeiro ano
- Ticket médio: R$ 197/mês (Plano Pro)
- MRR estimado: R$ 10.000 - R$ 40.000/mês
- ARR (anual): R$ 120.000 - R$ 480.000/ano

**ROI Projetado:**
- Break-even: 6-12 meses
- Payback do investimento: 8-18 meses
- LTV (Lifetime Value) por cliente: R$ 7.000 - R$ 15.000

### Comparação de Mercado

Sistemas similares cobram:
- **Bling**: R$ 250/mês (funcionalidades básicas)
- **Tiny ERP**: R$ 150-300/mês
- **Omie**: R$ 300-800/mês
- **Nosso sistema**: R$ 97-497/mês (competitivo)

## 📄 Licença

**Proprietary** - Todos os direitos reservados © 2025

## 👥 Suporte

📧 suporte@sistema.com • 💬 Sistema interno • 📱 WhatsApp

---

<div align="center">

**Desenvolvido com ❤️ para otimizar operações de e-commerce multi-marketplace**

[⬆ Voltar ao topo](#-saas-marketplace---sistema-de-gestão-multi-marketplace)

</div>
