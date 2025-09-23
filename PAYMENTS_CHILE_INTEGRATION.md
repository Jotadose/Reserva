# 💳 **INTEGRACIÓN DE PAGOS CHILE - MERCADO PAGO + WEBPAY**

## 🚀 **Configuración para Mercado Pago Chile**

### **1. Variables de Entorno**
```bash
# Mercado Pago Chile
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxx-xxxxxx-xxxxxx
MERCADOPAGO_SECRET_KEY=APP_USR-xxxxxxxxx-xxxxxx-xxxxxx
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret

# WebPay Plus (Transbank)
WEBPAY_COMMERCE_CODE=597055555532
WEBPAY_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
WEBPAY_ENVIRONMENT=integration # production para live

# URLs de retorno
NEXT_PUBLIC_APP_URL=https://agendex.studio
```

### **2. Implementación MercadoPago**
```typescript
// lib/payments/mercadopago.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_SECRET_KEY!,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc123',
  }
});

export async function createSubscription(tenantId: string, plan: string) {
  const preference = new Preference(client);

  const planPrices = {
    basic: 0, // Gratis
    pro: 29990, // $29.990 CLP mensual
    enterprise: 79990 // $79.990 CLP mensual
  };

  return await preference.create({
    body: {
      items: [
        {
          title: `Agendex Plan ${plan.toUpperCase()}`,
          quantity: 1,
          unit_price: planPrices[plan as keyof typeof planPrices],
          currency_id: 'CLP'
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/${tenantId}/dashboard?payment=success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/${tenantId}/dashboard?payment=failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/${tenantId}/dashboard?payment=pending`
      },
      auto_return: 'approved',
      external_reference: `tenant_${tenantId}_${plan}`,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`
    }
  });
}
```

### **3. Implementación WebPay Plus**
```typescript
// lib/payments/webpay.ts
import { WebpayPlus } from 'transbank-sdk';

const tx = new WebpayPlus.Transaction();

export async function createWebPayTransaction(tenantId: string, amount: number) {
  const buyOrder = `agendex_${tenantId}_${Date.now()}`;
  const sessionId = `session_${tenantId}`;
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/webpay/return`;

  return await tx.create(buyOrder, sessionId, amount, returnUrl);
}
```

## 🔗 **Webhooks para Actualización Automática**

### **API Route para MercadoPago**
```typescript
// app/api/webhooks/mercadopago/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  if (body.type === 'payment') {
    const payment = await mercadopago.payment.findById(body.data.id);
    
    if (payment.status === 'approved') {
      // Actualizar subscription_status en Supabase
      await supabase
        .from('tenants')
        .update({ 
          subscription_status: 'active',
          subscription_plan: extractPlanFromReference(payment.external_reference)
        })
        .eq('id', extractTenantIdFromReference(payment.external_reference));
    }
  }
  
  return Response.json({ received: true });
}
```

## 📋 **Plan de Implementación**

### **Fase 1: MVP (Solo Plan Básico Gratis)**
- ✅ Sin pagos requeridos
- ✅ Registro directo 
- ✅ Todas las funcionalidades básicas

### **Fase 2: Monetización (Enero 2026)**
- 🔄 MercadoPago para planes pagos
- 🔄 WebPay como alternativa
- 🔄 Upgrade/downgrade automático

### **Fase 3: Escalamiento**
- 🔄 Facturación automática
- 🔄 Reportes de pagos
- 🔄 Descuentos y promociones