import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Ticket, Patient, Room, QueueStats, PriorityLevel, ServiceType } from '../types';
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
    priority: PriorityLevel;
    service: ServiceType;
    birthDate?: string;
    phone?: string;
  }) => Ticket;
  callNext: (roomId: string, professionalName?: string) => Ticket | null;
  callAgain: (ticketId: string) => Ticket | null;
  startAttendance: (ticketId: string) => Ticket | null;
  finishAttendance: (ticketId: string) => Ticket | null;
  markAbsent: (ticketId: string) => Ticket | null;
  resetData: () => void;
  refresh: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    totalWaiting: 0,
    totalAttendedToday: 0,
    averageWaitMinutes: 0,
    byPriority: { URGENTE: 0, PREFERENCIAL: 0, NORMAL: 0 },
  });

  const refresh = useCallback(() => {
    const t = mockQueueService.getTickets();
    const p = mockQueueService.getPatients();
    const r = mockQueueService.getRooms();
    const s = mockQueueService.getStats();

    setTickets([...t]);
    setPatients([...p]);
    setRooms([...r]);
    setStats(s);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const lastCalledTicket = tickets
    .filter((t) => t.status === 'CHAMANDO' || t.status === 'EM_ATENDIMENTO')
    .sort((a, b) => new Date(b.calledAt || 0).getTime() - new Date(a.calledAt || 0).getTime())[0] || null;

  const waitingQueue = mockQueueService.getWaitingQueue();

  const addPatient = (data: {
    patientName: string;
    cartaoSus?: string;
    priority: PriorityLevel;
    service: ServiceType;
    birthDate?: string;
    phone?: string;
  }) => {
    const newTicket = mockQueueService.addTicket(data);
    refresh();
    return newTicket;
  };

  const callNext = (roomId: string, professionalName?: string) => {
    const called = mockQueueService.callNextTicket(roomId, professionalName);
    refresh();
    return called;
  };

  const callAgain = (ticketId: string) => {
    const res = mockQueueService.callAgain(ticketId);
    refresh();
    return res;
  };

  const startAttendance = (ticketId: string) => {
    const res = mockQueueService.startAttendance(ticketId);
    refresh();
    return res;
  };

  const finishAttendance = (ticketId: string) => {
    const res = mockQueueService.finishAttendance(ticketId);
    refresh();
    return res;
  };

  const markAbsent = (ticketId: string) => {
    const res = mockQueueService.markAbsent(ticketId);
    refresh();
    return res;
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
