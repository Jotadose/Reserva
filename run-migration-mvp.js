const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Configuración de conexión a Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log("🚀 Iniciando migración completa a esquema MVP...\n");

    // Leer el archivo de migración
    const migrationPath = path.join(
      __dirname,
      "database",
      "migration-mvp-complete.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Ejecutar la migración
    console.log("📋 Ejecutando migración...");
    await client.query(migrationSQL);

    console.log("✅ Migración completada exitosamente!\n");

    // Verificar el estado final
    console.log("📊 Verificando estado final:");

    const usuarios = await client.query("SELECT COUNT(*) FROM usuarios");
    const barberos = await client.query(
      "SELECT COUNT(*) FROM barberos WHERE activo = true"
    );
    const servicios = await client.query(
      "SELECT COUNT(*) FROM servicios WHERE activo = true"
    );
    const reservas = await client.query("SELECT COUNT(*) FROM reservas");

    console.log(`👥 Usuarios creados: ${usuarios.rows[0].count}`);
    console.log(`💇 Barberos activos: ${barberos.rows[0].count}`);
    console.log(`🔧 Servicios disponibles: ${servicios.rows[0].count}`);
    console.log(`📅 Reservas de ejemplo: ${reservas.rows[0].count}`);

    // Mostrar barberos creados
    const barberosInfo = await client.query(`
      SELECT u.nombre, u.email, b.especialidades, b.horario_inicio, b.horario_fin 
      FROM usuarios u 
      JOIN barberos b ON u.id_usuario = b.id_barbero 
      WHERE u.rol = 'barbero'
    `);

    console.log("\n💇 Barberos configurados:");
    barberosInfo.rows.forEach((barbero) => {
      console.log(
        `  • ${barbero.nombre} (${barbero.horario_inicio} - ${barbero.horario_fin})`
      );
      console.log(`    Especialidades: ${barbero.especialidades.join(", ")}`);
    });

    // Mostrar servicios creados
    const serviciosInfo = await client.query(`
      SELECT nombre, precio/100 as precio_pesos, duracion, categoria 
      FROM servicios 
      WHERE activo = true 
      ORDER BY categoria, precio
    `);

    console.log("\n🔧 Servicios disponibles:");
    serviciosInfo.rows.forEach((servicio) => {
      console.log(
        `  • ${servicio.nombre} - $${servicio.precio_pesos.toLocaleString()} (${
          servicio.duracion
        } min)`
      );
    });

    console.log("\n🎯 ¡MVP base implementado exitosamente!");
    console.log("📋 Próximos pasos:");
    console.log("  1. Actualizar API endpoints para usar nuevas tablas");
    console.log("  2. Actualizar hooks del frontend");
    console.log("  3. Implementar sistema de autenticación");
    console.log("  4. Crear interfaces de barbero y admin");
  } catch (error) {
    console.error("❌ Error durante la migración:", error.message);
    console.error("📋 Detalles del error:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };
