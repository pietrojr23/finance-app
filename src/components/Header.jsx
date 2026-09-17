import { IconWallet, IconLogout } from "./Icon";

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
      <h1 className="header-title">
        <span className="header-logo" aria-hidden="true">
          <IconWallet width={26} height={26} />
        </span>
        Finanças
      </h1>
      <div className="header-actions">
        <div className="user-chip" title={user.email}>
          <span className="avatar">{getInitials(user)}</span>
          <span className="user-chip-name">{user.displayName || user.email}</span>
        </div>
        <button
          className="btn-icon header-logout"
          onClick={onLogout}
          title="Sair"
          aria-label="Sair da conta"
        >
          <IconLogout width={20} height={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;