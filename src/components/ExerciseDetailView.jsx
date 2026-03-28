import React, { useState } from 'react';

const BAND_COLORS = [
  { id: 'amarilla', label: 'A', bg: '#ECC94B', cls: 'bg-yellow' },
  { id: 'roja',    label: 'R', bg: '#F56565', cls: 'bg-red'    },
  { id: 'morada',  label: 'M', bg: '#9F7AEA', cls: 'bg-purple' },
  { id: 'verde',   label: 'V', bg: '#48BB78', cls: 'bg-green'  },
  { id: 'negra',   label: 'N', bg: '#2D3748', cls: 'bg-black'  },
];

const SUPERSET_COLORS = ['#6C63FF', '#48BB78', '#F56565', '#9F7AEA', '#ECC94B', '#38B2AC'];

function getBandClass(color) {
  return BAND_COLORS.find(b => b.id === color)?.cls || 'bg-none';
}
function getBandLetter(color) {
  return BAND_COLORS.find(b => b.id === color)?.label || '';
}

function getSupersetColor(groupId) {
  if (!groupId) return null;
  const code = groupId.toString().charCodeAt(0) || 0;
  return SUPERSET_COLORS[code % SUPERSET_COLORS.length];
}

/** Find all indices in the exercises array that share the same superset group */
function getSupersetIndices(exercises, currentIndex) {
  const group = exercises[currentIndex]?.Grupo_Superset || exercises[currentIndex]?.superset || null;
  if (!group) return [currentIndex];
  return exercises.reduce((acc, ex, i) => {
    if ((ex.Grupo_Superset || ex.superset || null) === group) acc.push(i);
    return acc;
  }, []);
}

