# 📦 Deploy Automático - Checklist

## ✅ Arquivos Preparados:
- [x] `.env.production` criado com exemplo de variáveis
- [x] `DEPLOY-RENDER.md` com guia completo
- [x] CORS atualizado para aceitar seu domínio InfinityFree
- [x] Scripts de build configurados
- [x] Frontend com domínio configurado

## 🚀 Próximos Passos (você precisa fazer):

### 1️⃣ Subir código para o GitHub
```bash
cd c:\Saass
git init
git add .
git commit -m "Prepare for deployment"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/seu-repositorio.git
git push -u origin main
```

### 2️⃣ Criar conta e deploy no Render.com
1. Acesse: https://render.com
2. Faça login com GitHub
3. Siga o guia em `DEPLOY-RENDER.md`

### 3️⃣ Atualizar frontend com URL do backend
1. Após deploy, copie a URL do Render (ex: https://saas-backend.onrender.com)
2. Edite `c:\Saass\frontend\.env`:
   ```
   VITE_API_URL=https://SUA_URL_DO_RENDER.onrender.com
   VITE_SOCKET_URL=https://SUA_URL_DO_RENDER.onrender.com
   ```
3. Rode: `cd c:\Saass\frontend && npm run build`
4. Faça upload do novo `dist` para InfinityFree

### 4️⃣ Testar
- Acesse: https://devmichelpaixao.infinityfreeapp.com
- Sistema deve funcionar completo!

## 📋 Variáveis de Ambiente para o Render:

Copie e cole no painel do Render:

```
DATABASE_URL=<copiar_do_render_postgresql>
NODE_ENV=production
PORT=10000
JWT_SECRET=mude_isso_por_uma_chave_segura_123456
CORS_ORIGIN=https://devmichelpaixao.infinityfreeapp.com
```

## ⏱️ Tempo estimado:
- Subir para GitHub: 5 minutos
- Deploy no Render: 10 minutos
- Atualizar frontend: 5 minutos
- **Total: ~20 minutos**

## 🆘 Precisa de ajuda?
Abra o guia `DEPLOY-RENDER.md` para instruções detalhadas passo a passo!
