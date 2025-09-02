export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: string, rules: ValidationRule): string | null => {
  if (rules.required && (!value || value.trim() === "")) {
    return "Este campo es obligatorio";
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return `Debe tener al menos ${rules.minLength} caracteres`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `No puede tener más de ${rules.maxLength} caracteres`;
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return "El formato no es válido";
  }

  if (value && rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (
  data: Record<string, string>,
  rules: ValidationRules,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field] || "";
    const error = validateField(value, rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Reglas predefinidas comunes
export const commonRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    required: true,
    pattern: /^(\+?56)?[0-9]{8,9}$/,
    custom: (value: string) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length < 8 || cleaned.length > 11) {
        return "El teléfono debe tener entre 8 y 11 dígitos";
      }
      return null;
    },
  },
};
