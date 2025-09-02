import { useState, useCallback } from "react";

interface PaymentMethod {
  id: string;
  type: "card" | "bank_transfer" | "cash" | "digital_wallet";
  name: string;
  isActive: boolean;
  processingFee: number; // Porcentaje
  config: Record<string, any>;
}

interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  externalId?: string;
  metadata?: Record<string, any>;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  clientSecret?: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "succeeded"
    | "canceled";
}

interface RefundRequest {
  transactionId: string;
  amount?: number; // Si no se especifica, es reembolso completo
  reason: string;
  metadata?: Record<string, any>;
}

export const usePayments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Métodos de pago disponibles (mock)
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: "card",
      type: "card",
      name: "Tarjeta de Crédito/Débito",
      isActive: true,
      processingFee: 3.5,
      config: {
        acceptedCards: ["visa", "mastercard", "amex"],
        currencies: ["COP", "USD"],
      },
    },
    {
      id: "bank_transfer",
      type: "bank_transfer",
      name: "Transferencia Bancaria",
      isActive: true,
      processingFee: 1.0,
      config: {
        banks: ["bancolombia", "davivienda", "bbva"],
        processingDays: 1,
      },
    },
    {
      id: "cash",
      type: "cash",
      name: "Efectivo",
      isActive: true,
      processingFee: 0,
      config: {},
    },
    {
      id: "nequi",
      type: "digital_wallet",
      name: "Nequi",
      isActive: true,
      processingFee: 2.0,
      config: {
        maxAmount: 2000000,
      },
    },
  ]);

  // Crear intención de pago
  const createPaymentIntent = useCallback(
    async (
      amount: number,
      description: string,
      currency: string = "COP",
      metadata?: Record<string, any>,
    ): Promise<PaymentIntent> => {
      setIsLoading(true);

      try {
        // Simular llamada a API de pagos
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const paymentIntent: PaymentIntent = {
          id: `pi_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          amount,
          currency,
          description,
          metadata,
          clientSecret: `pi_client_secret_${Math.random().toString(36).substring(2, 22)}`,
          status: "requires_payment_method",
        };

        return paymentIntent;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Procesar pago
  const processPayment = useCallback(
    async (
      paymentIntentId: string,
      paymentMethodId: string,
      bookingId: string,
    ): Promise<Transaction> => {
      setIsLoading(true);

      try {
        // Simular procesamiento de pago
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const isSuccess = Math.random() > 0.1; // 90% de éxito

        const transaction: Transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          bookingId,
          amount: Math.floor(Math.random() * 200000) + 50000, // Entre 50k y 250k COP
          currency: "COP",
          method: paymentMethodId,
          status: isSuccess ? "completed" : "failed",
          createdAt: new Date().toISOString(),
          completedAt: isSuccess ? new Date().toISOString() : undefined,
          failureReason: !isSuccess ? "Fondos insuficientes" : undefined,
          externalId: `ext_${Math.random().toString(36).substring(2, 14)}`,
          metadata: {
            paymentIntentId,
            userAgent: navigator.userAgent,
          },
        };

        setTransactions((prev) => [transaction, ...prev]);

        return transaction;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Reembolsar pago
  const refundPayment = useCallback(
    async (refundRequest: RefundRequest): Promise<Transaction> => {
      setIsLoading(true);

      try {
        const originalTransaction = transactions.find((t) => t.id === refundRequest.transactionId);
        if (!originalTransaction) {
          throw new Error("Transacción no encontrada");
        }

        if (originalTransaction.status !== "completed") {
          throw new Error("Solo se pueden reembolsar transacciones completadas");
        }

        // Simular procesamiento de reembolso
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const refundAmount = refundRequest.amount || originalTransaction.amount;

        if (refundAmount > originalTransaction.amount) {
          throw new Error("El monto del reembolso no puede ser mayor al monto original");
        }

        const refundTransaction: Transaction = {
          id: `rfnd_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          bookingId: originalTransaction.bookingId,
          amount: -refundAmount, // Monto negativo para reembolsos
          currency: originalTransaction.currency,
          method: originalTransaction.method,
          status: "completed",
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          externalId: `rfnd_ext_${Math.random().toString(36).substring(2, 14)}`,
          metadata: {
            originalTransactionId: refundRequest.transactionId,
            reason: refundRequest.reason,
            ...refundRequest.metadata,
          },
        };

        // Actualizar estado de la transacción original si es reembolso completo
        if (refundAmount === originalTransaction.amount) {
          setTransactions((prev) =>
            prev.map((t) =>
              t.id === refundRequest.transactionId ? { ...t, status: "refunded" as const } : t,
            ),
          );
        }

        setTransactions((prev) => [refundTransaction, ...prev]);

        return refundTransaction;
      } finally {
        setIsLoading(false);
      }
    },
    [transactions],
  );

  // Obtener transacciones por reserva
  const getTransactionsByBooking = useCallback(
    (bookingId: string): Transaction[] => {
      return transactions.filter((t) => t.bookingId === bookingId);
    },
    [transactions],
  );

  // Calcular balance de una reserva
  const getBookingBalance = useCallback(
    (bookingId: string): number => {
      const bookingTransactions = getTransactionsByBooking(bookingId);
      return bookingTransactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);
    },
    [getTransactionsByBooking],
  );

  // Obtener resumen de pagos
  const getPaymentSummary = useCallback(() => {
    const completedTransactions = transactions.filter((t) => t.status === "completed");
    const totalRevenue = completedTransactions
      .filter((t) => t.amount > 0) // Excluir reembolsos
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunds = Math.abs(
      completedTransactions
        .filter((t) => t.amount < 0) // Solo reembolsos
        .reduce((sum, t) => sum + t.amount, 0),
    );

    const netRevenue = totalRevenue - totalRefunds;

    const failedTransactions = transactions.filter((t) => t.status === "failed").length;
    const successRate =
      transactions.length > 0
        ? ((transactions.length - failedTransactions) / transactions.length) * 100
        : 0;

    // Agregar fees de procesamiento
    const totalFees = completedTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => {
        const method = paymentMethods.find((m) => m.id === t.method);
        const fee = method ? (t.amount * method.processingFee) / 100 : 0;
        return sum + fee;
      }, 0);

    return {
      totalRevenue,
      totalRefunds,
      netRevenue,
      totalFees,
      successRate,
      transactionCount: transactions.length,
      failedCount: failedTransactions,
    };
  }, [transactions, paymentMethods]);

  // Validar método de pago
  const validatePaymentMethod = useCallback(
    (
      methodId: string,
      amount: number,
    ): {
      isValid: boolean;
      error?: string;
    } => {
      const method = paymentMethods.find((m) => m.id === methodId);

      if (!method) {
        return { isValid: false, error: "Método de pago no encontrado" };
      }

      if (!method.isActive) {
        return { isValid: false, error: "Método de pago no disponible" };
      }

      // Validaciones específicas por tipo
      if (
        method.type === "digital_wallet" &&
        method.config.maxAmount &&
        amount > method.config.maxAmount
      ) {
        return {
          isValid: false,
          error: `El monto máximo para ${method.name} es $${method.config.maxAmount.toLocaleString("es-CO")}`,
        };
      }

      return { isValid: true };
    },
    [paymentMethods],
  );

  // Simular webhook de pago
  const simulatePaymentWebhook = useCallback(
    (transactionId: string, newStatus: Transaction["status"]) => {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId
            ? {
                ...t,
                status: newStatus,
                completedAt: newStatus === "completed" ? new Date().toISOString() : t.completedAt,
                failureReason: newStatus === "failed" ? "Error de procesamiento" : undefined,
              }
            : t,
        ),
      );
    },
    [],
  );

  return {
    // State
    isLoading,
    transactions,
    paymentMethods,

    // Actions
    createPaymentIntent,
    processPayment,
    refundPayment,

    // Queries
    getTransactionsByBooking,
    getBookingBalance,
    getPaymentSummary,
    validatePaymentMethod,

    // Utils
    simulatePaymentWebhook,
  };
};
