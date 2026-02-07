@echo off
echo ========================================
echo Iniciando Sistema SaaS
echo ========================================
echo.

echo [1/3] Parando processos anteriores...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Iniciando Backend (porta 3000)...
start "Backend SaaS - Porta 3000" cmd /k "cd /d c:\Saass\backend && echo Iniciando Backend... && npm run dev"
timeout /t 8 /nobreak >nul

echo [3/3] Iniciando Frontend (porta 5173)...
start "Frontend SaaS - Porta 5173" cmd /k "cd /d c:\Saass\frontend && echo Iniciando Frontend... && npm run dev"
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo Servidores iniciados!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Local:    http://localhost:5173
echo Rede:     http://192.168.1.12:5173
echo.
echo Abrindo navegador...
timeout /t 3 /nobreak >nul
start http://localhost:5173/login
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
