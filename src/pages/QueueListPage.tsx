import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UserPlus,
  Calendar,
  Volume2,
  Tv,
  ExternalLink,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Baby,
  Stethoscope,
  Smile,
  Download,
  UserX,
  Play,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import { soundService } from '../services/soundService';
import { callBroadcastService } from '../services/callBroadcastService';
import { ticketService } from '../services/ticketService';
import { roomService } from '../services/roomService';
import { socketService } from '../services/socketService';
import type { Ticket, Room } from '../types';
import '../styles/queue.css';

interface QueueListPageProps {
  onNavigate: (screen: InternalScreen) => void;
}

type FilterStatus = 'ALL' | 'AGUARDANDO' | 'CHAMANDO' | 'EM_ATENDIMENTO' | 'FINALIZADO' | 'AUSENTE';

export const QueueListPage: React.FC<QueueListPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [queueDate, setQueueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<Ticket[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        specialty: selectedSpecialty === 'ALL' ? undefined : selectedSpecialty,
        room: selectedRoom === 'ALL' ? undefined : selectedRoom,
        date: queueDate || undefined,
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 12,
      };

      const [ticketsData, waitingData] = await Promise.all([
        ticketService.getTickets(filters),
        ticketService.getWaitingQueue(),
      ]);

      setTickets(ticketsData.tickets);
      setTotalCount(ticketsData.total);
      setTotalPages(Math.max(1, ticketsData.totalPages));
      setWaitingQueue(waitingData);
    } catch (err) {
      console.warn('Erro ao carregar fila:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, selectedSpecialty, selectedRoom, queueDate, searchTerm, currentPage]);

  useEffect(() => {
    roomService.list().then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    loadTickets();

    const unsubCalled = socketService.onTicketCalled(() => loadTickets());
    const unsubStatus = socketService.onStatusUpdated(() => loadTickets());
    const unsubQueue = socketService.onQueueUpdated(() => loadTickets());

    return () => {
      unsubCalled();
      unsubStatus();
      unsubQueue();
    };
  }, [loadTickets]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCallPatient = async (ticket: Ticket, isRecall = false) => {
    try {
      const called = isRecall
        ? await ticketService.recall(ticket.id)
        : await ticketService.callTicket(ticket.id, ticket.room, ticket.professional);

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

      showToast(`${isRecall ? 'Rechamando' : 'Chamando'} ${called.code} (${called.patientName}) para ${called.room || 'atendimento'}!`);
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Erro ao chamar paciente.');
    }
  };

  const handleStartAttendance = async (ticket: Ticket) => {
    try {
      await ticketService.startAttendance(ticket.id);
      showToast(`Atendimento de ${ticket.code} iniciado.`);
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Erro ao iniciar atendimento.');
    }
  };

  const handleFinishAttendance = async (ticket: Ticket) => {
    try {
      await ticketService.finishAttendance(ticket.id);
      showToast(`Atendimento de ${ticket.code} finalizado.`);
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Erro ao finalizar atendimento.');
    }
  };

  const handleMarkAbsent = async (ticket: Ticket) => {
    try {
      await ticketService.markAbsent(ticket.id);
      showToast(`Paciente ${ticket.code} marcado como ausente.`);
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Erro ao marcar ausente.');
    }
  };

  const handleExportCsv = async () => {
    try {
      await ticketService.exportQueue('csv', {
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        specialty: selectedSpecialty === 'ALL' ? undefined : selectedSpecialty,
        room: selectedRoom === 'ALL' ? undefined : selectedRoom,
        date: queueDate || undefined,
        search: searchTerm.trim() || undefined,
      });
      showToast('Download do relatório CSV iniciado!');
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar lista de fila.');
    }
  };

  const handleTestSound = () => {
    const testData = {
      code: 'TESTE-01',
      patientName: 'Sinal sonoro de teste',
      room: 'Recepção Principal',
      priority: 'Normal',
    };
    soundService.announceCall(testData);
    callBroadcastService.emitCall(testData);
    showToast('Sinal sonoro e voz de teste emitidos no painel!');
  };

  const nextImmediate = waitingQueue[0] || null;

  return (
    <div className="queue-page">
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

      {/* ================= HEADER ================= */}
      <header className="queue-header-row">
        <div>
          <div className="queue-badge-live">
            <span className="dot"></span>
            Acolhimento Ativo • WebSocket Sincronizado
          </div>

          <h1 className="page-title" style={{ marginTop: '0.2rem', marginBottom: 0 }}>
            Gerenciamento da Fila de Atendimento
          </h1>

          <p className="page-subtitle" style={{ margin: '0.15rem 0 0' }}>
            Controle de fluxo de chamadas, acolhimento humanizado e triagem clínica do SUS.
          </p>
        </div>

        <div className="queue-header-actions">
          <button className="btn-header-outline" onClick={handleExportCsv} title="Exportar dados filtrados em planilha CSV">
            <Download size={15} color="#0284c7" />
            Exportar CSV
          </button>

          <button className="btn-header-outline" onClick={() => loadTickets()}>
            <RotateCcw size={15} color="#64748b" />
            Atualizar
          </button>

          <button
            className="btn-header-primary"
            onClick={() => onNavigate('add-queue')}
          >
            <UserPlus size={16} />
            + Novo Paciente
          </button>
        </div>
      </header>

      {/* ================= FILTROS MODERNOS ================= */}
      <div className="queue-filters-container">
        <div className="queue-filters-top-row">
          <div className="queue-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por Paciente, CPF ou Número da Senha..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="queue-select-filter"
            value={selectedSpecialty}
            onChange={(e) => {
              setSelectedSpecialty(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Todas as Especialidades</option>
            <option value="Clínico">Clínico Geral</option>
            <option value="Pediatria">Pediatria</option>
            <option value="Ginecologia">Ginecologia</option>
            <option value="Odontologia">Odontologia</option>
            <option value="Enfermagem">Enfermagem</option>
            <option value="Vacinação">Vacinação</option>
          </select>

          <select
            className="queue-select-filter"
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Todos os Consultórios</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>

          <div className="queue-date-pill">
            <Calendar size={15} color="#2563eb" />
            <input
              type="date"
              value={queueDate}
              onChange={(e) => {
                setQueueDate(e.target.value);
                setCurrentPage(1);
              }}
              className="queue-date-input"
              title="Filtrar fila por data (dia, mês e ano)"
            />
          </div>
        </div>

        {/* Sub-linha de filtros de status */}
        <div className="queue-filters-bottom-row">
          <div className="status-filter-pills">
            <span className="filter-label-prefix">STATUS:</span>

            <button
              className={`status-tab-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
            >
              Todos ({totalCount})
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'AGUARDANDO' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('AGUARDANDO'); setCurrentPage(1); }}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ca8a04' }}></span>
              Aguardando
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'CHAMANDO' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('CHAMANDO'); setCurrentPage(1); }}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0284c7' }}></span>
              Chamando
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'EM_ATENDIMENTO' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('EM_ATENDIMENTO'); setCurrentPage(1); }}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
              Em Atendimento
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'FINALIZADO' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('FINALIZADO'); setCurrentPage(1); }}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
              Atendidos
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'AUSENTE' ? 'active' : ''}`}
              onClick={() => { setStatusFilter('AUSENTE'); setCurrentPage(1); }}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
              Ausentes
            </button>
          </div>

          <div className="sync-status-text">
            <RotateCcw size={13} color="#16a34a" />
            <span>Sincronização em Tempo Real</span>
          </div>
        </div>
      </div>

      {/* ================= BANNER PRÓXIMO IMEDIATO ================= */}
      {nextImmediate && (
        <div className="next-immediate-banner">
          <div className="next-immediate-left">
            <div className="next-immediate-icon-box">
              <Volume2 size={18} />
              <span>FILA</span>
            </div>

            <div className="next-immediate-meta">
              <div className="next-immediate-badge-row">
                <span className="badge-immediate">PRÓXIMO IMEDIATO (LEI SUS)</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Aguardando há {Math.max(1, Math.round((Date.now() - new Date(nextImmediate.createdAt).getTime()) / 60000))} min
                </span>
              </div>

              <div className="next-immediate-patient">
                <span className="next-immediate-code">{nextImmediate.code}</span>
                <span className="next-immediate-name">{nextImmediate.patientName}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 999, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                  {nextImmediate.priorityLabel || nextImmediate.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="next-immediate-actions">
            <button
              className="btn-call-immediate"
              onClick={() => handleCallPatient(nextImmediate)}
            >
              <Volume2 size={16} />
              Chamar Próximo ({nextImmediate.code})
            </button>
          </div>
        </div>
      )}

      {/* ================= TABELA COMPLETA ================= */}
      <div className="queue-table-card-wrapper">
        <div style={{ overflowX: 'auto' }}>
          <table className="queue-interactive-table">
            <thead>
              <tr>
                <th>Senha</th>
                <th>Paciente / Documento</th>
                <th>Idade</th>
                <th>Especialidade</th>
                <th>Chegada</th>
                <th>Consultório</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Carregando fila de pacientes...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    Nenhum paciente encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                tickets.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="ticket-code-modern-cell">
                        <div className={`ticket-side-indicator ${item.priority === 'URGENTE' ? 'red' : item.priority === 'PREFERENCIAL' ? 'blue' : 'green'}`}></div>
                        <div className="ticket-code-text-group">
                          <span className="ticket-code-number">{item.code}</span>
                          <span className={`ticket-code-priority-label ${item.priority === 'URGENTE' ? 'red' : item.priority === 'PREFERENCIAL' ? 'blue' : 'green'}`}>
                            {item.priorityLabel || item.priority}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.patientName}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                          CPF: {item.cpf || 'Não informado'} • SUS: {item.cartaoSus || '---'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ color: '#334155', fontWeight: 600 }}>{item.age ? `${item.age} anos` : '---'}</span>
                    </td>

                    <td>
                      <span className="specialty-badge-pill">
                        {item.service.includes('CLINICO') && <Stethoscope size={13} color="#2563eb" />}
                        {item.service.includes('ODONTO') && <Smile size={13} color="#7c3aed" />}
                        {item.service.includes('GINECO') && <Baby size={13} color="#db2777" />}
                        {item.service.includes('PEDIA') && <Baby size={13} color="#16a34a" />}
                        {item.serviceLabel || item.service}
                      </span>
                    </td>

                    <td>
                      <div className="arrival-waiting-cell">
                        <span className="arrival-time-bold">
                          {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="arrival-waiting-tag green">
                          {Math.max(1, Math.round((Date.now() - new Date(item.createdAt).getTime()) / 60000))} min
                        </span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.room || item.serviceLabel}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.professional || 'A definir'}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`status-pill-badge ${item.status === 'AGUARDANDO' ? 'aguardando' : item.status === 'CHAMANDO' || item.status === 'EM_ATENDIMENTO' ? 'atendimento' : item.status === 'FINALIZADO' ? 'atendido' : 'ausente'}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                        {item.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {item.status === 'AGUARDANDO' && (
                          <button
                            className="table-action-btn-circle green"
                            title="Chamar paciente"
                            onClick={() => handleCallPatient(item)}
                          >
                            <Volume2 size={15} />
                          </button>
                        )}

                        {item.status === 'CHAMANDO' && (
                          <>
                            <button
                              className="table-action-btn-circle"
                              title="Rechamar no painel"
                              onClick={() => handleCallPatient(item, true)}
                            >
                              <RotateCcw size={14} />
                            </button>
                            <button
                              className="table-action-btn-circle green"
                              title="Iniciar atendimento clínico"
                              onClick={() => handleStartAttendance(item)}
                            >
                              <Play size={14} />
                            </button>
                            <button
                              className="table-action-btn-circle red"
                              title="Marcar como ausente"
                              onClick={() => handleMarkAbsent(item)}
                            >
                              <UserX size={14} />
                            </button>
                          </>
                        )}

                        {item.status === 'EM_ATENDIMENTO' && (
                          <button
                            className="table-action-btn-circle green"
                            title="Finalizar atendimento"
                            onClick={() => handleFinishAttendance(item)}
                          >
                            <Check size={14} />
                          </button>
                        )}

                        {item.status === 'AUSENTE' && (
                          <button
                            className="table-action-btn-circle"
                            title="Rechamar paciente ausente"
                            onClick={() => handleCallPatient(item, true)}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="queue-table-footer-row">
          <div>
            Mostrando <strong>{tickets.length}</strong> de <strong>{totalCount}</strong> paciente(s)
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= CARD TV DA RECEPÇÃO CONECTADO ================= */}
      <div className="tv-connected-card">
        <div className="tv-connected-left">
          <div className="tv-connected-icon">
            <Tv size={22} />
          </div>
          <div>
            <div className="tv-connected-title">Painel de TV da Recepção Conectado</div>
            <div className="tv-connected-subtitle">
              Sincronizado em tempo real com WebSocket e pronto para transmissão Smart TV sem fio.
            </div>
          </div>
        </div>

        <div className="tv-connected-actions">
          <button className="btn-header-outline" onClick={() => onNavigate('tv-panel')}>
            <ExternalLink size={15} />
            Abrir Painel em Tela Cheia
          </button>

          <button className="btn-sound-test" onClick={handleTestSound}>
            <Volume2 size={16} />
            Testar Sinal Sonoro
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueListPage;
