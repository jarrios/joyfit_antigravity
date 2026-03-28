import React, { useState } from 'react';

export default function WorkoutCard({ exercise, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const isWarmup = exercise.tipo === 'Calentamiento' || (exercise.ejercicio && exercise.ejercicio.toLowerCase().includes('calentamiento'));
  const badgeClass = isWarmup ? 'badge-calentamiento' : (exercise.equipo && exercise.equipo.toLowerCase().includes('kettlebell') || exercise.equipo === 'Kett. + Bandas' ? 'badge-kettlebell' : 'badge-fuerza');
  const [notes, setNotes] = useState(exercise.notes || '');

  // Generamos un estado para las series
  const [sets, setSets] = useState(
    exercise.completedSets ? exercise.completedSets : Array.from({ length: exercise.seriesObj || 1 }).map((_, i) => ({
      id: i + 1,
      reps: exercise.repsDefault || '',
      kgs: exercise.kgsDefault || '',
      bands: Array(3).fill('ninguna'),
      completed: false
    }))
  );

  const handleBandChange = (setId, index, value) => {
    setSets(sets.map(s => s.id === setId ? {
      ...s, bands: s.bands.map((b, i) => i === index ? value : b)
    } : s));
  };

  const handleSetChange = (setId, field, value) => {
    setSets(sets.map(s => s.id === setId ? { ...s, [field]: value } : s));
  };

  const deleteSet = (setId) => {
    setSets(sets.filter(s => s.id !== setId).map((s, idx) => ({ ...s, id: idx + 1 })));
  };

  const addSet = () => {
    setSets([...sets, { id: sets.length + 1, reps: '', kgs: '', bands: ['ninguna', 'ninguna', 'ninguna'], completed: false }]);
  };

  const handleSave = () => {
    setExpanded(false);
    onSave({ ...exercise, completedSets: sets, notes });
  };

  const getBandClass = (color) => {
    if (color === 'amarilla') return 'bg-yellow';
    if (color === 'roja') return 'bg-red';
    if (color === 'morada') return 'bg-purple';
    if (color === 'verde') return 'bg-green';
    if (color === 'negra') return 'bg-black';
    return 'bg-none';
  };

  const getBandLetter = (color) => {
    if (color === 'amarilla') return 'A';
    if (color === 'roja') return 'R';
    if (color === 'morada') return 'M';
    if (color === 'verde') return 'V';
    if (color === 'negra') return 'N';
    return '';
  };

  let imgUrl = exercise.image || exercise.Imagen || exercise.imagen;
  if (!imgUrl || imgUrl.trim() === '') {
     imgUrl = isWarmup ? "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80" : "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80";
  }
  const fallbackImgSrc = isWarmup ? "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80" : "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80";

  const supersetGroup = exercise.Grupo_Superset || exercise.superset;

  const getSupersetColor = (group) => {
    if (!group) return 'transparent';
    // Colores pastel en este orden: Azul, Verde, Rojo, Morado, Naranja, Turquesa
    const colors = ['#C4E1F6', '#C6F6D5', '#FED7D7', '#E9D8FD', '#FEEBC8', '#B2F5EA']; 
    const charCode = group.toString().charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const cardStyle = {
    marginBottom: '1.5rem',
    borderLeft: supersetGroup ? `6px solid ${getSupersetColor(supersetGroup)}` : '1px solid #E2E8F0',
    backgroundColor: supersetGroup ? `${getSupersetColor(supersetGroup)}08` : 'inherit'
  };

  return (
    <div className={`workout-card ${expanded ? 'expanded' : ''} ${exercise.completed ? 'completed' : ''}`} style={cardStyle}>
      {!expanded && !exercise.completed && <div className="clickable-area" onClick={() => setExpanded(true)}></div>}
      
      <img 
        src={imgUrl} 
        alt={exercise.name || 'Ejercicio'} 
        className="exercise-image" 
        onClick={() => setExpanded(!expanded)} 
        onError={(e) => {
           e.target.onerror = null; 
           e.target.src = fallbackImgSrc;
        }}
      />
      
      <div className="card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          <div style={{ flex: 1, paddingRight: '1rem' }}>
            <div style={{ marginBottom: '0.4rem' }}>
              <span className={`badge ${badgeClass}`}>
                {exercise.equipo || 'Corporal'}
              </span>
              {supersetGroup && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <span className="badge" style={{ 
                    background: getSupersetColor(supersetGroup), 
                    color: '#2D3748',
                    borderRadius: '8px'
                  }}>
                    Superset {supersetGroup}
                  </span>
                </div>
              )}
            </div>
            
            <h2 className="exercise-title" style={{ marginTop: 0 }}>
              {exercise.name || exercise.ejercicio || exercise.Ejercicio}
            </h2>
          </div>
          
          <div style={{display:'flex', flexDirection: 'row', gap:'0.4rem', zIndex: 3, paddingTop: '2px', alignItems: 'flex-start'}}>
            {(exercise.video || exercise.Video || exercise['Video 1'] || exercise['Guía 1'] || exercise.link) && (
              <button className="btn-video" title="Ver guía 1" onClick={(e) => { e.stopPropagation(); window.open(exercise.video || exercise.Video || exercise['Video 1'] || exercise['Guía 1'] || exercise.link, '_blank'); }} style={{ justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', padding: 0, fontSize: '1rem', color: '#4A5568', background: '#EDF2F7' }}>
                ►
              </button>
            )}
            {(exercise['Video 2'] || exercise['Guía 2']) && (
              <button className="btn-video" title="Ver guía 2" onClick={(e) => { e.stopPropagation(); window.open(exercise['Video 2'] || exercise['Guía 2'], '_blank'); }} style={{ justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', padding: 0, fontSize: '1rem', color: '#4A5568', background: '#EDF2F7' }}>
                ►
              </button>
            )}
          </div>

        </div>
        
        {!isWarmup && (
          <div className="exercise-stats">
            <div className="stat-box"><span className="stat-label">Te Toca</span><span className="stat-value">{(exercise.seriesObj || exercise.Series_Obj || exercise.Series) ? `${exercise.seriesObj || exercise.Series_Obj || exercise.Series} × ${exercise.repsDefault || exercise.Reps_Default || exercise.Reps || '-'}` : '-'}</span></div>
            <div className="stat-box"><span className="stat-label">Anterior</span><span className="stat-value">{exercise.ultimaVez || exercise['Última vez'] || exercise['Última Vez'] || exercise['Ultima Vez'] || exercise.ultimo || '-'}</span></div>
            <div className="stat-box"><span className="stat-label">Récord</span><span className="stat-value">{exercise.lastRecord || exercise.record || '-'}</span></div>
          </div>
        )}

        {exercise.notas && (
          <div className="tips-box" style={{background: 'linear-gradient(to right, #F0FFF4, #FFFFFF)', borderLeftColor: 'var(--accent-mint)'}}>
            <strong>📝 Notas:</strong> {exercise.notas}
          </div>
        )}
        {exercise.Notas && !exercise.notas && (
          <div className="tips-box" style={{background: 'linear-gradient(to right, #F0FFF4, #FFFFFF)', borderLeftColor: 'var(--accent-mint)'}}>
            <strong>📝 Notas:</strong> {exercise.Notas}
          </div>
        )}
        {exercise.tips && (
          <div className="tips-box">
            <strong>💡 Tip:</strong> {exercise.tips}
          </div>
        )}

        <button className="btn-expand-hint" onClick={() => setExpanded(!expanded)}>
          {exercise.completed ? '¡Completado! ✨' : (expanded ? 'Cerrar sin guardar' : 'Anotar Resultados')}
        </button>

        {/* LOGGER SECTION */}
        <div className="logger-section" style={{ display: expanded ? 'block' : 'none' }}>
           {isWarmup ? (
              <>
                 <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem'}}>
                    Anota tus sensaciones de movilidad.
                 </p>
                 <textarea className="notes-input" placeholder="Sensaciones o molestias..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                 <button className="btn-save" onClick={handleSave}>Guardar Calentamiento</button>
              </>
           ) : (
               <>
                 <div id="setsContainer">
                   {sets.map(set => (
                     <div className="set-block" key={set.id} style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 0.4rem', flexWrap: 'nowrap', 
                        opacity: set.completed ? 0.85 : 1, 
                        background: set.completed ? '#F0FFF4' : '#F7FAFC',
                        borderColor: set.completed ? '#9AE6B4' : '#EDF2F7',
                        transition: 'all 0.3s' 
                     }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', minWidth: '24px' }}>
                           <span className="set-number" style={{ alignSelf: 'center', background: set.completed ? '#48BB78' : 'var(--accent-orange)', transition: 'background 0.3s', minWidth: '24px', height: '24px', fontSize: '0.8rem' }}>{set.id}</span>
                           {sets.length > 1 && (
                              <button onClick={() => deleteSet(set.id)} style={{ background: 'transparent', border: 'none', color: '#A0AEC0', fontSize: '0.75rem', cursor: 'pointer', padding: '2px' }}>✕</button>
                           )}
                        </div>
                        
                        <div className="input-wrapper" style={{ minWidth: '35px' }}>
                           <span className="input-label" style={{fontSize: '0.6rem'}}>Reps</span>
                           <input type="number" className="set-input" placeholder="0" value={set.reps} onChange={e => handleSetChange(set.id, 'reps', e.target.value)} style={{ width: '100%', fontSize: '1.1rem' }} />
                        </div>
                        <div className="input-wrapper" style={{ minWidth: '40px' }}>
                           <span className="input-label" style={{fontSize: '0.6rem'}}>Kgs</span>
                           <input type="number" className="set-input" placeholder="0.0" step="0.5" value={set.kgs} onChange={e => handleSetChange(set.id, 'kgs', e.target.value)} style={{ width: '100%', fontSize: '1.1rem' }} />
                        </div>
                        <div className="band-inline-selector" style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '75px', gap: '0.2rem', alignItems: 'center' }}>
                           <span className="input-label" style={{fontSize: '0.6rem'}}>Bandas</span>
                           <div className="selected-bands" style={{ display: 'flex', gap: '0.2rem', minHeight: '18px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                                 {set.bands.filter(b => b !== 'ninguna').map((b, i) => (
                                    <div key={i} className={`band-pill ${getBandClass(b)}`} onClick={() => {
                                       const newBands = [...set.bands];
                                       newBands.splice(i, 1);
                                       if (newBands.length < 3) newBands.push('ninguna');
                                       setSets(sets.map(s => s.id === set.id ? { ...s, bands: newBands } : s));
                                    }} style={{ padding: '0.1rem 0.3rem', fontSize: '0.65rem', minHeight: '18px' }}>
                                       <span style={{ fontWeight: 'bold' }}>{getBandLetter(b)}</span>
                                       <span className="remove-cross" style={{ marginLeft: '2px' }}>×</span>
                                    </div>
                                 ))}

                                 {set.bands.filter(b => b !== 'ninguna').length < 3 && (
                                    <div className="band-options" style={{ padding: 0, border: 'none', display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                                       <div className="band-circle bg-yellow" style={{ width: '16px', height: '16px' }} onClick={() => {
                                          const firstEmpty = set.bands.indexOf('ninguna');
                                          if (firstEmpty !== -1) handleBandChange(set.id, firstEmpty, 'amarilla');
                                       }}></div>
                                       <div className="band-circle bg-red" style={{ width: '16px', height: '16px' }} onClick={() => {
                                          const firstEmpty = set.bands.indexOf('ninguna');
                                          if (firstEmpty !== -1) handleBandChange(set.id, firstEmpty, 'roja');
                                       }}></div>
                                      <div className="band-circle bg-purple" style={{ width: '16px', height: '16px' }} onClick={() => {
                                          const firstEmpty = set.bands.indexOf('ninguna');
                                          if (firstEmpty !== -1) handleBandChange(set.id, firstEmpty, 'morada');
                                       }}></div>
                                       <div className="band-circle bg-green" style={{ width: '16px', height: '16px' }} onClick={() => {
                                          const firstEmpty = set.bands.indexOf('ninguna');
                                         if (firstEmpty !== -1) handleBandChange(set.id, firstEmpty, 'verde');
                                      }}></div>
                                      <div className="band-circle bg-black" style={{ width: '16px', height: '16px' }} onClick={() => {
                                         const firstEmpty = set.bands.indexOf('ninguna');
                                         if (firstEmpty !== -1) handleBandChange(set.id, firstEmpty, 'negra');
                                      }}></div>
                                    </div>
                                 )}
                           </div>
                        </div>

                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <button 
                             onClick={() => handleSetChange(set.id, 'completed', !set.completed)}
                             style={{ 
                               width: '32px', height: '32px', borderRadius: '8px', border: '2px solid #E2E8F0',
                               background: set.completed ? '#48BB78' : 'white',
                               color: set.completed ? 'white' : 'transparent',
                               display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                               fontSize: '1.2rem', padding: 0, transition: 'all 0.2s'
                             }}
                           >
                              ✓
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>
                 <button className="btn-add-set" onClick={addSet}>+ Añadir Serie Adicional</button>
                 <textarea className="notes-input" placeholder="Sensaciones del ejercicio..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                 <button className="btn-save" onClick={handleSave}>Guardar y Completar</button>
               </>
           )}
        </div>
      </div>
    </div>
  );
}
