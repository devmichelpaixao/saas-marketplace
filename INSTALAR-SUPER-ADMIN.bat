@echo off
chcp 65001 > nul
echo ========================================
echo   INSTALAR SUPER ADMIN
echo ========================================
echo.

cd /d "%~dp0frontend-admin"

echo [1/2] Instalando dependências...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)

echo.
echo ✅ Instalação concluída com sucesso!
echo.
echo ========================================
echo   PRÓXIMOS PASSOS
echo ========================================
echo.
echo 1. Criar Super Admin no banco de dados:
echo    Execute o arquivo: create-superadmin.sql
echo    no PostgreSQL
echo.
echo 2. Iniciar o servidor backend:
echo    cd backend
echo    npm run dev
echo.
echo 3. Iniciar o painel admin:
echo    cd frontend-admin
echo    npm run dev
echo.
echo 4. Acessar: http://localhost:5175
echo.
pause
