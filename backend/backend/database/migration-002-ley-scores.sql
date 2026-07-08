-- Migración aditiva (no destructiva): agrega las columnas de la doble
-- métrica del cuestionario unificado Eje 1 (Ley 21.663 + Ley 21.719) a
-- dbo.Resultados. No toca filas existentes; las columnas quedan NULL para
-- evaluaciones de otros módulos (cyber/ti) y para resultados calculados
-- antes de esta migración.
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Resultados') AND name = 'Ley663Score')
BEGIN
    ALTER TABLE dbo.Resultados ADD
        Ley663Score          INT NULL,
        Ley719Score          INT NULL,
        CumplimientoGlobal   INT NULL,
        Cumplimiento663      INT NULL,
        Cumplimiento719      INT NULL,
        BrechasGlobal        INT NULL;
    PRINT 'Migración 002 aplicada: columnas de score por ley agregadas a dbo.Resultados';
END
ELSE
BEGIN
    PRINT 'Migración 002 ya estaba aplicada (columnas ya existen), sin cambios';
END
