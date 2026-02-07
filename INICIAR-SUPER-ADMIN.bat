@echo off
chcp 65001 > nul
echo ========================================
echo   INICIANDO SUPER ADMIN
echo ========================================
echo.

cd /d "%~dp0frontend-admin"

echo 🚀 Iniciando painel Super Admin na porta 5175...
echo.
echo Acesse: http://localhost:5175
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run dev

pause
