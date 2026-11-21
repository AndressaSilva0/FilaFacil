import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AppLayout, { type InternalScreen } from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import AddToQueuePage from './pages/AddToQueuePage';
import QueueListPage from './pages/QueueListPage';
import TVPanelPage from './pages/TVPanelPage';
import StatisticsPage from './pages/StatisticsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage, { type UserProfile } from './pages/ProfilePage';
import { authService } from './services/authService';

export type AppScreen =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  | InternalScreen;

const INTERNAL_SCREENS: InternalScreen[] = [
  'dashboard',
  'add-queue',
  'queue-list',
  'statistics',
  'history',
  'profile',
];

const VALID_SCREENS: AppScreen[] = [
  'landing',
  'login',
  'register',
  'forgot-password',
  'tv-panel',
  ...INTERNAL_SCREENS,
];

export const App: React.FC = () => {
  // Obtém dados do usuário autenticado no momento (nunca mock hardcoded)
  const getUserProfileFromAuth = (): UserProfile | null => {
    const saved = authService.getCurrentUser();
    if (saved) {
      return {
        name: saved.name,
        role: saved.role,
        unit: saved.unit || 'UBS Central 01',
        email: saved.email,
        cpf: saved.cpf,
        phone: saved.phone || '',
        registrationNumber: saved.registrationNumber || '',
        avatarUrl: saved.avatarUrl || '/images/avatars/avatar-male-agent.jpg',
      };
    }
    return null;
  };

  // Inicializa com base no hash da URL se existir (com proteção de rota para telas internas)
  const getScreenFromHash = (): AppScreen => {
    const raw = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    
    // Suporte a sinônimos de navegação rápida e Smart TV (tela pública da recepção)
    if (raw === 'tv' || raw === 'tv-panel' || raw === 'painel' || raw === 'painel-tv') {
      return 'tv-panel';
    }
    if (raw === 'queue' || raw === 'fila') {
      return authService.isAuthenticated() ? 'queue-list' : 'login';
    }
    if (raw === 'add' || raw === 'nova-senha' || raw === 'add-queue') {
      return authService.isAuthenticated() ? 'add-queue' : 'login';
    }
    if (raw === 'dash' || raw === 'dashboard') {
      return authService.isAuthenticated() ? 'dashboard' : 'login';
    }

    if (VALID_SCREENS.includes(raw as AppScreen)) {
      // Bloqueio de segurança: se a rota for interna e não estiver autenticado, vai para login
      if (INTERNAL_SCREENS.includes(raw as InternalScreen) && !authService.isAuthenticated()) {
        return 'login';
      }
      return raw as AppScreen;
    }
    return 'landing';
  };

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(getScreenFromHash);

  // Perfil global do usuário operador (sempre sincronizado com a conta logada)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return getUserProfileFromAuth() || {
      name: 'Operador UBS',
      role: 'Atendente',
      unit: 'UBS Central',
      email: '',
      cpf: '',
      phone: '',
      registrationNumber: '',
      avatarUrl: '/images/avatars/avatar-male-agent.jpg',
    };
  });

  // Sincroniza o hash da URL quando a tela mudar, aplicando Auth Guard estrito
  const navigateTo = (screen: AppScreen) => {
    // Verificação de segurança: telas internas exigem login ativo
    if (INTERNAL_SCREENS.includes(screen as InternalScreen) && !authService.isAuthenticated()) {
      setCurrentScreen('login');
      window.history.pushState(null, '', '#/login');
      return;
    }

    // Ao navegar para tela interna, sempre recarrega os dados da conta ativa
    if (INTERNAL_SCREENS.includes(screen as InternalScreen)) {
      const activeUser = getUserProfileFromAuth();
      if (activeUser) {
        setUserProfile(activeUser);
      }
    }

    setCurrentScreen(screen);
    const hash = screen === 'landing' ? '' : `#/${screen}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash || window.location.pathname);
    }
  };

  // Escuta alterações de navegação (botão Voltar/Avançar do navegador ou digitação no link)
  useEffect(() => {
    const handleHashChange = () => {
      const nextScreen = getScreenFromHash();
      if (INTERNAL_SCREENS.includes(nextScreen as InternalScreen)) {
        const activeUser = getUserProfileFromAuth();
        if (activeUser) {
          setUserProfile(activeUser);
        }
      }
      setCurrentScreen(nextScreen);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUserProfile({
      name: 'Operador UBS',
      role: 'Atendente',
      unit: 'UBS Central',
      email: '',
      cpf: '',
      phone: '',
      registrationNumber: '',
      avatarUrl: '/images/avatars/avatar-male-agent.jpg',
    });
    navigateTo('landing');
  };

  return (
    <>
      {/* Telas Públicas / Autenticação */}
      {currentScreen === 'landing' && (
        <LandingPage
          onOpenSystem={() => navigateTo('login')}
          onOpenTvPanel={() => navigateTo('tv-panel')}
        />
      )}

      {currentScreen === 'login' && (
        <LoginPage
          onNavigateToRegister={() => navigateTo('register')}
          onNavigateToForgot={() => navigateTo('forgot-password')}
          onBackToHome={() => navigateTo('landing')}
          onLoginSuccess={() => {
            const saved = authService.getCurrentUser();
            if (saved) {
              setUserProfile({
                name: saved.name,
                role: saved.role,
                unit: saved.unit || 'UBS Central 01',
                email: saved.email,
                cpf: saved.cpf,
                phone: saved.phone || '',
                registrationNumber: saved.registrationNumber || '',
                avatarUrl: saved.avatarUrl || '/images/avatars/avatar-male-agent.jpg',
              });
            }
            navigateTo('dashboard');
          }}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterPage
          onNavigateToLogin={() => navigateTo('login')}
          onRegisterSuccess={() => navigateTo('login')}
        />
      )}

      {currentScreen === 'forgot-password' && (
        <ForgotPasswordPage
          onNavigateToLogin={() => navigateTo('login')}
        />
      )}

      {/* Painel de TV (Fullscreen / Dark, ideal para monitor de parede) */}
      {currentScreen === 'tv-panel' && (
        <TVPanelPage onNavigate={(screen) => navigateTo(screen)} />
      )}

      {/* Telas Internas com AppLayout (Sidebar + Top Header) */}
      {(currentScreen === 'dashboard' ||
        currentScreen === 'add-queue' ||
        currentScreen === 'queue-list' ||
        currentScreen === 'statistics' ||
        currentScreen === 'history' ||
        currentScreen === 'profile') && (
        <AppLayout
          currentScreen={currentScreen}
          onNavigate={(screen) => navigateTo(screen)}
          onLogout={handleLogout}
          userProfile={userProfile}
        >
          {currentScreen === 'dashboard' && (
            <DashboardPage onNavigate={(screen) => navigateTo(screen)} />
          )}
          {currentScreen === 'add-queue' && (
            <AddToQueuePage onNavigate={(screen) => navigateTo(screen)} />
          )}
          {currentScreen === 'queue-list' && (
            <QueueListPage onNavigate={(screen) => navigateTo(screen)} />
          )}
          {currentScreen === 'statistics' && (
            <StatisticsPage onNavigate={(screen) => navigateTo(screen)} />
          )}
          {currentScreen === 'history' && (
            <HistoryPage onNavigate={(screen) => navigateTo(screen)} />
          )}
          {currentScreen === 'profile' && (
            <ProfilePage
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
              onNavigate={(screen) => navigateTo(screen)}
            />
          )}
        </AppLayout>
      )}
    </>
  );
};

export default App;
