import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Download,
  CheckCircle2,
  UserX,
  Eye,
  Printer,
  FileSpreadsheet,
  Building2,
  Timer,
  Clock,
  Stethoscope,
  Smile,
  Baby,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import '../styles/history.css';

interface HistoryPageProps {
  onNavigate: (screen: InternalScreen) => void;
}

interface HistoryRecord {
  id: string;
  code: string;
  name: string;
  cpf: string;
  date: string;
  time: string;
  specialty: string;
  specialtyIcon: 'clinico' | 'pediatria' | 'ginecologia' | 'odonto';
  room: string;
  doctor: string;
  waitTime: string;
  isWaitHigh: boolean;
  duration: string;
  status: 'Atendido' | 'Ausente';
  cid?: string;
}

const mockHistoryRecords: HistoryRecord[] = [
  {
    id: 'h1',
    code: 'C012',
    name: 'Ana Paula Souza',
    cpf: '334.***.***-77',
    date: '24/10/2026',
    time: '09:45',
    specialty: 'Ginecologia',
    specialtyIcon: 'ginecologia',
    room: 'Sala 03',
    doctor: 'Dra. Fernanda Lopes',
    waitTime: '18 min',
    isWaitHigh: false,
    duration: '22 min',
    status: 'Atendido',
    cid: 'Z01.4 — Exame ginecológico de rotina',
  },
  {
    id: 'h2',
    code: 'A121',
    name: 'Marcos Vinicius Pereira',
    cpf: '542.***.***-19',
    date: '24/10/2026',
    time: '09:20',
    specialty: 'Clínico Geral',
    specialtyIcon: 'clinico',
    room: 'Sala 02',
    doctor: 'Dra. Mariana Vasconcellos',
    waitTime: '12 min',
    isWaitHigh: false,
    duration: '15 min',
    status: 'Atendido',
    cid: 'I10 — Hipertensão essencial primária',
  },
  {
    id: 'h3',
    code: 'A122',
    name: 'Roberto Ferreira',
    cpf: '651.***.***-23',
    date: '24/10/2026',
    time: '08:50',
    specialty: 'Clínico Geral',
    specialtyIcon: 'clinico',
    room: 'Sala 02',
    doctor: 'Dra. Mariana Vasconcellos',
    waitTime: '35 min',
    isWaitHigh: true,
    duration: '—',
    status: 'Ausente',
  },
  {
    id: 'h4',
    code: 'B044',
    name: 'Gabriel Martins Ribeiro',
    cpf: '109.***.***-88',
    date: '24/10/2026',
    time: '08:35',
    specialty: 'Pediatria',
    specialtyIcon: 'pediatria',
    room: 'Sala 01',
    doctor: 'Dr. Marcos Albuquerque',
    waitTime: '15 min',
    isWaitHigh: false,
    duration: '20 min',
    status: 'Atendido',
    cid: 'J00 — Nasofaringite aguda (resfriado comum)',
  },
  {
    id: 'h5',
    code: 'D007',
    name: 'Clara Beatriz Farias',
    cpf: '882.***.***-34',
    date: '24/10/2026',
    time: '08:10',
    specialty: 'Odontologia',
    specialtyIcon: 'odonto',
    room: 'Sala 04',
    doctor: 'Dr. Ricardo Mendes',
    waitTime: '14 min',
    isWaitHigh: false,
    duration: '30 min',
    status: 'Atendido',
    cid: 'K02.1 — Cárie da dentina',
  },
  {
    id: 'h6',
    code: 'A119',
    name: 'Sandra Helena Castro',
    cpf: '401.***.***-02',
    date: '23/10/2026',
    time: '16:40',
    specialty: 'Clínico Geral',
    specialtyIcon: 'clinico',
    room: 'Sala 02',
    doctor: 'Dra. Mariana Vasconcellos',
    waitTime: '11 min',
    isWaitHigh: false,
    duration: '18 min',
    status: 'Atendido',
    cid: 'M54.5 — Dor lombar baixa',
  },
];

