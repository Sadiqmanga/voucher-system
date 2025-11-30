import AMULogo from './AMULogo';

function Dashboard({ user, onLogout, children }) {
  const roleNames = {
    gm: 'General Manager',
    accountant: 'Accountant',
    uploader1: 'Uploader 1',
    uploader2: 'Uploader 2'
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AMULogo size="small" showText={false} />
          <h1 style={{ margin: 0 }}>AMU MULTI SERVICES LTD</h1>
        </div>
        <div className="user-info">
          <span>{user.name} ({roleNames[user.role]})</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

export default Dashboard;

