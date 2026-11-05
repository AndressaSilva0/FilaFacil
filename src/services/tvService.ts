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
    const data = await api.get<{ currentCall: TvCallItem | null }>('/tv/current-call');
    return data.currentCall;
  }

  public async getUpcoming(): Promise<TvUpcomingItem[]> {
    const data = await api.get<{ upcoming: TvUpcomingItem[] }>('/tv/upcoming');
    return data.upcoming || [];
  }
}

export const tvService = new TvService();

