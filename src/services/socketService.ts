import { io, Socket } from 'socket.io-client';
import { callBroadcastService } from './callBroadcastService';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export interface TicketCalledPayload {
  code: string;
  patientName: string;
  room: string;
  professional?: string;
  priority?: string;
  priorityLabel?: string;
  serviceLabel?: string;
  timestamp?: number;
}

export interface TicketStatusUpdatedPayload {
  id: string;
  code: string;
  status: string;
  calledAt?: string;
  attendedAt?: string;
  finishedAt?: string;
  room?: string;
  professional?: string;
}

type EventCallback<T = any> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    this.init();
  }

  public init(): void {
    if (this.socket) return;

    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 2000,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        // Entra na sala geral da fila
        this.socket?.emit('join:room', 'general-queue');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
      });

      this.socket.on('connect_error', () => {
        this.isConnected = false;
      });

      // Evento: Senha chamada
      this.socket.on('ticket:called', (payload: TicketCalledPayload) => {
        // 1. Notifica via broadcast local (BroadcastChannel / storage)
        callBroadcastService.emitCall({
          code: payload.code,
          patientName: payload.patientName,
          room: payload.room,
          priority: payload.priorityLabel || payload.priority,
        });

        // 2. Notifica ouvintes internos
        this.notify('ticket:called', payload);
      });

      // Evento: Status atualizado (chamando, em atendimento, finalizado, ausente)
      this.socket.on('ticket:status-updated', (payload: TicketStatusUpdatedPayload) => {
        this.notify('ticket:status-updated', payload);
        this.notify('queue:updated', payload);
      });

      // Evento: Métricas do dashboard recalculadas
      this.socket.on('queue:metrics-updated', (payload: any) => {
        this.notify('queue:metrics-updated', payload);
      });

      // Evento genérico de atualização da fila
      this.socket.on('queue:updated', (payload: any) => {
        this.notify('queue:updated', payload);
      });
    } catch (err) {
      console.warn('[SocketService] Não foi possível conectar ao servidor Socket.IO:', err);
    }
  }

  private notify(event: string, data: any) {
    const subs = this.listeners.get(event);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Erro no ouvinte do evento ${event}:`, err);
        }
      });
    }
  }

  public on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public onTicketCalled(callback: EventCallback<TicketCalledPayload>): () => void {
    return this.on('ticket:called', callback);
  }

  public onStatusUpdated(callback: EventCallback<TicketStatusUpdatedPayload>): () => void {
    return this.on('ticket:status-updated', callback);
  }

  public onMetricsUpdated(callback: EventCallback<any>): () => void {
    return this.on('queue:metrics-updated', callback);
  }

  public onQueueUpdated(callback: EventCallback<any>): () => void {
    return this.on('queue:updated', callback);
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
