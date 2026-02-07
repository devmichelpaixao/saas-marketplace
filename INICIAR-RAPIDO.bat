@echo off
chcp 65001 >nul
color 0A

echo ========================================
echo    INICIAR SISTEMA RAPIDO
echo ========================================
echo.

:: Matar processos anteriores
echo [1/3] Limpando processos...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM ngrok.exe 2>nul
timeout /t 2 >nul

:: Iniciar Backend
echo [2/3] Iniciando Backend...
start "Backend SaaS" cmd /c "cd /d %~dp0backend && npm run dev"
timeout /t 5 >nul

:: Iniciar Frontend
echo [3/3] Iniciando Frontend...
start "Frontend SaaS" cmd /c "cd /d %~dp0frontend && npm run dev"
timeout /t 3 >nul

echo.
echo ========================================
echo    SISTEMA INICIADO!
echo ========================================
echo.
echo URLs LOCAIS:
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
echo Para acessar externamente:
echo   Execute: ABRIR-NGROK.bat
echo.
echo Para parar:
echo   Feche as janelas do terminal
echo.
pause
