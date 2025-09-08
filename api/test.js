/**
 * 🧪 TEST ENDPOINT - Prueba simple sin dependencias
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
    return res.status(200).json({
      status: 'OK',
      message: 'Test endpoint working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      query: req.query,
      url: req.url
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      error: 'Test endpoint failed',
      details: error.message
    });
  }
}
