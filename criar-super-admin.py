import psycopg2

print("Conectando ao banco de dados...")

try:
    # Conectar ao banco
    conn = psycopg2.connect(
        host="localhost",
        database="saas_marketplace",
        user="postgres",
        password="postgres"
    )

    cur = conn.cursor()

    # SQL para criar super admin
    sql = """
    INSERT INTO users (id, "tenantId", email, password, name, role, active, "createdAt", "updatedAt")
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
    )
    RETURNING id, email, role;
    """

    cur.execute(sql)
    result = cur.fetchone()
    conn.commit()
    
    print("\n" + "="*50)
    print("✅ SUPER ADMIN CRIADO COM SUCESSO!")
    print("="*50)
    print(f"\nID: {result[0]}")
    print(f"Email: {result[1]}")
    print(f"Role: {result[2]}")
    print(f"\nCREDENCIAIS DE ACESSO:")
    print("="*50)
    print("Email: superadmin@sistema.com")
    print("Senha: SuperAdmin@2024")
    print("URL: http://localhost:5175")
    print("="*50 + "\n")
    
except psycopg2.errors.UniqueViolation:
    print("\n⚠️ Super admin já existe no banco de dados!")
    conn.rollback()
except Exception as e:
    print(f"\n❌ Erro ao criar super admin: {e}")
    conn.rollback()
finally:
    if 'cur' in locals():
        cur.close()
    if 'conn' in locals():
        conn.close()
