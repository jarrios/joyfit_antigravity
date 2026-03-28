import React from 'react';

export default function SessionDetailView({ program, exercises, onSelectSession, onBack }) {
  // Extract unique sessions (Semana + Dia combos)
  const sessionMap = {};
  exercises.forEach(ex => {
    const semana = ex.Semana || ex.semana;
    const dia = ex.Dia || ex.dia;
    if (semana == null || dia == null) return;
    const key = `S${semana}_D${dia}`;
    if (!sessionMap[key]) {
      sessionMap[key] = { semana, dia, count: 0, exercises: [] };
    }
    sessionMap[key].count++;
    sessionMap[key].exercises.push(ex);
  });

  const sessions = Object.values(sessionMap).sort((a, b) => {
    if (Number(a.semana) !== Number(b.semana)) return Number(a.semana) - Number(b.semana);
    return Number(a.dia) - Number(b.dia);
  });

  // Group by week
  const weeks = {};
  sessions.forEach(s => {
    const w = s.semana;
    if (!weeks[w]) weeks[w] = [];
    weeks[w].push(s);
  });

  const kettlebellIcon = <svg style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.3rem' }} width="28" height="28" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M20 28C20 14 26 6 32 6C38 6 44 14 44 28" stroke="var(--accent-warm)" strokeWidth="7" fill="none" strokeLinecap="round"/><ellipse cx="32" cy="40" rx="18" ry="16" fill="var(--accent-warm)"/><rect x="18" y="52" width="28" height="6" rx="3" fill="var(--accent-warm)"/></svg>;
  const programLabel = program === 'kettlebell' ? 'Programa Kettlebell' : '🏋️ Programa Estándar';

  return (
    <div className="view">
      <div className="workout-header">
        <span className="nav-back" onClick={onBack}>« Volver</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem', display: 'flex', alignItems: 'center' }}>
          {program === 'kettlebell' && kettlebellIcon}
          {programLabel}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
          {sessions.length} sesiones disponibles
        </p>
      </div>

      {Object.entries(weeks).map(([weekNum, weekSessions]) => (
        <div key={weekNum}>
          <div style={{
            padding: '0.5rem 0.2rem',
            fontWeight: 800, fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Semana {weekNum}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {weekSessions.map(session => (
              <div
                key={`S${session.semana}_D${session.dia}`}
                onClick={() => onSelectSession(session.semana, session.dia, session.exercises)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.2rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#E5E5EA'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                  background: 'var(--accent-primary-light)',
                  color: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem',
                }}>
                  D{session.dia}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Día {session.dia}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {session.count} ejercicios
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
