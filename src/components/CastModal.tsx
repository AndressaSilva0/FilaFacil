import React, { useState, useEffect } from 'react';
import {
  Cast,
  Tv,
  ExternalLink,
  Copy,
  Check,
  X,
  Wifi,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { castService, type CastState } from '../services/castService';

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTvPanel?: () => void;
}

export const CastModal: React.FC<CastModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTvPanel,
}) => {
  const [castState, setCastState] = useState<CastState>(castService.getState());
  const [isCopied, setIsCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = castService.onStateChange((state) => {
      setCastState(state);
      if (state === 'connected') {
        setErrorMessage(null);
      }
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const tvUrl = `${window.location.origin}${window.location.pathname}#/tv-panel`;

  const handleStartCast = async () => {
    setErrorMessage(null);
    const result = await castService.startCast();
    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleStopCast = () => {
    castService.stopCast();
  };

  const handleOpenWindow = () => {
    const win = castService.openDedicatedWindow();
    if (!win) {
      setErrorMessage('O navegador bloqueou a abertura de pop-ups. Por favor, libere pop-ups para este site.');
    } else {
      onClose();
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(tvUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInModal 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: castState === 'connected' ? '#dcfce7' : '#eff6ff',
                color: castState === 'connected' ? '#16a34a' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cast size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f2d59' }}>
                Transmitir para Televisão / Painel
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Envie a chamada para a sala de espera sem espelhar seu computador
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensagem de Erro / Aviso */}
        {errorMessage && (
          <div
            style={{
              margin: '1rem 1.5rem 0',
              padding: '0.75rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#b91c1c',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Status de Conexão Ativa */}
        {castState === 'connected' && (
          <div
            style={{
              margin: '1rem 1.5rem 0',
              padding: '0.85rem 1rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={18} color="#16a34a" className="animate-pulse" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                Conectado e transmitindo para a TV!
              </span>
            </div>
            <button
              type="button"
              onClick={handleStopCast}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Parar Transmissão
            </button>
          </div>
        )}

        {/* Corpo com as 3 opções práticas */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Opção 1: Sem Fios (Chromecast / Smart TV) */}
          <div
            style={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Wifi size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f2d59', display: 'block' }}>
                  1. Transmissão sem Fios (Smart TV / Chromecast)
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  Abre a busca nativa do navegador para encontrar TVs na mesma rede Wi-Fi.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartCast}
              disabled={castState === 'connecting'}
              style={{
                backgroundColor: castState === 'connected' ? '#059669' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              }}
            >
              <Cast size={15} />
              {castState === 'connecting'
                ? 'Buscando...'
                : castState === 'connected'
                ? 'Conectado'
                : 'Detectar TV'}
            </button>
          </div>

          {/* Opção 2: Monitor Secundário ou Cabo HDMI */}
          <div
            style={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Monitor size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f2d59', display: 'block' }}>
                  2. Janela Dedicada (Cabo HDMI / Segundo Monitor)
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  Abre o painel em janela própria para você arrastar para a TV sem espelhar.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenWindow}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f2d59',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.55rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                flexShrink: 0,
              }}
            >
              <ExternalLink size={15} />
              Abrir Janela
            </button>
          </div>

          {/* Opção 3: Navegador da TV (Acesso Direto) */}
          <div
            style={{
              border: '1.5px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '1rem',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Tv size={16} color="#64748b" />
              <strong style={{ fontSize: '0.85rem', color: '#334155' }}>
                3. Abrir direto no navegador da Smart TV (Recomendado na UBS)
              </strong>
            </div>

            <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: '#64748b' }}>
              Basta abrir o navegador web da Smart TV ou TV Box uma única vez e digitar:
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  color: '#2563eb',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {tvUrl}
              </span>

              <button
                type="button"
                onClick={handleCopyUrl}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isCopied ? '#16a34a' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.4rem',
                }}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                {isCopied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
            <CheckCircle2 size={15} color="#16a34a" />
            <span>Sincronização instantânea via Socket.IO ativa</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onNavigateToTvPanel && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToTvPanel();
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#2563eb',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '0.4rem 0.8rem',
                }}
              >
                Ver Tela do Painel
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#e2e8f0',
                color: '#334155',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CastModal;

