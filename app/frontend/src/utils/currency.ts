/**
 * Currency Utility Functions for Sri Lankan Rupees (LKR)
 */

export const CURRENCY_SYMBOL = 'Rs';
export const CURRENCY_CODE = 'LKR';
export const CURRENCY_NAME = 'Sri Lankan Rupees';

/**
 * Format amount as Sri Lankan Rupees
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string, showSymbol: boolean = true): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return showSymbol ? `${CURRENCY_SYMBOL} 0.00` : '0.00';
  }
  
  const formatted = numAmount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return showSymbol ? `${CURRENCY_SYMBOL} ${formatted}` : formatted;
};

/**
 * Format amount as Sri Lankan Rupees (no decimals)
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string without decimals
 */
export const formatCurrencyWhole = (amount: number | string, showSymbol: boolean = true): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return showSymbol ? `${CURRENCY_SYMBOL} 0` : '0';
  }
  
  const formatted = Math.round(numAmount).toLocaleString('en-LK');
  
  return showSymbol ? `${CURRENCY_SYMBOL} ${formatted}` : formatted;
};

/**
 * Parse currency string to number
 * @param currencyString - Currency string to parse
 * @returns Parsed number
 */
export const parseCurrency = (currencyString: string): number => {
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};
