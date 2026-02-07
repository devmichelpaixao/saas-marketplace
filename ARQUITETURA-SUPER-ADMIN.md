# 🏗️ Arquitetura do Super Admin - Diagrama

## 📊 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIO FINAL                                │
│                    (Super Administrador)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND ADMIN (React)                           │
│                    http://localhost:5175                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  LoginPage   │  │ DashboardPage│  │ TenantsPage  │             │
│  │              │  │              │  │              │             │
│  │ - Email      │  │ - Stats      │  │ - Tabela     │             │
│  │ - Senha      │  │ - Gráficos   │  │ - Filtros    │             │
│  │ - Validação  │  │ - Últimos    │  │ - Ações      │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                  │                      │
│         └─────────────────┴──────────────────┘                      │
│                             │                                        │
│                             ▼                                        │
│                  ┌──────────────────────┐                           │
│                  │   AuthContext        │                           │
│                  │   - user             │                           │
│                  │   - login()          │                           │
│                  │   - logout()         │                           │
│                  └──────────┬───────────┘                           │
│                             │                                        │
│                             ▼                                        │
│                  ┌──────────────────────┐                           │
│                  │   API Service        │                           │
│                  │   (Axios)            │                           │
│                  │   - baseURL          │                           │
│                  │   - interceptors     │                           │
│                  └──────────┬───────────┘                           │
│                             │                                        │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                              │ HTTP Requests (JWT Token)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express)                             │
│                    http://localhost:3000                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              /api/super-admin/* Routes                        │ │
│  │                                                               │ │
│  │  GET    /stats           - Estatísticas globais              │ │
│  │  GET    /tenants         - Lista paginada                    │ │
│  │  GET    /tenants/:id     - Detalhes                          │ │
│  │  PATCH  /tenants/:id/status - Ativar/desativar              │ │
│  │  PATCH  /tenants/:id/plan   - Alterar plano                 │ │
│  │  DELETE /tenants/:id     - Deletar                           │ │
│  │  GET    /plans           - Listar planos                     │ │
│  └───────────────────────────┬───────────────────────────────────┘ │
│                              │                                      │
│                              ▼                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                 MIDDLEWARE CHAIN                              │ │
│  │                                                               │ │
│  │  1. authenticate()        ──────────────────────────────────┐│ │
│  │     ├─ Verifica JWT token                                   ││ │
│  │     ├─ Extrai usuário do token                              ││ │
│  │     └─ Retorna 401 se inválido                              ││ │
│  │                                                              ││ │
│  │  2. requireSuperAdmin()   ◄──────────────────────────────────┘│ │
│  │     ├─ Verifica: user.role === 'SUPER_ADMIN'               ┐│ │
│  │     └─ Retorna 403 se não for super admin                  ││ │
│  │                                                             ││ │
│  │  3. requireNoTenant()     ◄─────────────────────────────────┘│ │
│  │     ├─ Verifica: user.tenantId === NULL                     │ │
│  │     └─ Retorna 403 se tiver tenant                          │ │
│  │                                                              │ │
│  └───────────────────────────┬──────────────────────────────────┘ │
│                               │                                    │
│                               ▼                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              SUPER ADMIN CONTROLLER                           │ │
│  │                                                               │ │
│  │  - listTenants()      - Lista com filtros e paginação       │ │
│  │  - getTenant()        - Detalhes completos                  │ │
│  │  - updateTenantStatus() - Ativa/desativa                    │ │
│  │  - updateTenantPlan() - Muda plano                          │ │
│  │  - getStats()         - Estatísticas agregadas              │ │
│  │  - listPlans()        - Todos os planos                     │ │
│  │  - deleteTenant()     - Remove tenant                       │ │
│  └───────────────────────────┬──────────────────────────────────┘ │
│                               │                                    │
└───────────────────────────────┼────────────────────────────────────┘
                                │
                                │ SQL Queries
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BANCO DE DADOS (PostgreSQL)                     │
│                        via Prisma ORM                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   users      │  │   tenants    │  │ subscriptions│             │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤             │
│  │ id           │  │ id           │  │ id           │             │
│  │ tenantId  ◄──┼──│ name         │  │ tenantId  ◄──┼──┐          │
│  │ email        │  │ subdomain    │  │ planId    ◄──┼──┼──┐       │
│  │ password     │  │ active       │  │ status       │  │  │       │
│  │ role         │  │ createdAt    │  │ startDate    │  │  │       │
│  │ active       │  └──────────────┘  │ endDate      │  │  │       │
│  └──────────────┘                    └──────────────┘  │  │       │
│                                                         │  │       │
│  ┌──────────────┐  ┌──────────────┐                   │  │       │
│  │  auditLogs   │  │    plans     │ ◄─────────────────┘  │       │
│  ├──────────────┤  ├──────────────┤                      │       │
│  │ id           │  │ id           │                      │       │
│  │ tenantId  ◄──┼──│ name         │                      │       │
│  │ userId       │  │ price        │                      │       │
│  │ action       │  │ features     │                      │       │
│  │ details      │  │ active       │                      │       │
│  │ timestamp    │  └──────────────┘                      │       │
│  └──────────────┘                                        │       │
│                                                          │       │
│  SUPER ADMIN:                                            │       │
│  ┌─────────────────────────────────────────────┐        │       │
│  │ id: uuid                                    │        │       │
│  │ tenantId: NULL  ◄────── CRÍTICO!            │        │       │
│  │ email: 'superadmin@sistema.com'             │        │       │
│  │ password: '$2a$10$...' (bcrypt hash)         │        │       │
│  │ role: 'SUPER_ADMIN'  ◄────── CRÍTICO!       │        │       │
│  │ active: true                                │        │       │
│  └─────────────────────────────────────────────┘        │       │
│                                                          │       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO ACESSA /login                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. PREENCHE CREDENCIAIS                                         │
│    - Email: superadmin@sistema.com                              │
│    - Senha: SuaSenha                                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND: POST /api/auth/login                               │
│    Body: { email, password }                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. BACKEND: Valida credenciais                                  │
│    - Busca usuário no banco                                     │
│    - Compara hash da senha (bcrypt)                             │
│    - Gera JWT token                                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. FRONTEND: Recebe resposta                                    │
│    Response: { user, token }                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND: Valida role                                        │
│    if (user.role !== 'SUPER_ADMIN') {                           │
│        throw Error('Acesso negado')                             │
│    }                                                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. FRONTEND: Salva token                                        │
│    localStorage.setItem('token', token)                         │
│    setUser(user)                                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. REDIRECT para /                                              │
│    → DashboardPage é renderizado                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Fluxo de Requisição Protegida

