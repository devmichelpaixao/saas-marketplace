# 🚀 Como Iniciar o Painel Super Admin

## ✅ Método Simples (Recomendado)

### 1️⃣ Abrir Prompt de Comando (fora do VS Code)
- Pressione **Windows + R**
- Digite: `cmd`
- Pressione Enter

### 2️⃣ Executar o Script
```bash
C:\Saass\INICIAR-SUPER-ADMIN.bat
```

### 3️⃣ Aguardar Mensagem
Você verá:
```
VITE v5.4.21  ready in XXXX ms
➜  Local:   http://localhost:5175/
```

### 4️⃣ Acessar no Navegador
**URL:** http://localhost:5175

**Credenciais:**
- **Email:** superadmin@sistema.com
- **Senha:** SuperAdmin@2024

---

## 🔧 Método Alternativo (Manual)

### 1️⃣ Abrir Prompt de Comando
- Windows + R → `cmd` → Enter

### 2️⃣ Navegar para o Diretório
```bash
cd C:\Saass\frontend-admin
```

### 3️⃣ Executar npm
```bash
npm run dev
```

### 4️⃣ Aguardar Iniciar
Quando aparecer:
```
➜  Local:   http://localhost:5175/
```

### 5️⃣ Acessar
http://localhost:5175

---

## ⚠️ Problemas Comuns

### Porta já em uso?
```bash
# Matar processo Node.js
taskkill /F /IM node.exe

# Reiniciar
C:\Saass\INICIAR-SUPER-ADMIN.bat
```

### Backend não está rodando?
```bash
# Abrir outro terminal
cd C:\Saass\backend
npm run dev
```

---

## ✅ Status dos Serviços

Para verificar se está tudo rodando, abra navegador em:
- **Backend:** http://localhost:3000 (deve mostrar algo ou erro 404)
- **Super Admin:** http://localhost:5175 (deve mostrar tela de login)

---

## 📝 Notas Importantes

1. **NÃO use o terminal do VS Code** - está com problema de buffer
2. **Use CMD ou PowerShell nativo do Windows**
3. **Deixe a janela do terminal aberta** enquanto usa o sistema
4. **Pressione Ctrl+C** para parar o servidor

---

## 🎯 Resumo Rápido

**1 Comando para Tudo:**
```
C:\Saass\INICIAR-SUPER-ADMIN.bat
```

**Login:**
- http://localhost:5175
- superadmin@sistema.com
- SuperAdmin@2024
