import { useState, useEffect } from 'react';
import { viewVoucherPDF } from '../utils/pdfDownload';
import { toNigerianLocaleString } from '../utils/dateUtils';

function UploaderDashboard({ user }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPastVouchers, setShowPastVouchers] = useState(false);

  useEffect(() => {
    fetchVouchers();
    const interval = setInterval(fetchVouchers, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
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

  const handleAction = async (voucherId, action) => {
    if (!confirm(`Are you sure you want to ${action} this voucher?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/vouchers/${voucherId}/uploader-action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update voucher');
      }

      fetchVouchers();
    } catch (error) {
      alert(error.message);
    }
  };

  const [reportDateRange, setReportDateRange] = useState({
    start: '',
    end: ''
  });
  const [downloadingReport, setDownloadingReport] = useState(false);

  const downloadReport = async (status) => {
    try {
      setDownloadingReport(true);
      const token = localStorage.getItem('token');
      let url = `/api/reports/download/${status}`;
      
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
      a.download = `vouchers_${status}${dateRange}_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_blob);
      document.body.removeChild(a);
    } catch (error) {
      alert(error.message);
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Separate active and past vouchers
  // Active: vouchers pending verification by this uploader
  // Past: vouchers already approved/rejected by this uploader
  const pendingVouchers = vouchers.filter(v => 
    v.gm_status === 'verified' && v.uploader_status === 'pending' && (v.uploader_id === user.id || !v.uploader_id)
  );
  const myCompletedVouchers = vouchers.filter(v => 
    v.uploader_id === user.id && v.uploader_status !== 'pending'
  );

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Download Reports</h2>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Start Date (Optional)</label>
              <input
                type="date"
                value={reportDateRange.start}
                onChange={(e) => setReportDateRange({ ...reportDateRange, start: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date (Optional)</label>
              <input
                type="date"
                value={reportDateRange.end}
                onChange={(e) => setReportDateRange({ ...reportDateRange, end: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => downloadReport('approved')}
              disabled={downloadingReport}
            >
              {downloadingReport ? 'Generating...' : 'Download Approved Report'}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => downloadReport('rejected')}
              disabled={downloadingReport}
            >
              {downloadingReport ? 'Generating...' : 'Download Rejected Report'}
            </button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Leave dates empty to download all vouchers, or select a date range to filter.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Pending Verification ({pendingVouchers.length})</h2>
        {pendingVouchers.length === 0 ? (
          <div className="empty-state">
            <p>No vouchers pending verification</p>
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
                  <th>GM Verified At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingVouchers.map((voucher) => {
                  const voucherData = JSON.parse(voucher.voucher_data || '{}');
                  const amount = voucherData.advance_paid || voucherData.total_due || 0;
                  return (
                    <tr key={voucher.id}>
                      <td>{voucher.voucher_number}</td>
                      <td>{voucher.accountant_name}</td>
                      <td>{voucherData.in_favour_of || 'N/A'}</td>
                      <td>₦{amount.toLocaleString()}</td>
                      <td>{voucher.gm_verified_at ? toNigerianLocaleString(voucher.gm_verified_at) : '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => viewVoucherPDF(voucher.id)}
                            className="btn btn-sm"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', marginRight: '0.5rem' }}
                          >
                            View PDF
                          </button>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAction(voucher.id, 'approved')}
                          >
                            Approve
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
             onClick={() => setShowPastVouchers(!showPastVouchers)}>
          <h2 style={{ margin: 0 }}>My Completed Vouchers ({myCompletedVouchers.length})</h2>
          <span style={{ fontSize: '1.2rem', userSelect: 'none' }}>
            {showPastVouchers ? '▼' : '▶'}
          </span>
        </div>
        {showPastVouchers && (
          <div style={{ marginTop: '1rem' }}>
            {myCompletedVouchers.length === 0 ? (
              <div className="empty-state">
                <p>No completed vouchers</p>
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
                      <th>My Status</th>
                      <th>Verified At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCompletedVouchers.map((voucher) => {
                      const voucherData = JSON.parse(voucher.voucher_data || '{}');
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
                          <td>{voucher.uploader_verified_at ? toNigerianLocaleString(voucher.uploader_verified_at) : '-'}</td>
                          <td>
                            <button
                              onClick={() => viewVoucherPDF(voucher.id)}
                              className="btn btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
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
    </div>
  );
}

export default UploaderDashboard;

