# 🚀 Guia Rápido - Nova Gestão Super Admin

## Como Iniciar

### 1️⃣ Iniciar o Sistema
```bash
# Execute o script de inicialização
.\INICIAR-RAPIDO.bat

# Ou manualmente:
cd backend && npm run dev
cd frontend-admin && npm run dev
```

### 2️⃣ Criar Planos Iniciais (Primeira vez)
```bash
# Execute o script para criar planos padrão
.\CRIAR-PLANOS.bat
```

Isso criará 5 planos:
- **Gratuito** - R$ 0,00/mês
- **Básico** - R$ 49,90/mês  
- **Profissional** - R$ 149,90/mês
- **Enterprise** - R$ 499,90/mês
- **Trial** - R$ 0,00/mês (14 dias)

### 3️⃣ Acessar o Painel
```
URL: http://localhost:5173
Email: super@admin.com
Senha: (sua senha de super admin)
```

## 📖 Como Usar as Novas Funcionalidades

### Gerenciar Planos

**Criar um novo plano:**
1. Acesse **Menu → Planos**
2. Clique em **"Novo Plano"**
3. Preencha:
   - Nome (ex: "Premium")
   - Descrição
   - Preço mensal
   - Limites (usuários, produtos, pedidos)
   - Recursos (clique + para adicionar)
4. Clique em **"Salvar"**

**Editar um plano:**
1. Na página de Planos
2. Clique em **"Editar"** no card do plano
3. Modifique os campos desejados
4. Salve as alterações

**Ativar/Desativar:**
- Clique em **"Ativar"** ou **"Desativar"**
- Planos inativos não aparecem para novos tenants

**Deletar:**
- Clique no ícone de **lixeira**
- ⚠️ Só é possível deletar planos sem assinaturas ativas

### Aprovar Tenants

**Visualizar solicitações:**
1. Acesse **Menu → Aprovações**
2. Veja lista de tenants pendentes
3. Informações mostradas:
   - Nome da empresa
   - Subdomínio
   - Administrador
   - Email
   - Data de criação

**Aprovar acesso:**
1. Clique em **"Aprovar"** no tenant desejado
2. Selecione o **plano** que será atribuído
3. Clique em **"Confirmar"**
4. ✅ Tenant será ativado automaticamente

**Rejeitar solicitação:**
1. Clique em **"Rejeitar"**
2. Digite o motivo (opcional)
3. Confirme
4. ❌ Tenant será marcado como rejeitado

### Dashboard - Visão Geral

O Dashboard mostra:
- 📊 **Total de Tenants** - todos os cadastrados
- ✅ **Tenants Ativos** - com acesso liberado
- ❌ **Tenants Inativos** - bloqueados ou pendentes
- 👥 **Total de Usuários** - em todos os tenants

Também exibe:
- **Distribuição por Plano** - quantos tenants em cada plano
- **Últimos Tenants** - criados recentemente
- **Ações Rápidas** - links diretos

### Gerenciar Tenants

Na página de Tenants você pode:
- 🔍 **Buscar** - por nome ou subdomínio
- 🔽 **Filtrar** - por status e plano
- ✏️ **Editar** - informações do tenant
- 🔄 **Trocar Plano** - mudar assinatura
- ⚡ **Ativar/Desativar** - bloquear acesso
- 🗑️ **Deletar** - remover completamente (cuidado!)

## 🎯 Casos de Uso Comuns

### Caso 1: Nova Empresa Se Cadastrou

**Cenário:** Uma empresa se cadastrou e está aguardando aprovação.

**Passos:**
1. Acesse **Aprovações**
2. Revise as informações da empresa
3. Decida o plano adequado (Trial, Básico, etc)
4. Clique em **Aprovar**
5. Selecione o plano
6. Confirme

**Resultado:** Empresa pode fazer login e usar o sistema

### Caso 2: Cliente Quer Upgrade

**Cenário:** Cliente no plano Básico quer migrar para Profissional.

