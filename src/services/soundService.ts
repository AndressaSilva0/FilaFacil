import type { Ticket, PriorityLevel } from '../types';

export interface SoundAnnouncementParams {
  code: string;
  patientName?: string;
  priority?: PriorityLevel | string;
  room?: string;
}

class SoundService {
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        try {
          window.speechSynthesis.getVoices();
        } catch {
          // ignore
        }
      };
    }
  }

  public async ensureAudioContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.audioCtx = new AudioCtx();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Destrava o áudio do navegador em resposta a uma ação do usuário
   */
  public async unlockAudio(): Promise<boolean> {
    try {
      const ctx = await this.ensureAudioContext();
      if (!ctx) return false;
      if (ctx.state === 'running') {
        return true;
      }
      await ctx.resume();
      return (ctx.state as AudioContextState) === 'running';
    } catch {
      return false;
    }
  }

  /**
   * Toca o sino clássico de chamada de painel (dois tons harmônicos)
   */
  public async playChime(): Promise<void> {
    try {
      const ctx = await this.ensureAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primeiro tom (Mi - ~659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.55);

      // Segundo tom (Dó - ~523Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, now + 0.28);
      gain2.gain.setValueAtTime(0.001, now + 0.28);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.32);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.28);
      osc2.stop(now + 1.1);

      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      console.warn('Erro ao tocar sino:', err);
    }
  }

  /**
   * Sintetiza voz em português anunciando a senha, nome e sala
   */
  public speakAnnouncement(params: SoundAnnouncementParams): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      let priorityText = '';
      const p = (params.priority || '').toString().toUpperCase();
      if (
        p.includes('PREFERENCIAL') ||
        p.includes('PRIORITÁRIO') ||
        p.includes('PRIORIDADE') ||
        p.includes('IDOSO') ||
        p.includes('GESTANTE') ||
        p.includes('80+')
      ) {
        priorityText = 'Preferencial';
      } else if (p.includes('URGENTE') || p.includes('URGÊNCIA')) {
        priorityText = 'Urgência';
      } else if (p.includes('EXAME')) {
        priorityText = 'Exames';
      } else if (p.includes('CONVENCIONAL') || p.includes('NORMAL')) {
        priorityText = 'Normal';
      }

      // Separa letras e números para pronúncia clara (Ex: A123 -> A 123)
      const cleanCode = (params.code || '')
        .replace(/([a-zA-Z]+)(\d+)/g, '$1 $2')
        .replace(/-/g, ' ');

      // Trata sala de forma elegante ("ao Consultório 01", "à Sala 02", etc)
      let roomPhrase = 'ao atendimento';
      if (params.room) {
        const rLower = params.room.toLowerCase().trim();
        if (
          rLower.startsWith('sala') ||
          rLower.startsWith('recepção') ||
          rLower.startsWith('clínica') ||
          rLower.startsWith('triagem')
        ) {
          roomPhrase = `à ${params.room}`;
        } else {
          roomPhrase = `ao ${params.room}`;
        }
      }

      const parts: string[] = [];
      if (priorityText) {
        parts.push(`Senha ${priorityText}, ${cleanCode}.`);
      } else {
        parts.push(`Senha ${cleanCode}.`);
      }

      if (params.patientName && params.patientName.trim()) {
        parts.push(`${params.patientName.trim()}.`);
      }

      parts.push(`Comparecer ${roomPhrase}.`);

      const text = parts.join(' ');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Buscar voz brasileira se disponível
      const voices = window.speechSynthesis.getVoices();
      const ptVoice =
        voices.find(
          (v) =>
            (v.lang.includes('pt') || v.lang.includes('PT')) &&
            (v.lang.includes('BR') || v.lang.includes('br'))
        ) || voices.find((v) => v.lang.includes('pt') || v.lang.includes('PT'));

      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Erro ao falar chamada:', err);
    }
  }

  /**
   * Sintetiza voz mantendo retrocompatibilidade com objeto Ticket
   */
  public speakCall(ticket: Ticket): void {
    this.speakAnnouncement({
      code: ticket.code,
      patientName: ticket.patientName,
      priority: ticket.priorityLabel || ticket.priority,
      room: ticket.room,
    });
  }

  /**
   * Executa a sequência completa de chamada: Sino hospitalar + Anúncio de voz suavemente sobreposto
   */
  public async announceCall(params: SoundAnnouncementParams): Promise<void> {
    this.playChime();
    setTimeout(() => {
      this.speakAnnouncement(params);
    }, 600);
  }

  /**
   * Mantém retrocompatibilidade para objetos do tipo Ticket
   */
  public async announceTicket(ticket: Ticket): Promise<void> {
    await this.announceCall({
      code: ticket.code,
      patientName: ticket.patientName,
      priority: ticket.priorityLabel || ticket.priority,
      room: ticket.room,
    });
  }
}

export const soundService = new SoundService();
