export type PriorityLevel = 'NORMAL' | 'PREFERENCIAL' | 'URGENTE';

export type ServiceType = 
  | 'CLINICO_GERAL' 
  | 'PEDIATRIA' 
  | 'GINECOLOGIA' 
  | 'ODONTOLOGIA'
  | 'ENFERMAGEM' 
  | 'VACINACAO' 
  | 'TRIAGEM' 
  | 'CURATIVO' 
  | 'FARMACIA'
  | 'CONSULTA_MEDICA';

export type AttendanceStatus = 
  | 'AGUARDANDO' 
  | 'CHAMANDO' 
  | 'TRIAGEM'
  | 'EM_ATENDIMENTO' 
  | 'FINALIZADO' 
  | 'AUSENTE';

export interface Patient {
  id: string;
  name: string;
  cpf?: string;
  cartaoSus: string;
  birthDate?: string;
  phone?: string;
  priority?: PriorityLevel;
  priorityLabel?: string; // Ex: "Idoso 60+", "Gestante", "PCD", "Convencional"
}

export interface Ticket {
  id: string;
  code: string; // Ex: 'A123', 'B045', 'C012'
  patientId: string;
  patientName: string;
  cpf?: string;
  cartaoSus?: string;
  age?: number;
  priority: PriorityLevel;
  priorityLabel?: string;
  service: ServiceType;
  serviceLabel?: string; // Ex: "Clínico Geral", "Pediatria"
  status: AttendanceStatus;
  createdAt: string;
  calledAt?: string;
  attendedAt?: string;
  finishedAt?: string;
  room?: string; // Ex: 'Sala 02'
  roomLabel?: string; // Ex: 'Consultório Médico'
  professional?: string; // Ex: 'Dra. Mariana Vasconcellos'
}

export interface Room {
  id: string;
  name: string;
  label: string; // Ex: 'Consultório Médico', 'Triagem Rápida'
  defaultService: ServiceType;
  assignedProfessional?: string;
}

export interface QueueStats {
  totalWaiting: number;
  totalAttendedToday: number;
  totalAbsent?: number;
  totalInConsultation?: number;
  averageWaitMinutes: number;
  activeRooms?: number;
  punctualityPercent?: number;
  byPriority: Record<PriorityLevel, number>;
}
