/**
 * ===================================================================
 * API INTERMEDIA - HEALTH CHECK
 * ===================================================================
 *
 * Endpoint simple para verificar que la API está funcionando
 * Arquitectura: FRONT → API INTERMEDIA → DB SUPABASE
 */

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "Barberia API Intermedia",
        architecture: "FRONT → API → SUPABASE",
        endpoints: {
          health: "/api/health",
          reservas: "/api/reservas",
          servicios: "/api/servicios",
          barberos: "/api/barberos",
          clientes: "/api/clientes",
        },
      };

      res.status(200).json(health);
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
