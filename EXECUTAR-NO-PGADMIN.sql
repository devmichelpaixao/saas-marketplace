-- COPIE E EXECUTE ESTE SQL NO PGADMIN

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
    NULL,
    'superadmin@sistema.com',
    '$2a$10$XrJYKZQZqN5YqKZQZqN5YeF7kzB9P8qY9YqKZQZqN5YqKZQZqN5Ym',
    'Super Administrador',
    'SUPER_ADMIN',
    true,
    NOW(),
    NOW()
);

-- VERIFICAR SE CRIOU:
SELECT id, email, name, role, "tenantId", active FROM users WHERE role = 'SUPER_ADMIN';

-- CREDENCIAIS:
-- Email: superadmin@sistema.com
-- Senha: SuperAdmin@2024