function SetLogger({ exercise, onSaveSets }) {
  const [sets, setSets] = useState(
    exercise.completedSets
      ? exercise.completedSets
      : Array.from({ length: exercise.seriesObj || exercise.Series_Obj || exercise.Series || 1 }).map((_, i) => ({
          id: i + 1,
          reps: exercise.repsDefault || exercise.Reps_Default || exercise.Reps || '',
          kgs: exercise.kgsDefault || '',
          bands: ['ninguna', 'ninguna', 'ninguna'],
          completed: false,
        }))
  );
  const [notes, setNotes] = useState(exercise.notes || '');

  const handleSetChange = (id, field, val) =>
    setSets(sets.map(s => s.id === id ? { ...s, [field]: val } : s));

  const handleBandChange = (setId, index, val) =>
    setSets(sets.map(s => s.id === setId
      ? { ...s, bands: s.bands.map((b, i) => i === index ? val : b) }
      : s));

  const addBand = (setId, bandId) => {
    const set = sets.find(s => s.id === setId);
    if (!set) return;
    const firstEmpty = set.bands.indexOf('ninguna');
    if (firstEmpty !== -1) handleBandChange(setId, firstEmpty, bandId);
  };

  const removeBand = (setId, index) => {
    const set = sets.find(s => s.id === setId);
    if (!set) return;
    const newBands = [...set.bands];
    newBands.splice(index, 1);
    newBands.push('ninguna');
    setSets(sets.map(s => s.id === setId ? { ...s, bands: newBands } : s));
  };

  const addSet = () =>
    setSets([...sets, { id: sets.length + 1, reps: '', kgs: '', bands: ['ninguna', 'ninguna', 'ninguna'], completed: false }]);

  const deleteSet = id =>
    setSets(sets.filter(s => s.id !== id).map((s, i) => ({ ...s, id: i + 1 })));

  const isWarmup = (exercise.tipo || '').toLowerCase().includes('calentamiento') ||
    (exercise.name || exercise.ejercicio || exercise.Ejercicio || '').toLowerCase().includes('calentamiento');

  // Expose current sets/notes to parent via ref-like callback
  React.useEffect(() => {
    if (exercise._setDataCallback) {
      exercise._setDataCallback({ sets, notes });
    }
  });

  return (
    <div style={{ marginTop: '1rem' }}>
      {isWarmup ? (
        <>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>
            Anota tus sensaciones de movilidad.
          </p>
          <textarea className="notes-input" placeholder="Sensaciones o molestias..." value={notes} onChange={e => setNotes(e.target.value)} />
          <button className="btn-save" onClick={() => onSaveSets(sets, notes)}>Guardar y Continuar →</button>
        </>
      ) : (
        <>
          {sets.map(set => (
            <div key={set.id} className="set-block" style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 0.4rem', flexWrap: 'nowrap',
              background: set.completed ? '#F0FFF4' : '#F7FAFC',
              borderColor: set.completed ? '#9AE6B4' : '#EDF2F7',
              transition: 'all 0.3s',
            }}>
              {/* Set number + delete */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', minWidth: '24px' }}>
                <span className="set-number" style={{
                  background: set.completed ? '#48BB78' : 'var(--accent-orange)',
                  minWidth: '24px', height: '24px', fontSize: '0.8rem', transition: 'background 0.3s'
                }}>{set.id}</span>
                {sets.length > 1 && (
                  <button onClick={() => deleteSet(set.id)} style={{ background: 'transparent', border: 'none', color: '#A0AEC0', fontSize: '0.75rem', cursor: 'pointer', padding: '2px' }}>✕</button>
                )}
              </div>

              {/* Reps */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                <span className="input-label" style={{ fontSize: '0.6rem' }}>Reps</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <button onClick={() => handleSetChange(set.id, 'reps', Math.max(0, (parseInt(set.reps) || 0) - 1).toString())}
                    style={{ width: '22px', height: '26px', border: '1.5px solid #E2E8F0', borderRadius: '6px 0 0 6px',
                      background: '#F7FAFC', color: '#718096', fontWeight: 800, fontSize: '0.9rem',
                      cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <input type="number" className="set-input" placeholder="0" value={set.reps}
                    onChange={e => handleSetChange(set.id, 'reps', e.target.value)}
                    style={{ width: '32px', fontSize: '1rem', textAlign: 'center', borderRadius: 0,
                      borderLeft: 'none', borderRight: 'none', padding: '0.15rem 0' }} />
                  <button onClick={() => handleSetChange(set.id, 'reps', ((parseInt(set.reps) || 0) + 1).toString())}
                    style={{ width: '22px', height: '26px', border: '1.5px solid #E2E8F0', borderRadius: '0 6px 6px 0',
                      background: '#F7FAFC', color: '#718096', fontWeight: 800, fontSize: '0.9rem',
                      cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              {/* Kgs */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' }}>
                <span className="input-label" style={{ fontSize: '0.6rem' }}>Kgs</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <button onClick={() => handleSetChange(set.id, 'kgs', Math.max(0, (parseFloat(set.kgs) || 0) - 0.5).toString())}
                    style={{ width: '22px', height: '26px', border: '1.5px solid #E2E8F0', borderRadius: '6px 0 0 6px',
                      background: '#F7FAFC', color: '#718096', fontWeight: 800, fontSize: '0.9rem',
                      cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <input type="number" className="set-input" placeholder="0" step="0.5" value={set.kgs}
                    onChange={e => handleSetChange(set.id, 'kgs', e.target.value)}
                    style={{ width: '36px', fontSize: '1rem', textAlign: 'center', borderRadius: 0,
                      borderLeft: 'none', borderRight: 'none', padding: '0.15rem 0' }} />
                  <button onClick={() => handleSetChange(set.id, 'kgs', ((parseFloat(set.kgs) || 0) + 0.5).toString())}
                    style={{ width: '22px', height: '26px', border: '1.5px solid #E2E8F0', borderRadius: '0 6px 6px 0',
                      background: '#F7FAFC', color: '#718096', fontWeight: 800, fontSize: '0.9rem',
                      cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>

              {/* Bands */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '75px', gap: '0.2rem', alignItems: 'center' }}>
                <span className="input-label" style={{ fontSize: '0.6rem' }}>Bandas</span>
                <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', minHeight: '18px' }}>
                  {set.bands.filter(b => b !== 'ninguna').map((b, i) => (
                    <div key={i} className={`band-pill ${getBandClass(b)}`}
                      style={{ padding: '0.1rem 0.3rem', fontSize: '0.65rem', minHeight: '18px' }}
                      onClick={() => removeBand(set.id, i)}>
                      <span style={{ fontWeight: 'bold' }}>{getBandLetter(b)}</span>
                      <span className="remove-cross" style={{ marginLeft: '2px' }}>×</span>
                    </div>
                  ))}
                  {set.bands.filter(b => b !== 'ninguna').length < 3 && (
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                      {BAND_COLORS.map(b => (
                        <div key={b.id} className={`band-circle ${b.cls}`}
                          style={{ width: '16px', height: '16px' }}
                          onClick={() => addBand(set.id, b.id)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox */}
              <button
                onClick={() => handleSetChange(set.id, 'completed', !set.completed)}
                style={{
                  width: '32px', minWidth: '32px', maxWidth: '32px',
                  height: '32px', borderRadius: '8px', flexShrink: 0,
                  border: '2px solid #E5E5EA',
                  background: set.completed ? 'var(--accent-primary)' : 'white',
                  color: set.completed ? 'white' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '1.2rem', padding: 0, transition: 'all 0.2s'
                }}>✓</button>
            </div>
          ))}

          <button className="btn-add-set" onClick={addSet}>+ Añadir Serie</button>
          <textarea className="notes-input" placeholder="Sensaciones del ejercicio..." value={notes} onChange={e => setNotes(e.target.value)} />
          <button className="btn-save" onClick={() => onSaveSets(sets, notes)}>
            Guardar y Continuar →
          </button>
        </>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, index, totalCount, isSuperset, supersetColor }) {
  const name = exercise.name || exercise.ejercicio || exercise.Ejercicio || 'Ejercicio';
  const equipo = exercise.equipo || exercise.Equipo || '';
  const isWarmup = (exercise.tipo || '').toLowerCase().includes('calentamiento') ||
    name.toLowerCase().includes('calentamiento');

  const badgeClass = isWarmup ? 'badge-calentamiento'
    : (equipo.toLowerCase().includes('kettlebell') || equipo === 'Kett. + Bandas' ? 'badge-kettlebell' : 'badge-fuerza');

  let imgUrl = exercise.image || exercise.Imagen || exercise.imagen || '';
  if (!imgUrl.trim()) {
    imgUrl = isWarmup
      ? 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80';
  }

  return (
    <div className="workout-card expanded" style={{
      borderLeft: supersetColor ? `6px solid ${supersetColor}` : '2px solid transparent',
      backgroundColor: supersetColor ? `${supersetColor}08` : 'white',
    }}>
      {/* Image */}
      <img src={imgUrl} alt={name} className="exercise-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = isWarmup
            ? 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80';
        }}
      />

      <div className="card-content">
        {/* Badge + title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: '0.5rem' }}>
            <div style={{ marginBottom: '0.4rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge ${badgeClass}`}>{equipo || 'Corporal'}</span>
            </div>
            <h2 className="exercise-title" style={{ marginTop: 0 }}>{name}</h2>
          </div>
          {/* Video buttons */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(exercise.video || exercise.Video || exercise['Video 1'] || exercise['Guía 1']) && (
              <button className="btn-video" title="Ver guía"
                onClick={() => window.open(exercise.video || exercise.Video || exercise['Video 1'] || exercise['Guía 1'], '_blank')}
                style={{ width: '32px', height: '32px', borderRadius: '8px', padding: 0, fontSize: '1rem', justifyContent: 'center' }}>►</button>
            )}
            {(exercise['Video 2'] || exercise['Guía 2']) && (
              <button className="btn-video" title="Ver guía 2"
                onClick={() => window.open(exercise['Video 2'] || exercise['Guía 2'], '_blank')}
                style={{ width: '32px', height: '32px', borderRadius: '8px', padding: 0, fontSize: '1rem', justifyContent: 'center' }}>►</button>
            )}
          </div>
        </div>

        {/* Stats */}
        {!isWarmup && (
          <div className="exercise-stats">
            <div className="stat-box">
              <span className="stat-label">Te Toca</span>
              <span className="stat-value">{(exercise.seriesObj || exercise.Series_Obj || exercise.Series) ? `${exercise.seriesObj || exercise.Series_Obj || exercise.Series} × ${exercise.repsDefault || exercise.Reps_Default || exercise.Reps || '-'}` : '-'}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Anterior</span>
              <span className="stat-value">{exercise.ultimaVez || exercise['Última vez'] || exercise['Última Vez'] || '-'}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Récord</span>
              <span className="stat-value">{exercise.lastRecord || exercise.record || '-'}</span>
            </div>
          </div>
        )}

        {/* Tips / Notes */}
        {(exercise.notas || exercise.Notas) && (
          <div className="tips-box" style={{ background: 'linear-gradient(to right, #F0FFF4, #FFFFFF)', borderLeftColor: 'var(--accent-mint)' }}>
            <strong>📝 Notas:</strong> {exercise.notas || exercise.Notas}
          </div>
        )}
        {exercise.tips && (
          <div className="tips-box">
            <strong>💡 Tip:</strong> {exercise.tips}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExerciseDetailView({ exercises, currentIndex, onSave, onBack }) {
  const supersetIndices = getSupersetIndices(exercises, currentIndex);
  const isSuperset = supersetIndices.length > 1;
  const supersetGroup = exercises[currentIndex]?.Grupo_Superset || exercises[currentIndex]?.superset || null;
  const supersetColor = getSupersetColor(supersetGroup);

  // For superset, we need to collect set data from each exercise's SetLogger
  const [supersetData, setSupersetData] = useState({});

  const handleSetDataUpdate = (idx, data) => {
    setSupersetData(prev => ({ ...prev, [idx]: data }));
  };

  const handleSave = () => {
    if (isSuperset) {
      // Save all exercises in the superset group
      supersetIndices.forEach(idx => {
        const data = supersetData[idx];
        if (data) {
          onSave(idx, data.sets, data.notes);
        }
      });
    }
    // Single exercise save is handled directly by SetLogger's onSaveSets
  };

  const isLast = isSuperset
    ? Math.max(...supersetIndices) >= exercises.length - 1
    : currentIndex === exercises.length - 1;

  // Find next exercise after the current group
  const lastGroupIndex = isSuperset ? Math.max(...supersetIndices) : currentIndex;
  const nextExercise = exercises[lastGroupIndex + 1] || null;

  const progressPct = exercises.length > 0 ? ((currentIndex) / exercises.length) * 100 : 0;

  return (
    <div className="view" style={{ paddingTop: '1rem' }}>
      {/* Top bar */}
      <div className="workout-header">
        <span className="nav-back" onClick={onBack}>« Lista de ejercicios</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isSuperset
              ? `Superset ${supersetGroup} · Ejercicios ${supersetIndices.map(i => i + 1).join(' + ')} de ${exercises.length}`
              : `Ejercicio ${currentIndex + 1} de ${exercises.length}`
            }
          </span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Superset banner */}
      {isSuperset && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.8rem 1rem',
          background: `linear-gradient(135deg, ${supersetColor}15, ${supersetColor}05)`,
          borderRadius: '16px',
          border: `2px solid ${supersetColor}40`,
          marginBottom: '0.5rem',
        }}>
          <span style={{
            background: supersetColor, color: 'white',
            padding: '0.2rem 0.7rem', borderRadius: '10px',
            fontWeight: 800, fontSize: '0.8rem',
          }}>
            🔗 Superset {supersetGroup}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Haz los {supersetIndices.length} ejercicios seguidos, descansa entre rondas
          </span>
        </div>
      )}

      {/* Exercise cards — show all in superset */}
      {supersetIndices.map((idx, posInGroup) => {
        const exercise = exercises[idx];
        // Inject a callback ref so we can collect set data
        const exerciseWithCallback = {
          ...exercise,
          _setDataCallback: (data) => handleSetDataUpdate(idx, data),
        };

        return (
          <div key={idx}>
            {isSuperset && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0',
                marginTop: posInGroup > 0 ? '1rem' : 0,
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: supersetColor, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                }}>
                  {posInGroup + 1}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  de {supersetIndices.length}
                </span>
              </div>
            )}

            <ExerciseCard
              exercise={exercise}
              index={idx}
              totalCount={exercises.length}
              isSuperset={isSuperset}
              supersetColor={supersetColor}
            />

            {/* Set logger inside each card */}
            <div style={{
              padding: '0 0.5rem',
              borderLeft: isSuperset ? `4px solid ${supersetColor}30` : 'none',
              marginLeft: isSuperset ? '0.5rem' : 0,
            }}>
              <SetLogger
                key={`logger-${idx}-${exercise.completed ? 'done' : 'pending'}`}
                exercise={exerciseWithCallback}
                onSaveSets={(sets, notes) => {
                  if (!isSuperset) {
                    // Single exercise — save directly
                    onSave(idx, sets, notes);
                  }
                  // For superset, data is collected via _setDataCallback, saved via group button
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Group save button for supersets */}
      {isSuperset && (
        <button className="btn-save" onClick={handleSave} style={{ marginTop: '1rem' }}>
          💪 Guardar Superset y Continuar →
        </button>
      )}

      {/* Next exercise preview */}
      {nextExercise && (
        <div style={{
          padding: '1rem 1.2rem',
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #EDF2F7',
          display: 'flex', alignItems: 'center', gap: '0.8rem',
          marginTop: '1rem',
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', flexShrink: 0 }}>
            Siguiente →
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {nextExercise.name || nextExercise.ejercicio || nextExercise.Ejercicio}
            </div>
            {(nextExercise.equipo || nextExercise.Equipo) && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {nextExercise.equipo || nextExercise.Equipo}
              </div>
            )}
          </div>
        </div>
      )}

      {isLast && (
        <div style={{
          textAlign: 'center', padding: '0.8rem', fontSize: '0.85rem',
          color: 'var(--text-secondary)', fontWeight: 600,
          marginTop: '0.5rem',
        }}>
          Este es el último ejercicio de la sesión 🏁
        </div>
      )}
    </div>
  );
}
