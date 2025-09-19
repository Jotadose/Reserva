import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Interfaces para los tipos de datos
interface BookingEvent {
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder'
  booking: {
    id: string
    client_name: string
    client_phone: string
    service_name: string
    provider_name: string
    scheduled_date: string
    scheduled_time: string
    tenant_name: string
  }
}

interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  recipient_type: 'individual'
  to: string
  type: 'template'
  template: {
    name: string
    language: {
      code: string
    }
    components: Array<{
      type: 'body'
      parameters: Array<{
        type: 'text'
        text: string
      }>
    }>
  }
}

// Función para generar el mensaje según el tipo de evento
function generateWhatsAppMessage(event: BookingEvent): WhatsAppMessage {
  const { booking, type } = event
  
  let templateName = ''
  let parameters: string[] = []
  
  switch (type) {
    case 'booking_confirmed':
      templateName = 'booking_confirmation'
      parameters = [
        booking.client_name,
        booking.service_name,
        booking.scheduled_date,
        booking.scheduled_time,
        booking.provider_name,
        booking.tenant_name
      ]
      break
      
    case 'booking_reminder':
      templateName = 'booking_reminder'
      parameters = [
        booking.client_name,
        booking.service_name,
        booking.scheduled_date,
        booking.scheduled_time,
        booking.tenant_name
      ]
      break
      
    case 'booking_cancelled':
      templateName = 'booking_cancellation'
      parameters = [
        booking.client_name,
        booking.service_name,
        booking.scheduled_date,
        booking.scheduled_time,
        booking.tenant_name
      ]
      break
      
    default:
      throw new Error(`Unsupported event type: ${type}`)
  }
  
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: booking.client_phone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'es'
      },
      components: [
        {
          type: 'body',
          parameters: parameters.map(text => ({
            type: 'text',
            text
          }))
        }
      ]
    }
  }
}

// Función mockada para enviar a WhatsApp (reemplazar con API real)
async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<any> {
  // En desarrollo, solo loguear el mensaje
  if (process.env.NODE_ENV === 'development') {
    console.log('📱 WhatsApp Message (MOCK):', JSON.stringify(message, null, 2))
    return {
      success: true,
      message_id: `mock_${Date.now()}`,
      status: 'sent'
    }
  }
  
  // En producción, enviar a la API real de WhatsApp
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  
  if (!whatsappToken || !phoneNumberId) {
    throw new Error('WhatsApp credentials not configured')
  }
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      }
    )
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const contentType = headersList.get('content-type')
    
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }
    
    const body: BookingEvent = await request.json()
    
    // Validar estructura del evento
    if (!body.type || !body.booking) {
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      )
    }
    
    // Validar que el teléfono esté presente
    if (!body.booking.client_phone) {
      return NextResponse.json(
        { error: 'Client phone number is required' },
        { status: 400 }
      )
    }
    
    // Generar el mensaje de WhatsApp
    const whatsappMessage = generateWhatsAppMessage(body)
    
    // Enviar el mensaje
    const result = await sendWhatsAppMessage(whatsappMessage)
    
    // Log del evento para auditoría
    console.log(`WhatsApp notification sent for booking ${body.booking.id}:`, {
      type: body.type,
      recipient: body.booking.client_phone,
      message_id: result.message_id,
      status: result.status
    })
    
    return NextResponse.json({
      success: true,
      message_id: result.message_id,
      status: result.status,
      event_type: body.type,
      booking_id: body.booking.id
    })
    
  } catch (error) {
    console.error('WhatsApp notification error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send WhatsApp notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Endpoint GET para verificar el estado del servicio
export async function GET() {
  const isConfigured = !!(
    process.env.WHATSAPP_ACCESS_TOKEN && 
    process.env.WHATSAPP_PHONE_NUMBER_ID
  )
  
  return NextResponse.json({
    service: 'WhatsApp Notifications',
    status: 'operational',
    configured: isConfigured,
    environment: process.env.NODE_ENV,
    supported_events: [
      'booking_confirmed',
      'booking_cancelled', 
      'booking_reminder'
    ]
  })
}