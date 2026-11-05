import { api } from './api';
import type { QueueStats, PriorityLevel } from '../types';

export interface DashboardStatsResponse {
  totalWaiting: number;
  byPriority: Record<PriorityLevel, number>;
  averageWaitMinutes: number;
  totalAttendedToday: number;
  totalAbsentToday: number;
  inAttendance: number;
  targetMet: boolean;
}

export interface AnalyticalReportResponse {
  period: string;
  total: number;
  attended: number;
  absent: number;
  absenteeismRate: string;
  bySpecialty: { specialty: string; count: number; percentage: string }[];
  hourlyFlow: { hour: string; count: number }[];
}

class StatsService {
  public async getDashboard(): Promise<QueueStats> {
    const data = await api.get<DashboardStatsResponse>('/stats/dashboard');
    return {
      totalWaiting: data.totalWaiting,
      totalAttendedToday: data.totalAttendedToday,
      totalAbsent: data.totalAbsentToday,
      totalInConsultation: data.inAttendance,
      averageWaitMinutes: data.averageWaitMinutes,
      byPriority: data.byPriority,
      punctualityPercent: data.targetMet ? 94 : 78,
    };
  }

  public async getReports(period: 'today' | 'week' | 'month' = 'today'): Promise<AnalyticalReportResponse> {
    return api.get<AnalyticalReportResponse>('/stats/reports', { period });
  }

  public async exportPdf(): Promise<void> {
    await api.download('/stats/export', `relatorio_analitico_ubs_${new Date().toISOString().slice(0, 10)}.pdf`, {
      format: 'pdf',
    });
  }
}

export const statsService = new StatsService();

