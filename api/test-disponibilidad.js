/**
 * 🧪 TEST DISPONIBILIDAD - Endpoint específico para probar disponibilidad
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🧪 TEST DISPONIBILIDAD:', {
      method: req.method,
      url: req.url,
      query: req.query,
      timestamp: new Date().toISOString()
    });

    const { barberoId, serviceId, year, month } = req.query;

    return res.status(200).json({
      status: 'TEST OK',
      message: 'Test disponibilidad endpoint working!',
      receivedParams: {
        barberoId,
        serviceId, 
        year,
        month
      },
      fullQuery: req.query,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test disponibilidad error:', error);
    return res.status(500).json({
      error: 'Test disponibilidad failed',
      details: error.message
    });
  }
}
