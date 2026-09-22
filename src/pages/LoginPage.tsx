import React, { useState } from 'react';
import { 
  CreditCard, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Stethoscope, 
  CheckCircle2
} from 'lucide-react';
import Logo from '../components/Logo';
import '../styles/auth.css';

interface LoginPageProps {
  onNavigateToRegister?: () => void;
  onNavigateToForgot?: () => void;
  onLoginSuccess?: () => void;
  onBackToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onNavigateToForgot,
  onLoginSuccess,
  onBackToHome,
}) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Máscara automática de CPF: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = rawValue;

    if (rawValue.length > 9) {
      formatted = `${rawValue.slice(0, 3)}.${rawValue.slice(3, 6)}.${rawValue.slice(6, 9)}-${rawValue.slice(9)}`;
    } else if (rawValue.length > 6) {
      formatted = `${rawValue.slice(0, 3)}.${rawValue.slice(3, 6)}.${rawValue.slice(6)}`;
    } else if (rawValue.length > 3) {
      formatted = `${rawValue.slice(0, 3)}.${rawValue.slice(3)}`;
    }

    setCpf(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !password) {
      setError('Por favor, preencha seu CPF e senha de acesso.');
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        alert('Login efetuado com sucesso no FilaFácil UBS!');
      }
    }, 800);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-grid">
        {/* ================= COLUNA ESQUERDA (SHOWCASE ILUSTRATIVO) ================= */}
        <div className="auth-showcase-side auth-showcase-light">
          {/* Top Bar */}
          <div className="auth-showcase-top">
            <div onClick={onBackToHome} style={{ cursor: onBackToHome ? 'pointer' : 'default' }}>
              <Logo size="md" showSubtitle={false} />
            </div>
            <div className="badge-sus-official">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green-health)' }}></span>
              Sistema Oficial | UBS / SUS
            </div>
          </div>

          {/* Conteúdo Central */}
          <div className="auth-showcase-content">
            <div className="auth-tag-pill auth-tag-light">
              <CheckCircle2 size={15} color="var(--color-green-health)" />
              Mais de 150 UBSs conectadas
            </div>

            <h1 className="auth-headline">
              Cuidado humanizado e <span style={{ color: 'var(--color-blue-ubs)' }}>filas inteligentes</span> para a Atenção Primária.
            </h1>

            <p className="auth-subtitle">
              Tecnologia moderna, acolhimento veloz e triagem clínica ágil para fortalecer as equipes de saúde da família e humanizar a experiência do paciente SUS.
            </p>

            {/* Card da Médica com Badge Flutuante */}
            <div className="doctor-showcase-card">
              <img 
                src="/images/doctor-ubs-portrait.jpg" 
                alt="Dra. Helena Carvalho na Unidade Básica de Saúde" 
              />
              
              <div className="doctor-floating-badge">
                <div className="doctor-info-left">
                  <div className="doctor-avatar-circle">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <div className="doctor-name-title">
                      Dra. Helena Carvalho
                      <CheckCircle2 size={14} color="var(--color-green-health)" />
                    </div>
                    <div className="doctor-role-subtitle">
                      Coordenadora da Atenção Básica
                    </div>
                  </div>
                </div>

                <div className="doctor-rating-right">
                  <div className="doctor-rating-stars">★★★★★</div>
                  <div className="doctor-rating-percent">99.4% satisfação</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé da Coluna Esquerda */}
          <div className="auth-showcase-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--color-blue-ubs)" />
              <span>Atenção Primária Humanizada • Ministério da Saúde</span>
            </div>
            <div>v2.4 LTS</div>
          </div>
        </div>

        {/* ================= COLUNA DIREITA (FORMULÁRIO DE LOGIN) ================= */}
        <div className="auth-form-side">
          <div className="auth-card">
            <div className="auth-badge-tag">
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Acesso Seguro
            </div>

            <h2 className="auth-card-title">Acesse sua conta profissional</h2>
            <p className="auth-card-desc">
              Digite suas credenciais vinculadas ao CNES para iniciar o gerenciamento das filas.
            </p>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Campo CPF */}
              <div className="auth-form-group">
                <label className="auth-label">CPF DO PROFISSIONAL</label>
                <div className="auth-input-wrapper">
                  <CreditCard size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    required
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="auth-form-group">
                <label className="auth-label">SENHA DE ACESSO</label>
                <div className="auth-input-wrapper">
                  <Key size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Opções (Lembrar de mim e Esqueceu senha) */}
              <div className="auth-options-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--color-blue-ubs)', width: '16px', height: '16px' }}
                  />
                  <span>Lembrar de mim</span>
                </label>

                <button
                  type="button"
                  className="auth-link"
                  onClick={onNavigateToForgot}
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {/* Botão de Enviar */}
              <button
                type="submit"
                className="btn-auth-submit"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Link para Cadastro */}
            <div className="auth-card-footer">
              Ainda não possui conta?{' '}
              <button
                type="button"
                className="auth-link"
                onClick={onNavigateToRegister}
                style={{ fontWeight: 700 }}
              >
                Fazer cadastro ↗
              </button>
            </div>
          </div>

          {/* Selos de Confiança abaixo do card */}
          <div className="auth-trust-footer">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="var(--color-green-health)" />
              Criptografia de Ponta
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} color="var(--color-blue-ubs)" />
              LGPD Saúde
            </span>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
            FilaFácil UBS • Sistema Homologado para Atenção Primária à Saúde • SUS
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
