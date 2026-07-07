-- Esquema MSSQL para GRC Assessment (TIBOX)
-- Persiste el perfil del cliente y sus respuestas; el banco de preguntas vive en el frontend (contenido estático).

IF OBJECT_ID('dbo.Resultados', 'U') IS NOT NULL DROP TABLE dbo.Resultados;
IF OBJECT_ID('dbo.Respuestas', 'U') IS NOT NULL DROP TABLE dbo.Respuestas;
IF OBJECT_ID('dbo.Evaluaciones', 'U') IS NOT NULL DROP TABLE dbo.Evaluaciones;
IF OBJECT_ID('dbo.Clientes', 'U') IS NOT NULL DROP TABLE dbo.Clientes;

CREATE TABLE dbo.Clientes (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    RazonSocial     NVARCHAR(150)   NOT NULL,
    Industria       NVARCHAR(50)    NOT NULL,
    Usuarios        INT             NOT NULL,
    Anci            NVARCHAR(20)    NOT NULL DEFAULT 'general',
    Infraestructura NVARCHAR(20)    NOT NULL DEFAULT 'onpremise',
    EcosistemaMs    NVARCHAR(10)    NOT NULL DEFAULT 'no',
    Gestion         NVARCHAR(20)    NOT NULL DEFAULT 'nadie',
    Incidentes      NVARCHAR(10)    NOT NULL DEFAULT 'no',
    ContactoNombre  NVARCHAR(100)   NULL,
    ContactoCargo   NVARCHAR(100)   NULL,
    ContactoEmail   NVARCHAR(150)   NULL,
    ContactoTelefono NVARCHAR(30)   NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.Evaluaciones (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    ClienteId           INT             NOT NULL REFERENCES dbo.Clientes(Id),
    Modulo              NVARCHAR(10)    NOT NULL,
    DatosSensibles      NVARCHAR(10)    NULL,
    DecisionesAuto      NVARCHAR(10)    NULL,
    Transferencia       NVARCHAR(10)    NULL,
    FechaInicio         DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    Completada          BIT             NOT NULL DEFAULT 0
);

CREATE TABLE dbo.Respuestas (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    EvaluacionId    INT             NOT NULL REFERENCES dbo.Evaluaciones(Id),
    PreguntaId      NVARCHAR(20)    NOT NULL,
    Nivel           INT             NOT NULL,
    FechaRespuesta  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Respuestas_Evaluacion_Pregunta UNIQUE (EvaluacionId, PreguntaId)
);

CREATE TABLE dbo.Resultados (
    Id                          INT IDENTITY(1,1) PRIMARY KEY,
    EvaluacionId                INT             NOT NULL UNIQUE REFERENCES dbo.Evaluaciones(Id),
    PuntajeGlobal               INT             NOT NULL,
    Nivel                       NVARCHAR(30)    NOT NULL,
    InventarioScore             INT             NULL,
    AccesoIdentidadScore        INT             NULL,
    DatosPersonalesScore        INT             NULL,
    SeguridadPerimetralScore    INT             NULL,
    RespaldosScore              INT             NULL,
    MonitoreoScore              INT             NULL,
    ProveedoresScore            INT             NULL,
    AreaDebilUno                NVARCHAR(100)   NULL,
    AreaDebilDos                NVARCHAR(100)   NULL,
    AreaDebilTres               NVARCHAR(100)   NULL,
    ResumenEjecutivo            NVARCHAR(MAX)   NULL,
    FechaCalculo                DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    FechaActualizacion          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

PRINT 'Esquema GRC_Assessment creado correctamente';
