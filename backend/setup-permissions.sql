-- Agregar login de Windows si no existe
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'CORP\maraneda')
BEGIN
    CREATE LOGIN [CORP\maraneda] FROM WINDOWS;
END

-- Usar la base de datos GRC_Assessment
USE GRC_Assessment;

-- Crear usuario si no existe
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'CORP\maraneda')
BEGIN
    CREATE USER [CORP\maraneda] FOR LOGIN [CORP\maraneda];
END

-- Otorgar permisos
ALTER ROLE db_owner ADD MEMBER [CORP\maraneda];

PRINT 'Permisos configurados exitosamente para CORP\maraneda';
