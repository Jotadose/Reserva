export type Currency = 'CLP'

export interface CheckoutSessionInput {
  amount: number
  currency: Currency
  tenantId: string
  customerEmail?: string
  description?: string
  metadata?: Record<string, any>
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSession {
  id: string
  url: string
  provider: 'mercadopago' | 'webpay'
}

export interface PaymentProvider {
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSession>
}
