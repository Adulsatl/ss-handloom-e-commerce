export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: any) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === "string" && value.trim() === ""))) {
    return "This field is required"
  }

  if (value && typeof value === "string") {
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return "Invalid format"
    }
  }

  if (value && typeof value === "number") {
    if (rules.min !== undefined && value < rules.min) {
      return `Minimum value is ${rules.min}`
    }

    if (rules.max !== undefined && value > rules.max) {
      return `Maximum value is ${rules.max}`
    }
  }

  if (rules.custom) {
    return rules.custom(value)
  }

  return null
}

export function validateForm(data: Record<string, any>, rules: ValidationRules): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules)
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s\-$$$$]{10,}$/,
  pincode: /^[1-9][0-9]{5}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
}

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: patterns.email,
  },
  phone: {
    required: true,
    pattern: patterns.phone,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  price: {
    required: true,
    min: 1,
    max: 1000000,
  },
  stock: {
    required: true,
    min: 0,
    max: 10000,
  },
  pincode: {
    required: true,
    pattern: patterns.pincode,
  },
}
