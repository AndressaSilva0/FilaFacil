/**
 * Serviço de Transmissão sem Fios para Smart TVs e Telas Secundárias (Web Presentation API)
 * Permite detectar Smart TVs / Chromecasts na mesma rede Wi-Fi e transmitir o Painel de TV
 * sem necessidade de espelhar o monitor de trabalho do profissional.
 */

declare global {
  interface Window {
    PresentationRequest?: any;
  }
}

export type CastState = 'disconnected' | 'connecting' | 'connected' | 'terminated';

class CastService {
  private presentationRequest: any = null;
  private currentConnection: any = null;
  private listeners: ((state: CastState, details?: any) => void)[] = [];
  private state: CastState = 'disconnected';

  constructor() {
    this.initPresentationRequest();
  }

  private initPresentationRequest() {
    if (typeof window === 'undefined') return;

    if ('PresentationRequest' in window && window.PresentationRequest) {
      try {
        const presentationUrl = `${window.location.origin}${window.location.pathname}#/tv-panel`;
        this.presentationRequest = new window.PresentationRequest([
          presentationUrl,
          '#/tv-panel',
          '/tv-panel',
        ]);

        // Monitora disponibilidade de telas na rede local
        if (this.presentationRequest.getAvailability) {
          this.presentationRequest
            .getAvailability()
            .then((availability: any) => {
              availability.onchange = () => {
                console.log(
                  '[CastService] Disponibilidade de Smart TVs na rede Wi-Fi:',
                  availability.value
                );
              };
            })
            .catch(() => {
              // Alguns navegadores restringem getAvailability por política de segurança
            });
        }
      } catch (err) {
        console.warn('[CastService] Erro ao inicializar PresentationRequest:', err);
      }
    }
  }

  /**
   * Verifica se o navegador suporta a Web Presentation API (Chromecast / Smart TVs)
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'PresentationRequest' in window;
  }

  public getState(): CastState {
    return this.state;
  }

  public onStateChange(listener: (state: CastState, details?: any) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(state: CastState, details?: any) {
    this.state = state;
    this.listeners.forEach((l) => l(state, details));
  }

  /**
   * Inicia o diálogo nativo do navegador para detectar Smart TVs e Chromecasts na rede local
   */
  public async startCast(): Promise<{ success: boolean; mode: 'presentation' | 'window'; error?: string }> {
    if (this.isSupported() && this.presentationRequest) {
      try {
        this.notify('connecting');
        const connection = await this.presentationRequest.start();
        this.currentConnection = connection;

        this.notify('connected', { id: connection.id });

        connection.onconnect = () => {
          this.notify('connected', { id: connection.id });
        };

        connection.onclose = () => {
          this.notify('disconnected');
        };

        connection.onterminate = () => {
          this.notify('terminated');
        };

        return { success: true, mode: 'presentation' };
      } catch (err: any) {
        this.notify('disconnected');
        // Usuário cancelou ou navegador não encontrou dispositivos
        if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
          return { success: false, mode: 'presentation', error: 'Transmissão cancelada pelo usuário.' };
        }
        console.warn('[CastService] Falha na Presentation API, utilizando fallback para janela dedicada:', err);
      }
    }

    // Fallback: abre em uma janela/aba dedicada sem espelhar o monitor atual
    const win = this.openDedicatedWindow();
    return {
      success: !!win,
      mode: 'window',
      error: win ? undefined : 'Pop-up bloqueado pelo navegador. Por favor, permita pop-ups para abrir o painel.',
    };
  }

  /**
   * Encerra a transmissão ativa para a TV
   */
  public stopCast() {
    if (this.currentConnection) {
      try {
        this.currentConnection.terminate();
      } catch (e) {
        // Ignora
      }
      this.currentConnection = null;
    }
    this.notify('disconnected');
  }

  /**
   * Abre o Painel de TV em uma janela independente (ideal para arrastar para TV via HDMI ou monitor externo sem espelhamento)
   */
  public openDedicatedWindow(): Window | null {
    const url = `${window.location.origin}${window.location.pathname}#/tv-panel`;
    const win = window.open(
      url,
      'FilaFacilTVPanel',
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no'
    );
    if (win) {
      win.focus();
    }
    return win;
  }
}

export const castService = new CastService();

