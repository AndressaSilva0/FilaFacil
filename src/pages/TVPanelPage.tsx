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
} from 'lucide-react';
import Logo from '../components/Logo';
import type { InternalScreen } from '../components/AppLayout';
import { soundService } from '../services/soundService';
import { callBroadcastService } from '../services/callBroadcastService';
import '../styles/tv-panel.css';

interface TVPanelPageProps {
  onNavigate: (screen: InternalScreen) => void;
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
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [upcomingTickets, setUpcomingTickets] = useState<NextTicket[]>(INITIAL_UPCOMING_TICKETS);

  const [currentCall, setCurrentCall] = useState({
    code: 'A123',
    priorityType: 'normal',
    priorityLabel: 'Atendimento Convencional (Normal)',
    room: 'Sala 02 • Consultório Médico',
    patientName: 'José Maria da Silva',
    specialty: 'Clínico Geral',
    doctor: 'Dra. Mariana Vasconcellos • Triagem: 08:30',
  });

  // Escuta chamadas disparadas em tempo real de qualquer tela ou aba (Dashboard, Fila, etc.)
  useEffect(() => {
    const unsubscribe = callBroadcastService.onCall((callData) => {
      const isPref = (callData.priority || '').toLowerCase().includes('pref') ||
        (callData.priority || '').toLowerCase().includes('prior');

      setCurrentCall({
        code: callData.code,
        patientName: callData.patientName,
        room: callData.room,
        priorityLabel: callData.priority || 'Atendimento Convencional (Normal)',
        priorityType: isPref ? 'preferencial' : 'normal',
        specialty: 'Atendimento Clínico',
        doctor: 'Consultório Designado',
      });

      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 2500);

      // Reproduz o áudio na TV se habilitado
      if (soundEnabled) {
        soundService.announceCall({
          code: callData.code,
          patientName: callData.patientName,
          room: callData.room,
          priority: callData.priority,
        });
      }
    });

    return unsubscribe;
  }, [soundEnabled]);

  // Desbloqueia áudio caso o navegador exija interação prévia
  const handleUnlockAudio = async () => {
    await soundService.unlockAudio();
    setAudioUnlocked(true);
    await soundService.playChime();
  };

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
      {/* Banner de permissão de áudio para navegadores com autoplay restrito */}
      {!audioUnlocked && (
        <div
          className="tv-audio-unlock-banner"
          onClick={handleUnlockAudio}
          title="Clique para garantir liberação total do áudio e som do painel"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Volume2 size={20} />
            <strong>Painel de TV Interativo: Clique aqui para ativar o áudio e testar o sino hospitalar</strong>
          </div>
          <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Ativar Som ➜</span>
        </div>
      )}

      {/* ================= HEADER TV ================= */}
      <header className="tv-header">
        <div className="tv-header-left">
          <Logo variant="white" size="md" showSubtitle={false} />

          <div className="tv-unit-badge">
            <Building2 size={18} color="#60a5fa" />
            <span>UBS Jardim das Flores • Sala de Espera Principal</span>
          </div>
        </div>

        <div className="tv-header-right">
          <div className="tv-clock-box">
            <div className="tv-clock-time">{currentTime || '17 : 36 : 10'}</div>
            <div className="tv-clock-date">{currentDate || '17 DE SETEMBRO DE 2026'}</div>
          </div>

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

        <button className="tv-back-btn" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={16} />
          Voltar ao Sistema
        </button>
      </footer>
    </div>
  );
};

export default TVPanelPage;
