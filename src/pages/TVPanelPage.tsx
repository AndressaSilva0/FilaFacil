import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Building2,
  Info,
  Users,
  ArrowLeft,
  DoorOpen,
  Maximize2,
  Minimize2,
  Sparkles,
  Cast,
} from 'lucide-react';
import Logo from '../components/Logo';
import { soundService } from '../services/soundService';
import { callBroadcastService } from '../services/callBroadcastService';
import { socketService, type TicketCalledPayload } from '../services/socketService';
import CastModal from '../components/CastModal';
import { castService } from '../services/castService';
import { tvService } from '../services/tvService';
import { authService } from '../services/authService';
import { normalizeUnitName } from '../utils/units';
import '../styles/tv-panel.css';

interface TVPanelPageProps {
  onNavigate: (screen: any) => void;
}

interface NextTicket {
  code: string;
  priorityType: 'preferencial' | 'normal' | 'exames' | 'urgente';
  priorityLabel: string;
  name: string;
  details: string;
  estimatedTime: string;
}

const INITIAL_UPCOMING_TICKETS: NextTicket[] = [
  {
    code: 'B045',
    priorityType: 'preferencial',
    priorityLabel: 'PREFERENCIAL',
    name: 'Maria Oliveira Santos',
    details: 'Pediatria • Consultório 01',
    estimatedTime: 'Previsto: 10:15',
  },
  {
    code: 'A124',
    priorityType: 'normal',
    priorityLabel: 'NORMAL',
    name: 'Carlos Eduardo Ramos',
    details: 'Clínico Geral • Sala 02',
    estimatedTime: 'Previsto: 10:20',
  },
  {
    code: 'C012',
    priorityType: 'exames',
    priorityLabel: 'EXAMES',
    name: 'Ana Marcela Fontes',
    details: 'Ginecologia • Sala 03',
    estimatedTime: 'Previsto: 10:30',
  },
  {
    code: 'A125',
    priorityType: 'normal',
    priorityLabel: 'NORMAL',
    name: 'Roberto Lima Bezerra',
    details: 'Odontologia • Gabinete 01',
    estimatedTime: 'Previsto: 10:35',
  },
  {
    code: 'P046',
    priorityType: 'preferencial',
    priorityLabel: 'PREFERENCIAL',
    name: 'Sebastião Moreira Neves',
    details: 'Clínico Geral • Sala 02',
    estimatedTime: 'Previsto: 10:40',
  },
  {
    code: 'A126',
    priorityType: 'normal',
    priorityLabel: 'NORMAL',
    name: 'Juliana Paes Fagundes',
    details: 'Vacinação • Sala 05',
    estimatedTime: 'Previsto: 10:45',
  },
  {
    code: 'U003',
    priorityType: 'urgente',
    priorityLabel: 'URGÊNCIA',
    name: 'Gabriel Albuquerque Rios',
    details: 'Triagem Rápida • Sala 01',
    estimatedTime: 'Imediato',
  },
  {
    code: 'B047',
    priorityType: 'preferencial',
    priorityLabel: 'PREFERENCIAL',
    name: 'Francisca Helena Souza',
    details: 'Ginecologia • Sala 03',
    estimatedTime: 'Previsto: 10:55',
  },
];

