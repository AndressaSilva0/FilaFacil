import { api } from './api';

export interface HistoryItem {
  id: string;
  code: string;
  patientName: string;
  cpf?: string;
  cartaoSus?: string;
  priority: string;
  priorityLabel: string;
  service: string;
  serviceLabel: string;
  status: string;
  createdAt: string;
  calledAt?: string;
  attendedAt?: string;
  finishedAt?: string;
  room?: string;
  professional?: string;
  cidCode?: string;
  notes?: string;
  waitTimeMinutes?: number;
  consultationDurationMinutes?: number;
}

export interface HistoryTimelineStep {
  stage: string;
  timestamp: string | null;
  description: string;
}

export interface HistoryDetailsResponse {
  ticket: HistoryItem;
  timeline: HistoryTimelineStep[];
  waitTimeMinutes?: number;
  consultationDurationMinutes?: number;
}

export interface HistoryQueryParams {
  status?: string;
  specialty?: string;
  room?: string;
  doctor?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class HistoryService {
  public async list(params?: HistoryQueryParams): Promise<{ history: HistoryItem[]; total: number; totalPages: number }> {
    const data = await api.get<{ history: any[]; total: number; page: number; totalPages: number }>('/history', params);
    return {
      history: (data.history || []).map((h) => ({
        ...h,
        waitTimeMinutes: h.calledAt && h.createdAt
          ? Math.round((new Date(h.calledAt).getTime() - new Date(h.createdAt).getTime()) / 60000)
          : undefined,
        consultationDurationMinutes: h.finishedAt && h.attendedAt
          ? Math.round((new Date(h.finishedAt).getTime() - new Date(h.attendedAt).getTime()) / 60000)
          : undefined,
      })),
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };
  }

  public async getById(id: string): Promise<HistoryDetailsResponse> {
    return api.get<HistoryDetailsResponse>(`/history/${id}`);
  }

  public async exportHistory(format: 'csv' | 'xlsx' = 'csv', params?: HistoryQueryParams): Promise<void> {
    await api.download('/history/export', `historico_atendimentos_${new Date().toISOString().slice(0, 10)}.${format}`, {
      format,
      ...params,
    });
  }
}

export const historyService = new HistoryService();

