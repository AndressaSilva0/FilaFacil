import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Search,
  Tv,
  BarChart3,
  Clock,
  LogOut,
  UserCircle2,
  Maximize2,
  Minimize2,
  Menu,
  PanelLeftClose,
  PanelLeft,
  HeartHandshake,
  UserCog,
  Camera,
} from 'lucide-react';
import Logo from './Logo';
import type { UserProfile } from '../pages/ProfilePage';
import '../styles/layout.css';

export type InternalScreen =
  | 'dashboard'
  | 'add-queue'
  | 'queue-list'
  | 'tv-panel'
  | 'statistics'
  | 'history'
  | 'profile';

interface AppLayoutProps {
  currentScreen: InternalScreen;
  onNavigate: (screen: InternalScreen) => void;
  onLogout: () => void;
  userProfile?: UserProfile;
  children: React.ReactNode;
}

const navItems: { id: InternalScreen; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Início (Dashboard)', icon: <LayoutDashboard size={18} /> },
  { id: 'add-queue', label: 'Adicionar na Fila', icon: <UserPlus size={18} /> },
  { id: 'queue-list', label: 'Consultar Fila', icon: <Search size={18} /> },
  { id: 'tv-panel', label: 'Painel de Chamada', icon: <Tv size={18} /> },
  { id: 'statistics', label: 'Estatísticas', icon: <BarChart3 size={18} /> },
  { id: 'history', label: 'Histórico', icon: <Clock size={18} /> },
  { id: 'profile', label: 'Meu Perfil', icon: <UserCog size={18} /> },
];

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentScreen,
  onNavigate,
  onLogout,
  userProfile,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fecha menu de perfil ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const profile = userProfile || {
    name: 'Hiago Zavarize',
    role: 'Agente de Saúde',
    unit: 'UBS Central 01',
    email: 'hiago.zavarize@saude.gov.br',
    cpf: '429.810.378-15',
    phone: '(11) 98765-4321',
    registrationNumber: 'ACS-2024-089',
    avatarUrl: '/images/avatars/avatar-male-agent.jpg',
  };

  // Sincroniza estado com o evento do navegador (ex: F11 ou ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Erro ao ativar tela cheia:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error('Erro ao sair da tela cheia:', err);
        });
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="app-layout">
      {/* ================= HEADER SUPERIOR (LARGURA TOTAL) ================= */}
      <header className="top-header">
        <div className="top-header-left">
          {/* 1. Área da Marca e Controle do Menu Lateral */}
          <div className="top-header-brand">
            <button
              className="btn-header-icon"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
              aria-label={isSidebarCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
            >
              {isSidebarCollapsed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
            </button>

            <div
              className="header-logo-container"
              onClick={isSidebarCollapsed ? toggleSidebar : undefined}
              style={{ cursor: isSidebarCollapsed ? 'pointer' : 'default' }}
              title={isSidebarCollapsed ? 'FilaFácil UBS (Clique para expandir menu)' : 'FilaFácil UBS'}
            >
              <Logo
                variant="white"
                size="sm"
                iconOnly={isSidebarCollapsed}
                showSubtitle={false}
              />
            </div>
          </div>

          {/* Divisor vertical claro separando a Marca/Menu do Módulo */}
          <div className="header-vertical-divider" />

          {/* 2. Badge do Módulo Ativo: Acolhimento & Triagem Humanizada */}
          <div className="header-module-badge">
            <div className="module-badge-icon">
              <HeartHandshake size={16} />
            </div>
            <div className="module-badge-text">
              <span className="module-badge-tag">Módulo Operacional</span>
              <span className="module-badge-title">Acolhimento &amp; Triagem Humanizada</span>
            </div>
          </div>
        </div>

        <div className="top-header-center">
          <div className="header-badge-unit">
            <span className="header-badge-dot"></span>
            Posto Ativo: UBS Central 01
          </div>
        </div>

        <div className="top-header-right">
          {/* Botão de Tela Cheia */}
          <button
            className="btn-header-icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia (Esc)' : 'Entrar em Tela Cheia (F11)'}
            aria-label={isFullscreen ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Botão e Menu Dropdown do Perfil (Ao clicar na bolinha) */}
          <div className="header-user-menu-wrapper" ref={profileMenuRef}>
            <button
              type="button"
              className="header-user-btn"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              title="Meu Perfil e Opções da Conta (Clique para abrir opções)"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="header-user-info">
                <div className="header-user-name">{profile.name}</div>
                <div className="header-user-role">{profile.role}</div>
              </div>

              <div className="header-avatar">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="header-avatar-img"
                  />
                ) : (
                  <UserCircle2 size={24} />
                )}
              </div>
            </button>

            {/* Dropdown Menu com Opção de Editar Perfil */}
            {isProfileMenuOpen && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="profile-dropdown-avatar-img"
                      />
                    ) : (
                      <UserCircle2 size={38} color="#2563eb" />
                    )}
                  </div>
                  <div className="profile-dropdown-info">
                    <span className="profile-dropdown-name">{profile.name}</span>
                    <span className="profile-dropdown-role">{profile.role}</span>
                    <span className="profile-dropdown-unit">{profile.unit}</span>
                  </div>
                </div>

                <div className="profile-dropdown-divider" />

                <div className="profile-dropdown-actions">
                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigate('profile');
                    }}
                  >
                    <UserCog size={16} color="#2563eb" />
                    <span>Editar Meu Perfil</span>
                    <span className="dropdown-action-tag">Acessar</span>
                  </button>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigate('profile');
                    }}
                  >
                    <Camera size={16} color="#059669" />
                    <span>Alterar Foto de Perfil</span>
                  </button>
                </div>

                <div className="profile-dropdown-divider" />

                <div className="profile-dropdown-footer">
                  <button
                    type="button"
                    className="profile-dropdown-logout-btn"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= CORPO COM SIDEBAR E CONTEÚDO ================= */}
      <div className="app-body">
        {/* Sidebar fixa abaixo do header */}
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div>
            <div className="sidebar-nav-label">Navegação Operacional</div>

            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-nav-item ${currentScreen === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  <span className="nav-text">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="sidebar-footer">
            <button
              className="sidebar-collapse-toggle-btn"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
              <span className="toggle-text">Recolher Menu</span>
            </button>

            <button
              className="sidebar-logout-btn"
              onClick={onLogout}
              title={isSidebarCollapsed ? 'Sair do sistema' : undefined}
            >
              <LogOut size={18} />
              <span className="logout-text">Sair</span>
            </button>
          </div>
        </aside>

        {/* Área de conteúdo principal com margem dinâmica */}
        <main className={`main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
