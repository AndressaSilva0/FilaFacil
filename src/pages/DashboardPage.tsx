import React, { useState, useEffect, useCallback } from 'react';
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
  Tv,
  Maximize2,
  RotateCcw,
  Clock,
  TrendingUp,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import { soundService } from '../services/soundService';
import { callBroadcastService } from '../services/callBroadcastService';
import { ticketService } from '../services/ticketService';
import { statsService } from '../services/statsService';
import { socketService } from '../services/socketService';
import type { Ticket, QueueStats } from '../types';
import '../styles/dashboard.css';

interface DashboardPageProps {
  onNavigate: (screen: InternalScreen) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'aguardando' | 'chamando'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dados reais da API
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<Ticket[]>([]);
  const [lastCalled, setLastCalled] = useState<Ticket | null>(null);
  const [stats, setStats] = useState<QueueStats>({
    totalWaiting: 0,
    totalAttendedToday: 0,
    totalAbsent: 0,
    averageWaitMinutes: 0,
    punctualityPercent: 94,
    byPriority: { URGENTE: 0, PREFERENCIAL: 0, NORMAL: 0 },
  });

  const loadData = useCallback(async () => {
    try {
      const [statsData, ticketsData, waitingData] = await Promise.all([
        statsService.getDashboard().catch(() => null),
        ticketService.getTickets({ limit: 50 }).catch(() => null),
        ticketService.getWaitingQueue().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      if (ticketsData && ticketsData.tickets) {
        setTickets(ticketsData.tickets);
        const called = ticketsData.tickets.find((t) => t.status === 'CHAMANDO' || t.status === 'EM_ATENDIMENTO');
        if (called) setLastCalled(called);
      }
      if (waitingData) setWaitingQueue(waitingData);
    } catch (err) {
      console.warn('Erro ao carregar dados do dashboard:', err);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Sincronização em tempo real via Socket.IO
    const unsubCalled = socketService.onTicketCalled(() => loadData());
    const unsubStatus = socketService.onStatusUpdated(() => loadData());
    const unsubMetrics = socketService.onMetricsUpdated((m) => {
      setStats((prev) => ({ ...prev, ...m }));
      loadData();
    });
    const unsubQueue = socketService.onQueueUpdated(() => loadData());

    return () => {
      unsubCalled();
      unsubStatus();
      unsubMetrics();
      unsubQueue();
    };
  }, [loadData]);

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

  const handleCallTicket = async (ticket: Ticket) => {
    try {
      const called = await ticketService.callTicket(ticket.id, ticket.room, ticket.professional);
      setLastCalled(called);
      soundService.announceCall({
        code: called.code,
        patientName: called.patientName,
        room: called.room || 'Consultório 01',
        priority: called.priorityLabel || called.priority,
      });
      callBroadcastService.emitCall({
        code: called.code,
        patientName: called.patientName,
        room: called.room || 'Consultório 01',
        priority: called.priorityLabel || called.priority,
      });
      setToastMsg(`Chamando senha ${called.code} (${called.patientName})!`);
      setTimeout(() => setToastMsg(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao chamar senha.');
    }
  };

  const handleCallNext = async () => {
    try {
      const called = await ticketService.callNext();
      if (!called) {
        alert('Não há mais pacientes aguardando na fila.');
        return;
      }
      setLastCalled(called);
      soundService.announceCall({
        code: called.code,
        patientName: called.patientName,
        room: called.room || 'Consultório 01',
        priority: called.priorityLabel || called.priority,
      });
      callBroadcastService.emitCall({
        code: called.code,
        patientName: called.patientName,
        room: called.room || 'Consultório 01',
        priority: called.priorityLabel || called.priority,
      });
      setToastMsg(`Próximo chamado: ${called.code} (${called.patientName})!`);
      setTimeout(() => setToastMsg(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao chamar próximo.');
    }
  };

  const handleRecall = async () => {
    if (!lastCalled) return;
    try {
      const recalled = await ticketService.recall(lastCalled.id);
      soundService.announceCall({
        code: recalled.code,
        patientName: recalled.patientName,
        room: recalled.room || 'Consultório 01',
        priority: recalled.priorityLabel || recalled.priority,
      });
      setToastMsg(`Rechamando senha ${recalled.code}!`);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao rechamar.');
    }
  };

  const handleMarkAbsent = async () => {
    if (!lastCalled) return;
    try {
      await ticketService.markAbsent(lastCalled.id);
      setToastMsg(`Paciente ${lastCalled.code} marcado como ausente.`);
      setTimeout(() => setToastMsg(null), 3000);
      setLastCalled(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao marcar ausente.');
    }
  };

  const filteredItems = tickets.filter((item) => {
    if (activeTab === 'aguardando' && item.status !== 'AGUARDANDO') return false;
    if (activeTab === 'chamando' && item.status !== 'CHAMANDO' && item.status !== 'EM_ATENDIMENTO') return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.patientName.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        (item.cpf && item.cpf.includes(term)) ||
        (item.cartaoSus && item.cartaoSus.includes(term))
      );
    }
    return true;
  });

  const nextWaiting = waitingQueue[0] || null;

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
              Tempo Real • Conectado via Socket.IO
            </span>
            <span className="badge-updated">
              Atualizado às {currentTimeFormatted || '10:42'}
            </span>
          </div>

          <h1 className="page-title" style={{ marginTop: '0.2rem', marginBottom: 0 }}>
            Visão Geral do Atendimento
          </h1>

          <p className="page-subtitle" style={{ margin: '0.15rem 0 0' }}>
            Acompanhe a dinâmica de acolhimento, triagem de Manchester e fluxo das salas clínicas da UBS.
          </p>
        </div>

        <div className="dashboard-header-right">
          <button className="btn-header-outline" onClick={() => loadData()}>
            <Calendar size={15} color="#2563eb" />
            Hoje • Atualizar
          </button>

          <button className="btn-header-outline" onClick={() => onNavigate('queue-list')}>
            <SlidersHorizontal size={15} color="#64748b" />
            Fila Completa
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

      {/* ================= 4 STAT CARDS REAIS DO BACKEND ================= */}
      <div className="modern-stats-grid">
        {/* Card 1: Pessoas na Fila */}
        <div className="modern-stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-title">Pessoas na Fila</div>
              <div className="stat-card-value">{stats.totalWaiting}</div>
            </div>
            <div className="stat-card-circle-icon blue">
              <Users size={22} />
            </div>
          </div>
          <div className="stat-card-bottom-pill">
            <span className="pill-highlight green">
              <TrendingUp size={13} />
              {stats.byPriority.URGENTE} urgentes
            </span>
            <span className="pill-subtext">{stats.byPriority.PREFERENCIAL} prioritários</span>
          </div>
        </div>

        {/* Card 2: Tempo Médio de Espera */}
        <div className="modern-stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-title">Tempo Médio Espera</div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="stat-card-value">{stats.averageWaitMinutes}</span>
                <span className="stat-card-unit">min</span>
              </div>
            </div>
            <div className="stat-card-circle-icon mint">
              <Timer size={22} />
            </div>
          </div>
          <div className="stat-card-bottom-pill">
            <span className={`pill-highlight ${stats.averageWaitMinutes <= 20 ? 'green' : 'red'}`}>
              <CheckCircle2 size={13} />
              {stats.averageWaitMinutes <= 20 ? 'Dentro da meta' : 'Acima da meta'}
            </span>
            <span className="pill-subtext">meta SUS: 20 min</span>
          </div>
        </div>

        {/* Card 3: Atendidos Hoje */}
        <div className="modern-stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-title">Atendidos Hoje</div>
              <div className="stat-card-value">{stats.totalAttendedToday}</div>
            </div>
            <div className="stat-card-circle-icon blue">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="stat-card-bottom-pill">
            <span className="pill-highlight blue">
              <Clock size={13} />
              Concluídos
            </span>
            <span className="pill-subtext">{stats.totalInConsultation || 0} em atendimento</span>
          </div>
        </div>

        {/* Card 4: Faltas / Ausências */}
        <div className="modern-stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-title">Faltas / Ausências</div>
              <div className="stat-card-value red">{stats.totalAbsent || 0}</div>
            </div>
            <div className="stat-card-circle-icon red">
              <UserX size={22} />
            </div>
          </div>
          <div className="stat-card-bottom-pill">
            <span className="pill-highlight red">
              Absenteísmo
            </span>
            <span className="pill-subtext">não compareceram</span>
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
              <p>Ordenação legal do SUS: Urgência Manchester &gt; 80+ &gt; Prioritários &gt; Convencional</p>
            </div>

            <div className="queue-segmented-tabs">
              <button
                className={`queue-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Todos ({tickets.length})
              </button>
              <button
                className={`queue-tab-btn ${activeTab === 'aguardando' ? 'active' : ''}`}
                onClick={() => setActiveTab('aguardando')}
              >
                Aguardando ({tickets.filter((t) => t.status === 'AGUARDANDO').length})
              </button>
              <button
                className={`queue-tab-btn ${activeTab === 'chamando' ? 'active' : ''}`}
                onClick={() => setActiveTab('chamando')}
              >
                Chamando / Em Atendimento ({tickets.filter((t) => t.status === 'CHAMANDO' || t.status === 'EM_ATENDIMENTO').length})
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
                  <th>Horário / Chegada</th>
                  <th>Destino</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      Nenhum paciente encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span className={`badge-ticket-modern ${item.priority !== 'NORMAL' ? 'priority' : 'conventional'}`}>
                            {item.code}
                          </span>
                          <div className="patient-info-col">
                            <span className="patient-info-name">{item.patientName}</span>
                            <span className="patient-info-sus">SUS: {item.cartaoSus || 'Cadastrado'}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`pill-classification ${item.priority === 'URGENTE' ? 'blue-80' : item.priority === 'PREFERENCIAL' ? 'gestante' : 'convencional'}`}>
                          <span className="pill-dot"></span>
                          {item.priorityLabel || item.priority}
                        </span>
                      </td>

                      <td>
                        <div className="arrival-col">
                          <span>{new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="arrival-waiting-time">
                            ({Math.max(1, Math.round((Date.now() - new Date(item.createdAt).getTime()) / 60000))}m)
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="destination-col">
                          <span className="destination-room">{item.room || item.serviceLabel || 'Clínico Geral'}</span>
                          <span className="destination-doctor">{item.professional || 'A definir'}</span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-table-call"
                          onClick={() => handleCallTicket(item)}
                        >
                          <Volume2 size={13} />
                          {item.status === 'CHAMANDO' ? 'Rechamar' : 'Chamar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="queue-box-footer">
            <span>Total de {filteredItems.length} paciente(s) exibido(s)</span>
          </div>
        </div>

        {/* Coluna Direita: Sidebar com Próximo da Fila + TV */}
        <aside className="dashboard-modern-sidebar">
          {/* Card Próximo da Fila */}
          <div className="modern-next-card">
            <div className="next-card-top-row">
              <div className="next-card-label">
                <span className="live-dot"></span>
                {lastCalled ? 'Chamada Ativa' : 'Próximo da Fila'}
              </div>
              <span className="next-card-priority-badge">
                {(lastCalled || nextWaiting)?.priorityLabel || 'Prioridade Legal'}
              </span>
            </div>

            <div className="next-card-ticket-box">
              <div className="next-card-ticket-title">
                {lastCalled ? 'Senha Chamada' : 'Aguardando Chamada'}
              </div>
              <div className="next-card-ticket-code">
                {(lastCalled || nextWaiting)?.code || '---'}
              </div>
              <div>
                <span className="next-card-waiting-time">
                  <Clock size={13} />
                  {(lastCalled || nextWaiting)
                    ? `Aguardando há ${Math.max(1, Math.round((Date.now() - new Date((lastCalled || nextWaiting)!.createdAt).getTime()) / 60000))} min`
                    : 'Fila vazia'}
                </span>
              </div>
            </div>

            <div className="next-card-details-list">
              <div className="next-card-detail-item">
                <span className="label">Paciente:</span>
                <span className="value">{(lastCalled || nextWaiting)?.patientName || 'Nenhum paciente'}</span>
              </div>
              <div className="next-card-detail-item">
                <span className="label">Especialidade:</span>
                <span className="value blue">{(lastCalled || nextWaiting)?.serviceLabel || 'Clínico Geral'}</span>
              </div>
              <div className="next-card-detail-item">
                <span className="label">Consultório:</span>
                <span className="value">{(lastCalled || nextWaiting)?.room || 'Sala 01 • Consultório'}</span>
              </div>
            </div>

            <button
              className="btn-call-next-emerald"
              onClick={handleCallNext}
            >
              <Volume2 size={18} />
              Chamar Próximo (Voz &amp; TV)
            </button>

            {lastCalled && (
              <div className="next-card-sub-actions">
                <button
                  className="btn-sub-action repeat"
                  onClick={handleRecall}
                >
                  <RotateCcw size={14} />
                  Repetir
                </button>

                <button
                  className="btn-sub-action absent"
                  onClick={handleMarkAbsent}
                >
                  <UserX size={14} />
                  Marcar Ausente
                </button>
              </div>
            )}
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
              O monitor principal de áudio e vídeo na recepção está conectado ao servidor WebSocket e atualiza instantaneamente a cada chamada médica.
            </p>

            <button
              className="btn-tv-fullscreen"
              onClick={() => onNavigate('tv-panel')}
            >
              <Maximize2 size={14} />
              Abrir Visão em Tela Cheia
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;
