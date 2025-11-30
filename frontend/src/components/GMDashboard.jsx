import { useState, useEffect } from 'react';
import { viewVoucherPDF } from '../utils/pdfDownload';
import { toNigerianLocaleString } from '../utils/dateUtils';

function GMDashboard({ user }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPastVouchers, setShowPastVouchers] = useState(false);
  const [uploaders, setUploaders] = useState([]);
  const [uploadersLoading, setUploadersLoading] = useState(false);
  const [showUploaderModal, setShowUploaderModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedUploader, setSelectedUploader] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDateRange, setReportDateRange] = useState({
    start: '',
    end: ''
  });
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    fetchVouchers();
    fetchUploaders();
    const interval = setInterval(fetchVouchers, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Re-fetch uploaders when modal opens
  useEffect(() => {
    if (showUploaderModal && uploaders.length === 0) {
      fetchUploaders();
    }
  }, [showUploaderModal]);

  const fetchUploaders = async () => {
    setUploadersLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setUploadersLoading(false);
        return;
      }
      
      console.log('Fetching uploaders from /api/vouchers/uploaders');
      const response = await fetch('/api/vouchers/uploaders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Uploaders response:', data);
        if (Array.isArray(data) && data.length > 0) {
          setUploaders(data);
          console.log('Uploaders set successfully:', data);
        } else {
          console.warn('No uploaders returned from API, got:', data);
          setUploaders([]);
        }
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        console.error('Failed to fetch uploaders:', response.status, errorData);
        setUploaders([]);
      }
    } catch (error) {
      console.error('Error fetching uploaders:', error);
      setUploaders([]);
    } finally {
      setUploadersLoading(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVouchers(data || []);
      } else {
        console.error('Failed to fetch vouchers:', response.status);
        setVouchers([]);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (voucherId, action, uploaderId = null) => {
    if (action === 'verified' && !uploaderId) {
      // Show modal to select uploader
      console.log('Showing uploader selection modal for voucher:', voucherId);
      console.log('Available uploaders:', uploaders);
      
      // If uploaders haven't loaded yet, fetch them now
      if (uploaders.length === 0) {
        await fetchUploaders();
      }
      
      setSelectedVoucher({ id: voucherId, action });
      setShowUploaderModal(true);
      return;
    }

    if (action === 'rejected' && !confirm(`Are you sure you want to reject this voucher?`)) {
      return;
    }

    if (action === 'verified' && !confirm(`Are you sure you want to verify this voucher and assign it to the selected uploader?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/vouchers/${voucherId}/gm-action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, uploader_id: uploaderId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update voucher');
      }

      setShowUploaderModal(false);
      setSelectedVoucher(null);
      setSelectedUploader('');
      fetchVouchers();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleVerifyWithUploader = () => {
    if (!selectedUploader) {
      alert('Please select an uploader');
      return;
    }
    if (selectedVoucher) {
      handleAction(selectedVoucher.id, 'verified', parseInt(selectedUploader));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Separate active and past vouchers
  // Active: pending vouchers and verified vouchers waiting for uploader
  // Past: rejected vouchers or vouchers completed by uploader
  const pendingVouchers = (vouchers || []).filter(v => v && v.gm_status === 'pending');
  const activeVerifiedVouchers = (vouchers || []).filter(v => 
    v && v.gm_status === 'verified' && v.uploader_status === 'pending'
  );
  const pastVouchers = (vouchers || []).filter(v => 
    v && (v.gm_status === 'rejected' || 
    (v.gm_status === 'verified' && v.uploader_status !== 'pending'))
  );

  const downloadReport = async () => {
    try {
      setDownloadingReport(true);
      const token = localStorage.getItem('token');
      let url = `/api/reports/download/all`;
      
      // Add date range if provided
      if (reportDateRange.start && reportDateRange.end) {
        url += `?start_date=${reportDateRange.start}&end_date=${reportDateRange.end}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download report');
      }

      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_blob;
      const dateRange = reportDateRange.start && reportDateRange.end 
        ? `_${reportDateRange.start}_to_${reportDateRange.end}` 
        : '';
      a.download = `vouchers_all${dateRange}_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_blob);
      document.body.removeChild(a);
      
      // Close modal after successful download
      setShowReportModal(false);
      setReportDateRange({ start: '', end: '' });
    } catch (error) {
      alert(error.message);
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Pending Vouchers ({pendingVouchers.length})</h2>
        {pendingVouchers.length === 0 ? (
          <div className="empty-state">
            <p>No pending vouchers</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Voucher Number</th>
                  <th>Accountant</th>
                  <th>In Favour Of</th>
                  <th>Amount</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingVouchers.map((voucher) => {
                  let voucherData = {};
                  try {
                    voucherData = JSON.parse(voucher.voucher_data || '{}');
                  } catch (e) {
                    console.error('Error parsing voucher data:', e);
                  }
                  const amount = voucherData.advance_paid || voucherData.total_due || 0;
                  return (
                    <tr key={voucher.id}>
                      <td>{voucher.voucher_number}</td>
                      <td>{voucher.accountant_name}</td>
                      <td>{voucherData.in_favour_of || 'N/A'}</td>
                      <td>₦{amount.toLocaleString()}</td>
                      <td>{toNigerianLocaleString(voucher.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => viewVoucherPDF(voucher.id)}
                            className="btn btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', marginRight: '0.5rem', backgroundColor: '#667eea', color: 'white' }}
                          >
                            View PDF
                          </button>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAction(voucher.id, 'verified')}
                          >
                            Verify
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleAction(voucher.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Verified - Awaiting Uploader ({activeVerifiedVouchers.length})</h2>
        {activeVerifiedVouchers.length === 0 ? (
          <div className="empty-state">
            <p>No vouchers awaiting uploader verification</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Voucher Number</th>
                  <th>Accountant</th>
                  <th>In Favour Of</th>
                  <th>Uploader</th>
                  <th>Uploader Status</th>
                  <th>Verified At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeVerifiedVouchers.map((voucher) => {
                  let voucherData = {};
                  try {
                    voucherData = JSON.parse(voucher.voucher_data || '{}');
                  } catch (e) {
                    console.error('Error parsing voucher data:', e);
                  }
                  return (
                    <tr key={voucher.id}>
                      <td>{voucher.voucher_number}</td>
                      <td>{voucher.accountant_name}</td>
                      <td>{voucherData.in_favour_of || 'N/A'}</td>
                      <td>{voucher.uploader_name || 'Not assigned'}</td>
                      <td>
                        <span className={`badge ${voucher.uploader_status}`}>
                          {voucher.uploader_status}
                        </span>
                      </td>
                      <td>{voucher.gm_verified_at ? toNigerianLocaleString(voucher.gm_verified_at) : '-'}</td>
                      <td>
                        <button
                          onClick={() => viewVoucherPDF(voucher.id)}
                          className="btn btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', backgroundColor: '#667eea', color: 'white' }}
                        >
                          View PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
             onClick={() => setShowPastVouchers(!showPastVouchers)}>
          <h2 style={{ margin: 0 }}>Past Vouchers ({pastVouchers.length})</h2>
          <span style={{ fontSize: '1.2rem', userSelect: 'none' }}>
            {showPastVouchers ? '▼' : '▶'}
          </span>
        </div>
        {showPastVouchers && (
          <div style={{ marginTop: '1rem' }}>
            {pastVouchers.length === 0 ? (
              <div className="empty-state">
                <p>No past vouchers</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Voucher Number</th>
                      <th>Accountant</th>
                      <th>In Favour Of</th>
                      <th>GM Status</th>
                      <th>Uploader Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastVouchers.map((voucher) => {
                      let voucherData = {};
                      try {
                        voucherData = JSON.parse(voucher.voucher_data || '{}');
                      } catch (e) {
                        console.error('Error parsing voucher data:', e);
                      }
                      return (
                        <tr key={voucher.id}>
                          <td>{voucher.voucher_number}</td>
                          <td>{voucher.accountant_name}</td>
                          <td>{voucherData.in_favour_of || 'N/A'}</td>
                          <td>
                            <span className={`badge ${voucher.gm_status}`}>
                              {voucher.gm_status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${voucher.uploader_status}`}>
                              {voucher.uploader_status}
                            </span>
                          </td>
                          <td>{toNigerianLocaleString(voucher.created_at)}</td>
                          <td>
                            <button
                              onClick={() => viewVoucherPDF(voucher.id)}
                              className="btn btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', backgroundColor: '#667eea', color: 'white' }}
                            >
                              View PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Download Reports</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowReportModal(true)}
          >
            Download All Vouchers
          </button>
        </div>
      </div>

      {/* Report Download Modal */}
      {showReportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReportModal(false);
              setReportDateRange({ start: '', end: '' });
            }
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '90%',
              position: 'relative',
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Download Voucher Report</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Select a date range to filter vouchers, or leave empty to download all vouchers. Report will be generated as Excel (.xlsx) file.
            </p>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Start Date (Optional)</label>
              <input
                type="date"
                value={reportDateRange.start}
                onChange={(e) => setReportDateRange({ ...reportDateRange, start: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>End Date (Optional)</label>
              <input
                type="date"
                value={reportDateRange.end}
                onChange={(e) => setReportDateRange({ ...reportDateRange, end: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={downloadReport}
                disabled={downloadingReport}
                style={{ flex: 1 }}
              >
                {downloadingReport ? 'Generating Excel...' : 'Download Report'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowReportModal(false);
                  setReportDateRange({ start: '', end: '' });
                }}
                disabled={downloadingReport}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploader Selection Modal */}
      {showUploaderModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploaderModal(false);
              setSelectedVoucher(null);
              setSelectedUploader('');
            }
          }}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: '500px', 
              width: '90%', 
              position: 'relative',
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Select Uploader</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Please select which uploader should handle this voucher:
            </p>
            
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Uploader *</label>
              {uploadersLoading ? (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '5px', 
                  color: '#666',
                  textAlign: 'center'
                }}>
                  Loading uploaders...
                </div>
              ) : uploaders.length === 0 ? (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '5px', 
                  color: '#856404',
                  textAlign: 'center'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>Failed to load uploaders. Please try again.</div>
                  <button 
                    type="button"
                    onClick={fetchUploaders}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#667eea', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <select
                  value={selectedUploader}
                  onChange={(e) => setSelectedUploader(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    fontSize: '1rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '5px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">-- Select Uploader --</option>
                  {uploaders.map(uploader => (
                    <option key={uploader.id} value={uploader.id}>
                      {uploader.name} ({uploader.role === 'uploader1' ? 'Uploader 1' : 'Uploader 2'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleVerifyWithUploader}
                disabled={!selectedUploader}
              >
                Verify & Assign
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowUploaderModal(false);
                  setSelectedVoucher(null);
                  setSelectedUploader('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GMDashboard;

