import type { CheckoutSessionInput, CheckoutSession, PaymentProvider } from './index'

// Placeholder integration with Mercado Pago SDK
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN

export const mercadoPagoProvider: PaymentProvider = {
  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSession> {
    if (!ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado')
    }
    // En una implementación real, aquí se llamaría a la API de Preferencias de Mercado Pago
    // Por ahora, devolvemos una URL de éxito de prueba
    return {
      id: 'mp_dummy',
      url: input.successUrl,
      provider: 'mercadopago',
    }
  },
}
