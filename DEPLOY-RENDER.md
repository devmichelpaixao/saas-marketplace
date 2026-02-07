# 🚀 Guia de Deploy no Render.com

## Passos para hospedar o backend:

### 1. Crie uma conta no Render
- Acesse: https://render.com
- Faça login com GitHub

### 2. Crie o banco de dados PostgreSQL
- No dashboard, clique em **"New +"** → **"PostgreSQL"**
- Configure:
  - **Name**: `saas-database`
  - **Database**: `saas_marketplace`
  - **User**: (deixe automático)
  - **Region**: `Oregon (US West)` ou mais próximo
  - **PostgreSQL Version**: 16
  - **Plan**: **FREE**
- Clique em **"Create Database"**
- Aguarde a criação (1-2 minutos)
- **IMPORTANTE**: Copie a **"Internal Database URL"** (estará na aba "Info")

### 3. Suba o código para o GitHub
- Crie um repositório no GitHub
- Faça upload da pasta `backend` completa
- OU use Git no terminal:
  ```bash
  cd c:\Saass
  git init
  git add .
  git commit -m "Deploy backend"
  git branch -M main
  git remote add origin https://github.com/SEU_USUARIO/saas-backend.git
  git push -u origin main
  ```

### 4. Crie o Web Service no Render
- Clique em **"New +"** → **"Web Service"**
- Clique em **"Build and deploy from a Git repository"**
- Conecte seu GitHub e selecione o repositório
- Configure:
  - **Name**: `saas-backend`
  - **Region**: mesma do banco (Oregon)
  - **Branch**: `main`
  - **Root Directory**: `backend` (se subiu o projeto todo) ou deixe vazio (se subiu só o backend)
  - **Runtime**: `Node`
  - **Build Command**: `npm install && npx prisma generate && npm run build`
  - **Start Command**: `npm start`
  - **Instance Type**: **Free**

### 5. Adicione as variáveis de ambiente
Na seção **"Environment Variables"**, clique em **"Add Environment Variable"** e adicione:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Cole a Internal Database URL copiada do banco |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_SECRET` | `sua_chave_secreta_mude_isso_123456` |
| `CORS_ORIGIN` | `https://devmichelpaixao.infinityfreeapp.com` |

### 6. Deploy
- Clique em **"Create Web Service"**
- Aguarde o deploy (5-10 minutos na primeira vez)
- O Render vai:
  1. Instalar dependências
  2. Gerar o Prisma Client
  3. Compilar TypeScript
  4. Iniciar o servidor

### 7. Execute as migrations do banco
- Após o deploy bem-sucedido, vá na aba **"Shell"** do seu Web Service
- Execute os comandos:
  ```bash
  npx prisma migrate deploy
  npx prisma db seed
  ```

### 8. Copie a URL do backend
- Na página do Web Service, copie a URL (algo como: `https://saas-backend.onrender.com`)

### 9. Atualize o frontend
- Edite `c:\Saass\frontend\.env`:
  ```
  VITE_API_URL=https://SEU_BACKEND.onrender.com
  VITE_SOCKET_URL=https://SEU_BACKEND.onrender.com
  ```
- Rode:
  ```bash
  cd c:\Saass\frontend
  npm run build
  ```
- Faça upload do novo build para o InfinityFree

### 10. Teste
- Acesse: https://devmichelpaixao.infinityfreeapp.com
- O site deve funcionar conectando ao backend no Render!

---

## ⚠️ Importante:
- O plano FREE do Render **hiberna após 15 minutos de inatividade**
- A primeira requisição após hibernar pode demorar 30-60 segundos
- Se quiser evitar hibernação, use o plano pago ($7/mês)

## 🆘 Problemas comuns:
- **Build falhou**: Verifique os logs no Render
- **500 error**: Verifique se DATABASE_URL está correta
- **CORS error**: Verifique se CORS_ORIGIN está correto
- **Não conecta**: Aguarde o primeiro deploy terminar completamente

## 📞 Precisa de ajuda?
Se tiver dúvidas ou erros, me envie o log do Render para eu te ajudar!
