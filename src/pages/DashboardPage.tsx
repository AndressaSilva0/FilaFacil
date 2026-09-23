import React, { useState, useEffect } from 'react';
import {
  Users,
  Timer,
  CheckCircle2,
  UserX,
  Calendar,
  SlidersHorizontal,
  UserPlus,
  Search,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Tv,
  Maximize2,
  RotateCcw,
  Clock,
  TrendingUp,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import { soundService } from '../services/soundService';
import { callBroadcastService } from '../services/callBroadcastService';
import '../styles/dashboard.css';

interface DashboardPageProps {
  onNavigate: (screen: InternalScreen) => void;
}

interface ModernQueueRow {
  id: string;
  code: string;
  isPriority: boolean;
  name: string;
  sus: string;
  classification: string;
  classificationType: 'blue-80' | 'gestante' | 'convencional';
  arrival: string;
  elapsedTime: string;
  room: string;
  doctor: string;
  statusTab: 'aguardando' | 'triagem';
}

const mockModernQueue: ModernQueueRow[] = [
  {
    id: '1',
    code: 'P042',
    isPriority: true,
    name: 'Benedita Souza Costa',
    sus: '892.4410.2981.001',
    classification: 'Prioridade 80+',
    classificationType: 'blue-80',
    arrival: '10:18',
    elapsedTime: '(24m)',
    room: 'Consultório 02',
    doctor: 'Dr. Arnaldo Pires',
    statusTab: 'aguardando',
  },
  {
    id: '2',
    code: 'P043',
    isPriority: true,
    name: 'Juliana Mendes Rocha',
    sus: '712.9823.1102.049',
    classification: 'Gestante',
    classificationType: 'gestante',
    arrival: '10:24',
    elapsedTime: '(18m)',
    room: 'Pré-Natal / Sala 04',
    doctor: 'Enf. Mariana Leite',
    statusTab: 'aguardando',
  },
  {
    id: '3',
    code: 'C077',
    isPriority: false,
    name: 'Carlos Eduardo Silveira',
    sus: '104.9928.3840.119',
    classification: 'Convencional',
    classificationType: 'convencional',
    arrival: '10:29',
    elapsedTime: '(13m)',
    room: 'Clínica Médica 01',
    doctor: 'Dra. Camila Torres',
    statusTab: 'aguardando',
  },
  {
    id: '4',
    code: 'C078',
    isPriority: false,
    name: 'Beatriz Farias Ramos',
    sus: '239.1102.9482.022',
    classification: 'Convencional',
    classificationType: 'convencional',
    arrival: '10:33',
    elapsedTime: '(09m)',
    room: 'Triagem / Acolhimento',
    doctor: 'Guichê 03',
    statusTab: 'triagem',
  },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'aguardando' | 'triagem'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTimeFormatted(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCallTicket = (
    code: string,
    name: string,
    room = 'Consultório 02',
    priority = 'Normal'
  ) => {
    soundService.announceCall({
      code,
      patientName: name,
      room,
      priority,
    });
    callBroadcastService.emitCall({
      code,
      patientName: name,
      room,
      priority,
    });
    setToastMsg(`Chamando senha ${code} (${name}) para ${room}!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const filteredItems = mockModernQueue.filter((item) => {
    if (activeTab === 'aguardando' && item.statusTab !== 'aguardando') return false;
    if (activeTab === 'triagem' && item.statusTab !== 'triagem') return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.sus.includes(term)
      );
    }
    return true;
  });

  return (
    <div className="dashboard-page">
      {/* Toast de Notificação */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#065f46',
          color: '#ffffff',
          padding: '0.9rem 1.4rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 700,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Volume2 size={20} />
          {toastMsg}
        </div>
      )}

      {/* ================= HEADER DO DASHBOARD ================= */}
      <header className="dashboard-header-top">
        <div className="dashboard-header-left">
          <div className="dashboard-badge-row">
            <span className="badge-realtime">
              <span className="dot"></span>
              Tempo Real • Turno Manhã
            </span>
            <span className="badge-updated">
              Atualizado às {currentTimeFormatted || '10:42'}
            </span>
          </div>

          <h1 className="page-title" style={{ marginTop: '0.2rem', marginBottom: 0 }}>
            Visão Geral do Atendimento
          </h1>

          <p className="page-subtitle" style={{ margin: '0.15rem 0 0' }}>
            Olá, <strong style={{ color: '#0f2d59' }}>Hiago</strong>. Acompanhe a dinâmica de acolhimento e fluxo das salas clínicas da UBS Central 01.
          </p>
        </div>

        <div className="dashboard-header-right">
          <button className="btn-header-outline">
            <Calendar size={15} color="#2563eb" />
            Hoje, 24 de Outubro
          </button>

          <button className="btn-header-outline">
            <SlidersHorizontal size={15} color="#64748b" />
            Filtrar Salas
          </button>

          <button
            className="btn-header-primary"
            onClick={() => onNavigate('add-queue')}
          >
            <UserPlus size={16} />
            + Adicionar Paciente
          </button>
        </div>
      </header>

      {/* ================= 4 STAT CARDS MODERNOS ================= */}
      <div className="modern-stats-grid">
        {/* Card 1 */}
        <div className="modern-stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-title">Pessoas na Fila</div>
              <div className="stat-card-value">24</div>
            </div>
            <div className="stat-card-circle-icon blue">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-card-bottom-pill">
            <span className="pill-highlight green">
              <TrendingUp size={13} />
              +3 pacientes
            </span>
            <span className="pill-subtext">últimos 15 min</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="modern-stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-title">Tempo Médio Espera</div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="stat-card-value">18</span>
                <span className="stat-card-unit">min</span>
              </div>
            </div>
            <div className="stat-card-circle-icon mint">
              <Timer size={22} />
            </div>
          </div>
          <div className="stat-card-bottom-pill">
            <span className="pill-highlight green">
              <CheckCircle2 size={13} />
              Dentro da meta
            </span>
            <span className="pill-subtext">limite: 25 min</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="modern-stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-title">Atendidos Hoje</div>
              <div className="stat-card-value">86</div>
            </div>
            <div className="stat-card-circle-icon blue">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="stat-card-bottom-pill">
            <span className="pill-highlight blue">
              <Clock size={13} />
              Fluxo matutino estável
            </span>
            <span className="pill-subtext">4 consultórios</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="modern-stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-title">Faltas / Ausências</div>
              <div className="stat-card-value red">04</div>
            </div>
            <div className="stat-card-circle-icon red">
              <UserX size={22} />
            </div>
          </div>
          <div className="stat-card-bottom-pill">
            <span className="pill-highlight red">
              Taxa baixa: 4.6%
            </span>
            <span className="pill-subtext">rechamadas: 2</span>
          </div>
        </div>
      </div>

      {/* ================= GRID PRINCIPAL DASHBOARD ================= */}
      <div className="dashboard-modern-grid">
        {/* Coluna Esquerda: Tabela Fila de Atendimento */}
        <div className="queue-box-card">
          <div className="queue-box-header">
            <div className="queue-box-title-group">
              <h2>Fila de Atendimento</h2>
              <p>Classificação por triagem de risco e prioridade legal</p>
            </div>

            <div className="queue-segmented-tabs">
              <button
                className={`queue-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Todos (24)
              </button>
              <button
                className={`queue-tab-btn ${activeTab === 'aguardando' ? 'active' : ''}`}
                onClick={() => setActiveTab('aguardando')}
              >
                Aguardando (18)
              </button>
              <button
                className={`queue-tab-btn ${activeTab === 'triagem' ? 'active' : ''}`}
                onClick={() => setActiveTab('triagem')}
              >
                Em Triagem (6)
              </button>
            </div>
          </div>

          <div className="queue-box-search-bar">
            <div className="queue-search-input-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por nome do paciente, CPF ou número da senha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Senha &amp; Paciente</th>
                  <th>Classificação</th>
                  <th>Chegada</th>
                  <th>Destino</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span className={`badge-ticket-modern ${item.isPriority ? 'priority' : 'conventional'}`}>
                          {item.code}
                        </span>
                        <div className="patient-info-col">
                          <span className="patient-info-name">{item.name}</span>
                          <span className="patient-info-sus">SUS: {item.sus}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`pill-classification ${item.classificationType}`}>
                        <span className="pill-dot"></span>
                        {item.classification}
                      </span>
                    </td>

                    <td>
                      <div className="arrival-col">
                        <span>{item.arrival}</span>
                        <span className="arrival-waiting-time">{item.elapsedTime}</span>
                      </div>
                    </td>

                    <td>
                      <div className="destination-col">
                        <span className="destination-room">{item.room}</span>
                        <span className="destination-doctor">{item.doctor}</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-table-call"
                        onClick={() => handleCallTicket(item.code, item.name, item.room, item.classification)}
                      >
                        <Volume2 size={13} />
                        Chamar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="queue-box-footer">
            <span>Mostrando {filteredItems.length} de 24 pacientes em espera</span>
            <div className="pagination-arrows">
              <button className="pagination-arrow-btn">
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>1 de 6</span>
              <button className="pagination-arrow-btn">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Sidebar com Próximo da Fila + TV + Médico */}
        <aside className="dashboard-modern-sidebar">
          {/* Card Próximo da Fila */}
          <div className="modern-next-card">
            <div className="next-card-top-row">
              <div className="next-card-label">
                <span className="live-dot"></span>
                Próximo da Fila
              </div>
              <span className="next-card-priority-badge">
                Prioridade Legal
              </span>
            </div>

            <div className="next-card-ticket-box">
              <div className="next-card-ticket-title">Senha Chamada</div>
              <div className="next-card-ticket-code">A123</div>
              <div>
                <span className="next-card-waiting-time">
                  <Clock size={13} />
                  Aguardando há 11 min
                </span>
              </div>
            </div>

            <div className="next-card-details-list">
              <div className="next-card-detail-item">
                <span className="label">Paciente:</span>
                <span className="value">Benedita Souza Costa</span>
              </div>
              <div className="next-card-detail-item">
                <span className="label">Especialidade:</span>
                <span className="value blue">Clínico Geral</span>
              </div>
              <div className="next-card-detail-item">
                <span className="label">Consultório Alvo:</span>
                <span className="value">Sala 02 • Térreo</span>
              </div>
            </div>

            <button
              className="btn-call-next-emerald"
              onClick={() => handleCallTicket('A123', 'Benedita Souza Costa', 'Sala 02 • Térreo', 'Prioridade Legal')}
            >
              <Volume2 size={18} />
              Chamar Próximo (Voz &amp; TV)
            </button>

            <div className="next-card-sub-actions">
              <button
                className="btn-sub-action repeat"
                onClick={() => handleCallTicket('A123', 'Benedita Souza Costa', 'Sala 02 • Térreo', 'Prioridade Legal')}
              >
                <RotateCcw size={14} />
                Repetir
              </button>

              <button
                className="btn-sub-action absent"
                onClick={() => alert('Paciente A123 marcado como ausente.')}
              >
                <UserX size={14} />
                Marcar Ausente
              </button>
            </div>
          </div>

          {/* Card TV da Recepção */}
          <div className="modern-tv-card">
            <div className="modern-tv-card-header">
              <div className="modern-tv-icon-box">
                <Tv size={20} />
              </div>
              <div>
                <div className="modern-tv-card-title">Painel TV da Recepção</div>
                <div className="modern-tv-card-live">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                  Transmitindo em Sala de Espera
                </div>
              </div>
            </div>

            <p className="modern-tv-card-desc">
              O monitor principal de áudio e vídeo na recepção está sincronizado em tempo real.
            </p>

            <button
              className="btn-tv-fullscreen"
              onClick={() => onNavigate('tv-panel')}
            >
              <Maximize2 size={14} />
              Abrir Visão em Tela Cheia
            </button>
          </div>

          {/* Card Médico em Atendimento Ativo */}
          <div className="doctor-active-card">
            <div className="doctor-active-left">
              <div className="doctor-avatar-circle">
                CT
              </div>
              <div>
                <div className="doctor-name-text">Dra. Camila Torres</div>
                <div className="doctor-subtext">Clínica Médica • Sala 01</div>
              </div>
            </div>

            <span className="doctor-status-badge">
              Em consulta
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;
