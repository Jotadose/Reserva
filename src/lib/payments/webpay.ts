import type { CheckoutSessionInput, CheckoutSession, PaymentProvider } from './index'

// Placeholder integration with Transbank Webpay REST SDK
const COMMERCE_CODE = process.env.WEBPAY_COMMERCE_CODE
const API_KEY = process.env.WEBPAY_API_KEY

export const webpayProvider: PaymentProvider = {
  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSession> {
    if (!COMMERCE_CODE || !API_KEY) {
      throw new Error('WEBPAY_COMMERCE_CODE/API_KEY no configurados')
    }
    // En una implementación real, aquí se iniciaría la transacción con Webpay
    return {
      id: 'webpay_dummy',
      url: input.successUrl,
      provider: 'webpay',
    }
  },
}
