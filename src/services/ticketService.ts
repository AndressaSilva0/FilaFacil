import { api } from './api';
import type { Ticket, PriorityLevel, ServiceType } from '../types';

export interface ThermalReceiptData {
  code: string;
  patientName: string;
  priorityLabel: string;
  serviceLabel: string;
  dateFormatted: string;
  timeFormatted: string;
  qrPayload: string;
  qrSvg: string;
  textReceipt: string;
}

export interface CreateTicketResponse {
  message: string;
  ticket: Ticket;
  receipt?: ThermalReceiptData;
}

export interface TicketFilters {
  status?: string;
  specialty?: string;
  room?: string;
  doctor?: string;
  priority?: string;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class TicketService {
  public async getTickets(filters?: TicketFilters): Promise<{ tickets: Ticket[]; total: number; totalPages: number }> {
    const data = await api.get<{ tickets: any[]; total: number; page: number; totalPages: number }>('/tickets', filters);
    return {
      tickets: (data.tickets || []).map(this.mapTicket),
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };
  }

  public async getWaitingQueue(): Promise<Ticket[]> {
    const data = await api.get<any[]>('/tickets/waiting');
    return (data || []).map(this.mapTicket);
  }

  public async createTicket(data: {
    patientName: string;
    cpf?: string;
    cartaoSus?: string;
    birthDate?: string;
    phone?: string;
    priority: PriorityLevel | string;
    service: ServiceType | string;
    notes?: string;
    roomId?: string;
    room?: string;
    selectedDate?: string;
    selectedTime?: string;
  }): Promise<CreateTicketResponse> {
    const response = await api.post<{ message: string; ticket: any; receipt?: ThermalReceiptData }>('/tickets', data);
    return {
      message: response.message,
      ticket: this.mapTicket(response.ticket),
      receipt: response.receipt,
    };
  }

  public async callNext(roomId?: string, professionalName?: string): Promise<Ticket | null> {
    try {
      const response = await api.post<{ message: string; ticket: any }>('/tickets/call-next', {
        roomId,
        professionalName,
      });
      return response.ticket ? this.mapTicket(response.ticket) : null;
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  public async callTicket(ticketId: string, roomId?: string, professionalName?: string): Promise<Ticket> {
    const response = await api.post<{ message: string; ticket: any }>(`/tickets/${ticketId}/call`, {
      roomId,
      professionalName,
    });
    return this.mapTicket(response.ticket);
  }

  public async recall(ticketId: string): Promise<Ticket> {
    const response = await api.post<{ message: string; ticket: any }>(`/tickets/${ticketId}/recall`);
    return this.mapTicket(response.ticket);
  }

  public async startAttendance(ticketId: string): Promise<Ticket> {
    const response = await api.post<{ message: string; ticket: any }>(`/tickets/${ticketId}/start`);
    return this.mapTicket(response.ticket);
  }

  public async finishAttendance(ticketId: string, data?: { notes?: string; cidCode?: string }): Promise<Ticket> {
    const response = await api.post<{ message: string; ticket: any }>(`/tickets/${ticketId}/finish`, data);
    return this.mapTicket(response.ticket);
  }

  public async markAbsent(ticketId: string): Promise<Ticket> {
    const response = await api.post<{ message: string; ticket: any }>(`/tickets/${ticketId}/absent`);
    return this.mapTicket(response.ticket);
  }

  public async exportQueue(format: 'csv' | 'xlsx' = 'csv', filters?: TicketFilters): Promise<void> {
    await api.download('/tickets/export', `fila_atendimento_${new Date().toISOString().slice(0, 10)}.${format}`, {
      format,
      ...filters,
    });
  }

  private mapTicket(t: any): Ticket {
    return {
      id: t.id,
      code: t.code,
      patientId: t.patientId,
      patientName: t.patientName,
      cpf: t.cpf,
      cartaoSus: t.cartaoSus,
      age: t.age,
      priority: t.priority as PriorityLevel,
      priorityLabel: t.priorityLabel,
      service: t.service as ServiceType,
      serviceLabel: t.serviceLabel,
      status: t.status,
      createdAt: t.createdAt,
      calledAt: t.calledAt || undefined,
      attendedAt: t.attendedAt || undefined,
      finishedAt: t.finishedAt || undefined,
      room: t.room || (t.roomRel ? t.roomRel.name : undefined),
      roomLabel: t.roomRel?.label || undefined,
      professional: t.professional || undefined,
    };
  }
}

export const ticketService = new TicketService();

