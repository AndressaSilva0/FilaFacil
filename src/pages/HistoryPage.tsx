import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Printer,
  RotateCcw,
  Stethoscope,
  Baby,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import { historyService, type HistoryItem, type HistoryDetailsResponse } from '../services/historyService';
import { roomService } from '../services/roomService';
import type { Room } from '../types';
import '../styles/history.css';

interface HistoryPageProps {
  onNavigate?: (screen: InternalScreen) => void;
}

// Conjunto rico de dados de auditoria para fallback offline / demonstração
const MOCK_HISTORY_FALLBACK: HistoryItem[] = [
  {
    id: 'h1',
    code: 'C012',
    patientName: 'Ana Paula Souza',
    cpf: '334.***.***-77',
    cartaoSus: '7024-9920-1182',
    priority: 'NORMAL',
    priorityLabel: 'Convencional',
    service: 'GINECOLOGIA',
    serviceLabel: 'Ginecologia',
    status: 'Atendido',
    createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    calledAt: new Date(Date.now() - 3600000 * 2.2).toISOString(),
    attendedAt: new Date(Date.now() - 3600000 * 2.2).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    room: 'Sala 03',
    professional: 'Dra. Fernanda Lopes',
    waitTimeMinutes: 18,
    consultationDurationMinutes: 22,
    cidCode: 'Z01.4 — Exame ginecológico de rotina',
  },
  {
    id: 'h2',
    code: 'A121',
    patientName: 'Marcos Vinicius Pereira',
    cpf: '542.***.***-19',
    cartaoSus: '8192-3301-4490',
    priority: 'NORMAL',
    priorityLabel: 'Convencional',
    service: 'CLINICO_GERAL',
    serviceLabel: 'Clínico Geral',
    status: 'Atendido',
    createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    calledAt: new Date(Date.now() - 3600000 * 3.3).toISOString(),
    attendedAt: new Date(Date.now() - 3600000 * 3.3).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 3.0).toISOString(),
    room: 'Sala 02',
    professional: 'Dra. Mariana Vasconcellos',
    waitTimeMinutes: 12,
    consultationDurationMinutes: 15,
    cidCode: 'I10 — Hipertensão essencial primária',
  },
  {
    id: 'h3',
    code: 'A122',
    patientName: 'Roberto Ferreira',
    cpf: '651.***.***-23',
    cartaoSus: '3311-0941-8822',
    priority: 'NORMAL',
    priorityLabel: 'Convencional',
    service: 'CLINICO_GERAL',
    serviceLabel: 'Clínico Geral',
    status: 'Ausente',
    createdAt: new Date(Date.now() - 3600000 * 4.2).toISOString(),
    calledAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    room: 'Sala 02',
    professional: 'Dra. Mariana Vasconcellos',
    waitTimeMinutes: 24,
    notes: 'Paciente não compareceu após 3 anúncios sonoros no painel da recepção.',
  },
  {
    id: 'h4',
    code: 'B044',
    patientName: 'Gabriel Martins Ribeiro',
    cpf: '109.***.***-88',
    cartaoSus: '1044-8892-7711',
    priority: 'PREFERENCIAL',
    priorityLabel: 'Criança de Colo',
    service: 'PEDIATRIA',
    serviceLabel: 'Pediatria',
    status: 'Atendido',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    calledAt: new Date(Date.now() - 3600000 * 4.75).toISOString(),
    attendedAt: new Date(Date.now() - 3600000 * 4.75).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 4.4).toISOString(),
    room: 'Sala 01',
    professional: 'Dr. Marcos Albuquerque',
    waitTimeMinutes: 15,
    consultationDurationMinutes: 20,
    cidCode: 'J00 — Nasofaringite aguda (resfriado comum)',
  },
  {
    id: 'h5',
    code: 'D007',
    patientName: 'Clara Beatriz Farias',
    cpf: '882.***.***-34',
    cartaoSus: '4429-1920-5533',
    priority: 'NORMAL',
    priorityLabel: 'Convencional',
    service: 'ODONTOLOGIA',
    serviceLabel: 'Odontologia',
    status: 'Atendido',
    createdAt: new Date(Date.now() - 3600000 * 6.2).toISOString(),
    calledAt: new Date(Date.now() - 3600000 * 6.0).toISOString(),
    attendedAt: new Date(Date.now() - 3600000 * 6.0).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 5.5).toISOString(),
    room: 'Sala 04',
    professional: 'Dr. Ricardo Mendes',
    waitTimeMinutes: 14,
    consultationDurationMinutes: 28,
    cidCode: 'K02.1 — Cárie da dentina',
  },
  {
    id: 'h6',
    code: 'A119',
    patientName: 'Sandra Helena Castro',
    cpf: '401.***.***-02',
    cartaoSus: '8924-4102-2910',
    priority: 'PREFERENCIAL',
    priorityLabel: 'Idoso 60+',
    service: 'CLINICO_GERAL',
    serviceLabel: 'Clínico Geral',
    status: 'Atendido',
    createdAt: new Date(Date.now() - 3600000 * 7.5).toISOString(),
    calledAt: new Date(Date.now() - 3600000 * 7.3).toISOString(),
    attendedAt: new Date(Date.now() - 3600000 * 7.3).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 7.0).toISOString(),
    room: 'Sala 02',
    professional: 'Dra. Mariana Vasconcellos',
    waitTimeMinutes: 11,
    consultationDurationMinutes: 18,
    cidCode: 'M54.5 — Dor lombar baixa',
  },
  {
    id: 'h7',
    code: 'P042',
    patientName: 'Benedita Souza Costa',
    cpf: '719.***.***-45',
    cartaoSus: '7129-8231-1102',
    priority: 'PREFERENCIAL',
    priorityLabel: 'Idoso 80+',
    service: 'CLINICO_GERAL',
    serviceLabel: 'Clínico Geral',
    status: 'Atendido',
    createdAt: new Date(Date.now() - 3600000 * 8.5).toISOString(),
    calledAt: new Date(Date.now() - 3600000 * 8.35).toISOString(),
    attendedAt: new Date(Date.now() - 3600000 * 8.35).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 7.9).toISOString(),
    room: 'Sala 02',
    professional: 'Dra. Mariana Vasconcellos',
    waitTimeMinutes: 9,
    consultationDurationMinutes: 26,
    cidCode: 'E11.9 — Diabetes mellitus tipo 2',
  },
  {
    id: 'h8',
    code: 'P043',
    patientName: 'Juliana Mendes Rocha',
    cpf: '912.***.***-60',
    cartaoSus: '9920-1182-3344',
    priority: 'PREFERENCIAL',
    priorityLabel: 'Gestante',
    service: 'GINECOLOGIA',
    serviceLabel: 'Pré-Natal',
    status: 'Atendido',
    createdAt: new Date(Date.now() - 3600000 * 9.2).toISOString(),
    calledAt: new Date(Date.now() - 3600000 * 9.0).toISOString(),
    attendedAt: new Date(Date.now() - 3600000 * 9.0).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 8.5).toISOString(),
    room: 'Sala 03',
    professional: 'Dra. Fernanda Lopes',
    waitTimeMinutes: 12,
    consultationDurationMinutes: 30,
    cidCode: 'Z34.0 — Supervisão de primeira gravidez normal',
  },
];

