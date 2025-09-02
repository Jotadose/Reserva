#!/usr/bin/env node

/**
 * ===================================================================
 * VERIFICADOR POST-DEPLOY DEL MONOREPO
 * ===================================================================
 */

const https = require("https");

const BASE_URL = "https://reserva-mpcta07ok-jotadoses-projects.vercel.app";

console.log("🚀 VERIFICANDO DEPLOY DEL MONOREPO...\n");

async function checkUrl(url, description) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        const status = res.statusCode;
        const success = status >= 200 && status < 400;
        console.log(`${success ? "✅" : "❌"} ${description}: ${status}`);
        resolve(success);
      })
      .on("error", (err) => {
        console.log(`❌ ${description}: Error - ${err.message}`);
        resolve(false);
      });
  });
}

async function runChecks() {
  console.log("📊 VERIFICANDO ENDPOINTS:\n");

  const checks = [
    [`${BASE_URL}/`, "Frontend (Landing Page)"],
    [`${BASE_URL}/manifest.json`, "PWA Manifest"],
    [`${BASE_URL}/api/health`, "API Health Check"],
    [`${BASE_URL}/api/usuarios`, "API Usuarios Endpoint"],
    [`${BASE_URL}/api/servicios`, "API Servicios Endpoint"],
    [`${BASE_URL}/api/reservas`, "API Reservas Endpoint"],
    [`${BASE_URL}/api/disponibilidad`, "API Disponibilidad Endpoint"],
  ];

  let passed = 0;
  let total = checks.length;

  for (const [url, description] of checks) {
    const success = await checkUrl(url, description);
    if (success) passed++;
    await new Promise((resolve) => setTimeout(resolve, 500)); // Pausa entre requests
  }

  console.log(`\n📈 RESULTADOS: ${passed}/${total} endpoints funcionando`);

  if (passed === total) {
    console.log("\n🎉 ¡DEPLOY EXITOSO! Todos los endpoints están funcionando");
    console.log(`\n🌐 Tu aplicación está disponible en: ${BASE_URL}`);
    console.log("\n🔧 Para probar:");
    console.log("1. Abre la URL en tu navegador");
    console.log("2. Prueba crear una reserva");
    console.log("3. Accede al panel de admin");
    console.log("4. Verifica que las notificaciones funcionen");
  } else {
    console.log(
      "\n⚠️  Algunos endpoints tienen problemas. Revisa los logs de Vercel."
    );
  }

  console.log("\n📋 PRÓXIMOS PASOS:");
  console.log("• Configurar variables de entorno en Vercel Dashboard");
  console.log("• Probar todas las funcionalidades");
  console.log("• Verificar conexión a Supabase en producción");
}

runChecks().catch(console.error);