```
┌─────────────────────────────────────────────────────────────────┐
│ USUÁRIO CLICA EM "Tenants" no menu                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ React Router → /tenants                                         │
│ PrivateRoute verifica autenticação                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ useAuth() retorna user (OK)                                     │
│ TenantsPage é renderizado                                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ useQuery executa:                                               │
│ GET /api/super-admin/tenants?page=1&limit=20                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ AXIOS INTERCEPTOR (Request)                                     │
│ Adiciona header:                                                │
│ Authorization: Bearer eyJhbGc...                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND: Route Handler                                          │
│ /api/super-admin/tenants                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE 1: authenticate()                                    │
│ ├─ Extrai token do header                                       │
│ ├─ Verifica JWT                                                 │
│ ├─ Decodifica payload                                           │
│ └─ Busca user no banco                                          │
│                                                                 │
│ Se OK → next()                                                  │
│ Se ERRO → 401 Unauthorized                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE 2: requireSuperAdmin()                               │
│ ├─ Verifica: req.user.role === 'SUPER_ADMIN'                   │
│ │                                                               │
│ └─ Se NÃO → 403 Forbidden                                       │
│    'Acesso negado. Apenas super admins.'                        │
│                                                                 │
│ Se OK → next()                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ MIDDLEWARE 3: requireNoTenant()                                 │
│ ├─ Verifica: req.user.tenantId === null                        │
│ │                                                               │
│ └─ Se TEM TENANT → 403 Forbidden                                │
│    'Super admin não pode ter tenant.'                           │
│                                                                 │
│ Se OK → next()                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ CONTROLLER: listTenants()                                       │
│ ├─ Extrai query params (page, limit, search, status, planId)   │
│ ├─ Monta filtros Prisma                                         │
│ ├─ Executa query no banco                                       │
│ ├─ Calcula paginação                                            │
│ └─ Retorna: { data, page, totalPages, total }                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ RESPONSE → Frontend                                             │
│ Status: 200 OK                                                  │
│ Body: { data: [...], page: 1, totalPages: 3, total: 45 }       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: React Query atualiza cache                            │
│ TenantsPage renderiza tabela com dados                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Fluxo de Ação (Exemplo: Desativar Tenant)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO CLICA no botão "Desativar"                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND: Confirmação                                        │
│    if (!confirm('Desativar tenant X?')) return                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. useMutation executa:                                         │
│    PATCH /api/super-admin/tenants/:id/status                    │
│    Body: { active: false }                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. BACKEND: Middleware chain (autenticação + validação)        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. CONTROLLER: updateTenantStatus()                             │
│    - Valida que tenant existe                                   │
│    - Atualiza: UPDATE tenants SET active = false WHERE id = X   │
│    - Retorna tenant atualizado                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND: onSuccess                                          │
│    - queryClient.invalidateQueries(['tenants'])                 │
│    - Lista é recarregada automaticamente                        │
│    - Badge muda de verde (Ativo) para vermelho (Inativo)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Modelo de Dados

```sql
-- SUPER ADMIN (exemplo)
users {
  id:        "550e8400-e29b-41d4-a716-446655440000"
  tenantId:  NULL                                    ← Sem tenant!
  email:     "superadmin@sistema.com"
  password:  "$2a$10$XYZ..."                         ← Hash bcrypt
  name:      "Super Administrador"
  role:      "SUPER_ADMIN"                           ← Role especial
  active:    true
  createdAt: "2024-01-15T10:00:00Z"
  updatedAt: "2024-01-15T10:00:00Z"
}

