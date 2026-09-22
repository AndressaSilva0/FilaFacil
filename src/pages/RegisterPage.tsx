import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Briefcase, 
  Hospital, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  Tv, 
  HeartHandshake, 
  Users, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import Logo from '../components/Logo';
import '../styles/auth.css';

interface RegisterPageProps {
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [role, setRole] = useState('');
  const [unit, setUnit] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Máscara automática de CPF
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

    if (!name || !cpf || !role || !unit || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('A confirmação de senha não confere.');
      return;
    }

    if (!acceptedTerms) {
      setError('É necessário aceitar os termos de sigilo e privacidade do SUS.');
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        alert('Cadastro realizado com sucesso! Redirecionando para o login...');
        if (onNavigateToLogin) onNavigateToLogin();
      }
    }, 900);
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
              Sistema Oficial | UBS / SUS
            </div>
          </div>

          {/* Conteúdo Central */}
          <div className="auth-showcase-content">
            <div className="auth-tag-pill auth-tag-dark">
              <ShieldCheck size={15} color="#4ade80" />
              Acesso Seguro & Credenciado SUS
            </div>

            <h1 className="auth-headline">
              Cuidado humanizado e gestão ágil de filas.
            </h1>

            <p className="auth-subtitle">
              Junte-se à plataforma que conecta acolhimento imediato, organização inteligente de triagem e fluxo transparente em Atenção Primária.
            </p>

            {/* Badges de recursos */}
            <div className="auth-badges-row">
              <div className="auth-pill-badge">
                <Zap size={16} color="#38bdf8" />
                Triagem Rápida
              </div>
              <div className="auth-pill-badge">
                <Tv size={16} color="#4ade80" />
                Painel de TV Integrado
              </div>
              <div className="auth-pill-badge">
                <HeartHandshake size={16} color="#fbbf24" />
                Gestão Humanizada
              </div>
            </div>

            {/* Metric Box */}
            <div className="auth-metric-box">
              <div className="auth-metric-single">
                <div className="auth-metric-icon">
                  <Users size={22} />
                </div>
                <div>
                  <div className="auth-metric-number">+250k</div>
                  <div className="auth-metric-label">Pacientes acolhidos no mês</div>
                </div>
              </div>

              <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}></div>

              <div>
                <div className="auth-metric-number" style={{ color: '#4ade80' }}>-40%</div>
                <div className="auth-metric-label">Tempo de espera em fila</div>
              </div>
            </div>
          </div>

          {/* Rodapé da Coluna Esquerda */}
          <div className="auth-showcase-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green-health)' }}></span>
              <span>Rede de Atenção Básica em Operação</span>
            </div>
            <div>v2.4.0</div>
          </div>
        </div>

        {/* ================= COLUNA DIREITA (FORMULÁRIO DE CADASTRO) ================= */}
        <div className="auth-form-side">
          <div className="auth-card auth-card-wide">
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
              CREDENCIAMENTO PROFISSIONAL
            </div>

            <h2 className="auth-card-title">Criar conta profissional</h2>
            <p className="auth-card-desc">
              Informe seus dados institucionais para acesso ao sistema da unidade.
            </p>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nome Completo */}
              <div className="auth-form-group">
                <label className="auth-label">NOME COMPLETO</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="ex: Dra. Mariana Vasconcellos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Grid: CPF e Função na UBS */}
              <div className="auth-form-grid-2">
                <div className="auth-form-group">
                  <label className="auth-label">CPF</label>
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

                <div className="auth-form-group">
                  <label className="auth-label">FUNÇÃO NA UBS</label>
                  <div className="auth-input-wrapper">
                    <Briefcase size={18} className="auth-input-icon" />
                    <select
                      className="auth-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="">Selecione a função</option>
                      <option value="MEDICO">Médico(a) de Família e Comunidade</option>
                      <option value="ENFERMEIRO">Enfermeiro(a)</option>
                      <option value="RECEPCAO">Recepcionista / Acolhimento</option>
                      <option value="TEC_ENFERMAGEM">Técnico(a) de Enfermagem</option>
                      <option value="DENTISTA">Cirurgião-Dentista</option>
                      <option value="COORDENADOR">Coordenador(a) de UBS</option>
                    </select>
                    <ChevronDown size={18} className="auth-select-arrow" />
                  </div>
                </div>
              </div>

              {/* Unidade Básica de Saúde (Posto) */}
              <div className="auth-form-group">
                <label className="auth-label">UNIDADE BÁSICA DE SAÚDE (POSTO)</label>
                <div className="auth-input-wrapper">
                  <Hospital size={18} className="auth-input-icon" />
                  <select
                    className="auth-select"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  >
                    <option value="">Selecione sua unidade de atuação</option>
                    <option value="UBS-1">UBS Centro - Dr. José Silva</option>
                    <option value="UBS-2">UBS Jardim das Flores</option>
                    <option value="UBS-3">UBS Vila Esperança</option>
                    <option value="UBS-4">UBS São Francisco</option>
                    <option value="UBS-5">UBS Santa Rita de Cássia</option>
                  </select>
                  <ChevronDown size={18} className="auth-select-arrow" />
                </div>
              </div>

              {/* E-mail Corporativo / Funcional */}
              <div className="auth-form-group">
                <label className="auth-label">E-MAIL CORPORATIVO / FUNCIONAL</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="nome.sobrenome@saude.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Grid: Senha e Confirmar Senha */}
              <div className="auth-form-grid-2">
                <div className="auth-form-group">
                  <label className="auth-label">SENHA</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="auth-input-icon-right"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">CONFIRMAR SENHA</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Regras de Senha */}
              <div className="password-rules-row">
                <div className="password-rule-item">
                  <span className="rule-dot"></span>
                  <span>8+ caracteres</span>
                </div>
                <div className="password-rule-item">
                  <span className="rule-dot"></span>
                  <span>Letra e número</span>
                </div>
                <div className="password-rule-item">
                  <span className="rule-dot"></span>
                  <span>Criptografia de ponta a ponta</span>
                </div>
              </div>

              {/* Aceite de Normas SUS */}
              <div className="auth-form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="auth-checkbox-label" style={{ alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    style={{ accentColor: 'var(--color-blue-ubs)', width: '16px', height: '16px', marginTop: '3px' }}
                    required
                  />
                  <span style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                    Declaro que sou colaborador autorizado da Unidade Básica de Saúde e aceito as normas de sigilo de prontuário e privacidade do SUS.
                  </span>
                </label>
              </div>

              {/* Botão de Concluir */}
              <button
                type="submit"
                className="btn-auth-submit"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Concluir Cadastro'}
                <CheckCircle2 size={18} />
              </button>
            </form>

            {/* Footer do card */}
            <div className="auth-card-footer">
              Já possui uma conta?{' '}
              <button
                type="button"
                className="auth-link"
                onClick={onNavigateToLogin}
                style={{ fontWeight: 700 }}
              >
                Fazer login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
