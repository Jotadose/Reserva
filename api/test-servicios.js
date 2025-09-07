/**
 * Endpoint de prueba para servicios - debugging
 */

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Intentar importar Supabase
    const { createClient } = await import("@supabase/supabase-js");
    
    const supabaseUrl = "https://qvxwfkbcrunaebahpmft.supabase.co";
    const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eHdma2JjcnVuYWViYWhwbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU3NTIyMzksImV4cCI6MjA0MTMyODIzOX0.zxJt3UG7F10S9IYSm74ysF1LSkTF6GvlF9Yp9tHvR6Q";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Probar consulta simple
    const { data, error, count } = await supabase
      .from('servicios')
      .select('*', { count: 'exact' });

    if (error) {
      return res.status(400).json({ 
        error: 'Database error',
        message: error.message,
        details: error
      });
    }

    res.status(200).json({
      success: true,
      debug: {
        supabaseUrl,
        hasKey: !!supabaseKey,
        keyLength: supabaseKey?.length || 0
      },
      data: data || [],
      count: count || data?.length || 0
    });

  } catch (error) {
    console.error('Test Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack
    });
  }
}
