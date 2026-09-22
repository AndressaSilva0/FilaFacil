import type { Ticket, Patient, Room, QueueStats, PriorityLevel, ServiceType } from '../types';
import { INITIAL_PATIENTS, INITIAL_ROOMS, INITIAL_TICKETS } from '../mocks/mockData';
import { soundService } from './soundService';

const STORAGE_KEYS = {
  TICKETS: 'filafacil_tickets',
  PATIENTS: 'filafacil_patients',
  ROOMS: 'filafacil_rooms',
};

class MockQueueService {
  private getStored<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setStored<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // localStorage quota
    }
  }

  public getTickets(): Ticket[] {
    return this.getStored<Ticket[]>(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
  }

  public getPatients(): Patient[] {
    return this.getStored<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  }

  public getRooms(): Room[] {
    return this.getStored<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }

  public resetData(): void {
    this.setStored(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    this.setStored(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    this.setStored(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }

  public generateTicketCode(priority: PriorityLevel, tickets: Ticket[]): string {
    const prefix = priority === 'PREFERENCIAL' ? 'PRE' : priority === 'URGENTE' ? 'URG' : 'NOR';
    const samePriorityTickets = tickets.filter((t) => t.code.startsWith(prefix));
    const nextNum = samePriorityTickets.length + 1;
    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  }

  /**
   * Adiciona um novo paciente e emite a senha na fila
   */
  public addTicket(data: {
    patientName: string;
    cartaoSus?: string;
    priority: PriorityLevel;
    service: ServiceType;
    birthDate?: string;
    phone?: string;
  }): Ticket {
    const tickets = this.getTickets();
    const patients = this.getPatients();

    let patient = patients.find(
      (p) => data.cartaoSus && p.cartaoSus.replace(/\D/g, '') === data.cartaoSus.replace(/\D/g, '')
    );

    if (!patient) {
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        name: data.patientName.trim(),
        cartaoSus: data.cartaoSus || 'Não informado',
        birthDate: data.birthDate,
        phone: data.phone,
      };
      patients.push(newPatient);
      this.setStored(STORAGE_KEYS.PATIENTS, patients);
      patient = newPatient;
    }

    const code = this.generateTicketCode(data.priority, tickets);

    const newTicket: Ticket = {
      id: `tick-${Date.now()}`,
      code,
      patientId: patient.id,
      patientName: patient.name,
      cartaoSus: patient.cartaoSus,
      priority: data.priority,
      service: data.service,
      status: 'AGUARDANDO',
      createdAt: new Date().toISOString(),
    };

    tickets.push(newTicket);
    this.setStored(STORAGE_KEYS.TICKETS, tickets);
    return newTicket;
  }

  /**
   * Obtém os pacientes aguardando ordenados por prioridade (Urgente > Preferencial > Normal) e tempo de chegada
   */
  public getWaitingQueue(): Ticket[] {
    const priorityWeight: Record<PriorityLevel, number> = {
      URGENTE: 3,
      PREFERENCIAL: 2,
      NORMAL: 1,
    };

    return this.getTickets()
      .filter((t) => t.status === 'AGUARDANDO')
      .sort((a, b) => {
        const diffWeight = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (diffWeight !== 0) return diffWeight;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }

  /**
   * Chama o próximo paciente respeitando a fila de prioridades
   */
  public callNextTicket(roomId: string, professionalName?: string): Ticket | null {
    const waiting = this.getWaitingQueue();
    if (waiting.length === 0) return null;

    const next = waiting[0];
    const rooms = this.getRooms();
    const targetRoom = rooms.find((r) => r.id === roomId);
    const roomName = targetRoom ? targetRoom.name : 'Consultório';
    const prof = professionalName || targetRoom?.assignedProfessional || 'Profissional de Saúde';

    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === next.id);
    if (index === -1) return null;

    tickets[index] = {
      ...tickets[index],
      status: 'CHAMANDO',
      calledAt: new Date().toISOString(),
      room: roomName,
      professional: prof,
    };

    this.setStored(STORAGE_KEYS.TICKETS, tickets);

    // Notificação sonora no painel
    soundService.announceTicket(tickets[index]);

    return tickets[index];
  }

  /**
   * Re-chama o paciente atual (para repetir alerta no painel de TV)
   */
  public callAgain(ticketId: string): Ticket | null {
    const tickets = this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    ticket.calledAt = new Date().toISOString();
    ticket.status = 'CHAMANDO';
    this.setStored(STORAGE_KEYS.TICKETS, tickets);

    soundService.announceTicket(ticket);
    return ticket;
  }

  /**
   * Inicia o atendimento do paciente
   */
  public startAttendance(ticketId: string): Ticket | null {
    const tickets = this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    ticket.status = 'EM_ATENDIMENTO';
    ticket.attendedAt = new Date().toISOString();
    this.setStored(STORAGE_KEYS.TICKETS, tickets);
    return ticket;
  }

  /**
   * Conclui o atendimento
   */
  public finishAttendance(ticketId: string): Ticket | null {
    const tickets = this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    ticket.status = 'FINALIZADO';
    ticket.finishedAt = new Date().toISOString();
    this.setStored(STORAGE_KEYS.TICKETS, tickets);
    return ticket;
  }

  /**
   * Marca ausência do paciente
   */
  public markAbsent(ticketId: string): Ticket | null {
    const tickets = this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    ticket.status = 'AUSENTE';
    this.setStored(STORAGE_KEYS.TICKETS, tickets);
    return ticket;
  }

  /**
   * Retorna estatísticas calculadas da fila
   */
  public getStats(): QueueStats {
    const tickets = this.getTickets();
    const waiting = tickets.filter((t) => t.status === 'AGUARDANDO');
    const attended = tickets.filter((t) => t.status === 'FINALIZADO');

    let totalWaitMs = 0;
    let waitCount = 0;

    attended.forEach((t) => {
      if (t.createdAt && t.calledAt) {
        totalWaitMs += new Date(t.calledAt).getTime() - new Date(t.createdAt).getTime();
        waitCount++;
      }
    });

    const averageWaitMinutes = waitCount > 0 ? Math.round(totalWaitMs / waitCount / 60000) : 12;

    return {
      totalWaiting: waiting.length,
      totalAttendedToday: attended.length,
      averageWaitMinutes,
      byPriority: {
        URGENTE: waiting.filter((t) => t.priority === 'URGENTE').length,
        PREFERENCIAL: waiting.filter((t) => t.priority === 'PREFERENCIAL').length,
        NORMAL: waiting.filter((t) => t.priority === 'NORMAL').length,
      },
    };
  }
}

export const mockQueueService = new MockQueueService();
