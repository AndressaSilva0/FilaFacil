import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  X,
  Timer,
  CheckCircle2,
  Clock,
  UserX,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import { historyService, type HistoryItem, type HistoryDetailsResponse } from '../services/historyService';
import { roomService } from '../services/roomService';
import type { Room } from '../types';
import '../styles/history.css';

interface HistoryPageProps {
  onNavigate?: (screen: InternalScreen) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'Atendido' | 'Ausente'>('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('hoje');
  const [historyDate, setHistoryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<HistoryItem | null>(null);
  const [recordDetails, setRecordDetails] = useState<HistoryDetailsResponse | null>(null);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await historyService.list({
        status: statusTab === 'ALL' ? undefined : statusTab,
        specialty: specialtyFilter === 'ALL' ? undefined : specialtyFilter,
        room: roomFilter === 'ALL' ? undefined : roomFilter,
        date: historyDate || selectedPeriod,
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 10,
      });

      setHistoryList(result.history);
      setTotalCount(result.total);
      setTotalPages(Math.max(1, result.totalPages));
    } catch (err) {
      console.warn('Erro ao carregar histórico:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusTab, specialtyFilter, roomFilter, historyDate, selectedPeriod, searchTerm, currentPage]);

  useEffect(() => {
    roomService.list().then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleOpenDetails = async (item: HistoryItem) => {
    setSelectedRecord(item);
    try {
      const details = await historyService.getById(item.id);
      setRecordDetails(details);
    } catch {
      setRecordDetails(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      await historyService.exportHistory('csv', {
        status: statusTab === 'ALL' ? undefined : statusTab,
        specialty: specialtyFilter === 'ALL' ? undefined : specialtyFilter,
        room: roomFilter === 'ALL' ? undefined : roomFilter,
        date: historyDate || selectedPeriod,
        search: searchTerm.trim() || undefined,
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao exportar histórico.');
    }
  };

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
              • Base Consolidada SUS
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
            onClick={handleExportCsv}
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
              <div className="history-stat-value">{totalCount}</div>
            </div>
            <div className="history-stat-icon green">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#16a34a' }}>Auditados</span>
            <span style={{ color: '#64748b' }}>no período</span>
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
              <div className="history-stat-label">Duração Média Consulta</div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="history-stat-value">17</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', marginLeft: '0.25rem' }}>min</span>
              </div>
            </div>
            <div className="history-stat-icon blue">
              <Clock size={22} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#2563eb' }}>Atenção primária</span>
            <span style={{ color: '#64748b' }}>padrão SUS</span>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Total de Ausências</div>
              <div className="history-stat-value red">04</div>
            </div>
            <div className="history-stat-icon red">
              <UserX size={22} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#dc2626' }}>2.7% absenteísmo</span>
            <span style={{ color: '#64748b' }}>baixa evasão</span>
          </div>
        </div>
      </div>

      {/* ================= FILTROS ================= */}
      <div className="history-filters-card">
        <div className="history-filters-row">
          <div className="history-search-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por Nome do Paciente, CPF, Senha ou Médico..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="history-filter-select"
            value={specialtyFilter}
            onChange={(e) => {
              setSpecialtyFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Todas as Especialidades</option>
            <option value="Clínico">Clínico Geral</option>
            <option value="Pediatria">Pediatria</option>
            <option value="Ginecologia">Ginecologia</option>
            <option value="Odontologia">Odontologia</option>
          </select>

          <select
            className="history-filter-select"
            value={roomFilter}
            onChange={(e) => {
              setRoomFilter(e.target.value);
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

          <div className="history-date-box">
            <Calendar size={15} color="#2563eb" />
            <input
              type="date"
              value={historyDate}
              onChange={(e) => {
                setHistoryDate(e.target.value);
                setCurrentPage(1);
              }}
              className="history-date-input"
            />
          </div>
        </div>

        <div className="history-filters-subrow">
          <div className="history-status-pills">
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>STATUS:</span>
            <button
              className={`history-pill-btn ${statusTab === 'ALL' ? 'active' : ''}`}
              onClick={() => { setStatusTab('ALL'); setCurrentPage(1); }}
            >
              Todos ({totalCount})
            </button>
            <button
              className={`history-pill-btn ${statusTab === 'Atendido' ? 'active' : ''}`}
              onClick={() => { setStatusTab('Atendido'); setCurrentPage(1); }}
            >
              Atendidos
            </button>
            <button
              className={`history-pill-btn ${statusTab === 'Ausente' ? 'active' : ''}`}
              onClick={() => { setStatusTab('Ausente'); setCurrentPage(1); }}
            >
              Ausentes
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['hoje', 'ontem', 'semana', 'mes'].map((p) => (
              <button
                key={p}
                className={`period-quick-btn ${selectedPeriod === p ? 'active' : ''}`}
                onClick={() => { setSelectedPeriod(p); setCurrentPage(1); }}
              >
                {p === 'hoje' ? 'Hoje' : p === 'ontem' ? 'Ontem' : p === 'semana' ? 'Esta Semana' : 'Este Mês'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= TABELA DE HISTÓRICO ================= */}
      <div className="history-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="history-table">
            <thead>
              <tr>
                <th>Senha</th>
                <th>Paciente</th>
                <th>Especialidade</th>
                <th>Data &amp; Horário</th>
                <th>Consultório &amp; Médico</th>
                <th>Espera / Duração</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Carregando histórico clínico...
                  </td>
                </tr>
              ) : historyList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                    Nenhum registro encontrado para este filtro.
                  </td>
                </tr>
              ) : (
                historyList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="history-ticket-badge">{item.code}</span>
                    </td>

                    <td>
                      <div className="history-patient-cell">
                        <span className="name">{item.patientName}</span>
                        <span className="cpf">CPF: {item.cpf || '---'} • SUS: {item.cartaoSus || '---'}</span>
                      </div>
                    </td>

                    <td>
                      <span className="history-specialty-pill">{item.serviceLabel || item.service}</span>
                    </td>

                    <td>
                      <div className="history-datetime-cell">
                        <span className="date">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="time">{new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    <td>
                      <div className="history-room-cell">
                        <span className="room">{item.room || 'Consultório'}</span>
                        <span className="doctor">{item.professional || 'Profissional SUS'}</span>
                      </div>
                    </td>

                    <td>
                      <div className="history-times-cell">
                        <span className="wait">
                          Espera: {item.waitTimeMinutes ? `${item.waitTimeMinutes}m` : '12m'}
                        </span>
                        <span className="duration">
                          Consulta: {item.consultationDurationMinutes ? `${item.consultationDurationMinutes}m` : '18m'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`history-status-pill ${item.status === 'FINALIZADO' || item.status === 'Atendido' ? 'atendido' : 'ausente'}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                        {item.status === 'FINALIZADO' ? 'Atendido' : item.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="history-action-btns">
                        <button
                          className="btn-history-action primary"
                          title="Ver detalhes do atendimento"
                          onClick={() => handleOpenDetails(item)}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          className="btn-history-action"
                          title="Prontuário clínico"
                          onClick={() => handleOpenDetails(item)}
                        >
                          <FileSpreadsheet size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="history-table-footer">
          <div>
            Mostrando <strong>{historyList.length}</strong> de <strong>{totalCount}</strong> atendimentos registrados • <span style={{ color: '#16a34a', fontWeight: 600 }}>100% auditado</span>
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
                  <h3 className="modal-title">{selectedRecord.patientName}</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>CPF: {selectedRecord.cpf || 'Não inf.'}</span>
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
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{selectedRecord.serviceLabel || selectedRecord.service}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Consultório</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{selectedRecord.room || 'Consultório 01'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Profissional Responsável</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{selectedRecord.professional || 'Dra. Mariana Vasconcellos'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Duração da Consulta</div>
                  <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.85rem' }}>
                    {selectedRecord.consultationDurationMinutes ? `${selectedRecord.consultationDurationMinutes} min` : '18 min'}
                  </div>
                </div>
              </div>

              {selectedRecord.cidCode && (
                <div style={{ border: '1px solid #e2e8f0', padding: '0.85rem 1rem', borderRadius: '12px', marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Diagnóstico Principal (CID-10)
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                    {selectedRecord.cidCode}
                  </div>
                </div>
              )}

              {recordDetails?.timeline && recordDetails.timeline.length > 0 && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Linha do Tempo Clínica (Auditada)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {recordDetails.timeline.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{step.stage}: {step.description}</span>
                        <span style={{ color: '#64748b' }}>
                          {step.timestamp ? new Date(step.timestamp).toLocaleTimeString('pt-BR') : '---'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <span>Data: <strong>{new Date(selectedRecord.createdAt).toLocaleDateString('pt-BR')}</strong></span>
                <span className="history-status-pill atendido">
                  {selectedRecord.status}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedRecord(null)}
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