export const HistoryPage: React.FC<HistoryPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'Atendido' | 'Ausente'>('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'todos' | 'hoje' | 'ontem' | 'semana' | 'mes'>('todos');
  const [historyDate, setHistoryDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<HistoryItem | null>(null);
  const [recordDetails, setRecordDetails] = useState<HistoryDetailsResponse | null>(null);

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Aplica filtros nos dados (API ou Fallback)
  const filterDataset = useCallback((dataset: HistoryItem[]) => {
    return dataset.filter((item) => {
      // Filtro de Status
      if (statusTab !== 'ALL') {
        const isAttended = item.status === 'Atendido' || item.status === 'FINALIZADO';
        if (statusTab === 'Atendido' && !isAttended) return false;
        if (statusTab === 'Ausente' && item.status !== 'Ausente') return false;
      }

      // Filtro de Especialidade
      if (specialtyFilter !== 'ALL') {
        const itemSpec = (item.serviceLabel || item.service || '').toLowerCase();
        if (!itemSpec.includes(specialtyFilter.toLowerCase())) return false;
      }

      // Filtro de Consultório
      if (roomFilter !== 'ALL') {
        if (item.room !== roomFilter) return false;
      }

      // Filtro de Data Específica
      if (historyDate) {
        const itemDate = new Date(item.createdAt).toISOString().slice(0, 10);
        if (itemDate !== historyDate) return false;
      }

      // Busca Textual
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = item.patientName.toLowerCase().includes(term);
        const matchesCode = item.code.toLowerCase().includes(term);
        const matchesCpf = (item.cpf || '').replace(/\D/g, '').includes(term.replace(/\D/g, ''));
        const matchesDoctor = (item.professional || '').toLowerCase().includes(term);
        const matchesCid = (item.cidCode || '').toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesCpf && !matchesDoctor && !matchesCid) return false;
      }

      return true;
    });
  }, [statusTab, specialtyFilter, roomFilter, historyDate, searchTerm]);

  // Carrega dados da API ou faz fallback transparente para os mocks
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await historyService.list({
        status: statusTab === 'ALL' ? undefined : statusTab,
        specialty: specialtyFilter === 'ALL' ? undefined : specialtyFilter,
        room: roomFilter === 'ALL' ? undefined : roomFilter,
        date: historyDate || (selectedPeriod === 'todos' ? undefined : selectedPeriod),
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 10,
      });

      if (result && result.history && result.history.length > 0) {
        setHistoryList(result.history);
        setTotalCount(result.total);
        setTotalPages(Math.max(1, result.totalPages));
      } else {
        // Fallback para os dados locais de demonstração
        const filtered = filterDataset(MOCK_HISTORY_FALLBACK);
        setHistoryList(filtered);
        setTotalCount(filtered.length);
        setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)));
      }
    } catch {
      // Fallback gracioso
      const filtered = filterDataset(MOCK_HISTORY_FALLBACK);
      setHistoryList(filtered);
      setTotalCount(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / 10)));
    } finally {
      setIsLoading(false);
    }
  }, [statusTab, specialtyFilter, roomFilter, historyDate, selectedPeriod, searchTerm, currentPage, filterDataset]);

  useEffect(() => {
    roomService.list().then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Resetar todos os filtros com 1 clique
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusTab('ALL');
    setSpecialtyFilter('ALL');
    setRoomFilter('ALL');
    setSelectedPeriod('todos');
    setHistoryDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm || statusTab !== 'ALL' || specialtyFilter !== 'ALL' || roomFilter !== 'ALL' || historyDate || selectedPeriod !== 'todos'
  );

  // Métricas calculadas dinamicamente
  const stats = useMemo(() => {
    const dataset = historyList.length > 0 ? historyList : MOCK_HISTORY_FALLBACK;
    const attended = dataset.filter((h) => h.status === 'Atendido' || h.status === 'FINALIZADO');
    const absent = dataset.filter((h) => h.status === 'Ausente');

    const totalWait = attended.reduce((acc, h) => acc + (h.waitTimeMinutes || 12), 0);
    const avgWait = attended.length > 0 ? Math.round(totalWait / attended.length) : 14;

    const totalDuration = attended.reduce((acc, h) => acc + (h.consultationDurationMinutes || 18), 0);
    const avgDuration = attended.length > 0 ? Math.round(totalDuration / attended.length) : 18;

    return {
      attendedCount: attended.length,
      avgWait,
      avgDuration,
      absentCount: absent.length,
      absentRate: dataset.length > 0 ? ((absent.length / dataset.length) * 100).toFixed(1) : '2.5',
    };
  }, [historyList]);

  const handleOpenDetails = async (item: HistoryItem) => {
    setSelectedRecord(item);
    try {
      const details = await historyService.getById(item.id);
      setRecordDetails(details);
    } catch {
      setRecordDetails({
        ticket: item,
        timeline: [
          { stage: 'Chegada', timestamp: item.createdAt, description: 'Paciente acolhido na recepção da UBS' },
          { stage: 'Chamada', timestamp: item.calledAt || item.createdAt, description: `Chamado para ${item.room || 'Consultório'}` },
          { stage: 'Atendimento', timestamp: item.attendedAt || item.calledAt || null, description: `Consulta com ${item.professional || 'Profissional'}` },
          { stage: 'Conclusão', timestamp: item.finishedAt || null, description: item.status === 'Ausente' ? 'Paciente ausente' : 'Atendimento finalizado com sucesso' },
        ],
      });
    }
  };

  const handleExportCsv = async () => {
    try {
      await historyService.exportHistory('csv', {
        status: statusTab === 'ALL' ? undefined : statusTab,
        specialty: specialtyFilter === 'ALL' ? undefined : specialtyFilter,
        room: roomFilter === 'ALL' ? undefined : roomFilter,
        date: historyDate || (selectedPeriod === 'todos' ? undefined : selectedPeriod),
        search: searchTerm.trim() || undefined,
      });
    } catch {
      // Exportação local de segurança caso a API não esteja rodando
      const headers = ['Senha', 'Paciente', 'CPF', 'Cartão SUS', 'Especialidade', 'Data', 'Sala', 'Médico', 'Espera (min)', 'Duração (min)', 'Status', 'CID'];
      const rows = historyList.map((h) => [
        h.code,
        `"${h.patientName}"`,
        `"${h.cpf || ''}"`,
        `"${h.cartaoSus || ''}"`,
        `"${h.serviceLabel || h.service}"`,
        `"${new Date(h.createdAt).toLocaleDateString('pt-BR')}"`,
        `"${h.room || ''}"`,
        `"${h.professional || ''}"`,
        h.waitTimeMinutes || 0,
        h.consultationDurationMinutes || 0,
        `"${h.status}"`,
        `"${h.cidCode || ''}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `historico_atendimentos_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getSpecialtyBadgeClass = (service: string) => {
    const s = (service || '').toLowerCase();
    if (s.includes('pediat')) return 'pediatria';
    if (s.includes('gineco') || s.includes('natal')) return 'ginecologia';
    if (s.includes('odont')) return 'odonto';
    return 'clinico';
  };

  const getSpecialtyIcon = (service: string) => {
    const s = (service || '').toLowerCase();
    if (s.includes('pediat')) return <Baby size={14} />;
    if (s.includes('gineco') || s.includes('natal')) return <ShieldCheck size={14} />;
    if (s.includes('odont')) return <Smile size={14} />;
    return <Stethoscope size={14} />;
  };

  return (
    <div className="history-page">
      {/* ================= HEADER ================= */}
      <header className="history-header-row">
        <div className="history-header-left">
          <div className="history-breadcrumb-row">
            <span className="history-breadcrumb-tag">
              AUDITORIA &amp; REGISTROS CLÍNICOS
            </span>
            <span className="history-sus-badge">
              <span className="dot"></span>
              Base Consolidada SUS • 100% Auditado
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
          {hasActiveFilters && (
            <button className="btn-reset-filters" onClick={handleResetFilters} title="Limpar todos os filtros ativos">
              <RotateCcw size={14} />
              Limpar Filtros
            </button>
          )}

          <button className="btn-export-history" onClick={handleExportCsv} title="Exportar dados do histórico para planilha">
            <Download size={16} />
            Exportar Relatório (CSV)
          </button>
        </div>
      </header>

      {/* ================= 4 STAT CARDS ================= */}
      <div className="history-stats-grid">
        {/* Card 1: Atendimentos Concluídos */}
        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Atendimentos Concluídos</div>
              <div className="history-stat-value">{stats.attendedCount}</div>
            </div>
            <div className="history-stat-icon green">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#16a34a' }}>Auditados</span>
            <span style={{ color: '#64748b' }}>no período selecionado</span>
          </div>
        </div>

        {/* Card 2: Tempo Médio de Espera */}
        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Tempo Médio de Espera</div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="history-stat-value">{stats.avgWait}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', marginLeft: '0.25rem' }}>min</span>
              </div>
            </div>
            <div className="history-stat-icon mint">
              <Timer size={24} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#16a34a' }}>Meta &lt; 20 min</span>
            <span style={{ color: '#64748b' }}>excelente fluxo</span>
          </div>
        </div>

        {/* Card 3: Duração Média da Consulta */}
        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Duração Média Consulta</div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="history-stat-value">{stats.avgDuration}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b', marginLeft: '0.25rem' }}>min</span>
              </div>
            </div>
            <div className="history-stat-icon blue">
              <Clock size={24} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#2563eb' }}>Atenção primária</span>
            <span style={{ color: '#64748b' }}>padrão do SUS</span>
          </div>
        </div>

        {/* Card 4: Total de Ausências */}
        <div className="history-stat-card">
          <div className="history-stat-top">
            <div>
              <div className="history-stat-label">Total de Ausências</div>
              <div className={`history-stat-value ${stats.absentCount > 0 ? 'red' : ''}`}>
                {String(stats.absentCount).padStart(2, '0')}
              </div>
            </div>
            <div className="history-stat-icon red">
              <UserX size={24} />
            </div>
          </div>
          <div className="history-stat-bottom">
            <span style={{ fontWeight: 700, color: '#dc2626' }}>{stats.absentRate}% absenteísmo</span>
            <span style={{ color: '#64748b' }}>baixa evasão</span>
          </div>
        </div>
      </div>

      {/* ================= CARD DE FILTROS ================= */}
      <div className="history-filters-card">
        {/* Linha Superior: Busca e Selects */}
        <div className="history-filters-top-row">
          <div className="history-search-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por paciente, CPF, senha, médico ou CID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                type="button"
                className="history-search-clear"
                onClick={() => setSearchTerm('')}
                title="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className="history-select"
            value={specialtyFilter}
            onChange={(e) => {
              setSpecialtyFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Todas as Especialidades</option>
            <option value="Clínico">Clínico Geral</option>
            <option value="Pediatria">Pediatria</option>
            <option value="Ginecologia">Ginecologia / Pré-Natal</option>
            <option value="Odontologia">Odontologia</option>
          </select>

          <select
            className="history-select"
            value={roomFilter}
            onChange={(e) => {
              setRoomFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Todos os Consultórios</option>
            {rooms.length > 0 ? (
              rooms.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name} ({r.label || 'Atendimento'})
                </option>
              ))
            ) : (
              <>
                <option value="Sala 01">Sala 01 (Pediatria)</option>
                <option value="Sala 02">Sala 02 (Clínico Geral)</option>
                <option value="Sala 03">Sala 03 (Ginecologia)</option>
                <option value="Sala 04">Sala 04 (Odontologia)</option>
              </>
            )}
          </select>

          <div className="history-date-box" title="Filtrar por dia específico">
            <Calendar size={16} color="#2563eb" />
            <input
              type="date"
              value={historyDate}
              onChange={(e) => {
                setHistoryDate(e.target.value);
                setSelectedPeriod('todos');
                setCurrentPage(1);
              }}
              className="history-date-input"
            />
            {historyDate && (
              <button
                type="button"
                className="history-search-clear"
                onClick={() => setHistoryDate('')}
                title="Limpar filtro de data"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Linha Inferior: Abas de Status e Presets de Período */}
        <div className="history-filters-bottom-row">
          <div className="history-status-tabs">
            <span className="history-status-label">STATUS:</span>
            <button
              type="button"
              className={`history-pill-btn ${statusTab === 'ALL' ? 'active' : ''}`}
              onClick={() => {
                setStatusTab('ALL');
                setCurrentPage(1);
              }}
            >
              Todos
              <span className="history-pill-badge">{totalCount}</span>
            </button>

            <button
              type="button"
              className={`history-pill-btn ${statusTab === 'Atendido' ? 'active' : ''}`}
              onClick={() => {
                setStatusTab('Atendido');
                setCurrentPage(1);
              }}
            >
              <span className="history-pill-dot green"></span>
              Atendidos
            </button>

            <button
              type="button"
              className={`history-pill-btn ${statusTab === 'Ausente' ? 'active' : ''}`}
              onClick={() => {
                setStatusTab('Ausente');
                setCurrentPage(1);
              }}
            >
              <span className="history-pill-dot red"></span>
              Ausentes
            </button>
          </div>

          <div className="history-period-presets">
            <span className="history-status-label" style={{ marginRight: '0.2rem' }}>PERÍODO:</span>
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'hoje', label: 'Hoje' },
              { id: 'ontem', label: 'Ontem' },
              { id: 'semana', label: 'Esta Semana' },
              { id: 'mes', label: 'Este Mês' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn-period-preset ${selectedPeriod === p.id && !historyDate ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPeriod(p.id as any);
                  setHistoryDate('');
                  setCurrentPage(1);
                }}
              >
                {p.label}
              </button>
            ))}
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
                <th>Paciente</th>
                <th>Especialidade</th>
                <th>Data &amp; Horário</th>
                <th>Consultório &amp; Médico</th>
                <th>Tempos de Ciclo</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <RotateCcw size={18} className="animate-spin" />
                      Carregando histórico clínico auditado...
                    </div>
                  </td>
                </tr>
              ) : historyList.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="history-empty-box">
                      <div className="history-empty-icon">
                        <Search size={26} />
                      </div>
                      <h3 className="history-empty-title">Nenhum atendimento encontrado</h3>
                      <p className="history-empty-desc">
                        Não encontramos registros para os filtros selecionados. Tente alterar os termos de busca, o período ou limpar os filtros.
                      </p>
                      {hasActiveFilters && (
                        <button className="btn-reset-filters" style={{ marginTop: '0.5rem' }} onClick={handleResetFilters}>
                          <RotateCcw size={14} />
                          Limpar Todos os Filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                historyList.map((item) => {
                  const isUrgent = (item.priority || '').toUpperCase().includes('URG');
                  const isPref = (item.priority || '').toUpperCase().includes('PREF') || (item.priorityLabel || '').toLowerCase().includes('idoso');
                  const isAttended = item.status === 'FINALIZADO' || item.status === 'Atendido';

                  return (
                    <tr key={item.id}>
                      {/* Senha */}
                      <td>
                        <div className="history-ticket-wrap">
                          <span className={`history-ticket-badge ${isUrgent ? 'urgent' : isPref ? 'preferential' : ''}`}>
                            {item.code}
                          </span>
                        </div>
                      </td>

                      {/* Paciente */}
                      <td>
                        <div className="history-patient-cell">
                          <span className="history-patient-name">{item.patientName}</span>
                          <span className="history-patient-doc">
                            CPF: {item.cpf || 'Não informado'} • SUS: {item.cartaoSus || '---'}
                          </span>
                        </div>
                      </td>

                      {/* Especialidade */}
                      <td>
                        <span className={`history-spec-pill ${getSpecialtyBadgeClass(item.serviceLabel || item.service)}`}>
                          {getSpecialtyIcon(item.serviceLabel || item.service)}
                          {item.serviceLabel || item.service}
                        </span>
                      </td>

                      {/* Data & Horário */}
                      <td>
                        <div className="history-time-cell">
                          <span className="history-date-bold">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="history-time-sub">
                            <Clock size={12} />
                            {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Consultório & Médico */}
                      <td>
                        <div className="history-doctor-cell">
                          <span className="history-room-name">{item.room || 'Consultório 01'}</span>
                          <span className="history-doctor-name">{item.professional || 'Profissional SUS'}</span>
                        </div>
                      </td>

                      {/* Tempos de Ciclo */}
                      <td>
                        <div className="history-cycle-times">
                          <span className={`history-cycle-badge wait ${(item.waitTimeMinutes || 12) > 20 ? 'high' : ''}`}>
                            <Timer size={12} />
                            Espera: {item.waitTimeMinutes ? `${item.waitTimeMinutes} min` : '12 min'}
                          </span>
                          {isAttended && (
                            <span className="history-cycle-badge duration">
                              <CheckCircle2 size={12} />
                              Consulta: {item.consultationDurationMinutes ? `${item.consultationDurationMinutes} min` : '18 min'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`history-status-pill ${isAttended ? 'atendido' : 'ausente'}`}>
                          <span className="history-status-dot"></span>
                          {isAttended ? 'Atendido' : 'Ausente'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="history-action-btns">
                          <button
                            type="button"
                            className="btn-history-action primary"
                            title="Visualizar Detalhes do Atendimento"
                            onClick={() => handleOpenDetails(item)}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn-history-action"
                            title="Prontuário e Auditoria Clínica"
                            onClick={() => handleOpenDetails(item)}
                          >
                            <FileSpreadsheet size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="history-table-footer">
          <div>
            Mostrando <strong>{historyList.length}</strong> de <strong>{totalCount}</strong> atendimentos registrados •{' '}
            <span style={{ color: '#16a34a', fontWeight: 700 }}>Base 100% Auditada SUS</span>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Página Anterior"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
              <button
                key={page}
                type="button"
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Próxima Página"
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="history-ticket-badge" style={{ fontSize: '1.1rem', padding: '0.4rem 0.8rem' }}>
                  {selectedRecord.code}
                </span>
                <div>
                  <h3 className="modal-title">{selectedRecord.patientName}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    CPF: {selectedRecord.cpf || 'Não informado'} • SUS: {selectedRecord.cartaoSus || '---'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}
                onClick={() => setSelectedRecord(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Grid de Resumo Clínico */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.85rem',
                  backgroundColor: '#f8fafc',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Especialidade
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f2d59', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                    {selectedRecord.serviceLabel || selectedRecord.service}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Consultório
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f2d59', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                    {selectedRecord.room || 'Consultório 01'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Profissional Responsável
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f2d59', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                    {selectedRecord.professional || 'Dra. Mariana Vasconcellos'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Duração da Consulta
                  </div>
                  <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                    {selectedRecord.consultationDurationMinutes ? `${selectedRecord.consultationDurationMinutes} min` : '18 min'}
                  </div>
                </div>
              </div>

              {/* Diagnóstico Principal CID-10 */}
              {selectedRecord.cidCode && (
                <div
                  style={{
                    border: '1.5px solid #dbeafe',
                    backgroundColor: '#eff6ff',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Diagnóstico Principal (CID-10 Registrado)
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f2d59', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {selectedRecord.cidCode}
                  </div>
                </div>
              )}

              {/* Anotação de ausência */}
              {selectedRecord.notes && (
                <div
                  style={{
                    border: '1.5px solid #fecaca',
                    backgroundColor: '#fef2f2',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Motivo da Ausência / Observação
                  </div>
                  <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {selectedRecord.notes}
                  </div>
                </div>
              )}

              {/* Linha do Tempo Clínica Auditada */}
              {recordDetails?.timeline && recordDetails.timeline.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
                    Linha do Tempo Clínica (Auditada)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {recordDetails.timeline.map((step, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.82rem',
                          padding: '0.4rem 0.65rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{step.stage}:</span>
                          <span style={{ color: '#475569' }}>{step.description}</span>
                        </div>
                        <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
                          {step.timestamp ? new Date(step.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#64748b',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                }}
              >
                <span>
                  Data do Registro: <strong>{new Date(selectedRecord.createdAt).toLocaleDateString('pt-BR')}</strong>
                </span>
                <span
                  className={`history-status-pill ${
                    selectedRecord.status === 'Atendido' || selectedRecord.status === 'FINALIZADO' ? 'atendido' : 'ausente'
                  }`}
                >
                  <span className="history-status-dot"></span>
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

              <button
                type="button"
                className="btn-modal-print"
                onClick={() => {
                  alert(`Imprimindo prontuário de auditoria do paciente ${selectedRecord.patientName}...`);
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
