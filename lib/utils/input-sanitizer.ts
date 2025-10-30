/**
 * Input Sanitizer - First line of defense against prompt injection
 * Detects and rejects suspicious patterns before sending to AI
 */

export interface SanitizationResult {
  sanitized: string;
  rejected: boolean;
  reason?: string;
}

// Suspicious patterns that indicate prompt injection attempts
const SUSPICIOUS_PATTERNS = [
  // Instruction override attempts
  /ignore\s+(previous|above|earlier|prior)\s+(instruction|prompt|command|rule)/gi,
  /forget\s+(everything|all|previous|your)/gi,
  /new\s+(instruction|prompt|command|rule|task)/gi,
  /system\s*:/gi,
  /assistant\s*:/gi,
  /you\s+are\s+now/gi,
  /act\s+as\s+(a|an)/gi,
  /pretend\s+(you|to)\s+(are|be)/gi,
  /role\s*:\s*/gi,

  // Prompt leakage attempts
  /print\s+(your|the)\s+(prompt|instruction|system)/gi,
  /show\s+(me\s+)?(your|the)\s+(prompt|instruction)/gi,
  /repeat\s+(the\s+)?(text|instructions|prompt)\s+above/gi,
  /what\s+(are|is)\s+your\s+(instruction|prompt|rule)/gi,

  // Code injection patterns
  /<script[^>]*>/gi,
  /<iframe[^>]*>/gi,
  /javascript\s*:/gi,
  /on(load|error|click|mouse)\s*=/gi,

  // SQL injection patterns
  /;\s*(drop|delete|update|insert|create)\s+(table|database)/gi,
  /union\s+select/gi,
  /'\s*or\s+'1'\s*=\s*'1/gi,

  // Command injection
  /\|\s*(rm|del|format|shutdown)/gi,
  /`.*`/g, // backticks
  /\$\(.*\)/g, // command substitution
];

// Phrases that should trigger rejection
const BANNED_PHRASES = [
  'ignore instructions',
  'disregard prompt',
  'forget your role',
  'new task:',
  'your instructions are',
  'override',
  'bypass',
  'jailbreak',
  'system message',
  'admin command',
  'root access',
  'sudo ',
  'developer mode',
  'god mode',
];

/**
 * Sanitizes and validates user input for meal logging
 * @param text - Raw user input
 * @returns SanitizationResult with sanitized text or rejection reason
 */
export function sanitizeInput(text: string): SanitizationResult {
  // Check if input exists
  if (!text || typeof text !== 'string') {
    return {
      sanitized: '',
      rejected: true,
      reason: 'Input is required',
    };
  }

  // Trim whitespace
  const trimmed = text.trim();

  // Check if empty after trimming
  if (trimmed.length === 0) {
    return {
      sanitized: '',
      rejected: true,
      reason: 'Input cannot be empty',
    };
  }

  // Check length limits
  const MAX_LENGTH = 500;
  if (trimmed.length > MAX_LENGTH) {
    return {
      sanitized: '',
      rejected: true,
      reason: `Input too long (max ${MAX_LENGTH} characters)`,
    };
  }

  // Check for excessive newlines (common in injection attempts)
  const newlineCount = (trimmed.match(/\n/g) || []).length;
  if (newlineCount > 5) {
    return {
      sanitized: '',
      rejected: true,
      reason: 'Input contains too many line breaks',
    };
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        sanitized: '',
        rejected: true,
        reason: 'Input contains suspicious content. Please enter only food descriptions.',
      };
    }
  }

  // Check for banned phrases (case-insensitive)
  const lowerText = trimmed.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      return {
        sanitized: '',
        rejected: true,
        reason: 'Input contains prohibited content. Please enter only food descriptions.',
      };
    }
  }

  // Check for suspicious character sequences
  // Multiple consecutive special characters might indicate injection
  if (/[^\w\s]{5,}/.test(trimmed)) {
    return {
      sanitized: '',
      rejected: true,
      reason: 'Input contains invalid character sequences',
    };
  }

  // Check for control characters (except newline, tab, carriage return)
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(trimmed)) {
    return {
      sanitized: '',
      rejected: true,
      reason: 'Input contains invalid control characters',
    };
  }

  // Remove any remaining dangerous characters but keep the input functional
  // Remove null bytes, control chars (keeping \n, \r, \t)
  // eslint-disable-next-line no-control-regex
  const cleaned = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize whitespace (replace multiple spaces/tabs with single space)
  const normalized = cleaned.replace(/\s+/g, ' ').trim();

  return {
    sanitized: normalized,
    rejected: false,
  };
}

/**
 * Quick check if text looks like it could be food-related (basic heuristic)
 * This is a lightweight pre-filter before calling the AI
 * @param text - Sanitized input text
 * @returns boolean indicating if text might be food
 */
export function looksLikeFood(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Common food-related words
  const foodIndicators = [
    // Food types
    'egg', 'bread', 'rice', 'chicken', 'fish', 'meat', 'milk', 'cheese',
    'vegetable', 'fruit', 'salad', 'soup', 'curry', 'dal', 'roti', 'naan',
    'pasta', 'pizza', 'burger', 'sandwich', 'coffee', 'tea', 'juice',
    'yogurt', 'butter', 'oil', 'sugar', 'salt', 'spice',
    // Measurements
    'cup', 'gram', 'kg', 'oz', 'liter', 'ml', 'teaspoon', 'tablespoon',
    'piece', 'slice', 'bowl', 'plate', 'serving',
    // Meal indicators
    'breakfast', 'lunch', 'dinner', 'snack', 'meal', 'ate', 'had',
    // Cooking methods
    'boiled', 'fried', 'grilled', 'baked', 'steamed', 'roasted',
  ];

  // Check if text contains any food indicators
  for (const indicator of foodIndicators) {
    if (lowerText.includes(indicator)) {
      return true;
    }
  }

  // Check if text contains numbers (portions/quantities)
  // Food descriptions usually have numbers
  if (/\d/.test(text)) {
    return true;
  }

  // If text is very short (< 3 words) and no food indicators, probably not food
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 3) {
    return false;
  }

  // Default: let AI decide (return true to allow AI validation)
  return true;
}
