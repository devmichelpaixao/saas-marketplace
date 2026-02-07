@echo off
chcp 65001 >nul
color 0E

echo ========================================
echo    CRIAR PLANOS PADRÃO
echo ========================================
echo.

cd /d %~dp0backend

echo [1/2] Compilando TypeScript...
npx ts-node prisma/seed-plans.ts

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    ✅ PLANOS CRIADOS COM SUCESSO!
    echo ========================================
    echo.
    echo Os seguintes planos foram criados:
    echo   - Gratuito (R$ 0,00/mês)
    echo   - Básico (R$ 49,90/mês)
    echo   - Profissional (R$ 149,90/mês)
    echo   - Enterprise (R$ 499,90/mês)
    echo   - Trial (R$ 0,00/mês - 14 dias)
    echo.
) else (
    echo.
    echo ========================================
    echo    ❌ ERRO AO CRIAR PLANOS
    echo ========================================
    echo.
)

pause
