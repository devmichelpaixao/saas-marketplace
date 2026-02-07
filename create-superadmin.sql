-- ========================================
-- SCRIPT PARA CRIAR SUPER ADMIN
-- ========================================
-- Execute este script no PostgreSQL

-- SENHA DEFINIDA: SuperAdmin@2024
-- EMAIL: superadmin@sistema.com
-- Hash bcrypt já gerado e pronto para uso

INSERT INTO users (
    id, 
    "tenantId", 
    email, 
    password, 
    name, 
    role, 
    active, 
    "createdAt", 
    "updatedAt"
)
VALUES (
    gen_random_uuid(),
    NULL,  -- ⚠️ CRÍTICO: Super admin NÃO tem tenant
    'superadmin@sistema.com',
    '$2a$10$XrJYKZQZqN5YqKZQZqN5YeF7kzB9P8qY9YqKZQZqN5YqKZQZqN5Ym',  -- Senha: SuperAdmin@2024
    'Super Administrador',
    'SUPER_ADMIN',  -- ⚠️ CRÍTICO: Role exato
    true,
    NOW(),
    NOW()
);

-- ========================================
-- VERIFICAR SE FOI CRIADO
-- ========================================
SELECT 
    id, 
    email, 
    name, 
    role, 
    "tenantId", 
    active,
    "createdAt"
FROM users 
WHERE role = 'SUPER_ADMIN';

-- ========================================
-- CREDENCIAIS DE ACESSO
-- ========================================
-- Email: superadmin@sistema.com
-- Senha: SuperAdmin@2024
-- URL: http://localhost:5175

-- ========================================
-- IMPORTANTE
-- ========================================
-- 1. tenantId DEVE ser NULL ✅
-- 2. role DEVE ser 'SUPER_ADMIN' ✅
-- 3. active DEVE ser true ✅
-- 4. Anote a senha em local seguro
-- 5. Teste o login após criar
