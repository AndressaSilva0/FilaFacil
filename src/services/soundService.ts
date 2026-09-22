import type { Ticket } from '../types';

class SoundService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Toca o sino clássico de chamada de painel (dois tons harmônicos)
   */
  public playChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) {
          resolve();
          return;
        }

        const now = ctx.currentTime;

        // Primeiro tom (Mi - ~659Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Segundo tom (Dó - ~523Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25, now + 0.35);
        gain2.gain.setValueAtTime(0.25, now + 0.35);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.35);
        osc2.stop(now + 1.2);

        setTimeout(() => resolve(), 1200);
      } catch {
        resolve();
      }
    });
  }

  /**
   * Sintetiza voz em português anunciando a senha, nome e sala
   */
  public speakCall(ticket: Ticket): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      const priorityText = 
        ticket.priority === 'PREFERENCIAL' 
          ? 'Preferencial' 
          : ticket.priority === 'URGENTE' 
          ? 'Urgência' 
          : 'Normal';

      const text = `Senha ${priorityText} ${ticket.code.replace('-', ' ')}. ${ticket.patientName}. Comparecer ao ${ticket.room || 'atendimento'}.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Buscar voz em português se disponível
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.includes('pt') || v.lang.includes('BR'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignorar caso navegador restrinja reprodução antes de clique
    }
  }

  /**
   * Executa a sequência completa de chamada: Sino hospitalar + Anúncio de voz
   */
  public async announceTicket(ticket: Ticket): Promise<void> {
    await this.playChime();
    this.speakCall(ticket);
  }
}

export const soundService = new SoundService();
