import React, { useState, useRef } from 'react';
import {
  User,
  CreditCard,
  Briefcase,
  Hospital,
  Mail,
  Phone,
  Lock,
  Camera,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  BadgeCheck,
  ChevronDown,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import '../styles/profile.css';

export interface UserProfile {
  name: string;
  role: string;
  unit: string;
  email: string;
  cpf: string;
  phone: string;
  registrationNumber: string;
  avatarUrl?: string;
}

interface ProfilePageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigate: (screen: InternalScreen) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigate,
}) => {
  // Dados do formulário
  const [name, setName] = useState(userProfile.name);
  const [role, setRole] = useState(userProfile.role);
  const [unit, setUnit] = useState(userProfile.unit);
  const [email, setEmail] = useState(userProfile.email);
  const [cpf, setCpf] = useState(userProfile.cpf);
  const [phone, setPhone] = useState(userProfile.phone);
  const [registrationNumber, setRegistrationNumber] = useState(userProfile.registrationNumber);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl || '');

  // Senhas (opcional)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Presets rápidos de avatar com imagens temáticas de saúde pública
  const avatarPresets = [
    { id: 'agent-male', url: '/images/avatars/avatar-male-agent.jpg', label: 'Agente Comunitário de Saúde (Hiago)' },
    { id: 'doctor-female', url: '/images/avatars/avatar-female-doctor.jpg', label: 'Dra. Mariana (Médica de Família)' },
    { id: 'doctor-male', url: '/images/avatars/avatar-doctor-portrait.jpg', label: 'Dr. Roberto (Clínico Geral)' },
    { id: 'nurse-teal', url: '/images/avatars/avatar-nurse.svg', label: 'Enfermeira Chefe da Equipe' },
    { id: 'reception-specialist', url: '/images/avatars/avatar-receptionist.svg', label: 'Recepção / Triagem Humanizada' },
  ];

  // Upload de arquivo de imagem real do computador
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Máscara de CPF
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

  // Máscara de Telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = rawValue;
    if (rawValue.length > 10) {
      formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 7)}-${rawValue.slice(7)}`;
    } else if (rawValue.length > 6) {
      formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2, 6)}-${rawValue.slice(6)}`;
    } else if (rawValue.length > 2) {
      formatted = `(${rawValue.slice(0, 2)}) ${rawValue.slice(2)}`;
    }
    setPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      alert('A confirmação da nova senha não confere.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      onUpdateProfile({
        name,
        role,
        unit,
        email,
        cpf,
        phone,
        registrationNumber,
        avatarUrl,
      });

      setToastMsg('Perfil, foto e dados cadastrais salvos com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setToastMsg(null);
      }, 3500);
    }, 500);
  };

  return (
    <div className="profile-page">
      {/* Toast de Sucesso */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#065f46',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 700,
        }}>
          <CheckCircle2 size={22} color="#34d399" />
          {toastMsg}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header className="profile-header-row">
        <div>
          <div className="profile-breadcrumb-row">
            <span className="page-breadcrumb" style={{ margin: 0 }}>
              CONFIGURAÇÕES &gt; CONTA DO PROFISSIONAL
            </span>
            <span className="profile-badge-active">
              <span className="pulse-dot"></span>
              Operador Ativo no SUS
            </span>
          </div>

          <h1 className="profile-page-title">Editar Meu Perfil</h1>
          <p className="profile-page-subtitle">
            Gerencie sua foto de exibição, dados profissionais de lotação na UBS e credenciais de acesso.
          </p>
        </div>

        <button
          type="button"
          className="btn-profile-cancel"
          onClick={() => onNavigate('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          Voltar ao Início
        </button>
      </header>

      {/* ================= FORMULÁRIO PRINCIPAL ================= */}
      <form onSubmit={handleSubmit}>
        <div className="profile-main-grid">
          {/* ================= COLUNA ESQUERDA: FOTO & CRACHÁ ================= */}
          <aside className="profile-sidebar-col">
            {/* Card de Foto de Perfil */}
            <div className="profile-card">
              <h3 className="profile-card-title">Foto de Perfil</h3>
              <p className="profile-card-subtitle">
                Essa imagem aparecerá no topo do cabeçalho e no registro de suas ações.
              </p>

              <div className="profile-photo-center">
                <div className="profile-avatar-large-wrap">
                  <div className="profile-avatar-large-inner">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="profile-avatar-large-img" />
                    ) : (
                      <User size={54} color="#64748b" />
                    )}
                  </div>

                  <button
                    type="button"
                    className="profile-avatar-camera-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Carregar nova foto"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                {/* Input file invisível */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div className="profile-photo-actions-row">
                  <button
                    type="button"
                    className="btn-upload-photo"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    Carregar Foto
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={() => setAvatarUrl('')}
                      title="Remover foto"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Presets Rápidos */}
                <span className="profile-presets-title">Ou escolha um avatar rápido:</span>
                <div className="profile-presets-row">
                  {avatarPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`profile-preset-option ${avatarUrl === preset.url ? 'active' : ''}`}
                      onClick={() => setAvatarUrl(preset.url)}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="profile-preset-img" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Crachá Digital SUS */}
            <div className="profile-badge-card">
              <div className="badge-card-header">
                <div className="badge-sus-title">
                  <span className="badge-sus-ministry">Ministério da Saúde • SUS</span>
                  <span className="badge-sus-app">FilaFácil Profissional</span>
                </div>
                <span className="badge-sus-tag">VERIFICADO</span>
              </div>

              <div className="badge-user-info-row">
                <div className="badge-avatar-mini">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} />
                  ) : (
                    <User size={24} color="#ffffff" />
                  )}
                </div>
                <div>
                  <div className="badge-name">{name || 'Seu Nome'}</div>
                  <div className="badge-role">{role || 'Agente de Saúde'}</div>
                  <div className="badge-unit">{unit || 'UBS Central 01'}</div>
                </div>
              </div>

              <div className="badge-metadata-grid">
                <div className="badge-meta-item">
                  <span className="label">Matrícula / Registro</span>
                  <span className="value">{registrationNumber || 'MAT-84920'}</span>
                </div>
                <div className="badge-meta-item">
                  <span className="label">Situação</span>
                  <span className="value" style={{ color: '#34d399' }}>● Ativo</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ================= COLUNA DIREITA: DADOS CADASTRAIS ================= */}
          <main className="profile-content-col">
            {/* Seção 1: Dados Pessoais e Documentos */}
            <div className="profile-section-card">
              <div className="profile-section-header">
                <div className="section-icon-wrap">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="section-title">Dados Pessoais e Identificação</h2>
                  <span className="section-subtitle">Informações preenchidas durante o cadastro inicial</span>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">
                  Nome Completo
                  <span className="profile-field-badge">Obrigatório</span>
                </label>
                <div className="profile-input-wrapper">
                  <User size={18} className="profile-input-icon" />
                  <input
                    type="text"
                    className="profile-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              <div className="profile-form-grid-2">
                <div className="profile-field-group">
                  <label className="profile-field-label">CPF</label>
                  <div className="profile-input-wrapper">
                    <CreditCard size={18} className="profile-input-icon" />
                    <input
                      type="text"
                      className="profile-input"
                      value={cpf}
                      onChange={handleCpfChange}
                      maxLength={14}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Telefone / WhatsApp</label>
                  <div className="profile-input-wrapper">
                    <Phone size={18} className="profile-input-icon" />
                    <input
                      type="text"
                      className="profile-input"
                      value={phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      placeholder="(11) 90000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">E-mail Institucional</label>
                <div className="profile-input-wrapper">
                  <Mail size={18} className="profile-input-icon" />
                  <input
                    type="email"
                    className="profile-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@saude.gov.br"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Atuação na UBS e SUS */}
            <div className="profile-section-card">
              <div className="profile-section-header">
                <div className="section-icon-wrap" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                  <Hospital size={18} />
                </div>
                <div>
                  <h2 className="section-title">Lotação e Função na Rede de Saúde</h2>
                  <span className="section-subtitle">Vínculo institucional do operador com a Unidade Básica</span>
                </div>
              </div>

              <div className="profile-form-grid-2">
                <div className="profile-field-group">
                  <label className="profile-field-label">Função na UBS</label>
                  <div className="profile-input-wrapper">
                    <Briefcase size={18} className="profile-input-icon" />
                    <select
                      className="profile-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="Agente de Saúde">Agente Comunitário de Saúde (ACS)</option>
                      <option value="Médico(a) de Família">Médico(a) de Família e Comunidade</option>
                      <option value="Enfermeiro(a)">Enfermeiro(a) Chefe</option>
                      <option value="Recepcionista">Recepcionista / Acolhimento</option>
                      <option value="Técnico(a) de Enfermagem">Técnico(a) de Enfermagem</option>
                      <option value="Cirurgião-Dentista">Cirurgião-Dentista</option>
                      <option value="Coordenador(a) de UBS">Coordenador(a) Geral de UBS</option>
                    </select>
                    <ChevronDown size={18} className="profile-select-arrow" />
                  </div>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Matrícula / Registro Profissional</label>
                  <div className="profile-input-wrapper">
                    <BadgeCheck size={18} className="profile-input-icon" />
                    <input
                      type="text"
                      className="profile-input"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="ex: ACS-84920 ou CRM-12345"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Unidade Básica de Saúde (Posto)</label>
                <div className="profile-input-wrapper">
                  <Hospital size={18} className="profile-input-icon" />
                  <select
                    className="profile-select"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  >
                    <option value="UBS Central 01">UBS Central 01 (Posto Principal)</option>
                    <option value="UBS Centro - Dr. José Silva">UBS Centro - Dr. José Silva</option>
                    <option value="UBS Jardim das Flores">UBS Jardim das Flores</option>
                    <option value="UBS Vila Esperança">UBS Vila Esperança</option>
                    <option value="UBS São Francisco">UBS São Francisco</option>
                    <option value="UBS Santa Rita de Cássia">UBS Santa Rita de Cássia</option>
                  </select>
                  <ChevronDown size={18} className="profile-select-arrow" />
                </div>
              </div>
            </div>

            {/* Seção 3: Senha e Segurança */}
            <div className="profile-section-card">
              <div className="profile-section-header">
                <div className="section-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <KeyRound size={18} />
                </div>
                <div>
                  <h2 className="section-title">Segurança e Senha de Acesso</h2>
                  <span className="section-subtitle">Deixe em branco caso não queira alterar a senha atual</span>
                </div>
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Senha Atual</label>
                <div className="profile-input-wrapper">
                  <Lock size={18} className="profile-input-icon" />
                  <input
                    type="password"
                    className="profile-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual para confirmar"
                  />
                </div>
              </div>

              <div className="profile-form-grid-2">
                <div className="profile-field-group">
                  <label className="profile-field-label">Nova Senha</label>
                  <div className="profile-input-wrapper">
                    <Lock size={18} className="profile-input-icon" />
                    <input
                      type="password"
                      className="profile-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Confirmar Nova Senha</label>
                  <div className="profile-input-wrapper">
                    <Lock size={18} className="profile-input-icon" />
                    <input
                      type="password"
                      className="profile-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Ações */}
            <div className="profile-actions-bar">
              <button
                type="button"
                className="btn-profile-cancel"
                onClick={() => onNavigate('dashboard')}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-profile-save"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span>Salvando...</span>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Salvar Alterações do Perfil</span>
                  </>
                )}
              </button>
            </div>
          </main>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
