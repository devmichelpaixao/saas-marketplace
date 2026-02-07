@echo off
echo ========================================
echo    CRIANDO SUPER ADMIN NO BANCO
echo ========================================
echo.

cd /d C:\Saass

echo Executando script Python...
python criar-super-admin.py

echo.
echo ========================================
echo Se funcionou, voce vera:
echo   - SUPER ADMIN CRIADO COM SUCESSO
echo   - Email: superadmin@sistema.com
echo   - Senha: SuperAdmin@2024
echo ========================================
echo.
pause