**Passos:**
1. Acesse **Tenants**
2. Encontre o tenant do cliente
3. Clique no botão de **editar plano**
4. Selecione "Profissional"
5. Confirme

**Resultado:** Cliente terá novos limites imediatamente

### Caso 3: Criar Plano Personalizado

**Cenário:** Cliente enterprise precisa de um plano customizado.

**Passos:**
1. Acesse **Planos**
2. Clique em **Novo Plano**
3. Configure:
   - Nome: "Enterprise - Empresa X"
   - Limites personalizados
   - Recursos específicos
4. Salve
5. Em **Tenants**, atribua o novo plano

### Caso 4: Desativar Tenant Inadimplente

**Cenário:** Cliente não pagou e precisa ser bloqueado.

**Passos:**
1. Acesse **Tenants**
2. Encontre o tenant
3. Clique em **Desativar**
4. Confirme

**Resultado:** Tenant não consegue mais fazer login

## 🔐 Permissões

**Quem pode acessar:**
- ✅ Apenas usuários com role **SUPER_ADMIN**
- ✅ Que **NÃO estejam** vinculados a um tenant
- ❌ Admins de tenants **NÃO** podem acessar

## 📱 Navegação

### Menu Superior
```
Dashboard → Visão geral e estatísticas
Tenants   → Gerenciar empresas
Planos    → Criar/editar planos
Aprovações→ Aprovar novos acessos
```

### Atalhos de Teclado (futuro)
- `Alt + D` → Dashboard
- `Alt + T` → Tenants
- `Alt + P` → Planos
- `Alt + A` → Aprovações

## ⚙️ Configurações Recomendadas

### Planos Sugeridos

**Para Startups:**
- Trial (14 dias) → converter para Básico

**Para PMEs:**
- Básico → escalar para Profissional conforme crescem

**Para Empresas:**
- Profissional → upgrade para Enterprise

**Para Grandes Corporações:**
- Enterprise ou planos customizados

### Políticas de Aprovação

**Automática:**
- Configurar webhook para aprovar automaticamente com plano Trial

**Manual:**
- Revisar cada solicitação antes de aprovar

**Híbrida:**
- Aprovar Trial automaticamente
- Exigir validação manual para planos pagos

## 🛡️ Segurança

**Todas as ações são:**
- ✅ Registradas em audit logs
- ✅ Protegidas por autenticação
- ✅ Validadas no backend
- ✅ Restritas a Super Admins

## 📊 Métricas Importantes

### KPIs para Acompanhar
1. **Taxa de Conversão** - Trial → Pago
2. **Distribuição de Planos** - qual mais vendido
3. **Churn Rate** - tenants que saem
4. **Tempo de Aprovação** - quanto tempo para aprovar
5. **Crescimento MRR** - receita mensal recorrente

## 🆘 Troubleshooting

### Problema: Não consigo deletar um plano
**Solução:** Planos com assinaturas ativas não podem ser deletados. Primeiro, migre os tenants para outro plano.

### Problema: Aprovação não está funcionando
**Solução:** Verifique se selecionou um plano ativo antes de confirmar.

### Problema: Tenant aprovado mas não consegue logar
**Solução:** Verifique se o tenant está marcado como "ativo" na lista de Tenants.

### Problema: Erro ao criar plano
**Solução:** Certifique-se de que todos os campos obrigatórios estão preenchidos e o nome não está duplicado.

## 🎨 Personalização

### Cores do Sistema
Edite `frontend-admin/src/index.css` para personalizar:
- Cores primárias
- Estilos de botões
- Badges e alertas

### Limites Padrão
Edite `seed-plans.ts` para ajustar os planos padrão.

## 📞 Suporte

Em caso de dúvidas:
1. Verifique este guia
2. Consulte `GESTAO-SUPER-ADMIN.md` para detalhes técnicos
3. Revise os logs no console do navegador
4. Verifique logs do backend

---

**Documentação atualizada em:** 13/12/2025  
**Versão:** 2.0  
**Sistema:** Multi-tenant SaaS Platform
