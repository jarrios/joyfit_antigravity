import React from 'react';

export default function HomeView({ onContinue, onSelectProgram, lastSession, onShowHistory }) {
  const hasLastSession = !!lastSession;

  return (
    <div className="view">
      <div className="welcome-header">
        <h1 style={{ color: 'var(--text-primary)' }}>JoyFit 💪</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>¿Qué hacemos hoy?</p>
      </div>

      {/* a) Continuar */}
      <div style={{
        background: hasLastSession
          ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4CAF79 100%)'
          : 'var(--bg-secondary)',
        borderRadius: 'var(--border-radius)',
        padding: '1.5rem',
        boxShadow: hasLastSession ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        border: hasLastSession ? 'none' : '2px dashed #D1D1D6',
        color: hasLastSession ? 'white' : 'var(--text-secondary)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          display: 'inline-block', padding: '0.3rem 0.8rem',
          background: hasLastSession ? 'rgba(255,255,255,0.2)' : 'var(--bg-primary)',
          borderRadius: '9999px', fontWeight: 800, fontSize: '0.75rem',
          textTransform: 'uppercase', marginBottom: '0.8rem',
        }}>
          ⏱ Continuar
        </div>

        {hasLastSession ? (
          <>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              {lastSession.title || 'Sesión en curso'}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.85, marginBottom: '1.2rem', fontWeight: 600 }}>
              {lastSession.programName} · {lastSession.completedCount || 0} ejercicios completados
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.2rem', color: '#A0AEC0' }}>
              No hay ningún programa activo
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '1.2rem', color: '#A0AEC0' }}>
              Selecciona un programa para empezar
            </div>
          </>
        )}

        <button
          onClick={() => hasLastSession && onContinue(lastSession)}
          disabled={!hasLastSession}
          style={{
            width: '100%', padding: '0.9rem', border: 'none', borderRadius: '14px',
            background: hasLastSession ? 'rgba(255,255,255,0.2)' : '#E5E5EA',
            color: hasLastSession ? 'white' : '#A0AEC0',
            fontFamily: 'inherit', fontWeight: 800, fontSize: '1rem',
            cursor: hasLastSession ? 'pointer' : 'not-allowed',
            opacity: hasLastSession ? 1 : 0.6,
            transition: 'all 0.2s',
          }}
        >
          ▶ Continuar sesión
        </button>
      </div>

      {/* b) Programa Estándar */}
      <div
        className="list-item"
        style={{ padding: '1.2rem', gap: '1rem' }}
        onClick={() => onSelectProgram('estandar')}
      >
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: 'var(--accent-blue-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
        }}>🏋️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.15rem' }}>Programa Estándar</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Fuerza · Cuerpo completo · Progresivo
          </div>
        </div>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>›</span>
      </div>

      {/* c) Programa Kettlebell */}
      <div
        className="list-item"
        style={{ padding: '1.2rem', gap: '1rem' }}
        onClick={() => onSelectProgram('kettlebell')}
      >
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: 'var(--accent-warm-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            {/* Handle */}
            <path d="M20 28C20 14 26 6 32 6C38 6 44 14 44 28" stroke="var(--accent-warm)" strokeWidth="7" fill="none" strokeLinecap="round"/>
            {/* Body */}
            <ellipse cx="32" cy="40" rx="18" ry="16" fill="var(--accent-warm)"/>
            {/* Base */}
            <rect x="18" y="52" width="28" height="6" rx="3" fill="var(--accent-warm)"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.15rem' }}>Programa Kettlebell</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Potencia · Resistencia · Kettlebell
          </div>
        </div>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>›</span>
      </div>

      {/* Historial */}
      <div
        className="list-item"
        style={{ padding: '1.2rem', gap: '1rem' }}
        onClick={onShowHistory}
      >
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          background: 'var(--accent-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
        }}>📅</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.15rem' }}>Historial</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Tu progreso y calendario
          </div>
        </div>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>›</span>
      </div>
    </div>
  );
}
