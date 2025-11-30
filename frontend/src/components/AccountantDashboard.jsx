import { useState, useEffect } from 'react';
import VoucherForm from './VoucherForm';
import { viewVoucherPDF } from '../utils/pdfDownload';
import { toNigerianLocaleString } from '../utils/dateUtils';

function AccountantDashboard({ user }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPastVouchers, setShowPastVouchers] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDateRange, setReportDateRange] = useState({
    start: '',
    end: ''
  });
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setVouchers(data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (voucherNumber, voucherData) => {
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          voucher_number: voucherNumber,
          voucher_data: voucherData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create voucher');
      }

      setShowForm(false);
      fetchVouchers();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Separate active and past vouchers
  // Active: vouchers that are still in process (not completed by uploader)
  // Past: vouchers that are completed (approved/rejected by uploader) or rejected by GM
  const activeVouchers = vouchers.filter(v => 
    v.uploader_status === 'pending' && v.gm_status !== 'rejected'
  );
  const pastVouchers = vouchers.filter(v => 
    v.uploader_status !== 'pending' || v.gm_status === 'rejected'
  );

  const VoucherTable = ({ vouchers: vouchersList, emptyMessage }) => {
    if (vouchersList.length === 0) {
      return (
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Voucher Number</th>
              <th>GM Status</th>
              <th>Uploader Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchersList.map((voucher) => {
              const voucherData = JSON.parse(voucher.voucher_data || '{}');
              return (
                <tr key={voucher.id}>
                  <td>
                    <div>
                      <strong>{voucher.voucher_number}</strong>
                      <br />
                      <small style={{ color: '#666' }}>{voucherData.in_favour_of || 'N/A'}</small>
                    </div>
                  </td>
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
    );
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Vouchers</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create New Voucher'}
          </button>
        </div>

        {showForm && (
          <div style={{ marginTop: '1.5rem' }}>
            <VoucherForm 
              onSubmit={handleSubmit} 
              onCancel={() => setShowForm(false)}
              user={user}
            />
          </div>
        )}
      </div>

      <div className="card">
        <h2>Active Vouchers ({activeVouchers.length})</h2>
        <VoucherTable 
          vouchers={activeVouchers} 
          emptyMessage="No active vouchers. Create your first voucher!"
        />
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
            <VoucherTable 
              vouchers={pastVouchers} 
              emptyMessage="No past vouchers"
            />
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
    </div>
  );
}

export default AccountantDashboard;

