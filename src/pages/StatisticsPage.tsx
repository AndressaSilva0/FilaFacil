import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Download,
  Building2,
  Activity,
  Award,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import type { InternalScreen } from '../components/AppLayout';

interface StatisticsPageProps {
  onNavigate: (screen: InternalScreen) => void;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  return (
    <div className="statistics-page">
      {/* Header */}
      <div className="page-header-row">
        <div className="page-header-left">
          <div className="page-breadcrumb">
            <span className="dot"></span>
            RELATÓRIOS &amp; DESEMPENHO OPERACIONAL
          </div>
          <h1 className="page-title">Estatísticas de Atendimento</h1>
          <p className="page-subtitle">
            Indicadores de tempo de espera, produtividade dos consultórios e fluxo de acolhimento.
          </p>
        </div>

        <div className="page-header-right">
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
            <button
              style={{
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: period === 'today' ? '#ffffff' : 'transparent',
                color: period === 'today' ? '#0f2d59' : '#64748b',
                boxShadow: period === 'today' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setPeriod('today')}
            >
              Hoje
            </button>
            <button
              style={{
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: period === 'week' ? '#ffffff' : 'transparent',
                color: period === 'week' ? '#0f2d59' : '#64748b',
                boxShadow: period === 'week' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setPeriod('week')}
            >
              Últimos 7 dias
            </button>
            <button
              style={{
                border: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: period === 'month' ? '#ffffff' : 'transparent',
                color: period === 'month' ? '#0f2d59' : '#64748b',
                boxShadow: period === 'month' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setPeriod('month')}
            >
              Este Mês
            </button>
          </div>

          <button
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', borderRadius: '10px' }}
            onClick={() => alert('Relatório analítico exportado para PDF.')}
          >
            <Download size={16} />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* 4 Cards de Métricas */}
      <div className="stats-row">
        <StatCard
          label="Total Atendimentos"
          value="428"
          unit="pacientes"
          icon={<Users size={24} />}
          iconColor="blue"
          accentColor="#2563eb"
          badge={{
            text: '+12% vs mês anterior',
            variant: 'green',
            icon: <TrendingUp size={12} />,
          }}
        />

        <StatCard
          label="Tempo Médio Espera"
          value="16"
          unit="minutos"
          icon={<Clock size={24} />}
          iconColor="teal"
          accentColor="#06b6d4"
          badge={{
            text: 'Meta < 20 min atingida',
            variant: 'green',
            icon: <CheckCircle2 size={12} />,
          }}
        />

        <StatCard
          label="Taxa Comparecimento"
          value="95.4%"
          unit="presentes"
          icon={<CheckCircle2 size={24} />}
          iconColor="green"
          accentColor="#16a34a"
          badge={{
            text: '4.6% absenteísmo',
            variant: 'blue',
          }}
        />

        <StatCard
          label="Acolhimento & Satisfação"
          value="4.9"
          unit="/ 5.0"
          icon={<Award size={24} />}
          iconColor="yellow"
          accentColor="#f59e0b"
          badge={{
            text: '98% aprovação geral',
            variant: 'green',
          }}
        />
      </div>

      {/* Grid de Seções de Análise */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Distribuição por Especialidade */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2d59' }}>
                Atendimentos por Especialidade
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Volume e proporção no período selecionado</p>
            </div>
            <Activity size={20} color="#2563eb" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Clínico Geral */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <span style={{ color: '#1e293b' }}>Clínico Geral</span>
                <span style={{ color: '#2563eb' }}>192 pacientes (45%)</span>
              </div>
              <div style={{ height: 10, backgroundColor: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '45%', height: '100%', backgroundColor: '#2563eb', borderRadius: 999 }}></div>
              </div>
            </div>

            {/* Pediatria */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <span style={{ color: '#1e293b' }}>Pediatria</span>
                <span style={{ color: '#16a34a' }}>107 pacientes (25%)</span>
              </div>
              <div style={{ height: 10, backgroundColor: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', backgroundColor: '#16a34a', borderRadius: 999 }}></div>
              </div>
            </div>

            {/* Ginecologia / Pré-natal */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <span style={{ color: '#1e293b' }}>Ginecologia / Pré-natal</span>
                <span style={{ color: '#db2777' }}>77 pacientes (18%)</span>
              </div>
              <div style={{ height: 10, backgroundColor: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '18%', height: '100%', backgroundColor: '#db2777', borderRadius: 999 }}></div>
              </div>
            </div>

            {/* Odontologia */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <span style={{ color: '#1e293b' }}>Odontologia</span>
                <span style={{ color: '#7c3aed' }}>52 pacientes (12%)</span>
              </div>
              <div style={{ height: 10, backgroundColor: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '12%', height: '100%', backgroundColor: '#7c3aed', borderRadius: 999 }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Horários de Pico */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2d59' }}>
                Fluxo por Faixa Horária
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Pico concentrado entre 08h e 10h da manhã</p>
            </div>
            <Clock size={20} color="#16a34a" />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            {[
              { hour: '07h', count: 18, height: '40%' },
              { hour: '08h', count: 42, height: '90%', peak: true },
              { hour: '09h', count: 48, height: '100%', peak: true },
              { hour: '10h', count: 35, height: '75%' },
              { hour: '11h', count: 22, height: '48%' },
              { hour: '13h', count: 28, height: '60%' },
              { hour: '14h', count: 32, height: '68%' },
              { hour: '15h', count: 20, height: '44%' },
            ].map((col) => (
              <div key={col.hour} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: col.peak ? '#2563eb' : '#64748b' }}>
                  {col.count}
                </span>
                <div style={{
                  width: '65%',
                  height: col.height,
                  backgroundColor: col.peak ? '#2563eb' : '#93c5fd',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s ease',
                }}></div>
                <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 500 }}>{col.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desempenho por Consultório */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        marginTop: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2d59' }}>
              Desempenho por Consultório
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Médicos e enfermeiros alocados nas salas</p>
          </div>
          <Building2 size={20} color="#2563eb" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { room: 'Sala 01', label: 'Consultório Pediátrico', doctor: 'Dr. Marcos Albuquerque', count: '107 atendimentos', avg: '14 min médio' },
            { room: 'Sala 02', label: 'Consultório Clínico', doctor: 'Dra. Mariana Vasconcellos', count: '192 atendimentos', avg: '15 min médio' },
            { room: 'Sala 03', label: 'Consultório Ginecológico', doctor: 'Dra. Fernanda Lopes', count: '77 atendimentos', avg: '18 min médio' },
            { room: 'Sala 04', label: 'Gabinete Odontológico', doctor: 'Dr. Ricardo Mendes', count: '52 atendimentos', avg: '22 min médio' },
          ].map((r) => (
            <div key={r.room} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', backgroundColor: '#fafbfc' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '0.9rem' }}>{r.room}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '0.2rem 0.5rem', borderRadius: 999 }}>Ativo</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{r.doctor}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.label}</div>
              <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ color: '#0f2d59' }}>{r.count}</span>
                <span style={{ color: '#16a34a' }}>{r.avg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
