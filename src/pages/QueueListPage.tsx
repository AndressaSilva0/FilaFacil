import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  UserPlus,
  Calendar,
  Volume2,
  Tv,
  ExternalLink,
  RotateCcw,
  Check,
  FileSpreadsheet,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Baby,
  Stethoscope,
  Smile,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import { soundService } from '../services/soundService';
import { callBroadcastService } from '../services/callBroadcastService';
import '../styles/queue.css';

interface QueueListPageProps {
  onNavigate: (screen: InternalScreen) => void;
}

type FilterStatus = 'ALL' | 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'ATENDIDOS' | 'AUSENTES';

interface QueueTableRowModern {
  id: string;
  code: string;
  codeIndicator: 'green' | 'blue' | 'red' | 'gray';
  priorityTag: string;
  priorityTagColor: 'green' | 'blue' | 'red' | 'gray';
  name: string;
  patientBadge?: { text: string; variant: 'blue' | 'cyan' };
  docInfo: string;
  age: string;
  specialty: string;
  specialtyIcon: 'clinico' | 'odonto' | 'gineco' | 'pediatria';
  arrivalTime: string;
  waitingTimeText: string;
  waitingTimeType: 'red' | 'green' | 'gray';
  room: string;
  doctor: string;
  status: 'Aguardando' | 'Em Atendimento' | 'Atendido' | 'Ausente';
  statusClass: 'aguardando' | 'atendimento' | 'atendido' | 'ausente';
  actionType: 'call' | 'in_progress' | 'record' | 'absent';
}

const mockModernQueueList: QueueTableRowModern[] = [
  {
    id: '1',
    code: 'A123',
    codeIndicator: 'green',
    priorityTag: 'Prioritário',
    priorityTagColor: 'green',
    name: 'Maria Aparecida dos Santos',
    patientBadge: { text: '60+', variant: 'blue' },
    docInfo: 'CPF: 382.***.***-12 • Cartão SUS: 7281-9920',
    age: '68 anos',
    specialty: 'Clínico Geral',
    specialtyIcon: 'clinico',
    arrivalTime: '08:14',
    waitingTimeText: 'Espera: 28m',
    waitingTimeType: 'red',
    room: 'Consultório 01',
    doctor: 'Dra. Clara Silveira',
    status: 'Aguardando',
    statusClass: 'aguardando',
    actionType: 'call',
  },
  {
    id: '2',
    code: 'C044',
    codeIndicator: 'blue',
    priorityTag: 'Convencional',
    priorityTagColor: 'gray',
    name: 'Lucas Gabriel Ferreira',
    docInfo: 'CPF: 194.***.***-45 • Cartão SUS: 8192-3301',
    age: '32 anos',
    specialty: 'Odontologia',
    specialtyIcon: 'odonto',
    arrivalTime: '08:05',
    waitingTimeText: 'Atend. há 12m',
    waitingTimeType: 'gray',
    room: 'Consultório 03',
    doctor: 'Dr. Vanessa Prado',
    status: 'Em Atendimento',
    statusClass: 'atendimento',
    actionType: 'in_progress',
  },
  {
    id: '3',
    code: 'P019',
    codeIndicator: 'blue',
    priorityTag: 'Preferencial',
    priorityTagColor: 'blue',
    name: 'Beatriz Lima da Costa',
    patientBadge: { text: 'Gestante (28 sem)', variant: 'cyan' },
    docInfo: 'CPF: 442.***.***-89 • Cartão SUS: 3311-0941',
    age: '26 anos',
    specialty: 'Ginecologia / Pré-Natal',
    specialtyIcon: 'gineco',
    arrivalTime: '08:22',
    waitingTimeText: 'Espera: 20m',
    waitingTimeType: 'gray',
    room: 'Consultório 02',
    doctor: 'Dr. Roberto Castro',
    status: 'Aguardando',
    statusClass: 'aguardando',
    actionType: 'call',
  },
  {
    id: '4',
    code: 'C043',
    codeIndicator: 'gray',
    priorityTag: 'Convencional',
    priorityTagColor: 'gray',
    name: 'Sebastião Nogueira Lima',
    docInfo: 'CPF: 092.***.***-21 • Cartão SUS: 1044-8892',
    age: '54 anos',
    specialty: 'Clínico Geral',
    specialtyIcon: 'clinico',
    arrivalTime: '07:45',
    waitingTimeText: 'Finalizado 08:20',
    waitingTimeType: 'green',
    room: 'Consultório 01',
    doctor: 'Dra. Clara Silveira',
    status: 'Atendido',
    statusClass: 'atendido',
    actionType: 'record',
  },
  {
    id: '5',
    code: 'A122',
    codeIndicator: 'red',
    priorityTag: 'Ausente',
    priorityTagColor: 'red',
    name: 'Danilo Souza Martins',
    docInfo: 'CPF: 601.***.***-33 • Não respondeu 3 chamados',
    age: '41 anos',
    specialty: 'Pediatria (Acomp.)',
    specialtyIcon: 'pediatria',
    arrivalTime: '08:00',
    waitingTimeText: 'Chamado 08:25',
    waitingTimeType: 'red',
    room: 'Consultório 02',
    doctor: 'Dr. Roberto Castro',
    status: 'Ausente',
    statusClass: 'ausente',
    actionType: 'absent',
  },
  {
    id: '6',
    code: 'C045',
    codeIndicator: 'gray',
    priorityTag: 'Convencional',
    priorityTagColor: 'gray',
    name: 'Fernanda Ribeiro Mendes',
    docInfo: 'CPF: 812.***.***-01 • Cartão SUS: 4429-1920',
    age: '19 anos',
    specialty: 'Clínico Geral',
    specialtyIcon: 'clinico',
    arrivalTime: '08:29',
    waitingTimeText: 'Espera: 13m',
    waitingTimeType: 'gray',
    room: 'Aguardando Sala',
    doctor: 'Fila Geral',
    status: 'Aguardando',
    statusClass: 'aguardando',
    actionType: 'call',
  },
];

