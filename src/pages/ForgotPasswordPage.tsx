import React, { useState } from 'react';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Clock
} from 'lucide-react';
import Logo from '../components/Logo';
import '../styles/auth.css';

interface ForgotPasswordPageProps {
  onNavigateToLogin?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Informe seu e-mail corporativo ou CPF.');
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-grid">
        {/* ================= COLUNA ESQUERDA (DARK SHOWCASE) ================= */}
        <div className="auth-showcase-side auth-showcase-dark">
          {/* Pontos decorativos oficiais do Figma */}
          <img src="/images/dots-pattern.png" alt="" className="auth-dots-img" />

          {/* Top Bar */}
          <div className="auth-showcase-top">
            <Logo variant="white" size="md" showSubtitle={false} />
            <div className="badge-sus-official">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green-health)' }}></span>
              Sistema Oficial UBS / SUS
            </div>
          </div>

          {/* Conteúdo Central */}
          <div className="auth-showcase-content">
            <div className="auth-tag-pill auth-tag-dark">
              <ShieldCheck size={15} color="#4ade80" />
              Acesso Seguro & Credenciado SUS
            </div>

            <h1 className="auth-headline">
              Recuperação segura e rápida de acesso.
            </h1>

            <p className="auth-subtitle">
              Garantimos a proteção dos dados dos profissionais e pacientes da Atenção Básica através de verificação criptografada institucional.
            </p>

            {/* Badges de recursos */}
            <div className="auth-badges-row">
              <div className="auth-pill-badge">
                <Lock size={16} color="#38bdf8" />
                Criptografia de Ponta
              </div>
              <div className="auth-pill-badge">
                <ShieldCheck size={16} color="#4ade80" />
                Auditoria de Acesso SUS
              </div>
              <div className="auth-pill-badge">
                <Mail size={16} color="#fbbf24" />
                Validação Institucional
              </div>
            </div>

            {/* Info Box */}
            <div className="auth-metric-box" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '56px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <img 
                  src="/images/doctor-banner.png" 
                  alt="Acesso Seguro" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  +250k acessos seguros
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green-health)' }}></span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '0.15rem' }}>
                  Monitoramento contínuo para equipes e gestores da saúde pública.
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé da Coluna Esquerda */}
          <div className="auth-showcase-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Rede de Atenção Básica em Operação</span>
            </div>
            <div>v2.4 LTS</div>
          </div>
        </div>

        {/* ================= COLUNA DIREITA (FORMULÁRIO DE RECUPERAÇÃO) ================= */}
        <div className="auth-form-side">
          <div className="auth-card">
            {/* Voltar ao login */}
            <div className="auth-back-wrapper">
              <button
                type="button"
                className="auth-back-link"
                onClick={onNavigateToLogin}
              >
                <ArrowLeft size={16} />
                Voltar para o Login
              </button>
            </div>

            <div className="auth-badge-tag">
              SEGURANÇA DA CONTA
            </div>

            <h2 className="auth-card-title">Recuperar acesso</h2>
            <p className="auth-card-desc">
              Informe seu e-mail corporativo cadastrado na unidade básica ou o CPF vinculado ao CNES. Enviaremos um link seguro para redefinição da sua senha.
            </p>

            {/* Banner de Sucesso */}
            {isSubmitted && (
              <div className="auth-success-banner">
                <CheckCircle2 size={22} color="var(--color-green-health)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div className="auth-success-title">Link enviado com sucesso!</div>
                  <div className="auth-success-desc">
                    Se o e-mail informado estiver cadastrado, as instruções chegarão em instantes. Verifique também sua caixa de spam.
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-label">E-MAIL CORPORATIVO OU CPF</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="ex: nome.sobrenome@saude.gov.br ou 000.000.000-00"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-auth-submit"
                disabled={isLoading}
                style={{ marginTop: '1rem' }}
              >
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Nota de Ajuda */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '1.5rem', padding: '0.75rem 0', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
              <Clock size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Não tem mais acesso a este e-mail? Fale com a <strong>Coordenação da UBS</strong> ou Suporte Técnico Municipal.
              </div>
            </div>

            {/* Rodapé do card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div>
                Lembrou sua senha?{' '}
                <button
                  type="button"
                  className="auth-link"
                  onClick={onNavigateToLogin}
                  style={{ fontWeight: 700 }}
                >
                  Fazer login
                </button>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                LGPD Saúde • Ministério da Saúde
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
