function Header({ user, onLogout }) {
  return (
    <header className="header">
      <h1>💰 Gerenciador Financeiro</h1>
      <div className="header-user">
        <span>👤 {user.displayName || user.email}</span>
        <button className="btn-logout" onClick={onLogout}>Sair</button>
      </div>
    </header>
  );
}

export default Header;