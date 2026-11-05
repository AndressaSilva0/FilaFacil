import React, { useState, useEffect } from 'react';
import {
  User,
  Fingerprint,
  Calendar as CalendarIcon,
  CreditCard,
  CheckCircle2,
  Search,
  Users,
  Accessibility,
  Baby,
  Stethoscope,
  Smile,
  ChevronLeft,
  ChevronRight,
  Printer,
  Check,
  X,
} from 'lucide-react';
import type { InternalScreen } from '../components/AppLayout';
import { ticketService, type ThermalReceiptData } from '../services/ticketService';
import { patientService, type SearchPatientResult } from '../services/patientService';
import { roomService } from '../services/roomService';
import '../styles/add-queue.css';

interface AddToQueuePageProps {
  onNavigate: (screen: InternalScreen) => void;
}

type PriorityTypeModern = 'COMUM' | 'IDOSO_60' | 'IDOSO_80' | 'GESTANTE' | 'PCD';
type SpecialtyKeyModern = 'CLINICO' | 'PEDIATRIA' | 'GINECOLOGIA' | 'ODONTOLOGIA';

export const AddToQueuePage: React.FC<AddToQueuePageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('Maria Helena Cavalcanti');
  const [cpf, setCpf] = useState('489.201.782-90');
  const [birthDate, setBirthDate] = useState('14/05/1958');
  const [cns, setCns] = useState('702 4091 8832 0019');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [notes] = useState('');
  const [priority, setPriority] = useState<PriorityTypeModern>('IDOSO_60');
  const [specialty, setSpecialty] = useState<SpecialtyKeyModern>('CLINICO');

  // Estado dinâmico do Calendário (Data, Mês e Ano)
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());

  const [selectedTime, setSelectedTime] = useState('10:00 (Agora)');
  const [availableRooms, setAvailableRooms] = useState<Array<{ id: string; name: string; label: string; assignedProfessional?: string }>>([]);
  const [selectedRoom, setSelectedRoom] = useState('Consultório 02');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptModal, setReceiptModal] = useState<ThermalReceiptData | null>(null);

  // Modal de busca CADSUS
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchPatientResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    roomService.list().then((rooms) => {
      setAvailableRooms(rooms);
      if (rooms.length > 0) {
        setSelectedRoom(rooms[0].name);
        setSelectedRoomId(rooms[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSearchCadsus = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await patientService.search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (p: SearchPatientResult) => {
    setName(p.name);
    if (p.cpf) setCpf(p.cpf);
    if (p.susCard) setCns(p.susCard);
    if (p.birthDate) {
      const d = new Date(p.birthDate);
      if (!isNaN(d.getTime())) {
        setBirthDate(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
      }
    }
    if (p.phone) setPhone(p.phone);
    if (p.specialCondition) {
      if (p.specialCondition.includes('80')) setPriority('IDOSO_80');
      else if (p.specialCondition.includes('60')) setPriority('IDOSO_60');
      else if (p.specialCondition.toLowerCase().includes('gest')) setPriority('GESTANTE');
      else if (p.specialCondition.toLowerCase().includes('pcd')) setPriority('PCD');
    }
    setShowSearchModal(false);
  };

  const MONTH_NAMES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const YEARS_RANGE = Array.from({ length: 15 }, (_, i) => 2020 + i);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
  };

  // Cálculo dos dias do mês e dias vizinhos
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const prevMonthDays: number[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays: number[] = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    currentMonthDays.push(d);
  }

  const totalSlots = Math.ceil((firstDayOfWeek + daysInCurrentMonth) / 7) * 7;
  const nextMonthDaysCount = totalSlots - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays: number[] = [];
  for (let d = 1; d <= nextMonthDaysCount; d++) {
    nextMonthDays.push(d);
  }

  const handleSelectDay = (day: number) => {
    setSelectedDate(new Date(viewYear, viewMonth, day));
  };

  const handleSelectPrevMonthDay = (day: number) => {
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    setViewMonth(prevM);
    setViewYear(prevY);
    setSelectedDate(new Date(prevY, prevM, day));
  };

  const handleSelectNextMonthDay = (day: number) => {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    setViewMonth(nextM);
    setViewYear(nextY);
    setSelectedDate(new Date(nextY, nextM, day));
  };

  const isDateSelected = (day: number, month: number, year: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isTodayDate = (day: number, month: number, year: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const formattedSelectedDate = `${String(selectedDate.getDate()).padStart(2, '0')}/${String(
    selectedDate.getMonth() + 1
  ).padStart(2, '0')}/${selectedDate.getFullYear()}`;

  const priorityLabels: Record<PriorityTypeModern, string> = {
    COMUM: 'Comum',
    IDOSO_60: 'Idoso 60+',
    IDOSO_80: 'Idoso 80+',
    GESTANTE: 'Gestante',
    PCD: 'PCD',
  };

  const specialtyLabels: Record<SpecialtyKeyModern, string> = {
    CLINICO: 'Clínico Geral',
    PEDIATRIA: 'Pediatria',
    GINECOLOGIA: 'Ginecologia',
    ODONTOLOGIA: 'Odontologia',
  };

  const handleEmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await ticketService.createTicket({
        patientName: name,
        cpf,
        cartaoSus: cns,
        birthDate,
        phone,
        priority,
        service: specialty,
        roomId: selectedRoomId || undefined,
        room: selectedRoom,
        selectedDate: formattedSelectedDate,
        selectedTime: selectedTime.replace(' (Agora)', ''),
        notes,
      });

      setIsSubmitting(false);
      if (result.receipt) {
        setReceiptModal(result.receipt);
      } else {
        setSuccessToast(`Senha ${result.ticket.code} emitida com sucesso!`);
        setTimeout(() => {
          setSuccessToast(null);
          onNavigate('queue-list');
        }, 2200);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || 'Erro ao emitir senha.');
    }
  };

  return (
    <div className="add-queue-page">
      {/* Toast de Sucesso */}
      {successToast && (
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
          <CheckCircle2 size={22} />
          {successToast}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <header className="add-queue-header-row">
        <div>
          <div className="add-queue-breadcrumb-row">
            <span className="breadcrumb-tag">RECEPÇÃO &amp; TRIAGEM RÁPIDA</span>
            <span className="cadsus-badge">
              <span className="dot"></span>
              CADSUS Integrado
            </span>
          </div>

          <h1 className="page-title" style={{ marginTop: '0.35rem', marginBottom: 0 }}>
            Adicionar na Fila
          </h1>

          <p className="page-subtitle" style={{ margin: '0.15rem 0 0' }}>
            Registre a chegada do cidadão para acolhimento, triagem de Manchester ou consulta imediata.
          </p>
        </div>

        <div className="add-queue-metrics-pills">
          <div className="metric-pill-item">
            <span className="label">Fila Atual:</span>
            <span>14 aguardando</span>
          </div>

          <div className="metric-pill-item">
            <span className="label">Tempo Médio:</span>
            <span>~12 min</span>
          </div>
        </div>
      </header>

      {/* ================= FORMULÁRIO 2 COLUNAS ================= */}
      <form onSubmit={handleEmitTicket} className="add-queue-modern-grid">
        {/* Coluna Esquerda: Dados do Paciente e Especialidade */}
        <div className="add-queue-form-col">
          {/* Seção 1: Dados do Paciente */}
          <div className="modern-form-card">
            <div className="modern-form-card-header">
              <div className="modern-form-card-title-group">
                <div className="modern-form-card-icon blue">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="modern-form-card-title">Dados do Paciente</h2>
                  <p className="modern-form-card-subtitle">
                    Localize por CPF/CNS ou preencha o registro avulso
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn-search-citizen"
                onClick={() => setShowSearchModal(true)}
              >
                <Search size={13} />
                Buscar Cidadão (CADSUS)
              </button>
            </div>

            {/* Nome Completo */}
            <div className="modern-input-group">
              <div className="modern-input-label-row">
                <span className="modern-input-label">Nome Completo do Paciente *</span>
                <span className="modern-input-hint">Ex: Maria Oliveira Santos</span>
              </div>
              <div className="modern-input-field">
                <User size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CPF e Data de Nascimento */}
            <div className="modern-form-row-2">
              <div className="modern-input-group">
                <div className="modern-input-label-row">
                  <span className="modern-input-label">CPF</span>
                </div>
                <div className="modern-input-field">
                  <Fingerprint size={16} />
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modern-input-group">
                <div className="modern-input-label-row">
                  <span className="modern-input-label">Data de Nascimento</span>
                </div>
                <div className="modern-input-field">
                  <CalendarIcon size={16} />
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* CNS */}
            <div className="modern-input-group">
              <div className="modern-input-label-row">
                <span className="modern-input-label">Cartão Nacional de Saúde (CNS)</span>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={13} />
                  Vinculado ao SUS
                </span>
              </div>
              <div className="modern-input-field">
                <CreditCard size={16} />
                <input
                  type="text"
                  value={cns}
                  onChange={(e) => setCns(e.target.value)}
                />
              </div>
            </div>

            {/* 5 Opções de Prioridade Legal */}
            <div className="priority-legal-block">
              <div className="priority-legal-label">
                Classificação Legal de Prioridade
              </div>

              <div className="priority-pills-row">
                <button
                  type="button"
                  className={`priority-pill-btn ${priority === 'COMUM' ? 'active' : ''}`}
                  onClick={() => setPriority('COMUM')}
                >
                  <Users size={15} />
                  Comum
                </button>

                <button
                  type="button"
                  className={`priority-pill-btn ${priority === 'IDOSO_60' ? 'active' : ''}`}
                  onClick={() => setPriority('IDOSO_60')}
                >
                  <Accessibility size={15} />
                  Idoso 60+
                </button>

                <button
                  type="button"
                  className={`priority-pill-btn ${priority === 'IDOSO_80' ? 'active' : ''}`}
                  onClick={() => setPriority('IDOSO_80')}
                >
                  <Accessibility size={15} />
                  Idoso 80+
                </button>

                <button
                  type="button"
                  className={`priority-pill-btn ${priority === 'GESTANTE' ? 'active' : ''}`}
                  onClick={() => setPriority('GESTANTE')}
                >
                  <Baby size={15} />
                  Gestante
                </button>

                <button
                  type="button"
                  className={`priority-pill-btn ${priority === 'PCD' ? 'active' : ''}`}
                  onClick={() => setPriority('PCD')}
                >
                  <Accessibility size={15} />
                  PCD
                </button>
              </div>
            </div>
          </div>

          {/* Seção 2: Especialidade / Fila de Destino */}
          <div className="modern-form-card">
            <div className="modern-form-card-header">
              <div className="modern-form-card-title-group">
                <div className="modern-form-card-icon green">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h2 className="modern-form-card-title">Especialidade / Fila de Destino</h2>
                  <p className="modern-form-card-subtitle">
                    Selecione o acolhimento clínico necessário
                  </p>
                </div>
              </div>

              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.2rem 0.65rem', borderRadius: 999 }}>
                4 Disponíveis
              </span>
            </div>

            <div className="specialty-grid-modern">
              {/* Clínico Geral */}
              <div
                className={`specialty-card-modern ${specialty === 'CLINICO' ? 'active' : ''}`}
                onClick={() => setSpecialty('CLINICO')}
              >
                <div className="specialty-card-top-row">
                  <div className="specialty-icon-modern">
                    <Stethoscope size={18} />
                  </div>
                  {specialty === 'CLINICO' && (
                    <Check size={18} color="#ffffff" />
                  )}
                </div>
                <div>
                  <div className="specialty-title-modern">Clínico Geral</div>
                  <div className="specialty-desc-modern">Triagem primária &amp; queixas agudas</div>
                </div>
                <div className="specialty-doctors-active">
                  <span className="dot"></span>
                  2 Médicos ativos
                </div>
              </div>

              {/* Pediatria */}
              <div
                className={`specialty-card-modern ${specialty === 'PEDIATRIA' ? 'active' : ''}`}
                onClick={() => setSpecialty('PEDIATRIA')}
              >
                <div className="specialty-card-top-row">
                  <div className="specialty-icon-modern">
                    <Baby size={18} />
                  </div>
                  {specialty === 'PEDIATRIA' && (
                    <Check size={18} color="#ffffff" />
                  )}
                </div>
                <div>
                  <div className="specialty-title-modern">Pediatria</div>
                  <div className="specialty-desc-modern">Saúde da criança &amp; vacinação</div>
                </div>
                <div className="specialty-doctors-active">
                  <span className="dot"></span>
                  1 Médico ativo
                </div>
              </div>

              {/* Ginecologia */}
              <div
                className={`specialty-card-modern ${specialty === 'GINECOLOGIA' ? 'active' : ''}`}
                onClick={() => setSpecialty('GINECOLOGIA')}
              >
                <div className="specialty-card-top-row">
                  <div className="specialty-icon-modern">
                    <Smile size={18} />
                  </div>
                  {specialty === 'GINECOLOGIA' && (
                    <Check size={18} color="#ffffff" />
                  )}
                </div>
                <div>
                  <div className="specialty-title-modern">Ginecologia</div>
                  <div className="specialty-desc-modern">Pré-natal &amp; saúde da mulher</div>
                </div>
                <div className="specialty-doctors-active">
                  <span className="dot"></span>
                  1 Médica ativa
                </div>
              </div>

              {/* Odontologia */}
              <div
                className={`specialty-card-modern ${specialty === 'ODONTOLOGIA' ? 'active' : ''}`}
                onClick={() => setSpecialty('ODONTOLOGIA')}
              >
                <div className="specialty-card-top-row">
                  <div className="specialty-icon-modern">
                    <Smile size={18} />
                  </div>
                  {specialty === 'ODONTOLOGIA' && (
                    <Check size={18} color="#ffffff" />
                  )}
                </div>
                <div>
                  <div className="specialty-title-modern">Odontologia</div>
                  <div className="specialty-desc-modern">Acolhimento &amp; urgências bucais</div>
                </div>
                <div className="specialty-doctors-active">
                  <span className="dot"></span>
                  2 Dentistas ativos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Data, Consultório e Resumo do Encaixe */}
        <div className="add-queue-sidebar-col">
          {/* Card Data & Ponto */}
          <div className="sidebar-box-card">
            <div className="sidebar-box-header">
              <div className="sidebar-box-title-group">
                <CalendarIcon size={18} color="#2563eb" />
                <div>
                  <div className="sidebar-box-title">Data &amp; Horário de Chegada</div>
                  <div className="sidebar-box-subtitle">Controle de ponto de atendimento</div>
                </div>
              </div>
              <button
                type="button"
                className="badge-today-pill"
                onClick={handleGoToToday}
                title="Voltar para a data de hoje"
              >
                Hoje
              </button>
            </div>

            {/* Mini Calendário Dinâmico (Mês, Ano e Dia Navegáveis) */}
            <div className="mini-calendar-container">
              <div className="mini-calendar-month-row">
                <div className="mini-calendar-selectors">
                  <select
                    className="calendar-select-month"
                    value={viewMonth}
                    onChange={(e) => setViewMonth(Number(e.target.value))}
                    aria-label="Selecionar Mês"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    className="calendar-select-year"
                    value={viewYear}
                    onChange={(e) => setViewYear(Number(e.target.value))}
                    aria-label="Selecionar Ano"
                  >
                    {YEARS_RANGE.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mini-calendar-nav-buttons">
                  <button
                    type="button"
                    className="mini-calendar-nav-btn"
                    onClick={handlePrevMonth}
                    title="Mês anterior"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="mini-calendar-nav-btn"
                    onClick={handleNextMonth}
                    title="Próximo mês"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="mini-calendar-days-grid">
                <div className="mini-calendar-day-header">D</div>
                <div className="mini-calendar-day-header">S</div>
                <div className="mini-calendar-day-header">T</div>
                <div className="mini-calendar-day-header">Q</div>
                <div className="mini-calendar-day-header">Q</div>
                <div className="mini-calendar-day-header">S</div>
                <div className="mini-calendar-day-header">S</div>

                {/* Dias do mês anterior */}
                {prevMonthDays.map((d) => (
                  <button
                    key={`prev-${d}`}
                    type="button"
                    className="mini-calendar-day-cell other-month"
                    onClick={() => handleSelectPrevMonthDay(d)}
                    title={`Mês anterior: ${d}`}
                  >
                    {d}
                  </button>
                ))}

                {/* Dias do mês atual */}
                {currentMonthDays.map((d) => {
                  const selected = isDateSelected(d, viewMonth, viewYear);
                  const todayMatch = isTodayDate(d, viewMonth, viewYear);
                  return (
                    <button
                      key={`curr-${d}`}
                      type="button"
                      className={`mini-calendar-day-cell ${selected ? 'active' : ''} ${
                        todayMatch ? 'is-today' : ''
                      }`}
                      onClick={() => handleSelectDay(d)}
                      title={`${d} de ${MONTH_NAMES[viewMonth]} de ${viewYear}`}
                    >
                      {d}
                    </button>
                  );
                })}

                {/* Dias do próximo mês */}
                {nextMonthDays.map((d) => (
                  <button
                    key={`next-${d}`}
                    type="button"
                    className="mini-calendar-day-cell other-month"
                    onClick={() => handleSelectNextMonthDay(d)}
                    title={`Próximo mês: ${d}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Consultório Sugerido */}
            <div className="suggested-room-group">
              <div className="suggested-room-header">
                <span className="suggested-room-label">Consultório Sugerido</span>
                <span className="suggested-room-badge">Triagem Sala 03 Livre</span>
              </div>

              <select
                className="modern-select"
                value={selectedRoomId || selectedRoom}
                onChange={(e) => {
                  const r = availableRooms.find((rm) => rm.id === e.target.value || rm.name === e.target.value);
                  if (r) {
                    setSelectedRoom(r.name);
                    setSelectedRoomId(r.id);
                  } else {
                    setSelectedRoom(e.target.value);
                  }
                }}
              >
                {availableRooms.length > 0 ? (
                  availableRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.assignedProfessional ? `(${r.assignedProfessional})` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Consultório 02">Consultório 02 (Dr. Roberto - Clínico)</option>
                    <option value="Consultório 01">Consultório 01 (Dra. Clara - Pediatra)</option>
                    <option value="Consultório 03">Consultório 03 (Dra. Vanessa - Odonto)</option>
                    <option value="Sala 04">Sala 04 (Pré-Natal / Enf. Mariana)</option>
                  </>
                )}
              </select>
            </div>

            {/* Horários de Acolhimento */}
            <div>
              <span className="suggested-room-label">Horários de Acolhimento de Hoje</span>
              <div className="time-pills-row">
                {['09:40', '10:00 (Agora)', '10:20', '10:40'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`time-pill-btn ${selectedTime === time ? 'active' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card Resumo do Encaixe */}
          <div className="summary-modern-card">
            <div className="summary-card-header">
              <div className="summary-card-title-group">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  RESUMO DO ENCAIXE
                </span>
                <h3>Ticket Pronto para Emissão</h3>
              </div>

              <div className="summary-card-code-group">
                <div className="summary-card-code-label">Senha Prevista</div>
                <div className="summary-card-code-value">P-038</div>
              </div>
            </div>

            <div className="summary-rows-box">
              <div className="summary-row-item">
                <span className="label">Cidadão(ã):</span>
                <span className="value">{name}</span>
              </div>

              <div className="summary-row-item">
                <span className="label">Prioridade:</span>
                <span className="value" style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Accessibility size={13} />
                  {priorityLabels[priority]}
                </span>
              </div>

              <div className="summary-row-item">
                <span className="label">Especialidade:</span>
                <span className="value">{specialtyLabels[specialty]}</span>
              </div>

              <div className="summary-row-item">
                <span className="label">Data &amp; Horário:</span>
                <span className="value" style={{ fontWeight: 700, color: '#0f172a' }}>
                  {formattedSelectedDate} • {selectedTime}
                </span>
              </div>

              <div className="summary-row-item">
                <span className="label">Localização:</span>
                <span className="value">{selectedRoom.split(' (')[0]}</span>
              </div>
            </div>

            <button type="submit" className="btn-emit-ticket-primary" disabled={isSubmitting}>
              <Printer size={16} />
              {isSubmitting ? 'Emitindo...' : 'Emitir Senha e Registrar na Fila'}
            </button>

            <div className="summary-card-qrcode-note">
              <CheckCircle2 size={13} />
              <span>Impressão de comprovante térmico automática com QR Code</span>
            </div>
          </div>
        </div>
      </form>

      {/* ================= MODAL DE BUSCA CADSUS ================= */}
      {showSearchModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '560px',
            padding: '1.75rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  Localizar Cidadão no CADSUS
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Busque por Nome Completo, CPF ou Cartão Nacional de Saúde (CNS).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Ex: Maria, 489.201 ou 702409..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchCadsus())}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSearchCadsus}
                disabled={isSearching}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Search size={16} />
                {isSearching ? 'Buscando...' : 'Pesquisar'}
              </button>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                  {isSearching ? 'Consultando base CADSUS...' : 'Nenhum cidadão localizado com este termo.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      style={{
                        padding: '0.85rem 1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                          CPF: {p.cpf || 'Não inf.'} • CNS: {p.susCard || 'Não inf.'}
                        </div>
                      </div>
                      {p.specialCondition && (
                        <span style={{
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}>
                          {p.specialCondition}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE COMPROVANTE TÉRMICO E QR CODE ================= */}
      {receiptModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '420px',
            padding: '1.75rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Senha Emitida com Sucesso!
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
              Comprovante do acolhimento pronto para impressão.
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                SENHA DO CIDADÃO
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0284c7', margin: '0.25rem 0' }}>
                {receiptModal.code}
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                {receiptModal.patientName}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                {receiptModal.priorityLabel} • {receiptModal.serviceLabel}
              </div>

              {receiptModal.qrSvg && (
                <div
                  style={{ width: '130px', height: '130px', margin: '1rem auto 0' }}
                  dangerouslySetInnerHTML={{ __html: receiptModal.qrSvg }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Printer size={16} />
                Imprimir
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceiptModal(null);
                  onNavigate('queue-list');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Ir para a Fila
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToQueuePage;
