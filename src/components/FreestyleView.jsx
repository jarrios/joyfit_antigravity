import React from 'react';

export default function FreestyleView({ onStartWorkout }) {
  return (
    <div className="view active">
      <div className="welcome-header">
        <h1>Días Sueltos</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Entrena sin afectar tu progreso principal.</p>
      </div>

      <div className="list-item" onClick={() => onStartWorkout('freestyle', 'Fuerza Sup.', 'Día Libre')}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="list-icon">💪</div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>Fuerza Superior</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pecho, Espalda, Hombros</p>
          </div>
        </div>
        <div style={{ color: 'var(--accent-orange)', fontWeight: 800 }}>→</div>
      </div>

      <div className="list-item" onClick={() => onStartWorkout('freestyle', 'Cardio HIIT', 'Día Libre')}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="list-icon">🔥</div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>Kettlebell HIIT</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Metabolismo a tope</p>
          </div>
        </div>
        <div style={{ color: 'var(--accent-orange)', fontWeight: 800 }}>→</div>
      </div>
    </div>
  );
}
