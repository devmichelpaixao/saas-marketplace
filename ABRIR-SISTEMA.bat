@echo off
echo.
echo ========================================
echo   Abrindo Sistema SaaS Marketplace
echo ========================================
echo.

REM Verificar se os servidores estão rodando
echo [1/2] Verificando servidores...
powershell -Command "$b = Test-NetConnection localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue; $f = Test-NetConnection localhost -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue; if($b -and $f){ Write-Host 'OK: Servidores rodando' -ForegroundColor Green } else { Write-Host 'ERRO: Servidores nao estao rodando!' -ForegroundColor Red; Write-Host 'Execute INICIAR-SISTEMA.bat primeiro' -ForegroundColor Yellow; pause; exit }"

REM Abrir navegador
echo [2/2] Abrindo navegador...
start http://192.168.1.11:5173/login

echo.
echo ========================================
echo   Sistema Aberto!
echo ========================================
echo.
echo Login Admin:
echo   Email: admin@example.com
echo   Senha: admin123
echo.
echo ========================================
echo.
pause
