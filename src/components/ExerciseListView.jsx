import React from 'react';

const BAND_DISPLAY = {
  amarilla: { color: '#ECC94B', letter: 'A' },
  roja:     { color: '#F56565', letter: 'R' },
  morada:   { color: '#9F7AEA', letter: 'M' },
  verde:    { color: '#48BB78', letter: 'V' },
  negra:    { color: '#2D3748', letter: 'N' },
};

const SUPERSET_COLORS = ['#6C63FF', '#48BB78', '#F56565', '#9F7AEA', '#ECC94B', '#38B2AC'];

function getSupersetColor(groupId) {
  if (!groupId) return null;
  const code = groupId.toString().charCodeAt(0) || 0;
  return SUPERSET_COLORS[code % SUPERSET_COLORS.length];
}

/** Group consecutive exercises that share the same Grupo_Superset */
function groupExercises(exercises) {
  const groups = [];
  let i = 0;
  while (i < exercises.length) {
    const ex = exercises[i];
    const group = ex.Grupo_Superset || ex.superset || null;
    if (group) {
      // Collect all consecutive exercises with same group
      const members = [];
      while (i < exercises.length && ((exercises[i].Grupo_Superset || exercises[i].superset || null) === group)) {
        members.push({ exercise: exercises[i], originalIndex: i });
        i++;
      }
      groups.push({ type: 'superset', groupId: group, members });
    } else {
      groups.push({ type: 'single', exercise: ex, originalIndex: i });
      i++;
    }
  }
  return groups;
}

function ExerciseRow({ ex, idx, displayNumber, isCurrent, firstPendingIdx, onStartExercise }) {
  const name = ex.name || ex.ejercicio || ex.Ejercicio || `Ejercicio ${idx + 1}`;
  const equipo = ex.equipo || ex.Equipo || '';
  const series = ex.seriesObj || ex.Series_Obj || ex.Series || '';
  const reps = ex.repsDefault || ex.Reps_Default || ex.Reps || '';
  const isWarmup = (ex.tipo || '').toLowerCase().includes('calentamiento') ||
    name.toLowerCase().includes('calentamiento');
  const lastBands = (ex.Bandas || ex.bandas || ex['Última Banda'] || ex.ultimaBanda || '')
    .toString().toLowerCase().split(/[,;/+]/).map(b => b.trim()).filter(b => BAND_DISPLAY[b]);

  return (
    <div
      onClick={() => onStartExercise(idx)}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1.1rem 1.2rem',
        background: ex.completed ? '#FAFFFB' : (isCurrent ? '#FFFAF0' : 'var(--bg-secondary)'),
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
        border: ex.completed
          ? '2px solid var(--accent-mint)'
          : isCurrent
            ? '2px solid var(--accent-orange)'
            : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: ex.completed ? 0.8 : 1,
      }}
    >
      {/* Index / check */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '0.9rem',
        background: ex.completed ? 'var(--accent-mint)' : (isCurrent ? 'var(--accent-orange)' : '#EDF2F7'),
        color: ex.completed || isCurrent ? 'white' : 'var(--text-secondary)',
      }}>
        {ex.completed ? '✓' : displayNumber}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem',
          textDecoration: ex.completed ? 'line-through' : 'none',
          color: ex.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
        }}>
          {name}
          {isCurrent && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: 'var(--accent-orange)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '8px', fontWeight: 700 }}>AHORA</span>}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {equipo && <span>{equipo}</span>}
          {isWarmup
            ? <span>· 0</span>
            : (series && reps && <span>· {series}×{reps}</span>)
          }
          {isWarmup && <span>· Calentamiento</span>}
          {lastBands.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '2px' }}>
              ·
              {lastBands.map((b, i) => (
                <span key={i} style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: BAND_DISPLAY[b].color,
                  display: 'inline-block', flexShrink: 0,
                  border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} title={b} />
              ))}
            </span>
          )}
        </div>
      </div>

      <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>›</span>
    </div>
  );
}

export default function ExerciseListView({ sessionTitle, exercises, onStartExercise, onBack }) {
  const completedCount = exercises.filter(e => e.completed).length;
  const progress = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;
  const firstPendingIdx = exercises.findIndex(e => !e.completed);

  // Pre-compute display numbers: warmups = 0, rest = sequential 1, 2, 3...
  const displayNumbers = [];
  let exerciseCounter = 0;
  exercises.forEach((ex) => {
    const name = ex.name || ex.ejercicio || ex.Ejercicio || '';
    const isWarmup = (ex.tipo || '').toLowerCase().includes('calentamiento') ||
      name.toLowerCase().includes('calentamiento');
    if (isWarmup) {
      displayNumbers.push(0);
    } else {
      exerciseCounter++;
      displayNumbers.push(exerciseCounter);
    }
  });

  const groups = groupExercises(exercises);

  return (
    <div className="view">
      {/* Header */}
      <div className="workout-header">
        <span className="nav-back" onClick={onBack}>« Volver</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{sessionTitle}</h2>
        <div className="progress-bar-container">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">{completedCount} / {exercises.length} completados</div>
      </div>

      {/* Exercise list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {groups.map((group, gIdx) => {
          if (group.type === 'single') {
            const { exercise: ex, originalIndex: idx } = group;
            return (
              <ExerciseRow
                key={idx}
                ex={ex}
                idx={idx}
                displayNumber={displayNumbers[idx]}
                isCurrent={idx === firstPendingIdx}
                firstPendingIdx={firstPendingIdx}
                onStartExercise={onStartExercise}
              />
            );
          }

          // Superset / circuit group
          const color = getSupersetColor(group.groupId);
          const allCompleted = group.members.every(m => m.exercise.completed);
          const someIsCurrent = group.members.some(m => m.originalIndex === firstPendingIdx);

          return (
            <div key={`group-${gIdx}`} style={{
              borderLeft: `5px solid ${color}`,
              borderRadius: '24px',
              background: allCompleted ? '#FAFFFB' : (someIsCurrent ? `${color}08` : '#FAFBFE'),
              padding: '0.6rem 0.5rem 0.6rem 0.6rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s',
            }}>
              {/* Group label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.2rem 0.6rem',
              }}>
                <span style={{
                  background: color, color: 'white',
                  padding: '0.15rem 0.6rem', borderRadius: '8px',
                  fontWeight: 800, fontSize: '0.72rem',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>
                  🔗 Superset {group.groupId}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {group.members.length} ejercicios
                </span>
              </div>

              {/* Members */}
              {group.members.map(({ exercise: ex, originalIndex: idx }) => (
                <ExerciseRow
                  key={idx}
                  ex={ex}
                  idx={idx}
                  displayNumber={displayNumbers[idx]}
                  isCurrent={idx === firstPendingIdx}
                  firstPendingIdx={firstPendingIdx}
                  onStartExercise={onStartExercise}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Floating start button */}
      {firstPendingIdx !== -1 && (
        <button className="btn-primary" onClick={() => onStartExercise(firstPendingIdx)}>
          {completedCount === 0 ? '🚀 Empezar Entrenamiento' : '▶ Continuar Entrenamiento'}
        </button>
      )}

      {completedCount === exercises.length && exercises.length > 0 && (
        <div style={{
          textAlign: 'center', padding: '1.5rem',
          background: '#F0FFF4', borderRadius: '20px',
          border: '2px solid var(--accent-mint)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-mint)' }}>¡Sesión completada!</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Gran trabajo, sigue así.</div>
        </div>
      )}
    </div>
  );
}