export const QueueListPage: React.FC<QueueListPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [queueDate, setQueueDate] = useState('2026-10-24');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleCallPatient = (params: {
    code: string;
    name: string;
    room?: string;
    priority?: string;
    isRecall?: boolean;
  }) => {
    const callData = {
      code: params.code,
      patientName: params.name,
      room: params.room || 'Consultório 01',
      priority: params.priority || 'Normal',
    };
    soundService.announceCall(callData);
    callBroadcastService.emitCall(callData);
    setToastMsg(
      `${params.isRecall ? 'Rechamando' : 'Chamando'} ${params.code} (${params.name}) para ${params.room || 'atendimento'}!`
    );
    setTimeout(() => setToastMsg(null), 4000);
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
    setToastMsg('Sinal sonoro e voz de teste emitidos com sucesso!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredList = mockModernQueueList.filter((item) => {
    // Status tab filter
    if (statusFilter === 'AGUARDANDO' && item.status !== 'Aguardando') return false;
    if (statusFilter === 'EM_ATENDIMENTO' && item.status !== 'Em Atendimento') return false;
    if (statusFilter === 'ATENDIDOS' && item.status !== 'Atendido') return false;
    if (statusFilter === 'AUSENTES' && item.status !== 'Ausente') return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.docInfo.includes(term);
      if (!matchSearch) return false;
    }

    // Specialty filter
    if (selectedSpecialty !== 'ALL' && !item.specialty.includes(selectedSpecialty)) {
      return false;
    }

    // Room filter
    if (selectedRoom !== 'ALL' && !item.room.includes(selectedRoom)) {
      return false;
    }

    return true;
  });

  return (
    <div className="queue-list-page">
      {/* Toast de notificação sonora */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#065f46',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 700,
        }}>
          <Volume2 size={20} />
          {toastMsg}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header className="queue-header-row">
        <div>
          <div className="page-breadcrumb">
            Recepção &amp; Triagem &gt; Acolhimento Diário
          </div>
          <div className="queue-title-badge-group">
            <h1 className="page-title" style={{ margin: 0 }}>
              Fila de Atendimento
            </h1>
            <span className="queue-pacientes-badge">
              <span className="dot"></span>
              24 pacientes na fila hoje
            </span>
          </div>
        </div>

        <div className="queue-header-actions">
          <button className="btn-header-outline">
            <SlidersHorizontal size={15} color="#64748b" />
            Configurar Salas
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
              placeholder="Buscar por Paciente, CPF ou Cartão SUS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="queue-select-filter"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="ALL">Todas as Especialidades</option>
            <option value="Clínico">Clínico Geral</option>
            <option value="Pediatria">Pediatria</option>
            <option value="Ginecologia">Ginecologia</option>
            <option value="Odontologia">Odontologia</option>
          </select>

          <select
            className="queue-select-filter"
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
          >
            <option value="ALL">Todos os Consultórios</option>
            <option value="Consultório 01">Consultório 01</option>
            <option value="Consultório 02">Consultório 02</option>
            <option value="Consultório 03">Consultório 03</option>
            <option value="Sala 04">Sala 04</option>
          </select>

          <div className="queue-date-pill">
            <Calendar size={15} color="#2563eb" />
            <input
              type="date"
              value={queueDate}
              onChange={(e) => setQueueDate(e.target.value)}
              className="queue-date-input"
              title="Filtrar fila por data (dia, mês e ano)"
            />
          </div>
        </div>

        {/* Sub-linha de filtros de status */}
        <div className="queue-filters-bottom-row">
          <div className="status-filter-pills">
            <span className="filter-label-prefix">FILTRAR:</span>

            <button
              className={`status-tab-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              Todos (24)
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'AGUARDANDO' ? 'active' : ''}`}
              onClick={() => setStatusFilter('AGUARDANDO')}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ca8a04' }}></span>
              Aguardando (12)
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'EM_ATENDIMENTO' ? 'active' : ''}`}
              onClick={() => setStatusFilter('EM_ATENDIMENTO')}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
              Em Atendimento (3)
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'ATENDIDOS' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ATENDIDOS')}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
              Atendidos (7)
            </button>

            <button
              className={`status-tab-pill ${statusFilter === 'AUSENTES' ? 'active' : ''}`}
              onClick={() => setStatusFilter('AUSENTES')}
            >
              <span className="pill-dot" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
              Ausentes (2)
            </button>
          </div>

          <div className="sync-status-text">
            <RotateCcw size={13} color="#16a34a" />
            <span>Sincronizado há 15s</span>
          </div>
        </div>
      </div>

      {/* ================= BANNER PRÓXIMO IMEDIATO ================= */}
      <div className="next-immediate-banner">
        <div className="next-immediate-left">
          <div className="next-immediate-icon-box">
            <Volume2 size={18} />
            <span>FILA</span>
          </div>

          <div className="next-immediate-meta">
            <div className="next-immediate-badge-row">
              <span className="badge-immediate">PRÓXIMO IMEDIATO</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Aguardando há 18 min</span>
            </div>

            <div className="next-immediate-patient">
              <span className="next-immediate-code">A123</span>
              <span className="next-immediate-name">Maria Aparecida dos Santos</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 999, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                Idoso 65+
              </span>
            </div>
          </div>
        </div>

        <div className="next-immediate-actions">
          <button className="btn-reorder" onClick={() => alert('Ordem da fila reordenada conforme prioridades clínicas.')}>
            <ArrowRightLeft size={14} />
            Reordenar
          </button>

          <button
            className="btn-call-immediate"
            onClick={() =>
              handleCallPatient({
                code: 'A123',
                name: 'Maria Aparecida dos Santos',
                room: 'Consultório 01',
                priority: 'Prioritário',
              })
            }
          >
            <Volume2 size={16} />
            Chamar Próximo (A123)
          </button>
        </div>
      </div>

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
              {filteredList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="ticket-code-modern-cell">
                      <div className={`ticket-side-indicator ${item.codeIndicator}`}></div>
                      <div className="ticket-code-text-group">
                        <span className="ticket-code-number">{item.code}</span>
                        <span className={`ticket-code-priority-label ${item.priorityTagColor}`}>
                          {item.priorityTag}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</span>
                        {item.patientBadge && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 999,
                            backgroundColor: item.patientBadge.variant === 'blue' ? '#eff6ff' : '#ecfeff',
                            color: item.patientBadge.variant === 'blue' ? '#1d4ed8' : '#0891b2',
                          }}>
                            {item.patientBadge.text}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {item.docInfo}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span style={{ color: '#334155', fontWeight: 600 }}>{item.age}</span>
                  </td>

                  <td>
                    <span className="specialty-badge-pill">
                      {item.specialtyIcon === 'clinico' && <Stethoscope size={13} color="#2563eb" />}
                      {item.specialtyIcon === 'odonto' && <Smile size={13} color="#7c3aed" />}
                      {item.specialtyIcon === 'gineco' && <Baby size={13} color="#db2777" />}
                      {item.specialtyIcon === 'pediatria' && <Baby size={13} color="#16a34a" />}
                      {item.specialty}
                    </span>
                  </td>

                  <td>
                    <div className="arrival-waiting-cell">
                      <span className="arrival-time-bold">{item.arrivalTime}</span>
                      <span className={`arrival-waiting-tag ${item.waitingTimeType}`}>
                        {item.waitingTimeText}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.room}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.doctor}</span>
                    </div>
                  </td>

                  <td>
                    <span className={`status-pill-badge ${item.statusClass}`}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                      {item.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {item.actionType === 'call' && (
                      <button
                        className="table-action-btn-circle green"
                        title="Chamar paciente"
                        onClick={() =>
                          handleCallPatient({
                            code: item.code,
                            name: item.name,
                            room: item.room,
                            priority: item.priorityTag,
                          })
                        }
                      >
                        <Volume2 size={15} />
                      </button>
                    )}

                    {item.actionType === 'in_progress' && (
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="table-action-btn-circle"
                          title="Finalizar atendimento"
                          onClick={() => showToast(`Atendimento de ${item.code} finalizado.`)}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="table-action-btn-circle"
                          title="Encaminhar para exame"
                          onClick={() => alert(`Encaminhamento de ${item.name}`)}
                        >
                          <ArrowRightLeft size={14} />
                        </button>
                      </div>
                    )}

                    {item.actionType === 'record' && (
                      <button
                        className="table-action-btn-circle blue"
                        title="Visualizar prontuário"
                        onClick={() => alert(`Prontuário médico de ${item.name}`)}
                      >
                        <FileSpreadsheet size={15} />
                      </button>
                    )}

                    {item.actionType === 'absent' && (
                      <button
                        className="table-action-btn-circle"
                        title="Rechamar paciente ausente"
                        onClick={() =>
                          handleCallPatient({
                            code: item.code,
                            name: item.name,
                            room: item.room,
                            priority: item.priorityTag,
                            isRecall: true,
                          })
                        }
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="queue-table-footer-row">
          <div>
            Mostrando <strong>1-{filteredList.length}</strong> de <strong>24</strong> pacientes • Tempo médio de espera hoje: <strong style={{ color: '#16a34a' }}>16 min</strong>
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            <button className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
            <button className={`pagination-btn ${currentPage === 2 ? 'active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
            <button className={`pagination-btn ${currentPage === 3 ? 'active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
            <button className={`pagination-btn ${currentPage === 4 ? 'active' : ''}`} onClick={() => setCurrentPage(4)}>4</button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.min(4, currentPage + 1))}
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
              Transmitindo em tempo real para TV Samsung Sala de Espera A (IP: 192.168.1.104)
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
