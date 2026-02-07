@echo off
title SaaS - CONFIGURACAO COMPLETA NGROK
color 0B

echo ========================================
echo    CONFIGURACAO COMPLETA NGROK
echo ========================================
echo.

cd /d "%~dp0"

REM Verifica se ngrok esta instalado
if not exist "C:\ngrok\ngrok.exe" (
    echo [ERRO] ngrok nao encontrado!
    echo Execute primeiro a instalacao.
    pause
    exit /b 1
)

REM Verifica se token esta configurado
C:\ngrok\ngrok.exe config check >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/2] Token NGROK nao configurado
    echo.
    echo Abrindo configuracao de token...
    call CONFIGURAR-NGROK-TOKEN.bat
    
    REM Verifica novamente
    C:\ngrok\ngrok.exe config check >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERRO] Token nao foi configurado corretamente.
        echo.
        pause
        exit /b 1
    )
)

echo [1/2] Token OK!
echo [2/2] Iniciando sistema com NGROK...
echo.

call ABRIR-NGROK.bat
