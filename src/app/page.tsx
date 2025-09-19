export default function HomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#1e40af', marginBottom: '1rem' }}>Agendex - Sistema de Reservas</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Plataforma SaaS para gestión de reservas y citas en barberías
      </p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Estado del Sistema:</h2>
        <ul>
          <li>✅ Aplicación desplegada correctamente</li>
          <li>✅ Build exitoso</li>
          <li>✅ Rutas configuradas</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Enlaces de Prueba:</h2>
        <p><a href="/login" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Iniciar Sesión</a></p>
        <p><a href="/register" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Registrarse</a></p>
        <p><a href="/demo/services" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Demo - Servicios</a></p>
        <p><a href="/demo/test-booking" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Demo - Crear Reserva</a></p>
      </div>
      
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '1rem', 
        borderRadius: '8px',
        marginTop: '2rem'
      }}>
        <p><strong>Desarrollo:</strong> Sistema listo para producción</p>
        <p><strong>Objetivo:</strong> 100 barberías para octubre 1st</p>
        <p><strong>Estado:</strong> MVP funcional</p>
      </div>
    </div>
  )
}
