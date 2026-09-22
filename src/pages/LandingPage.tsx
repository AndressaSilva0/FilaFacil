import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Tv, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Stethoscope, 
  BarChart3, 
  Sparkles,
  ChevronRight,
  Volume2,
  Lock,
  HeartHandshake
} from 'lucide-react';
import Logo from '../components/Logo';
import { soundService } from '../services/soundService';
import '../styles/landing.css';

interface LandingPageProps {
  onOpenSystem?: () => void;
  onOpenTvPanel?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenSystem,
  onOpenTvPanel,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestChimeAndVoice = () => {
    soundService.announceTicket({
      id: 'demo-1',
      code: 'PRI-019',
      patientId: 'p-demo',
      patientName: 'Maria das Graças Silva',
      priority: 'PREFERENCIAL',
      service: 'CONSULTA_MEDICA',
      status: 'CHAMANDO',
      room: 'Consultório 02 - Médico da Família',
      createdAt: new Date().toISOString(),
    });
    showToast('Chamando senha PRI-019 no Painel de TV!');
  };

  return (
    <div className="landing-container">
      {/* Toast flutuante */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: 'var(--color-blue-deep)',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Sparkles size={18} color="var(--color-green-health)" />
          {toastMessage}
        </div>
      )}

      {/* ---------------- 1. HEADER / NAVBAR ---------------- */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <a href="#inicio" style={{ textDecoration: 'none' }}>
            <Logo size="md" showSubtitle={false} />
          </a>

          <nav>
            <ul className="landing-nav-links">
              <li><a href="#inicio" className="active">Início</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#beneficios">Benefícios SUS</a></li>
              <li><a href="#painel-tv">Painel de TV</a></li>
              <li><a href="#depoimentos">Depoimentos</a></li>
            </ul>
          </nav>

          <div className="landing-header-actions">
            <button 
              className="btn-landing-login"
              onClick={onOpenSystem || (() => showToast('Abrindo sistema de recepção...'))}
            >
              Acessar Sistema
            </button>
            <button 
              className="btn-landing-cta"
              onClick={() => showToast('Demonstração agendada com a equipe!')}
            >
              Agendar Demonstração
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- 2. HERO SECTION ---------------- */}
      <section id="inicio" className="hero-section">
        <div className="hero-left-col">
          <div className="hero-tag-pill">
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green-health)' }}></span>
            TECNOLOGIA PÚBLICA EFICIENTE • ALINHADO AO SUS
          </div>

          <h1 className="hero-title">
            O jeito calmo e humanizado de organizar as <span className="hero-title-highlight">filas da sua UBS.</span>
          </h1>

          <p className="hero-description">
            O FilaFácil UBS é a plataforma gratuita de gestão para acabar com aglomerações e discussões na porta da unidade. Com senhas digitais, painel de TV e acolhimento humanizado na recepção.
          </p>

          <div className="hero-cta-group">
            <button 
              className="btn-hero-primary"
              onClick={onOpenSystem || (() => showToast('Redirecionando para o sistema...'))}
            >
              Começar a Usar Agora
              <ArrowRight size={18} />
            </button>

            <button 
              className="btn-hero-secondary"
              onClick={handleTestChimeAndVoice}
            >
              <Play size={16} fill="var(--color-blue-deep)" />
              Ver Demonstração ao Vivo
            </button>
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <CheckCircle2 size={20} color="var(--color-green-health)" />
              <div>
                <div className="hero-stat-number">150+</div>
                <div className="hero-stat-label">UBSs Atendidas</div>
              </div>
            </div>

            <div className="hero-stat-item">
              <Zap size={20} color="var(--color-blue-ubs)" />
              <div>
                <div className="hero-stat-number">-45%</div>
                <div className="hero-stat-label">Tempo de Espera</div>
              </div>
            </div>

            <div className="hero-stat-item">
              <HeartHandshake size={20} color="var(--color-green-health)" />
              <div>
                <div className="hero-stat-number">98%</div>
                <div className="hero-stat-label">Satisfação SUS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Right Col (Nurse Tablet Image + Floating Ticket) */}
        <div className="hero-media-wrapper">
          <div className="hero-image-card">
            <img 
              src="/images/hero-tablet-nurse.png" 
              alt="Enfermeira com tablet atendendo pacientes na recepção da UBS" 
            />
            <div className="hero-image-badge">
              📍 Acolhimento Humanizado com Tablet Móvel
            </div>
          </div>

          {/* Floating Live Ticket Card */}
          <div className="hero-floating-ticket">
            <div className="ticket-header-row">
              <div className="ticket-pulse-indicator">
                <span className="pulse-dot"></span>
                Chamando Agora no Painel
              </div>
              <button 
                onClick={handleTestChimeAndVoice}
                style={{ fontSize: '0.72rem', color: 'var(--color-blue-ubs)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Ouvir som →
              </button>
            </div>

            <div className="ticket-data-grid">
              <div>
                <div className="ticket-field-label">Senha Atual</div>
                <div className="ticket-field-value-code">PRI-019</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-preferencial)', fontWeight: 600 }}>Preferencial (60+)</span>
              </div>
              <div>
                <div className="ticket-field-label">Destino</div>
                <div className="ticket-field-value-room">Sala 02</div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Médico da Família</span>
              </div>
            </div>

            <button 
              className="btn-ticket-action"
              onClick={() => showToast('Paciente chamado para a Sala 02!')}
            >
              <CheckCircle2 size={14} />
              Iniciar Atendimento na Recepção
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- 3. TRUST BAR ---------------- */}
      <section className="trust-bar-section">
        <div className="trust-bar-inner">
          <div className="trust-item">
            <CheckCircle2 size={18} color="var(--color-green-health)" />
            <span>Alinhado às Diretrizes do SUS e e-SUS APS</span>
          </div>
          <div className="trust-item">
            <ShieldCheck size={18} color="var(--color-blue-ubs)" />
            <span>Segurança Total & Conformidade com a LGPD</span>
          </div>
          <div className="trust-item">
            <Zap size={18} color="var(--color-green-health)" />
            <span>Zero Travamentos: Funciona em Redes Municipais Básicas</span>
          </div>
        </div>
      </section>

      {/* ---------------- 4. FEATURES GRID ---------------- */}
      <section id="como-funciona" className="features-section">
        <span className="section-tag-center">TECNOLOGIA PÚBLICA EFICIENTE</span>
        <h2 className="section-title-center">
          Tudo o que a equipe de saúde precisa para um atendimento calmo.
        </h2>
        <p className="section-sub-center">
          Elimine fichas perdidas, discussões de preferência na porta e lentidão nos consultórios.
        </p>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--color-green-soft)', color: 'var(--color-green-health)' }}>
              <Activity size={24} />
            </div>
            <h3 className="feature-title">Triagem Rápida & Prioridade Fácil</h3>
            <p className="feature-desc">
              Classificação instantânea de acordo com as diretrizes do Ministério da Saúde: Normal, Prioridade por Lei (60+, Gestantes, PCDs).
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: 'var(--color-blue-ubs)' }}>
              <Tv size={24} />
            </div>
            <h3 className="feature-title">Painel de TV da Recepção</h3>
            <p className="feature-desc">
              Atualização automática em tempo real na tela da sala de espera, com chamada sonora nítida e voz sintetizada para os pacientes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
              <Stethoscope size={24} />
            </div>
            <h3 className="feature-title">Controle do Agente & Consultório</h3>
            <p className="feature-desc">
              Cada profissional chama o próximo da sua especialidade em um clique pelo computador ou tablet, sem precisar ir até a sala de espera.
            </p>
          </div>

          {/* Card 4 */}
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: 'var(--color-preferencial)' }}>
              <BarChart3 size={24} />
            </div>
            <h3 className="feature-title">Relatórios para Gestão Municipal</h3>
            <p className="feature-desc">
              Relatórios e dados transparentes para secretarias municipais: tempo médio de espera, horários de pico e produtividade das equipes.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- 5. TV SHOWCASE SECTION ---------------- */}
      <section id="painel-tv" className="tv-showcase-section">
        <div className="tv-showcase-inner">
          <div className="tv-content-col">
            <span className="tv-content-tag">INTEGRAÇÃO & TEMPO REAL</span>
            <h2 className="tv-content-title">
              O Painel de TV que transforma o clima da recepção.
            </h2>
            <p className="tv-content-desc">
              Faça como as unidades de referência: transforme a sala de espera com um painel moderno, acessível e silencioso que transmite tranquilidade enquanto os cidadãos aguardam vacinação e consultas.
            </p>

            <div className="tv-benefits-list">
              <div className="tv-benefit-item">
                <CheckCircle2 size={18} color="var(--color-green-health)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Visibilidade nítida:</strong> Letras grandes, tipografia Poppins e alto contraste pensado para idosos.</span>
              </div>
              <div className="tv-benefit-item">
                <CheckCircle2 size={18} color="var(--color-green-health)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Som integrado:</strong> Sino hospitalar de atenção e voz em português anunciando a senha e a sala.</span>
              </div>
              <div className="tv-benefit-item">
                <CheckCircle2 size={18} color="var(--color-green-health)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Compatibilidade total:</strong> Funciona em qualquer Smart TV, computador, navegador ou TV Box.</span>
              </div>
            </div>

            <button 
              className="btn-tv-link"
              onClick={onOpenTvPanel || handleTestChimeAndVoice}
            >
              Ver demonstração do painel em tela cheia
              <ChevronRight size={18} />
            </button>
          </div>

          {/* TV Mockup */}
          <div className="tv-frame-mockup">
            <div className="tv-screen">
              <div className="tv-header-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green-health)' }}></span>
                  UBS JARDIM DAS FLORES • SISTEMA ONLINE
                </div>
                <div style={{ color: '#94a3b8', fontWeight: 600 }}>10:42</div>
              </div>

              <div className="tv-main-call-card">
                <div className="tv-call-badge-sub">CHAMANDO AGORA</div>
                <div className="tv-call-ticket-code">SENHA PRI-019</div>
                <div className="tv-call-patient-name">Maria das Graças Silva</div>
                <div className="tv-call-dest-pill">
                  CONSULTÓRIO 02 • MÉDICO DA FAMÍLIA
                </div>
              </div>

              <div className="tv-history-row">
                <div className="tv-history-col">
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Última Chamada</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>NOR-018</div>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Sala 01</div>
                </div>
                <div className="tv-history-col">
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Anterior</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>PRI-017</div>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Sala Vacina</div>
                </div>
                <div className="tv-history-col">
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Anterior</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>NOR-016</div>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Triagem</div>
                </div>
              </div>

              <div className="tv-ticker-footer">
                <Volume2 size={16} color="var(--color-green-health)" />
                <span>Compareça à sala indicada munido de documento oficial com foto e Cartão SUS.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 6. TESTIMONIALS SECTION ---------------- */}
      <section id="depoimentos" className="testimonials-section">
        <span className="section-tag-center">AVALIAÇÃO E DEPOIMENTOS</span>
        <h2 className="section-title-center">
          Quem está na ponta do SUS recomenda.
        </h2>
        <p className="section-sub-center">
          Centenas de profissionais da saúde e recepcionistas já transformaram a rotina de acolhimento da sua unidade.
        </p>

        <div className="testimonials-grid">
          {/* Card 1 */}
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              "Acabaram as discussões na recepção por causa da ordem de chegada. O painel na TV transmite transparência total e os pacientes aguardam muito mais calmos."
            </p>
            <div className="testimonial-author-row">
              <div className="testimonial-avatar" style={{ backgroundColor: 'var(--color-blue-ubs)' }}>
                CL
              </div>
              <div>
                <div className="testimonial-name">Clarice Lacerda</div>
                <div className="testimonial-role">Coordenadora de UBS • Fortaleza/CE</div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              "A agilidade para o médico chamar o próximo paciente direto do consultório poupa um tempo precioso. Conseguimos atender com mais atenção e calma."
            </p>
            <div className="testimonial-author-row">
              <div className="testimonial-avatar" style={{ backgroundColor: 'var(--color-green-health)' }}>
                MA
              </div>
              <div>
                <div className="testimonial-name">Dr. Marcos Albuquerque</div>
                <div className="testimonial-role">Médico da Família e Comunidade (PSF)</div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              "A implantação foi muito rápida. Em uma única tarde nossa recepção já estava operando sem dúvidas. Sistema leve e que não trava na rede municipal."
            </p>
            <div className="testimonial-author-row">
              <div className="testimonial-avatar" style={{ backgroundColor: 'var(--color-blue-deep)' }}>
                RN
              </div>
              <div>
                <div className="testimonial-name">Regina Nogueira</div>
                <div className="testimonial-role">Secretária Municipal de Saúde Adjunta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 7. FINAL CTA SECTION ---------------- */}
      <section className="final-cta-section">
        <div className="final-cta-card">
          <span className="final-cta-tag">ACESSO 100% GRATUITO PÚBLICO</span>
          <h2 className="final-cta-title">
            Pronto para levar organização e acolhimento à sua UBS?
          </h2>
          <p className="final-cta-desc">
            Transforme o fluxo de atendimento hoje mesmo. Sem burocracia, sem custos adicionais para o município e com suporte dedicado para treinamento da sua equipe.
          </p>

          <div className="final-cta-buttons">
            <button 
              className="btn-cta-green"
              onClick={() => showToast('Solicitação de demonstração enviada!')}
            >
              Solicitar Demonstração Gratuita
            </button>
            <button 
              className="btn-cta-outline-white"
              onClick={onOpenSystem || (() => showToast('Acessando modo operador...'))}
            >
              Acessar Sistema como Operador
            </button>
          </div>

          <div className="final-cta-guarantee">
            Alinhado às diretrizes do SUS • Conformidade integral com a LGPD • Suporte contínuo para sua unidade
          </div>
        </div>
      </section>

      {/* ---------------- 8. FOOTER ---------------- */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <Logo variant="white" size="md" showSubtitle={false} />
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Solução de gestão inteligente de filas e triagem para Unidades Básicas de Saúde, garantindo transparência, acolhimento e agilidade no atendimento do SUS.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Projeto Acadêmico • IFMA • Alpha Company
            </div>
          </div>

          <div>
            <div className="footer-col-title">Navegação</div>
            <ul className="footer-links-list">
              <li><a href="#inicio">Início</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#beneficios">Benefícios SUS</a></li>
              <li><a href="#painel-tv">Painel de TV</a></li>
              <li><a href="#depoimentos">Depoimentos</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Para a Unidade</div>
            <ul className="footer-links-list">
              <li><a href="#inicio" onClick={onOpenSystem}>Acessar Sistema</a></li>
              <li><a href="#painel-tv" onClick={onOpenTvPanel}>Painel de Chamadas</a></li>
              <li><a href="#inicio">Guia de Implantação</a></li>
              <li><a href="#inicio">Manual do Recepcionista</a></li>
              <li><a href="#inicio">Suporte Técnico</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Legislação SUS</div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Em conformidade com a Lei Federal nº 10.048/2000 que dá prioridade de atendimento a pessoas com deficiência, idosos, gestantes e lactantes.
            </p>
            <div className="footer-badge-law">
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Conforme LGPD & e-SUS APS
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>
            © 2026 FilaFácil UBS. Todos os direitos reservados. Desenvolvido para modernização da Saúde Pública.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#inicio" style={{ color: '#64748b', textDecoration: 'none' }}>Termos de Uso</a>
            <a href="#inicio" style={{ color: '#64748b', textDecoration: 'none' }}>Privacidade</a>
            <a href="#inicio" style={{ color: '#64748b', textDecoration: 'none' }}>Acessibilidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
