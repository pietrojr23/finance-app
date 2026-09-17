import { useState } from "react";
import { authService } from "../services/authService";
import { IconWallet } from "./Icon";

const errorMessages = {
  "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-not-found": "Usuário não encontrado.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde."
};

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isLogin) {
        await authService.login(form.email, form.password);
      } else {
        await authService.register(form.email, form.password, form.displayName);
      }
    } catch (err) {
      setError(errorMessages[err.code] || "Erro ao autenticar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setForm({ email: "", password: "", displayName: "" });
  };

  return (
    <div className="app auth-screen">
      <div className="auth-container">
        <div className="auth-logo">
          <span className="auth-logo-icon" aria-hidden="true">
            <IconWallet width={44} height={44} />
          </span>
          <h1>Finanças</h1>
          <p>Suas contas em um só lugar</p>
        </div>

        <div className="auth-card">

          <div className="auth-tabs">
            <button
              className={isLogin ? "active" : ""}
              onClick={toggleMode}
            >
              Entrar
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={toggleMode}
            >
              Cadastrar
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Seu nome"
                  required={!isLogin}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={submitting}>
              {submitting ? "Aguarde..." : (isLogin ? "Entrar" : "Criar conta")}
            </button>
          </form>

          <p className="auth-footer">
            Seus dados ficam salvos no Firebase e só você tem acesso.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;