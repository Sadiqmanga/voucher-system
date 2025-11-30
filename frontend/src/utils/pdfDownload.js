import { getApiUrl } from './api.js';

export async function viewVoucherPDF(voucherId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in again');
      return;
    }

    // Get API URL (works in both dev and production)
    const url = getApiUrl(`/api/vouchers/${voucherId}/pdf`);
    
    // Add authorization header by creating a blob URL with fetch
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to view PDF');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(blobUrl, '_blank');
    
    // Clean up after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Error viewing PDF:', error);
    alert(error.message || 'Failed to view PDF');
  }
}

