/**
 * ===================================================================
 * LAYOUT UNIFICADO - MICHAEL THE BARBER
 * ===================================================================
 * 
 * Layout base que mantiene consistencia visual en toda la aplicación
 */

import React from "react";
import { DESIGN_TOKENS } from "../../styles/designSystem";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  variant?: "client" | "admin";
  showNavigation?: boolean;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ 
  children, 
  variant = "client",
  showNavigation = true 
}) => {
  const backgroundClass = variant === "admin" 
    ? DESIGN_TOKENS.background.admin 
    : DESIGN_TOKENS.background.primary;

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      {children}
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: "client" | "admin";
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  variant = "client"
}) => {
  const containerClass = variant === "admin"
    ? `${DESIGN_TOKENS.background.elevated} shadow-sm ${DESIGN_TOKENS.border.default} border-b`
    : `${DESIGN_TOKENS.background.overlay}`;

  return (
    <div className={containerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className={`text-3xl font-bold ${DESIGN_TOKENS.text.primary}`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`mt-2 ${DESIGN_TOKENS.text.secondary}`}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  children: React.ReactNode;
  title?: string;
  elevated?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  elevated = false,
  className = ""
}) => {
  return (
    <div className={`${DESIGN_TOKENS.background.adminCard} ${DESIGN_TOKENS.border.default} border rounded-lg p-6 ${
      elevated ? DESIGN_TOKENS.shadow.lg : DESIGN_TOKENS.shadow.md
    } ${className}`}>
      {title && (
        <h3 className={`text-lg font-semibold ${DESIGN_TOKENS.text.primary} mb-4`}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
  className = ""
}) => {
  const baseClass = "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black";
  
  const variantClasses = {
    primary: `${DESIGN_TOKENS.button.primary}`,
    secondary: `${DESIGN_TOKENS.button.secondary}`,
    outline: `${DESIGN_TOKENS.button.outline}`,
    ghost: `${DESIGN_TOKENS.button.ghost}`,
    danger: `${DESIGN_TOKENS.button.danger}`,
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const disabledClass = disabled ? DESIGN_TOKENS.state.disabled : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
};

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    />
  );
};

interface StatusBadgeProps {
  status: "confirmed" | "pending" | "completed" | "cancelled" | "active" | "inactive";
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const statusClasses = {
    confirmed: "text-green-400 bg-green-400/10 border-green-400/20",
    pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    completed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
    active: "text-green-400 bg-green-400/10 border-green-400/20",
    inactive: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status]}`}>
      {children}
    </span>
  );
};

export { DESIGN_TOKENS };
