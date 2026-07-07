import { getConnection } from "./backend/database/connection.js";

console.log("🔍 Probando conexión a la base de datos...\n");

try {
  const pool = await getConnection();

  console.log("✓ Conexión establecida\n");

  // Verificar que las tablas existen
  const result = await pool.request().query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo'
    ORDER BY TABLE_NAME
  `);

  console.log("📊 Tablas en GRC_Assessment:");
  result.recordset.forEach(t => {
    console.log(`   ✓ ${t.TABLE_NAME}`);
  });

  // Contar registros en cada tabla
  const clientesCount = await pool.request().query("SELECT COUNT(*) as cnt FROM Clientes");
  const evaluacionesCount = await pool.request().query("SELECT COUNT(*) as cnt FROM Evaluaciones");
  const respuestasCount = await pool.request().query("SELECT COUNT(*) as cnt FROM Respuestas");

  console.log("\n📈 Registros:");
  console.log(`   Clientes: ${clientesCount.recordset[0].cnt}`);
  console.log(`   Evaluaciones: ${evaluacionesCount.recordset[0].cnt}`);
  console.log(`   Respuestas: ${respuestasCount.recordset[0].cnt}`);

  console.log("\n✅ Base de datos lista para usar\n");
  process.exit(0);
} catch (error) {
  console.error("✗ Error:", error.message);
  process.exit(1);
}
