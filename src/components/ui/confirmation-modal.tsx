'use client'

import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  X,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type ConfirmationType = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  loading?: boolean;
}

const typeConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    confirmBg: "bg-red-600 hover:bg-red-700",
    borderColor: "border-red-500/30",
    ringColor: "ring-red-500/50",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    confirmBg: "bg-yellow-600 hover:bg-yellow-700",
    borderColor: "border-yellow-500/30",
    ringColor: "ring-yellow-500/50",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    confirmBg: "bg-blue-600 hover:bg-blue-700",
    borderColor: "border-blue-500/30",
    ringColor: "ring-blue-500/50",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-green-500/20",
    iconColor: "text-green-400",
    confirmBg: "bg-green-600 hover:bg-green-700",
    borderColor: "border-green-500/30",
    ringColor: "ring-green-500/50",
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  loading = false,
}) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-transparent cursor-default"
        onClick={onClose}
        aria-label="Cerrar modal"
        tabIndex={-1}
      />

      {/* Modal */}
      <Card className={`relative z-10 w-full max-w-md mx-4 glass-card border ${config.borderColor} shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700/50 p-6">
          <div className="flex items-center space-x-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.iconBg} ring-2 ${config.ringColor}`}
            >
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-800 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 pt-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`text-white transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 ${config.ringColor} disabled:opacity-50 ${config.confirmBg}`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Procesando...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};