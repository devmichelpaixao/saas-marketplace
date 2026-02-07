# Super Admin - Painel de Administração

Painel de administração para gerenciar todos os tenants do sistema SaaS.

## 🚀 Instalação Rápida

### Opção 1: Usar o script batch (Windows)
```bash
# Na raiz do projeto
INSTALAR-SUPER-ADMIN.bat
```

### Opção 2: Manual
```bash
cd frontend-admin
npm install
```

## 🎯 Configuração

### 1. Criar Super Admin no Banco de Dados

Primeiro, gere o hash da senha:

```javascript
// Execute no Node.js
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('SuaSenhaForte123!', 10);
console.log(hash);
```

Depois, execute o SQL (arquivo `create-superadmin.sql`):

```sql
INSERT INTO users (
    id, "tenantId", email, password, name, role, active, "createdAt", "updatedAt"
)
VALUES (
    gen_random_uuid(),
    NULL,  -- CRÍTICO: Super admin NÃO tem tenant
    'superadmin@sistema.com',
    'SEU_HASH_AQUI',
    'Super Administrador',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
);
```

### 2. Configurar Variáveis de Ambiente

Arquivo `.env` já está configurado:

```env
VITE_API_URL=http://localhost:3000
```

## 🏃 Executar

### Opção 1: Usar o script batch (Windows)
```bash
# Na raiz do projeto
INICIAR-SUPER-ADMIN.bat
```

### Opção 2: Manual
```bash
cd frontend-admin
npm run dev
```

O painel estará disponível em: **http://localhost:5175**

## 🔐 Acesso

**Email:** superadmin@sistema.com  
**Senha:** A senha que você definiu ao criar o hash

## 📊 Funcionalidades

### Dashboard
- **Estatísticas Globais**: Total de tenants, ativos, inativos, usuários
- **Distribuição por Plano**: Visualize quantos tenants estão em cada plano
- **Últimos Tenants**: Lista dos tenants criados recentemente

### Gestão de Tenants
- **Listar Todos**: Tabela completa com paginação
- **Buscar**: Por nome ou subdomínio
- **Filtrar**: Por status (ativo/inativo) ou plano
- **Ações**:
  - ⚡ Ativar/Desativar tenant
  - 🗑️ Deletar tenant (com confirmação dupla)
  - 📝 Alterar plano (via API)

### Segurança
- Apenas usuários com `role = 'SUPER_ADMIN'` podem acessar
- Super admins **NÃO** devem ter `tenantId` (deve ser NULL)
- Autenticação via JWT token
- Proteção de rotas automática
- Logout seguro

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **Vite** para build rápido
- **Tailwind CSS** para estilização
- **React Query** para gerenciamento de estado do servidor
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Lucide React** para ícones

## 📝 API Endpoints Utilizados

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário autenticado
- `GET /api/super-admin/stats` - Estatísticas globais
- `GET /api/super-admin/tenants` - Lista de tenants
- `GET /api/super-admin/plans` - Lista de planos
- `PATCH /api/super-admin/tenants/:id/status` - Ativar/desativar
- `DELETE /api/super-admin/tenants/:id` - Deletar tenant

## 🚀 Deploy

### Opções de Deploy

1. **Vercel** (Recomendado)
   ```bash
   vercel --prod
   ```

2. **Netlify**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Variáveis de Ambiente em Produção

```env
VITE_API_URL=https://sua-api.com
```

## ⚠️ Avisos de Segurança

- **NUNCA** commite o arquivo `.env` com credenciais reais
- Use HTTPS em produção
- Implemente rate limiting no backend
- Mantenha logs de auditoria
- Use senhas fortes para contas de super admin
