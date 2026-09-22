import React from 'react';

export interface LogoProps {
  variant?: 'color' | 'dark' | 'green' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'color',
  size = 'md',
  showSubtitle = false,
  iconOnly = false,
  className = '',
}) => {
  // Configuração de dimensões por tamanho
  const scaleMap = {
    sm: { height: 32, fontSize: '1.15rem', subSize: '0.65rem', iconSize: 32 },
    md: { height: 44, fontSize: '1.5rem', subSize: '0.75rem', iconSize: 44 },
    lg: { height: 60, fontSize: '2.1rem', subSize: '0.85rem', iconSize: 60 },
    xl: { height: 80, fontSize: '2.75rem', subSize: '1rem', iconSize: 80 },
  };

  const currentScale = scaleMap[size];

  // Configuração de cores por variante
  const isDarkBg = variant === 'dark';
  const isGreenBg = variant === 'green';
  const isWhite = variant === 'white';

  const filaColor = isDarkBg || isGreenBg || isWhite ? '#ffffff' : 'var(--color-blue-deep)';
  const facilColor = isGreenBg || isWhite ? '#ffffff' : 'var(--color-green-health)';
  const ubsBg = isGreenBg ? '#ffffff' : isWhite ? '#ffffff' : 'var(--color-green-health)';
  const ubsText = isGreenBg ? 'var(--color-green-health)' : isWhite ? 'var(--color-blue-deep)' : '#ffffff';
  const subColor = isDarkBg || isGreenBg || isWhite ? 'rgba(255, 255, 255, 0.85)' : 'var(--color-blue-ubs)';

  // Cores do ícone da cruz e pessoas
  const crossStroke = isDarkBg || isGreenBg || isWhite ? '#ffffff' : 'var(--color-green-health)';
  const peopleFill = isDarkBg ? '#ffffff' : isGreenBg ? '#ffffff' : isWhite ? '#ffffff' : 'var(--color-blue-ubs)';
  const centerPersonFill = isDarkBg ? '#ffffff' : isGreenBg ? '#ffffff' : isWhite ? '#ffffff' : 'var(--color-blue-deep)';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        userSelect: 'none',
        textDecoration: 'none',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Ícone Vetorial Oficial da Cruz com 3 Pacientes */}
        <svg
          width={currentScale.iconSize}
          height={currentScale.iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0, transition: 'transform 0.25s ease' }}
        >
          {/* Cruz Médica com Cantos Arredondados */}
          <path
            d="M36 12C36 8.686 38.686 6 42 6H58C61.314 6 64 8.686 64 12V32H84C87.314 32 90 34.686 90 38V54C90 57.314 87.314 60 84 60H64V80C64 83.314 61.314 86 58 86H42C38.686 86 36 83.314 36 80V60H16C12.686 60 10 57.314 10 54V38C10 34.686 12.686 32 16 32H36V12Z"
            stroke={crossStroke}
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Curva de acolhimento / sorriso na base */}
          <path
            d="M24 64C28 78 40 84 50 84C60 84 72 78 76 64"
            stroke={crossStroke}
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Paciente Esquerda (Menor) */}
          <circle cx="34" cy="46" r="6" fill={peopleFill} />
          <path
            d="M24 62C24 55 28 53 34 53C40 53 44 55 44 62V63H24V62Z"
            fill={peopleFill}
          />

          {/* Paciente Direita (Menor) */}
          <circle cx="66" cy="46" r="6" fill={peopleFill} />
          <path
            d="M56 62C56 55 60 53 66 53C72 53 76 55 76 62V63H56V62Z"
            fill={peopleFill}
          />

          {/* Paciente Central (Destaque Maior) */}
          <circle cx="50" cy="39" r="7.5" fill={centerPersonFill} />
          <path
            d="M38 59C38 50 43 47 50 47C57 47 62 50 62 59V64H38V59Z"
            fill={centerPersonFill}
          />
        </svg>

        {/* Tipografia da Marca: Fila + Fácil + [UBS] (oculta em modo iconOnly) */}
        {!iconOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', lineHeight: 1 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: currentScale.fontSize,
                color: filaColor,
                letterSpacing: '-0.02em',
              }}
            >
              Fila
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: currentScale.fontSize,
                color: facilColor,
                letterSpacing: '-0.02em',
              }}
            >
              Fácil
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: `calc(${currentScale.fontSize} * 0.45)`,
                backgroundColor: ubsBg,
                color: ubsText,
                padding: '0.2rem 0.45rem',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginLeft: '0.15rem',
              }}
            >
              UBS
            </span>
          </div>
        )}
      </div>

      {/* Subtítulo Institucional Opcional */}
      {showSubtitle && !iconOnly && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: currentScale.subSize,
            color: subColor,
            fontWeight: 500,
            marginTop: '0.25rem',
            paddingLeft: `calc(${currentScale.iconSize}px + 0.65rem)`,
            lineHeight: 1.2,
          }}
        >
          Sistema de Gerenciamento de Filas para Unidades Básicas de Saúde
        </span>
      )}
    </div>
  );
};

export default Logo;
