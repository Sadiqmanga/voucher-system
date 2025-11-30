import { useState, useEffect } from 'react';
import { toNigerianLocaleString, getNigerianDateString } from '../utils/dateUtils';

function WeeklyLogs({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const getCurrentWeek = () => {
    const today = new Date();
    const nigerianDate = new Date(today.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    const dayOfWeek = nigerianDate.getDay();
    const diff = nigerianDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(nigerianDate.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(monday),
      end: formatDate(sunday)
    };
  };

  const [dateRange, setDateRange] = useState(getCurrentWeek());

  useEffect(() => {
    fetchLogs();
  }, [dateRange]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/logs/range?start_date=${dateRange.start}&end_date=${dateRange.end}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        console.error('Failed to fetch logs');
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentWeek = () => {
    const week = getCurrentWeek();
    setDateRange(week);
  };

  const getActionLabel = (action) => {
    const labels = {
      'voucher_created': 'Voucher Created',
      'voucher_verified': 'Voucher Verified',
      'voucher_rejected': 'Voucher Rejected',
      'voucher_approved': 'Voucher Approved',
      'voucher_rejected_by_uploader': 'Voucher Rejected by Uploader',
      'user_created': 'User Created',
      'user_updated': 'User Updated',
      'user_deleted': 'User Deleted'
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    if (action === 'voucher_created' || action === 'user_created') return '#667eea';
    if (action === 'voucher_verified' || action === 'voucher_approved' || action === 'user_updated') return '#28a745';
    if (action === 'voucher_rejected' || action === 'voucher_rejected_by_uploader' || action === 'user_deleted') return '#dc3545';
    return '#6c757d';
  };

  if (loading) {
    return <div className="loading">Loading logs...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Weekly Activity Logs</h2>
          <button className="btn btn-primary" onClick={loadCurrentWeek}>
            Current Week
          </button>
        </div>

        <div className="form-row" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="empty-state">
            <p>No logs found for the selected date range</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Voucher Number</th>
                  <th>Description</th>
                  <th>Status Change</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{toNigerianLocaleString(log.created_at)}</td>
                    <td>{log.user_name}</td>
                    <td>
                      <span className="badge" style={{ 
                        backgroundColor: getActionColor(log.action),
                        color: 'white'
                      }}>
                        {log.user_role === 'gm' ? 'GM' : log.user_role === 'accountant' ? 'Accountant' : log.user_role === 'admin' ? 'Admin' : 'Uploader'}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        color: getActionColor(log.action),
                        fontWeight: '500'
                      }}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td>{log.voucher_number || 'N/A'}</td>
                    <td>{log.description || '-'}</td>
                    <td>
                      {log.old_status && log.new_status ? (
                        <span>
                          <span className="badge" style={{ backgroundColor: '#6c757d', color: 'white', marginRight: '0.25rem' }}>
                            {log.old_status}
                          </span>
                          →
                          <span className="badge" style={{ backgroundColor: getActionColor(log.action), color: 'white', marginLeft: '0.25rem' }}>
                            {log.new_status}
                          </span>
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeeklyLogs;

