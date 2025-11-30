/**
 * Date utilities for Nigerian timezone (Africa/Lagos, UTC+1)
 */

/**
 * Get current date in Nigerian timezone
 * @returns {Date} Current date in Nigerian timezone
 */
export function getNigerianDate() {
  const now = new Date();
  // Convert to Nigerian time (UTC+1)
  const nigerianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  return nigerianTime;
}

/**
 * Format date to Nigerian timezone string
 * @param {Date|string} date - Date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatNigerianDate(date, options = {}) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...options
  };
  
  return new Intl.DateTimeFormat('en-GB', defaultOptions).format(dateObj);
}

/**
 * Get current date as YYYY-MM-DD in Nigerian timezone
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getNigerianDateString() {
  const date = getNigerianDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (DD/MM/YYYY HH:MM)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatNigerianDateTime(date) {
  if (!date) return '';
  return formatNigerianDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Format date for voucher (DD/MM/YY)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (DD/MM/YY)
 */
export function formatVoucherDate(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const nigerianDate = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  
  const day = String(nigerianDate.getDate()).padStart(2, '0');
  const month = String(nigerianDate.getMonth() + 1).padStart(2, '0');
  const year = String(nigerianDate.getFullYear()).slice(-2);
  
  return `${day}/${month}/${year}`;
}

/**
 * Get current timestamp in Nigerian timezone for database
 * @returns {string} ISO string in Nigerian timezone
 */
export function getNigerianTimestamp() {
  const date = getNigerianDate();
  return date.toISOString();
}

