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

export type AppScreen =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  | InternalScreen;

const VALID_SCREENS: AppScreen[] = [
  'landing',
  'login',
  'register',
  'forgot-password',
  'dashboard',
  'add-queue',
  'queue-list',
  'tv-panel',
  'statistics',
  'history',
  'profile',
];

export const App: React.FC = () => {
  // Inicializa com base no hash da URL se existir (ex: #/dashboard ou #/tv-panel)
  const getScreenFromHash = (): AppScreen => {
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (VALID_SCREENS.includes(hash as AppScreen)) {
      return hash as AppScreen;
    }
    return 'landing';
  };

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(getScreenFromHash);

  // Perfil global do usuário operador (sincronizado com o cabeçalho e página de edição)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Hiago Zavarize',
    role: 'Agente de Saúde',
    unit: 'UBS Central 01',
    email: 'hiago.zavarize@saude.gov.br',
    cpf: '429.810.378-15',
    phone: '(11) 98765-4321',
    registrationNumber: 'ACS-2024-089',
    avatarUrl: '/images/avatars/avatar-male-agent.jpg',
  });

  // Sincroniza o hash da URL quando a tela mudar
  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    const hash = screen === 'landing' ? '' : `#/${screen}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash || window.location.pathname);
    }
  };

  // Escuta alterações de navegação (botão Voltar/Avançar do navegador)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentScreen(getScreenFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const handleLogout = () => {
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
          onLoginSuccess={() => navigateTo('dashboard')}
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
