import { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import WeeklyLogs from './WeeklyLogs';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'logs', or 'email'
  const [emailStatus, setEmailStatus] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);

  const checkEmailStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/test-email/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Check if backend is running.');
      }
      
      if (response.ok) {
        const data = await response.json();
        setEmailStatus(data);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setEmailStatus({ configured: false, message: errorData.error || 'Failed to check email status' });
      }
    } catch (error) {
      console.error('Error checking email status:', error);
      setEmailStatus({ 
        configured: false, 
        message: error.message || 'Failed to connect to server. Make sure the backend is running.' 
      });
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter an email address');
      return;
    }

    try {
      setTestingEmail(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/test-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ to: testEmail })
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Check if backend is running and route exists.');
      }

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message || 'Test email sent successfully!'}\n\nPlease check your inbox (and spam folder).`);
        setTestEmail('');
      } else {
        alert(`❌ ${data.error || 'Failed to send test email'}\n\n${data.details || ''}\n\n${data.hint || ''}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}\n\nMake sure the backend server is running on port 3001.`);
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e0e0e0' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'users' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'users' ? '#667eea' : '#666',
              fontWeight: activeTab === 'users' ? '600' : '400',
              fontSize: '1rem'
            }}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'logs' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'logs' ? '#667eea' : '#666',
              fontWeight: activeTab === 'logs' ? '600' : '400',
              fontSize: '1rem'
            }}
          >
            Weekly Logs
          </button>
          <button
            onClick={() => {
              setActiveTab('email');
              checkEmailStatus();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === 'email' ? '3px solid #667eea' : '3px solid transparent',
              color: activeTab === 'email' ? '#667eea' : '#666',
              fontWeight: activeTab === 'email' ? '600' : '400',
              fontSize: '1rem'
            }}
          >
            Email Settings
          </button>
        </div>
      </div>

      {activeTab === 'users' && <UserManagement user={user} />}
      {activeTab === 'logs' && <WeeklyLogs user={user} />}
      {activeTab === 'email' && (
        <div>
          <div className="card">
            <h2>Email Configuration Status</h2>
            {emailStatus ? (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: emailStatus.configured ? '#d4edda' : '#fff3cd',
                  border: `2px solid ${emailStatus.configured ? '#28a745' : '#ffc107'}`,
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <p style={{ 
                    fontWeight: '600', 
                    color: emailStatus.configured ? '#155724' : '#856404',
                    marginBottom: '0.5rem'
                  }}>
                    {emailStatus.configured ? '✅ Email is Configured' : '⚠️ Email is Not Configured'}
                  </p>
                  <p style={{ color: emailStatus.configured ? '#155724' : '#856404', fontSize: '0.9rem' }}>
                    {emailStatus.message}
                  </p>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>SMTP Host:</strong> {emailStatus.host}</p>
                  <p><strong>SMTP Port:</strong> {emailStatus.port}</p>
                  <p><strong>SMTP User:</strong> {emailStatus.user}</p>
                  <p><strong>Password Set:</strong> {emailStatus.hasPassword ? 'Yes' : 'No'}</p>
                </div>
              </div>
            ) : (
              <p>Loading email status...</p>
            )}
          </div>

          <div className="card">
            <h2>Test Email</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Send a test email to verify your SMTP configuration is working correctly.
            </p>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address to test"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e1e8ed',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleTestEmail}
              disabled={!testEmail || testingEmail}
              style={{ marginTop: '1rem' }}
            >
              {testingEmail ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>

          <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
            <h3>How to Configure Email</h3>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Create a file named <code>.env</code> in the <code>backend</code> folder</li>
              <li>Add the following variables:
                <pre style={{ 
                  backgroundColor: '#fff', 
                  padding: '1rem', 
                  borderRadius: '5px', 
                  marginTop: '0.5rem',
                  overflow: 'auto'
                }}>
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=AMU Multi Services <your-email@gmail.com>`}
                </pre>
              </li>
              <li><strong>For Gmail:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Enable 2-Step Verification in your Google Account</li>
                  <li>Generate an App Password (not your regular password)</li>
                  <li>Use the App Password as SMTP_PASS</li>
                </ul>
              </li>
              <li>Restart the backend server after adding the .env file</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

