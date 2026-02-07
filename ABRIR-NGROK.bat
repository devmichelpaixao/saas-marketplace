@echo off
title SaaS - Iniciar com NGROK
color 0A

echo ========================================
echo    INICIANDO SAAS COM NGROK
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Parando processos Node anteriores...
taskkill /F /IM node.exe >nul 2>&1

echo [2/5] Iniciando Backend (porta 3000)...
start "SaaS Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 >nul

echo [3/5] Iniciando Frontend (porta 5173)...
start "SaaS Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 >nul

echo [4/5] Parando NGROK anterior...
taskkill /F /IM ngrok.exe >nul 2>&1
timeout /t 2 >nul

echo [5/5] Configurando 1 tunel NGROK para Frontend...
echo.
echo NOTA: Plano gratuito permite apenas 1 tunel
echo       Frontend tem proxy para Backend configurado
echo.
start "NGROK Frontend" cmd /k "C:\ngrok\ngrok.exe http 5173 --log stdout"

echo.
echo ========================================
echo    SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo.
echo URLs LOCAIS:
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.
echo URL PUBLICA (ngrok):
echo   Aguarde 5 segundos e execute: VER-URLS-NGROK.bat
echo   Ou veja na janela do NGROK
echo.
echo Como funciona:
echo   NGROK -^> Frontend (5173) -^> Proxy -^> Backend (3000)
echo.
echo Para parar: Feche as janelas ou execute:
echo   taskkill /F /IM node.exe
echo   taskkill /F /IM ngrok.exe
echo.
pause
