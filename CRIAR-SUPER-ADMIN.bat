@echo off
chcp 65001 > nul
cls
echo ========================================
echo   CRIAR SUPER ADMIN NO BANCO DE DADOS
echo ========================================
echo.

cd /d "%~dp0backend"

echo Executando script...
echo.

node create-superadmin-db.js

echo.
echo ========================================
echo Pressione qualquer tecla para sair...
pause > nul
