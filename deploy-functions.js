const fs = require("fs");
const https = require("https");

// Configuración de Supabase (usando las credenciales conocidas)
const SUPABASE_URL = "https://qvxwfkbcrunaebahpmft.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eHdma2JjcnVuYWViYWhwbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5OTAzNTAsImV4cCI6MjA1MDU2NjM1MH0.cYa6R8XdIEqmgm3FGKj3nQZY3gB6WbELKhXsYy6XO08";

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: sql,
    });

    const options = {
      hostname: "qvxwfkbcrunaebahpmft.supabase.co",
      port: 443,
      path: "/rest/v1/rpc/exec_sql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function deployFunctions() {
  try {
    console.log("🚀 Desplegando funciones RPC a Supabase...");

    // Leer el archivo de funciones
    const functionsSQL = fs.readFileSync("./api/functions.sql", "utf8");

    // Dividir en funciones individuales
    const functions = functionsSQL
      .split("CREATE OR REPLACE FUNCTION")
      .filter((f) => f.trim());

    for (let i = 0; i < functions.length; i++) {
      if (i === 0) continue; // Skip empty first element

      const functionSQL = "CREATE OR REPLACE FUNCTION" + functions[i];
      console.log(`📝 Ejecutando función ${i}...`);

      try {
        await executeSQL(functionSQL);
        console.log(`✅ Función ${i} ejecutada correctamente`);
      } catch (error) {
        console.error(`❌ Error en función ${i}:`, error.message);
      }
    }

    console.log("🎉 Proceso completado");
  } catch (error) {
    console.error("💥 Error general:", error);
  }
}

deployFunctions();
