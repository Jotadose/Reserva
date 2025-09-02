import React from "react";
import { usePayments } from "../../hooks/usePayments";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentDashboardProps {
  bookingId?: string; // Si se proporciona, muestra solo las transacciones de esta reserva
}

export const PaymentDashboard: React.FC<PaymentDashboardProps> = ({ bookingId }) => {
  const {
    isLoading,
    transactions,
    paymentMethods,
    getTransactionsByBooking,
    getBookingBalance,
    getPaymentSummary,
    refundPayment,
    simulatePaymentWebhook,
  } = usePayments();

  const [selectedTransaction, setSelectedTransaction] = React.useState<string | null>(null);
  const [refundReason, setRefundReason] = React.useState("");
  const [refundAmount, setRefundAmount] = React.useState<number | undefined>();

  const displayTransactions = bookingId ? getTransactionsByBooking(bookingId) : transactions;

  const summary = getPaymentSummary();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Completado", class: "bg-green-100 text-green-800" },
      pending: { label: "Pendiente", class: "bg-yellow-100 text-yellow-800" },
      processing: { label: "Procesando", class: "bg-blue-100 text-blue-800" },
      failed: { label: "Fallido", class: "bg-red-100 text-red-800" },
      refunded: { label: "Reembolsado", class: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${config?.class || "bg-gray-100 text-gray-800"}`}
      >
        {config?.label || status}
      </span>
    );
  };

  const getMethodIcon = (methodType: string) => {
    switch (methodType) {
      case "card":
        return "💳";
      case "bank_transfer":
        return "🏦";
      case "cash":
        return "💵";
      case "digital_wallet":
        return "📱";
      default:
        return "💰";
    }
  };

  const handleRefund = async (transactionId: string) => {
    if (!refundReason.trim()) {
      alert("Por favor ingresa el motivo del reembolso");
      return;
    }

    try {
      await refundPayment({
        transactionId,
        amount: refundAmount,
        reason: refundReason,
      });

      setSelectedTransaction(null);
      setRefundReason("");
      setRefundAmount(undefined);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al procesar el reembolso");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General (solo si no es para una reserva específica) */}
      {!bookingId && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Netos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.netRevenue)}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.successRate.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comisiones</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalFees)}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance de la Reserva (solo si es para una reserva específica) */}
      {bookingId && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Balance de la Reserva</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Pagado:</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(getBookingBalance(bookingId))}
            </span>
          </div>
        </div>
      )}

      {/* Métodos de Pago Disponibles */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Métodos de Pago</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`rounded-lg border-2 p-4 ${method.isActive ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getMethodIcon(method.type)}</span>
                <div>
                  <p className="font-medium text-gray-900">{method.name}</p>
                  <p className="text-sm text-gray-600">Comisión: {method.processingFee}%</p>
                  <p className={`text-xs ${method.isActive ? "text-green-600" : "text-gray-500"}`}>
                    {method.isActive ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Transacciones */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {bookingId ? "Transacciones de la Reserva" : "Historial de Transacciones"}
          </h3>
        </div>

        {displayTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg
              className="mx-auto mb-3 h-12 w-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <p>No hay transacciones registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Transacción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {displayTransactions.map((transaction) => {
                  const method = paymentMethods.find((m) => m.id === transaction.method);
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.id}</p>
                          <p className="text-sm text-gray-500">Reserva: {transaction.bookingId}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getMethodIcon(method?.type || "")}</span>
                          <span className="text-sm text-gray-900">
                            {method?.name || transaction.method}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`text-sm font-medium ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(Math.abs(transaction.amount))}
                          {transaction.amount < 0 && " (Reembolso)"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(transaction.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </td>
                      <td className="space-x-2 whitespace-nowrap px-6 py-4 text-sm">
                        {transaction.status === "completed" && transaction.amount > 0 && (
                          <button
                            onClick={() => setSelectedTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reembolsar
                          </button>
                        )}

                        {transaction.status === "pending" && (
                          <div className="space-x-1">
                            <button
                              onClick={() => simulatePaymentWebhook(transaction.id, "completed")}
                              className="text-xs text-green-600 hover:text-green-900"
                            >
                              ✓ Completar
                            </button>
                            <button
                              onClick={() => simulatePaymentWebhook(transaction.id, "failed")}
                              className="text-xs text-red-600 hover:text-red-900"
                            >
                              ✗ Fallar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Reembolso */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Procesar Reembolso</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="refund-reason"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Motivo del Reembolso
                </label>
                <textarea
                  id="refund-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Describe el motivo del reembolso..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label
                  htmlFor="refund-amount"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Monto (opcional - vacío para reembolso completo)
                </label>
                <input
                  id="refund-amount"
                  type="number"
                  value={refundAmount || ""}
                  onChange={(e) =>
                    setRefundAmount(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="Monto del reembolso"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleRefund(selectedTransaction)}
                  disabled={isLoading}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? "Procesando..." : "Procesar Reembolso"}
                </button>
                <button
                  onClick={() => {
                    setSelectedTransaction(null);
                    setRefundReason("");
                    setRefundAmount(undefined);
                  }}
                  className="flex-1 rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
