import React from 'react';
import '../styles/layout.css';

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  iconColor?: 'blue' | 'green' | 'yellow' | 'red' | 'teal';
  badge?: {
    text: string;
    variant?: 'green' | 'yellow' | 'red' | 'blue';
    icon?: React.ReactNode;
  };
  accentColor?: string; // e.g. '#2563eb', '#06b6d4', '#16a34a', '#dc2626'
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  iconColor = 'blue',
  badge,
  accentColor,
  subtext,
}) => {
  return (
    <div
      className="stat-card"
      style={accentColor ? { borderLeft: `3px solid ${accentColor}` } : undefined}
    >
      <div className="stat-card-info">
        <span className="stat-card-label">{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="stat-card-number">{value}</span>
          {unit && <span className="stat-card-unit">{unit}</span>}
        </div>
        {subtext && <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>{subtext}</span>}
        {badge && (
          <span className={`stat-card-badge ${badge.variant || 'blue'}`}>
            {badge.icon}
            {badge.text}
          </span>
        )}
      </div>

      <div className={`stat-card-icon ${iconColor}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
