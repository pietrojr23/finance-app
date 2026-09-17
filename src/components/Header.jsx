function getInitials(user) {
  const name = (user.displayName || user.email || "").trim();
  const first = name.charAt(0).toUpperCase();
  const second = name.includes(" ")
    ? name.split(/\s+/)[1].charAt(0).toUpperCase()
    : "";
  return first + second;
}

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <h1>💰 Finanças</h1>
      <div className="header-actions">
        <div className="user-chip" title={user.email}>
          <span className="avatar">{getInitials(user)}</span>
          <span>{user.displayName || user.email}</span>
        </div>
        <button className="btn-logout" onClick={onLogout} title="Sair" aria-label="Sair">
          ⏻
        </button>
      </div>
    </header>
  );
}

export default Header;