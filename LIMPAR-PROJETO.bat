@echo off
echo ====================================
echo   LIMPANDO ARQUIVOS DESNECESSARIOS
echo ====================================
echo.

cd C:\Saass

REM Documentacao desnecessaria
del /F /Q ABRIR-NOIP.bat 2>nul
del /F /Q ANTES_VS_DEPOIS.md 2>nul
del /F /Q CICD_SETUP.md 2>nul
del /F /Q COMO-LOGAR.md 2>nul
del /F /Q COMO-USAR-NGROK.md 2>nul
del /F /Q CONFIGURACAO-NOIP-COMPLETO.md 2>nul
del /F /Q CONFIGURACAO-NOIP.md 2>nul
del /F /Q CONFIGURAR-FIREWALL.bat 2>nul
del /F /Q configurar-firewall.ps1 2>nul
del /F /Q CONFIGURAR-NGROK-TOKEN.bat 2>nul
del /F /Q CONFIGURAR-TOKEN-NGROK.md 2>nul
del /F /Q configurar-upnp.ps1 2>nul
del /F /Q EXCLUIR-SUPERADMIN.bat 2>nul
del /F /Q get-ngrok-urls.ps1 2>nul
del /F /Q guia-roteador.ps1 2>nul
del /F /Q INDICE.md 2>nul
del /F /Q INSTALACAO-RAPIDA.md 2>nul
del /F /Q INSTALACAO.md 2>nul
del /F /Q instalar-postgresql.bat 2>nul
del /F /Q INSTALAR_POSTGRESQL.md 2>nul
del /F /Q KEYBOARD_SHORTCUTS.md 2>nul
del /F /Q MANUAL.md 2>nul
del /F /Q MELHORIAS-IMPLEMENTADAS.md 2>nul
del /F /Q MELHORIAS-NOTA-1000.md 2>nul
del /F /Q MIGRACAO.md 2>nul
del /F /Q MULTI-TENANT.md 2>nul
del /F /Q NFE_IMPLEMENTATION.md 2>nul
del /F /Q NGROK-PRONTO.md 2>nul
del /F /Q NGROK-SETUP.md 2>nul
del /F /Q POSTGRESQL-INSTALACAO.md 2>nul
del /F /Q PRECOS-ATUALIZADOS.md 2>nul
del /F /Q PROFISSIONAL_STATUS.md 2>nul
del /F /Q REDIS_QUICKSTART.md 2>nul
del /F /Q REMOVER-DARK-MODE.bat 2>nul
del /F /Q ROADMAP_ENTERPRISE.md 2>nul
del /F /Q ROADMAP_INTERNACIONAL.md 2>nul
del /F /Q ROADMAP_PROFISSIONAL.md 2>nul
del /F /Q SCRIPTS.md 2>nul
del /F /Q SECURITY_SETUP.md 2>nul
del /F /Q SENTRY_SETUP.md 2>nul
del /F /Q setup-completo.ps1 2>nul
del /F /Q setup-multitenant.ps1 2>nul
del /F /Q setup-noip.ps1 2>nul
del /F /Q setup-postgres.ps1 2>nul
del /F /Q SITE-FUNCIONANDO.txt 2>nul
del /F /Q STATUS-FINAL.md 2>nul
del /F /Q STATUS-NOIP.md 2>nul
del /F /Q STATUS.md 2>nul
del /F /Q STATUS_MELHORIAS.md 2>nul
del /F /Q SUPER-ADMIN-GUIDE.md 2>nul
del /F /Q TESTE-LOGIN.html 2>nul
del /F /Q TESTE-LOGIN.md 2>nul
del /F /Q TESTS_SETUP.md 2>nul
del /F /Q VALORACAO.md 2>nul
del /F /Q VER-URLS-NGROK.bat 2>nul
del /F /Q ver-urls-ngrok.ps1 2>nul

REM Frontend - coverage e arquivos PWA
cd frontend
if exist coverage rmdir /S /Q coverage 2>nul
if exist src\components\PWAInstallPrompt.tsx del /F /Q src\components\PWAInstallPrompt.tsx 2>nul
if exist src\components\PWAUpdatePrompt.tsx del /F /Q src\components\PWAUpdatePrompt.tsx 2>nul
if exist src\contexts\ThemeContext.tsx del /F /Q src\contexts\ThemeContext.tsx 2>nul
if exist src\components\ThemeToggle.tsx del /F /Q src\components\ThemeToggle.tsx 2>nul
if exist icon.svg del /F /Q icon.svg 2>nul

REM Backend - coverage e arquivos de teste
cd ..\backend
if exist coverage rmdir /S /Q coverage 2>nul
if exist dist rmdir /S /Q dist 2>nul
del /F /Q CACHE_SETUP.md 2>nul
del /F /Q LOGGING_SETUP.md 2>nul
del /F /Q check-plans.ts 2>nul
del /F /Q check-superadmin.ts 2>nul
del /F /Q create-demo-tenant.mjs 2>nul
del /F /Q create-user.mjs 2>nul
del /F /Q delete-superadmin-db.mjs 2>nul
del /F /Q delete-superadmin.sql 2>nul
del /F /Q delete-superadmin.ts 2>nul
del /F /Q verify-superadmin.ts 2>nul

cd ..

echo.
echo ====================================
echo   LIMPEZA CONCLUIDA!
echo ====================================
echo.
pause
