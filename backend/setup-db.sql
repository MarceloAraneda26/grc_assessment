-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'GRC_Assessment')
BEGIN
    CREATE DATABASE GRC_Assessment;
    PRINT 'Base de datos GRC_Assessment creada';
END
GO

-- Agregar login de Windows si no existe
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'CORP\maraneda')
BEGIN
    CREATE LOGIN [CORP\maraneda] FROM WINDOWS;
    PRINT 'Login CORP\maraneda creado';
END

-- Usar la base de datos
USE GRC_Assessment;

-- Crear usuario si no existe
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'CORP\maraneda')
BEGIN
    CREATE USER [CORP\maraneda] FOR LOGIN [CORP\maraneda];
    PRINT 'Usuario CORP\maraneda creado';
END

-- Otorgar permisos
ALTER ROLE db_owner ADD MEMBER [CORP\maraneda];
PRINT 'Permisos asignados';

-- Crear tablas
CREATE TABLE Clientes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    RazonSocial NVARCHAR(255) NOT NULL,
    Industria NVARCHAR(100),
    Usuarios INT,
    Anci NVARCHAR(MAX),
    Infraestructura NVARCHAR(MAX),
    EcosistemaMs NVARCHAR(MAX),
    Gestion NVARCHAR(MAX),
    Incidentes NVARCHAR(MAX),
    ContactoNombre NVARCHAR(255),
    ContactoCargo NVARCHAR(255),
    ContactoEmail NVARCHAR(255),
    ContactoTelefono NVARCHAR(20),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Evaluaciones (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ClienteId INT NOT NULL FOREIGN KEY REFERENCES Clientes(Id),
    Modulo NVARCHAR(50),
    DatosSensibles BIT,
    DecisionesAuto BIT,
    Transferencia BIT,
    FechaInicio DATETIME DEFAULT GETDATE(),
    FechaActualizacion DATETIME DEFAULT GETDATE(),
    Completada BIT DEFAULT 0
);

CREATE TABLE Respuestas (
    Id INT PRIMARY KEY IDENTITY(1,1),
    EvaluacionId INT NOT NULL FOREIGN KEY REFERENCES Evaluaciones(Id),
    PreguntaId NVARCHAR(50) NOT NULL,
    Nivel INT,
    FechaRespuesta DATETIME DEFAULT GETDATE(),
    UNIQUE(EvaluacionId, PreguntaId)
);

PRINT 'Tablas creadas exitosamente';
