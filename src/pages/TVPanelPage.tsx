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
} from 'lucide-react';
import Logo from '../components/Logo';
import type { InternalScreen } from '../components/AppLayout';
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

const mockNextTickets: NextTicket[] = [
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
];

export const TVPanelPage: React.FC<TVPanelPageProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const triggerChime = () => {
    // Som sintético do navegador via Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // AudioContext não suportado
    }
  };

  return (
    <div className="tv-panel-container">
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

          <button
            className="tv-sound-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia (Esc)' : 'Tela Cheia (F11)'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <button
            className="tv-sound-btn"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) triggerChime();
            }}
            title={soundEnabled ? 'Áudio ativado' : 'Áudio mudo'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>

      {/* ================= GRID PRINCIPAL ================= */}
      <main className="tv-main-grid">
        {/* Card Chamada Atual (Branco) */}
        <section className="tv-current-call-card">
          <div className="tv-card-top-badges">
            <div className="tv-badge-current">
              <span className="tv-pulse-dot"></span>
              Chamada Atual
            </div>

            <div className="tv-badge-type">
              <span className="tv-type-dot"></span>
              Atendimento Convencional (Normal)
            </div>
          </div>

          <div className="tv-ticket-center">
            <div className="tv-ticket-label">Senha Chamada</div>
            <div className="tv-ticket-code">A123</div>
            <div>
              <div className="tv-room-banner">
                <DoorOpen size={26} />
                Sala 02 • Consultório Médico
              </div>
            </div>
          </div>

          <div>
            <div className="tv-patient-section">
              <div>
                <div className="tv-patient-meta-label">Paciente</div>
                <div className="tv-patient-name">José Maria da Silva</div>
              </div>

              <div className="tv-specialty-info">
                <div className="tv-patient-meta-label">Especialidade / Profissional</div>
                <div className="tv-specialty-name">Clínico Geral</div>
                <div className="tv-doctor-subtext">
                  Dra. Mariana Vasconcellos • Triagem: 08:30
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

        {/* Coluna Lateral: Próximas Senhas */}
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
                4 aguardando
              </div>
            </div>

            <div className="tv-next-list">
              {mockNextTickets.map((t) => (
                <div key={t.code} className={`tv-next-item ${t.priorityType}`}>
                  <div className="tv-next-item-top">
                    <div className="tv-next-item-code-group">
                      <span className="tv-next-item-code">{t.code}</span>
                      <span className={`tv-tag-priority ${t.priorityType}`}>
                        {t.priorityLabel}
                      </span>
                    </div>
                    <span className="tv-tag-status">Aguardando</span>
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
