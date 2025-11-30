/**
 * Date utilities for Nigerian timezone (Africa/Lagos, UTC+1)
 */

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
 * Get current date as YYYY-MM-DD in Nigerian timezone
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getNigerianDateString() {
  const now = new Date();
  const nigerianDate = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const year = nigerianDate.getFullYear();
  const month = String(nigerianDate.getMonth() + 1).padStart(2, '0');
  const day = String(nigerianDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display with time (DD/MM/YYYY, HH:MM:SS)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function toNigerianLocaleString(date) {
  if (!date) return '-';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(dateObj);
}