export const HistoryPage: React.FC<HistoryPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'Atendido' | 'Ausente'>('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('hoje');
  const [historyDate, setHistoryDate] = useState('2026-10-24');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const filteredRecords = mockHistoryRecords.filter((item) => {
    if (statusTab !== 'ALL' && item.status !== statusTab) return false;
    if (specialtyFilter !== 'ALL' && item.specialty !== specialtyFilter) return false;
    if (roomFilter !== 'ALL' && item.room !== roomFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.cpf.includes(term) ||
        item.doctor.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="history-page">
      {/* ================= HEADER ================= */}
      <header className="history-header-row">
        <div className="history-header-left">
          <div className="history-breadcrumb-row">
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', color: '#1d4ed8', textTransform: 'uppercase' }}>
              AUDITORIA &amp; REGISTROS CLÍNICOS
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 999, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
              • Base Consolidada
            </span>
          </div>

          <h1 className="page-title" style={{ margin: 0 }}>
            Histórico de Atendimentos
          </h1>

          <p className="page-subtitle" style={{ margin: '0.15rem 0 0' }}>
            Consulta retroativa de pacientes atendidos, tempos de ciclo, ausências e prontuários da unidade.
          </p>
        </div>

        <div className="history-header-actions">
          <button
            className="btn-export-history"
            onClick={() => alert('Exportando relatório consolidado em formato CSV/Excel...')}
          >
            <Download size={16} />
            Exportar Relatório (CSV)
          </button>
        </div>
      </header>

      {/* ================= 4 STAT CARDS ================= */}
      <div className="history-stats-grid">
        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Atendimentos Concluídos</div>
              <div className="history-stat-value">142</div>
            </div>
            <div className="history-stat-icon green">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#16a34a' }}>95.4% comparecimento</span>
            <span style={{ color: '#64748b' }}>hoje</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Tempo Médio de Espera</div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="history-stat-value">15</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', marginLeft: '0.25rem' }}>min</span>
              </div>
            </div>
            <div className="history-stat-icon mint">
              <Timer size={22} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#16a34a' }}>Meta &lt; 20 min</span>
            <span style={{ color: '#64748b' }}>excelente fluxo</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Faltas / Ausências</div>
              <div className="history-stat-value red">06</div>
            </div>
            <div className="history-stat-icon red">
              <UserX size={22} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#dc2626' }}>4.2% do total</span>
            <span style={{ color: '#64748b' }}>rechamados</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Consultórios Ativos</div>
              <div className="history-stat-value">04</div>
            </div>
            <div className="history-stat-icon blue">
              <Building2 size={22} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#2563eb' }}>4 especialidades</span>
            <span style={{ color: '#64748b' }}>100% capacidade</span>
          </div>
        </div>
      </div>

      {/* ================= CARD DE FILTROS ================= */}
      <div className="history-filters-card">
        <div className="history-filters-row-1">
          <div className="history-search-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por paciente, CPF, Cartão SUS ou código da senha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="history-select"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="ALL">Todas as Especialidades</option>
            <option value="Clínico Geral">Clínico Geral</option>
            <option value="Pediatria">Pediatria</option>
            <option value="Ginecologia">Ginecologia</option>
            <option value="Odontologia">Odontologia</option>
          </select>

          <select
            className="history-select"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
          >
            <option value="ALL">Todos os Consultórios</option>
            <option value="Sala 01">Sala 01</option>
            <option value="Sala 02">Sala 02</option>
            <option value="Sala 03">Sala 03</option>
            <option value="Sala 04">Sala 04</option>
          </select>

          <div className="history-date-box">
            <Calendar size={15} color="#2563eb" />
            <input
              type="date"
              value={historyDate}
              onChange={(e) => {
                setHistoryDate(e.target.value);
                setSelectedPeriod('custom');
              }}
              className="history-date-input"
              title="Filtrar histórico por data (dia, mês e ano)"
            />
          </div>
        </div>

        <div className="history-filters-row-2">
          <div className="history-status-tabs">
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', marginRight: '0.35rem' }}>
              STATUS:
            </span>

            <button
              className={`btn-period-preset ${statusTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusTab('ALL')}
            >
              Todos (148)
            </button>

            <button
              className={`btn-period-preset ${statusTab === 'Atendido' ? 'active' : ''}`}
              onClick={() => setStatusTab('Atendido')}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block', marginRight: '0.3rem' }}></span>
              Atendidos (142)
            </button>

            <button
              className={`btn-period-preset ${statusTab === 'Ausente' ? 'active' : ''}`}
              onClick={() => setStatusTab('Ausente')}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block', marginRight: '0.3rem' }}></span>
              Ausentes (6)
            </button>
          </div>

          <div className="history-period-presets">
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', marginRight: '0.25rem' }}>
              PERÍODO:
            </span>
            {['hoje', 'ontem', '7dias', 'mes'].map((p) => {
              const labels: Record<string, string> = {
                hoje: 'Hoje',
                ontem: 'Ontem',
                '7dias': 'Últimos 7 dias',
                mes: 'Este Mês',
              };
              return (
                <button
                  key={p}
                  className={`btn-period-preset ${selectedPeriod === p ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod(p)}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TABELA DO HISTÓRICO ================= */}
      <div className="history-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="history-table">
            <thead>
              <tr>
                <th>Senha</th>
                <th>Paciente / Documento</th>
                <th>Data &amp; Hora</th>
                <th>Especialidade</th>
                <th>Consultório &amp; Médico</th>
                <th>Tempo Espera</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className={`history-ticket-badge ${item.status === 'Ausente' ? 'absent' : ''}`}>
                      {item.code}
                    </span>
                  </td>

                  <td>
                    <div className="history-patient-cell">
                      <span className="history-patient-name">{item.name}</span>
                      <span className="history-patient-doc">CPF: {item.cpf}</span>
                    </div>
                  </td>

                  <td>
                    <div className="history-time-cell">
                      <span className="history-time-bold">{item.time}</span>
                      <span className="history-date-sub">{item.date}</span>
                    </div>
                  </td>

                  <td>
                    <span className="history-spec-pill">
                      {item.specialtyIcon === 'clinico' && <Stethoscope size={13} color="#2563eb" />}
                      {item.specialtyIcon === 'pediatria' && <Baby size={13} color="#16a34a" />}
                      {item.specialtyIcon === 'ginecologia' && <Baby size={13} color="#db2777" />}
                      {item.specialtyIcon === 'odonto' && <Smile size={13} color="#7c3aed" />}
                      {item.specialty}
                    </span>
                  </td>

                  <td>
                    <div className="history-doctor-cell">
                      <span className="history-room-name">{item.room}</span>
                      <span className="history-doctor-name">{item.doctor}</span>
                    </div>
                  </td>

                  <td>
                    <span className={`history-wait-badge ${item.isWaitHigh ? 'high' : ''}`}>
                      <Clock size={13} />
                      {item.waitTime}
                    </span>
                  </td>

                  <td>
                    <span className={`history-status-pill ${item.status === 'Atendido' ? 'atendido' : 'ausente'}`}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                      {item.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div className="history-action-btns">
                      <button
                        className="btn-history-action primary"
                        title="Ver detalhes do atendimento"
                        onClick={() => setSelectedRecord(item)}
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        className="btn-history-action"
                        title="Prontuário clínico"
                        onClick={() => alert(`Visualizando prontuário eletrônico do paciente ${item.name}`)}
                      >
                        <FileSpreadsheet size={14} />
                      </button>

                      <button
                        className="btn-history-action"
                        title="Reimprimir comprovante de atendimento"
                        onClick={() => alert(`Comprovante da senha ${item.code} enviado para a impressora térmica.`)}
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="history-table-footer">
          <div>
            Mostrando <strong>1-{filteredRecords.length}</strong> de <strong>148</strong> atendimentos registrados • <span style={{ color: '#16a34a', fontWeight: 600 }}>100% auditado</span>
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

      {/* ================= MODAL DE DETALHES DO ATENDIMENTO ================= */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="history-ticket-badge" style={{ fontSize: '1rem' }}>
                  {selectedRecord.code}
                </span>
                <div>
                  <h3 className="modal-title">{selectedRecord.name}</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>CPF: {selectedRecord.cpf}</span>
                </div>
              </div>

              <button
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setSelectedRecord(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Especialidade</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{selectedRecord.specialty}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Consultório</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{selectedRecord.room}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Profissional Responsável</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{selectedRecord.doctor}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Duração da Consulta</div>
                  <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.85rem' }}>{selectedRecord.duration}</div>
                </div>
              </div>

              {selectedRecord.cid && (
                <div style={{ border: '1px solid #e2e8f0', padding: '0.85rem 1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Diagnóstico Principal (CID-10)
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                    {selectedRecord.cid}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <span>Data do Registro: <strong>{selectedRecord.date} às {selectedRecord.time}</strong></span>
                <span className={`history-status-pill ${selectedRecord.status === 'Atendido' ? 'atendido' : 'ausente'}`}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-header-outline"
                onClick={() => setSelectedRecord(null)}
              >
                Fechar
              </button>
              <button
                className="btn-header-primary"
                onClick={() => {
                  alert(`Imprimindo prontuário de ${selectedRecord.name}...`);
                  setSelectedRecord(null);
                }}
              >
                <Printer size={15} />
                Imprimir Prontuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
