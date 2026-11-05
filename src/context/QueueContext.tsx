import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Ticket, Patient, Room, QueueStats, PriorityLevel, ServiceType } from '../types';
import { ticketService } from '../services/ticketService';
import { roomService } from '../services/roomService';
import { statsService } from '../services/statsService';
import { socketService } from '../services/socketService';
import { soundService } from '../services/soundService';
import { mockQueueService } from '../services/mockQueueService';

interface QueueContextType {
  tickets: Ticket[];
  patients: Patient[];
  rooms: Room[];
  stats: QueueStats;
  waitingQueue: Ticket[];
  lastCalledTicket: Ticket | null;
  addPatient: (data: {
    patientName: string;
    cartaoSus?: string;
    cpf?: string;
    priority: PriorityLevel;
    service: ServiceType;
    birthDate?: string;
    phone?: string;
  }) => Promise<Ticket> | Ticket;
  callNext: (roomId?: string, professionalName?: string) => Promise<Ticket | null>;
  callAgain: (ticketId: string) => Promise<Ticket | null>;
  startAttendance: (ticketId: string) => Promise<Ticket | null>;
  finishAttendance: (ticketId: string) => Promise<Ticket | null>;
  markAbsent: (ticketId: string) => Promise<Ticket | null>;
  resetData: () => void;
  refresh: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    totalWaiting: 0,
    totalAttendedToday: 0,
    averageWaitMinutes: 0,
    byPriority: { URGENTE: 0, PREFERENCIAL: 0, NORMAL: 0 },
  });

  const refresh = useCallback(async () => {
    try {
      const [tData, wData, rData, sData] = await Promise.all([
        ticketService.getTickets({ limit: 100 }).catch(() => null),
        ticketService.getWaitingQueue().catch(() => null),
        roomService.list().catch(() => null),
        statsService.getDashboard().catch(() => null),
      ]);

      if (tData) setTickets(tData.tickets);
      if (wData) setWaitingQueue(wData);
      if (rData) setRooms(rData);
      if (sData) setStats(sData);
    } catch {
      // Fallback local se o backend não estiver rodando
      setTickets(mockQueueService.getTickets());
      setPatients(mockQueueService.getPatients());
      setRooms(mockQueueService.getRooms());
      setStats(mockQueueService.getStats());
      setWaitingQueue(mockQueueService.getWaitingQueue());
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubCalled = socketService.onTicketCalled(() => refresh());
    const unsubStatus = socketService.onStatusUpdated(() => refresh());
    const unsubMetrics = socketService.onMetricsUpdated(() => refresh());
    const unsubQueue = socketService.onQueueUpdated(() => refresh());

    return () => {
      unsubCalled();
      unsubStatus();
      unsubMetrics();
      unsubQueue();
    };
  }, [refresh]);

  const lastCalledTicket = tickets
    .filter((t) => t.status === 'CHAMANDO' || t.status === 'EM_ATENDIMENTO')
    .sort((a, b) => new Date(b.calledAt || 0).getTime() - new Date(a.calledAt || 0).getTime())[0] || null;

  const addPatient = async (data: {
    patientName: string;
    cartaoSus?: string;
    cpf?: string;
    priority: PriorityLevel;
    service: ServiceType;
    birthDate?: string;
    phone?: string;
  }) => {
    try {
      const res = await ticketService.createTicket({
        patientName: data.patientName,
        cartaoSus: data.cartaoSus,
        cpf: data.cpf,
        priority: data.priority,
        service: data.service,
        birthDate: data.birthDate,
        phone: data.phone,
      });
      refresh();
      return res.ticket;
    } catch {
      const fallback = mockQueueService.addTicket(data);
      refresh();
      return fallback;
    }
  };

  const callNext = async (roomId?: string, professionalName?: string) => {
    try {
      const called = await ticketService.callNext(roomId, professionalName);
      if (called) {
        soundService.announceCall({
          code: called.code,
          patientName: called.patientName,
          room: called.room || 'Consultório',
          priority: called.priorityLabel || called.priority,
        });
      }
      refresh();
      return called;
    } catch {
      const called = mockQueueService.callNextTicket(roomId || '1', professionalName);
      refresh();
      return called;
    }
  };

  const callAgain = async (ticketId: string) => {
    try {
      const recalled = await ticketService.recall(ticketId);
      soundService.announceCall({
        code: recalled.code,
        patientName: recalled.patientName,
        room: recalled.room || 'Consultório',
        priority: recalled.priorityLabel || recalled.priority,
      });
      refresh();
      return recalled;
    } catch {
      const res = mockQueueService.callAgain(ticketId);
      refresh();
      return res;
    }
  };

  const startAttendance = async (ticketId: string) => {
    try {
      const res = await ticketService.startAttendance(ticketId);
      refresh();
      return res;
    } catch {
      const res = mockQueueService.startAttendance(ticketId);
      refresh();
      return res;
    }
  };

  const finishAttendance = async (ticketId: string) => {
    try {
      const res = await ticketService.finishAttendance(ticketId);
      refresh();
      return res;
    } catch {
      const res = mockQueueService.finishAttendance(ticketId);
      refresh();
      return res;
    }
  };

  const markAbsent = async (ticketId: string) => {
    try {
      const res = await ticketService.markAbsent(ticketId);
      refresh();
      return res;
    } catch {
      const res = mockQueueService.markAbsent(ticketId);
      refresh();
      return res;
    }
  };

  const resetData = () => {
    mockQueueService.resetData();
    refresh();
  };

  return (
    <QueueContext.Provider
      value={{
        tickets,
        patients,
        rooms,
        stats,
        waitingQueue,
        lastCalledTicket,
        addPatient,
        callNext,
        callAgain,
        startAttendance,
        finishAttendance,
        markAbsent,
        resetData,
        refresh,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = (): QueueContextType => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue deve ser usado dentro de um QueueProvider');
  }
  return context;
};
