export interface BroadcastCallData {
  code: string;
  patientName: string;
  room: string;
  priority?: string;
  timestamp: number;
}

type CallListener = (data: BroadcastCallData) => void;

class CallBroadcastService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<CallListener> = new Set();
  private storageKey = 'filafacil_active_call_broadcast';

  constructor() {
    if (typeof window !== 'undefined') {
      // BroadcastChannel para comunicação instantânea entre abas
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel('filafacil_queue_channel');
          this.channel.onmessage = (event) => {
            if (event.data && event.data.type === 'TICKET_CALLED') {
              this.notifyListeners(event.data.payload);
            }
          };
        } catch {
          this.channel = null;
        }
      }

      // Fallback via evento de storage para navegadores ou contextos sem BroadcastChannel
      window.addEventListener('storage', (event) => {
        if (event.key === this.storageKey && event.newValue) {
          try {
            const data: BroadcastCallData = JSON.parse(event.newValue);
            this.notifyListeners(data);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  private notifyListeners(data: BroadcastCallData) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('Erro ao notificar ouvinte de chamada:', err);
      }
    });
  }

  /**
   * Emite uma chamada para todas as abas conectadas (ex: Painel de TV)
   */
  public emitCall(data: Omit<BroadcastCallData, 'timestamp'>): void {
    const payload: BroadcastCallData = {
      ...data,
      timestamp: Date.now(),
    };

    // 1. Notifica ouvintes na aba atual
    this.notifyListeners(payload);

    // 2. Transmite via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'TICKET_CALLED',
          payload,
        });
      } catch {
        // ignore
      }
    }

    // 3. Transmite via localStorage para garantir sincronização entre abas
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(payload));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Registra um ouvinte para receber chamadas de senha em tempo real
   */
  public onCall(listener: CallListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const callBroadcastService = new CallBroadcastService();
