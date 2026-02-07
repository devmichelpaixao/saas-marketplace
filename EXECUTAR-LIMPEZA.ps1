# Script de limpeza do projeto
Set-Location C:\Saass

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  LIMPANDO PROJETO..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$removidos = 0
$naoEncontrados = 0

# Arquivos para remover
$arquivos = @(
    "ABRIR-NOIP.bat",
    "ANTES_VS_DEPOIS.md",
    "CICD_SETUP.md",
    "COMO-LOGAR.md",
    "COMO-USAR-NGROK.md",
    "CONFIGURACAO-NOIP-COMPLETO.md",
    "CONFIGURACAO-NOIP.md",
    "CONFIGURAR-FIREWALL.bat",
    "configurar-firewall.ps1",
    "CONFIGURAR-NGROK-TOKEN.bat",
    "CONFIGURAR-TOKEN-NGROK.md",
    "configurar-upnp.ps1",
    "EXCLUIR-SUPERADMIN.bat",
    "get-ngrok-urls.ps1",
    "guia-roteador.ps1",
    "INDICE.md",
    "INSTALACAO-RAPIDA.md",
    "INSTALACAO.md",
    "instalar-postgresql.bat",
    "INSTALAR_POSTGRESQL.md",
    "KEYBOARD_SHORTCUTS.md",
    "MANUAL.md",
    "MELHORIAS-IMPLEMENTADAS.md",
    "MELHORIAS-NOTA-1000.md",
    "MIGRACAO.md",
    "MULTI-TENANT.md",
    "NFE_IMPLEMENTATION.md",
    "NGROK-PRONTO.md",
    "NGROK-SETUP.md",
    "POSTGRESQL-INSTALACAO.md",
    "PRECOS-ATUALIZADOS.md",
    "PROFISSIONAL_STATUS.md",
    "REDIS_QUICKSTART.md",
    "REMOVER-DARK-MODE.bat",
    "ROADMAP_ENTERPRISE.md",
    "ROADMAP_INTERNACIONAL.md",
    "ROADMAP_PROFISSIONAL.md",
    "SCRIPTS.md",
    "SECURITY_SETUP.md",
    "SENTRY_SETUP.md",
    "setup-completo.ps1",
    "setup-multitenant.ps1",
    "setup-noip.ps1",
    "setup-postgres.ps1",
    "SITE-FUNCIONANDO.txt",
    "STATUS-FINAL.md",
    "STATUS-NOIP.md",
    "STATUS.md",
    "STATUS_MELHORIAS.md",
    "SUPER-ADMIN-GUIDE.md",
    "TESTE-LOGIN.html",
    "TESTE-LOGIN.md",
    "TESTS_SETUP.md",
    "VALORACAO.md",
    "VER-URLS-NGROK.bat",
    "ver-urls-ngrok.ps1"
)

foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        Remove-Item $arquivo -Force
        Write-Host "  X $arquivo" -ForegroundColor Red
        $removidos++
    } else {
        $naoEncontrados++
    }
}

# Limpar frontend
Write-Host ""
Write-Host "Limpando frontend..." -ForegroundColor Yellow

if (Test-Path "frontend\coverage") {
    Remove-Item "frontend\coverage" -Recurse -Force
    Write-Host "  X frontend\coverage" -ForegroundColor Red
    $removidos++
}

if (Test-Path "frontend\src\components\PWAInstallPrompt.tsx") {
    Remove-Item "frontend\src\components\PWAInstallPrompt.tsx" -Force
    Write-Host "  X frontend\src\components\PWAInstallPrompt.tsx" -ForegroundColor Red
    $removidos++
}

if (Test-Path "frontend\src\components\PWAUpdatePrompt.tsx") {
    Remove-Item "frontend\src\components\PWAUpdatePrompt.tsx" -Force
    Write-Host "  X frontend\src\components\PWAUpdatePrompt.tsx" -ForegroundColor Red
    $removidos++
}

if (Test-Path "frontend\src\contexts\ThemeContext.tsx") {
    Remove-Item "frontend\src\contexts\ThemeContext.tsx" -Force
    Write-Host "  X frontend\src\contexts\ThemeContext.tsx" -ForegroundColor Red
    $removidos++
}

if (Test-Path "frontend\src\components\ThemeToggle.tsx") {
    Remove-Item "frontend\src\components\ThemeToggle.tsx" -Force
    Write-Host "  X frontend\src\components\ThemeToggle.tsx" -ForegroundColor Red
    $removidos++
}

if (Test-Path "frontend\icon.svg") {
    Remove-Item "frontend\icon.svg" -Force
    Write-Host "  X frontend\icon.svg" -ForegroundColor Red
    $removidos++
}

# Limpar backend
Write-Host ""
Write-Host "Limpando backend..." -ForegroundColor Yellow

if (Test-Path "backend\coverage") {
    Remove-Item "backend\coverage" -Recurse -Force
    Write-Host "  X backend\coverage" -ForegroundColor Red
    $removidos++
}

if (Test-Path "backend\dist") {
    Remove-Item "backend\dist" -Recurse -Force
    Write-Host "  X backend\dist" -ForegroundColor Red
    $removidos++
}

$backendArquivos = @(
    "backend\CACHE_SETUP.md",
    "backend\LOGGING_SETUP.md",
    "backend\check-plans.ts",
    "backend\check-superadmin.ts",
    "backend\create-demo-tenant.mjs",
    "backend\create-user.mjs",
    "backend\delete-superadmin-db.mjs",
    "backend\delete-superadmin.sql",
    "backend\delete-superadmin.ts",
    "backend\verify-superadmin.ts"
)

foreach ($arquivo in $backendArquivos) {
    if (Test-Path $arquivo) {
        Remove-Item $arquivo -Force
        Write-Host "  X $arquivo" -ForegroundColor Red
        $removidos++
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  LIMPEZA CONCLUIDA!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos removidos: $removidos" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