-- TENANT NORMAL (exemplo)
tenants {
  id:        "660e8400-e29b-41d4-a716-446655440001"
  name:      "Empresa ABC"
  subdomain: "empresa-abc"
  active:    true
  createdAt: "2024-01-20T14:30:00Z"
  updatedAt: "2024-01-20T14:30:00Z"
}

-- USUÁRIO DO TENANT (exemplo)
users {
  id:        "770e8400-e29b-41d4-a716-446655440002"
  tenantId:  "660e8400-e29b-41d4-a716-446655440001" ← Vinculado ao tenant
  email:     "admin@empresa-abc.com"
  password:  "$2a$10$ABC..."
  name:      "Admin Empresa ABC"
  role:      "ADMIN"                                 ← Role normal
  active:    true
  createdAt: "2024-01-20T14:35:00Z"
  updatedAt: "2024-01-20T14:35:00Z"
}

-- SUBSCRIPTION (exemplo)
subscriptions {
  id:        "880e8400-e29b-41d4-a716-446655440003"
  tenantId:  "660e8400-e29b-41d4-a716-446655440001"
  planId:    "990e8400-e29b-41d4-a716-446655440004"
  status:    "active"
  startDate: "2024-01-20T00:00:00Z"
  endDate:   "2024-02-20T00:00:00Z"
  createdAt: "2024-01-20T14:30:00Z"
  updatedAt: "2024-01-20T14:30:00Z"
}
```

---

## 🎯 Pontos Críticos de Segurança

```
┌──────────────────────────────────────────────────────────────┐
│                    VALIDAÇÃO DE SUPER ADMIN                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ✅ user.role === 'SUPER_ADMIN'                              │
│     └─ Valida o tipo de usuário                              │
│                                                               │
│  ✅ user.tenantId === NULL                                   │
│     └─ Garante que não está vinculado a nenhum tenant        │
│                                                               │
│  ✅ user.active === true                                     │
│     └─ Verifica se conta está ativa                          │
│                                                               │
│  ✅ JWT token válido                                         │
│     └─ Verifica assinatura e expiração                       │
│                                                               │
│  ❌ Se QUALQUER validação falhar → Acesso negado             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                     │
├─────────────────────────────────────────────────────────────┤
│ React 18.2.0        - UI Library                            │
│ TypeScript 5.3.3    - Type Safety                           │
│ Vite 5.0.8          - Build Tool                            │
│ React Router 6.20.0 - Client-side Routing                   │
│ React Query 5.12.2  - Server State Management               │
│ Axios 1.6.2         - HTTP Client                           │
│ Tailwind CSS 3.3.6  - Styling                               │
│ Lucide React        - Icons                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BACKEND                                                      │
├─────────────────────────────────────────────────────────────┤
│ Express 4.21.1      - Web Framework                         │
│ TypeScript          - Type Safety                           │
│ Prisma ORM          - Database ORM                          │
│ PostgreSQL          - Database                              │
│ JWT                 - Authentication                        │
│ bcryptjs            - Password Hashing                      │
└─────────────────────────────────────────────────────────────┘
```

---

**Este diagrama mostra a arquitetura completa do sistema Super Admin!**
