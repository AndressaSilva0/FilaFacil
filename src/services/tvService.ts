import { api } from './api';

export interface TvCallItem {
  code: string;
  patientName: string;
  room: string;
  doctor?: string;
  professional?: string;
  priority: string;
  priorityLabel: string;
  service?: string;
  serviceLabel?: string;
  timestamp: string;
}

export interface TvUpcomingItem {
  code: string;
  patientName: string;
  priority: string;
  priorityLabel: string;
  service: string;
  serviceLabel: string;
  estimatedTime: string;
}

class TvService {
  public async getCurrentCall(): Promise<TvCallItem | null> {
    try {
      const data = await api.get<{ hasCall?: boolean; currentCall: TvCallItem | null }>('/tv/current-call');
      return data?.currentCall || null;
    } catch {
      return null;
    }
  }

  public async getUpcoming(): Promise<TvUpcomingItem[]> {
    try {
      const data = await api.get<any>('/tv/upcoming');
      if (Array.isArray(data)) return data;
      return data?.upcoming || [];
    } catch {
      return [];
    }
  }
}

export const tvService = new TvService();