export const TVPanelPage: React.FC<TVPanelPageProps> = ({ onNavigate }) => {
  const getActiveUnitName = () => {
    try {
      const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const params = new URLSearchParams(window.location.search || hashQuery);
      const paramUnit = params.get('unit');
      if (paramUnit) return normalizeUnitName(paramUnit);
      const user = authService.getCurrentUser();
      if (user && user.unit) return normalizeUnitName(user.unit);
    } catch {}
    return 'UBS Centro - Dr. José Silva';
  };

  const activeUnit = getActiveUnitName();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [upcomingTickets, setUpcomingTickets] = useState<NextTicket[]>(INITIAL_UPCOMING_TICKETS);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [isCasting, setIsCasting] = useState(castService.getState() === 'connected');
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(socketService.getConnected());
  const [currentCall, setCurrentCall] = useState({
    code: 'A123',
    priorityType: 'normal',
    priorityLabel: 'Atendimento Convencional (Normal)',
    room: 'Sala 02 • Consultório Médico',
    patientName: 'José Maria da Silva',
    specialty: 'Clínico Geral',
    doctor: 'Dra. Mariana Vasconcellos • Triagem: 08:30',
  });

  // Carrega e atualiza a fila de próximas senhas da UBS
  const loadUpcomingTickets = () => {
    tvService.getUpcoming().then((upcoming) => {
      if (upcoming && upcoming.length > 0) {
        setUpcomingTickets(
          upcoming.map((u: any) => ({
            code: u.code,
            priorityType: (u.priorityType || u.priority || '').toLowerCase().includes('urg')
              ? 'urgente'
              : (u.priorityType || u.priority || '').toLowerCase().includes('pref')
              ? 'preferencial'
              : 'normal',
            priorityLabel: u.priorityLabel || u.priority || 'NORMAL',
            name: u.patientName || u.name || 'Paciente',
            details: u.details || `${u.serviceLabel || u.service || 'Clínico Geral'} • Fila SUS`,
            estimatedTime: u.estimatedTime || 'Em breve',
          }))
        );
      }
    }).catch(() => {});
  };

  // Trata chamada de senha em tempo real (via Socket.IO ou Broadcast local)
  const handleIncomingCall = (callData: any) => {
    const pStr = (callData.priorityLabel || callData.priority || '').toLowerCase();
    const isPref = pStr.includes('pref') || pStr.includes('prior') || pStr.includes('80') || pStr.includes('idoso');
    const isUrg = pStr.includes('urg');

    setCurrentCall({
      code: callData.code,
      patientName: callData.patientName,
      room: callData.room || 'Consultório 01',
      priorityLabel: callData.priorityLabel || callData.priority || (isUrg ? 'Urgência Manchester' : isPref ? 'Atendimento Preferencial' : 'Atendimento Convencional (Normal)'),
      priorityType: isUrg ? 'urgente' : isPref ? 'preferencial' : 'normal',
      specialty: callData.specialty || callData.serviceLabel || 'Atendimento Clínico',
      doctor: callData.doctor || callData.professional || 'Consultório Designado',
    });

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 2500);

    // Reproduz áudio (sino + voz do sintetizador)
    if (soundEnabled) {
      soundService.announceCall({
        code: callData.code,
        patientName: callData.patientName,
        room: callData.room || 'Consultório 01',
        priority: callData.priorityLabel || callData.priority,
      });
    }

    // Atualiza lista de próximas senhas na mesma hora
    loadUpcomingTickets();
  };

  // Desbloqueia áudio silenciosamente na primeira interação do usuário com a página
  useEffect(() => {
    const unlockOnInteraction = () => {
      soundService.unlockAudio();
      window.removeEventListener('click', unlockOnInteraction);
      window.removeEventListener('keydown', unlockOnInteraction);
    };
    window.addEventListener('click', unlockOnInteraction);
    window.addEventListener('keydown', unlockOnInteraction);
    return () => {
      window.removeEventListener('click', unlockOnInteraction);
      window.removeEventListener('keydown', unlockOnInteraction);
    };
  }, []);

  useEffect(() => {
    const unsub = castService.onStateChange((state) => {
      setIsCasting(state === 'connected');
    });
    return unsub;
  }, []);

  // Carrega chamada ativa inicial e fila do banco de dados
  useEffect(() => {
    tvService.getCurrentCall().then((call) => {
      if (call) {
        setCurrentCall({
          code: call.code,
          patientName: call.patientName,
          room: call.room,
          priorityLabel: call.priorityLabel || 'Atendimento Convencional (Normal)',
          priorityType: (call.priority || '').toLowerCase().includes('urg')
            ? 'urgente'
            : (call.priority || '').toLowerCase().includes('pref')
            ? 'preferencial'
            : 'normal',
          specialty: call.serviceLabel || call.service || 'Clínico Geral',
          doctor: call.doctor || call.professional || 'Consultório Designado',
        });
      }
    }).catch(() => {});

    loadUpcomingTickets();
  }, []);

  // Escuta chamadas disparadas em tempo real de qualquer tela, TV, aba ou dispositivo via Socket.IO
  useEffect(() => {
    // 1. Escuta chamadas via WebSocket da nuvem (Render)
    const unsubSocketCall = socketService.onTicketCalled((payload: TicketCalledPayload) => {
      handleIncomingCall(payload);
    });

    // 2. Atualiza fila de espera quando houver mudanças de status no sistema
    const unsubStatus = socketService.onStatusUpdated(() => {
      loadUpcomingTickets();
    });

    const unsubQueue = socketService.onQueueUpdated(() => {
      loadUpcomingTickets();
    });

    // 3. Monitora status de conexão WebSocket
    const unsubConn = socketService.onConnectionChange((connected) => {
      setIsSocketConnected(connected);
    });

    // 4. Fallback via BroadcastChannel / localStorage (para abas no mesmo navegador)
    const unsubBroadcast = callBroadcastService.onCall((callData) => {
      handleIncomingCall(callData);
    });

    return () => {
      unsubSocketCall();
      unsubStatus();
      unsubQueue();
      unsubConn();
      unsubBroadcast();
    };
  }, [soundEnabled]);

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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      const day = now.getDate().toString().padStart(2, '0');
      const monthNames = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDate(`${day} DE ${month} DE ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ouvir a chamada atual com voz e sino
  const handleAnnounceCurrent = async () => {
    setSoundEnabled(true);
    await soundService.unlockAudio();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 2500);

    soundService.announceCall({
      code: currentCall.code,
      patientName: currentCall.patientName,
      room: currentCall.room,
      priority: currentCall.priorityLabel,
    });
  };

  // Teste de som específico do painel de TV
  const handleTestAudio = async () => {
    setSoundEnabled(true);
    await soundService.unlockAudio();
    soundService.announceCall({
      code: 'TESTE-TV',
      patientName: 'Sistema de Áudio do Painel de TV',
      room: 'Sala de Espera Principal',
      priority: 'Normal',
    });
  };

  // Chamar uma senha da lista lateral no painel
  const handleCallTicket = async (ticket: NextTicket) => {
    setSoundEnabled(true);
    await soundService.unlockAudio();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 2500);

    const detailsParts = ticket.details.split('•');
    const specialty = detailsParts[0]?.trim() || 'Consulta';
    const room = detailsParts[1]?.trim() || 'Consultório';

    const newCall = {
      code: ticket.code,
      priorityType: ticket.priorityType,
      priorityLabel: ticket.priorityLabel === 'PREFERENCIAL' ? 'Atendimento Prioritário' : 'Atendimento Convencional (Normal)',
      room,
      patientName: ticket.name,
      specialty,
      doctor: 'Dr(a). em Atendimento',
    };

    setCurrentCall(newCall);

    soundService.announceCall({
      code: ticket.code,
      patientName: ticket.name,
      room,
      priority: ticket.priorityLabel,
    });

    callBroadcastService.emitCall({
      code: ticket.code,
      patientName: ticket.name,
      room,
      priority: ticket.priorityLabel,
    });
  };

  // Chamar o próximo da fila e avançar dinamicamente a lista
  const handleCallNextInQueue = () => {
    if (upcomingTickets.length === 0) return;
    const [next, ...rest] = upcomingTickets;
    handleCallTicket(next);

    const now = new Date();
    const nextMinutes = 35 + ((upcomingTickets.length * 7) % 25);
    const newTime = new Date(now.getTime() + nextMinutes * 60000).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const recycledTicket: NextTicket = {
      ...next,
      estimatedTime: `Previsto: ${newTime}`,
    };

    setUpcomingTickets([...rest, recycledTicket]);
  };

  // Chamar um paciente específico clicado na lista lateral e avançar a fila
  const handleSelectAndCallTicket = (ticket: NextTicket) => {
    handleCallTicket(ticket);

    const now = new Date();
    const nextMinutes = 40 + ((upcomingTickets.length * 9) % 20);
    const newTime = new Date(now.getTime() + nextMinutes * 60000).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const recycledTicket: NextTicket = {
      ...ticket,
      estimatedTime: `Previsto: ${newTime}`,
    };

    setUpcomingTickets((prev) => {
      const filtered = prev.filter((t) => t.code !== ticket.code);
      return [...filtered, recycledTicket];
    });
  };

  return (
    <div className="tv-panel-container">
      {/* ================= HEADER TV ================= */}
      <header className="tv-header">
        <div className="tv-header-left">
          <Logo variant="white" size="md" showSubtitle={false} />

          <div className="tv-unit-badge">
            <Building2 size={18} color="#60a5fa" />
            <span>{activeUnit} • Sala de Espera Principal</span>
          </div>
        </div>

        <div className="tv-header-right">
          {/* Indicador de Conexão WebSocket em Tempo Real */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: isSocketConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isSocketConnected ? '#34d399' : '#f87171',
              border: `1px solid ${isSocketConnected ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
            }}
            title={isSocketConnected ? 'Conectado ao servidor WebSocket via nuvem' : 'Tentando conectar ao servidor WebSocket'}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isSocketConnected ? '#10b981' : '#ef4444',
                boxShadow: isSocketConnected ? '0 0 8px #10b981' : 'none',
              }}
            />
            <span>{isSocketConnected ? 'Ao Vivo (WebSocket)' : 'Reconectando...'}</span>
          </div>

          <div className="tv-clock-box">
            <div className="tv-clock-time">{currentTime || '17 : 36 : 10'}</div>
            <div className="tv-clock-date">{currentDate || '17 DE SETEMBRO DE 2026'}</div>
          </div>

          {/* Botão de Conexão com Smart TV / Telão */}
          <button
            className="tv-test-audio-btn"
            onClick={() => setIsCastModalOpen(true)}
            title="Conectar este painel a uma Smart TV ou Telão na sala de espera"
            style={{
              backgroundColor: isCasting ? '#059669' : 'rgba(255, 255, 255, 0.1)',
              borderColor: isCasting ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Cast size={16} />
            <span>{isCasting ? 'Smart TV Conectada' : 'Conectar Smart TV'}</span>
          </button>

          {/* Botão de teste rápido de som no cabeçalho da TV */}
          <button
            className="tv-test-audio-btn"
            onClick={handleTestAudio}
            title="Tocar sino e anúncio de teste no painel de TV"
          >
            <Volume2 size={16} />
            <span>Testar Som da TV</span>
          </button>

          <button
            className="tv-sound-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia (Esc)' : 'Tela Cheia (F11)'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <button
            className="tv-sound-btn"
            onClick={async () => {
              const nextState = !soundEnabled;
              setSoundEnabled(nextState);
              if (nextState) {
                await soundService.unlockAudio();
                await soundService.playChime();
              }
            }}
            title={soundEnabled ? 'Áudio ativado (Clique para mutar)' : 'Áudio mudo (Clique para reativar)'}
            style={{
              backgroundColor: soundEnabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              borderColor: soundEnabled ? '#10b981' : '#ef4444',
            }}
          >
            {soundEnabled ? <Volume2 size={20} color="#34d399" /> : <VolumeX size={20} color="#f87171" />}
          </button>
        </div>
      </header>

      {/* ================= GRID PRINCIPAL ================= */}
      <main className="tv-main-grid">
        {/* Card Chamada Atual (Branco com flash glow ao chamar) */}
        <section className={`tv-current-call-card ${isFlashing ? 'calling-flash' : ''}`}>
          <div className="tv-card-top-badges">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="tv-badge-current">
                <span className="tv-pulse-dot"></span>
                Chamada Atual
              </div>

              <div className="tv-badge-type">
                <span className="tv-type-dot"></span>
                {currentCall.priorityLabel}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="tv-sound-repeat-pill"
                onClick={handleAnnounceCurrent}
                title="Tocar sino e anúncio com voz em português desta senha agora"
              >
                <Volume2 size={16} />
                <span>Ouvir Chamada com Voz &amp; Sino</span>
              </button>

              <button
                className="tv-sound-repeat-pill"
                style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
                onClick={handleCallNextInQueue}
                title="Avançar e chamar a próxima senha da fila"
              >
                <Sparkles size={15} />
                <span>Próxima Senha {upcomingTickets[0] ? `(${upcomingTickets[0].code})` : ''}</span>
              </button>
            </div>
          </div>

          <div className="tv-ticket-center">
            <div className="tv-ticket-label">Senha Chamada</div>
            <div className="tv-ticket-code">{currentCall.code}</div>
            <div>
              <div className="tv-room-banner">
                <DoorOpen size={26} />
                {currentCall.room}
              </div>
            </div>
          </div>

          <div>
            <div className="tv-patient-section">
              <div>
                <div className="tv-patient-meta-label">Paciente</div>
                <div className="tv-patient-name">{currentCall.patientName}</div>
              </div>

              <div className="tv-specialty-info">
                <div className="tv-patient-meta-label">Especialidade / Profissional</div>
                <div className="tv-specialty-name">{currentCall.specialty}</div>
                <div className="tv-doctor-subtext">
                  {currentCall.doctor}
                </div>
              </div>
            </div>

            <div className="tv-instruction-bar">
              <Info size={20} className="tv-instruction-icon" />
              <span>
                Por favor, dirija-se à sala indicada portando documento oficial com foto e o Cartão SUS.
              </span>
            </div>
          </div>
        </section>

        {/* Coluna Lateral: Próximas Senhas (interativas com clique para chamar) */}
        <aside className="tv-next-queue-box">
          <div>
            <div className="tv-next-header">
              <div className="tv-next-title-group">
                <div className="tv-next-title-icon">
                  <Users size={22} />
                </div>
                <div className="tv-next-title-text">
                  Próximas<br />Senhas
                </div>
              </div>

              <div className="tv-next-count-badge">
                {upcomingTickets.length} aguardando
              </div>
            </div>

            <div className="tv-next-list">
              {upcomingTickets.slice(0, 4).map((t) => (
                <div
                  key={t.code}
                  className={`tv-next-item ${t.priorityType}`}
                  onClick={() => handleSelectAndCallTicket(t)}
                  title="Clique para chamar esta senha imediatamente no painel de TV com áudio e voz"
                >
                  <div className="tv-next-item-top">
                    <div className="tv-next-item-code-group">
                      <span className="tv-next-item-code">{t.code}</span>
                      <span className={`tv-tag-priority ${t.priorityType}`}>
                        {t.priorityLabel}
                      </span>
                    </div>
                    <span className="tv-tag-status" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700 }}>
                      <Volume2 size={13} />
                      Chamar
                    </span>
                  </div>

                  <div className="tv-next-item-name">{t.name}</div>

                  <div className="tv-next-item-meta">
                    <span>{t.details}</span>
                    <span style={{ fontWeight: 600 }}>{t.estimatedTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tv-next-footer-note">
            Mantenha seu comprovante de senha em mãos e aguarde o sinal sonoro para a próxima chamada.
          </div>
        </aside>
      </main>

      {/* ================= FOOTER / INFORMATIVO LEGAL ================= */}
      <footer className="tv-footer">
        <div className="tv-legal-info">
          <span className="tv-legal-badge">Informativo Legal</span>
          <span>
            Atenção: A ordem de atendimento prioriza casos de urgência, pessoas idosas (60+ e 80+), gestantes, lactantes, pessoas com deficiência e com crianças de colo (Lei Federal nº 10.048/2000).
          </span>
        </div>

        <button
          className="tv-back-btn"
          onClick={() => {
            if (authService.isAuthenticated()) {
              onNavigate('dashboard');
            } else {
              onNavigate('login');
            }
          }}
          title={authService.isAuthenticated() ? 'Voltar para o Painel de Atendimento' : 'Ir para a tela de Login'}
        >
          <ArrowLeft size={16} />
          {authService.isAuthenticated() ? 'Voltar ao Sistema' : 'Acessar Sistema'}
        </button>
      </footer>

      {/* Modal de Transmissão para Smart TV */}
      <CastModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
      />
    </div>
  );
};

export default TVPanelPage;
