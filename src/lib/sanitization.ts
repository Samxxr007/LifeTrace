/**
 * Sanitization & Privacy Utilities
 * Ensures sensitive raw data (card numbers, customer IDs, DOB, fraud flags)
 * is never exposed or rendered.
 */

export function sanitizeMerchantName(merchant?: string): string {
  if (!merchant) return 'Unknown Merchant';
  return merchant.replace(/^fraud_/, '').trim();
}

export function maskCardNumber(num?: string): string {
  if (!num) return '•••• •••• •••• ••••';
  const clean = num.replace(/[\s-]/g, '');
  if (clean.length < 4) return '••••';
  return `•••• •••• •••• ${clean.slice(-4)}`;
}

export function sanitizeText(text?: string): string {
  if (!text) return '';
  return text.trim();
}
