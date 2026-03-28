import React from 'react';

export default function ProgramView({ onStartWorkout, firstWorkout }) {
  const semana = firstWorkout?.Semana || '-';
  const dia = firstWorkout?.Dia || '-';
  const programa = firstWorkout?.Programa || 'Tu Programa';

  return (
    <div className="view active">
      <div className="welcome-header">
        <h1>Programa Activo</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Continúa donde lo dejaste</p>
      </div>

      <div className="program-card">
        <div className="program-card-bg"></div>
        <div className="program-content">
          <span className="program-badge">📍 {programa}</span>
          <h2 className="program-title">Semana {semana} • Día {dia}</h2>
          <p className="program-next">Sesión de Entrenamiento</p>
          <button 
            className="btn-primary" 
            onClick={() => onStartWorkout('program', `Semana ${semana} - Día ${dia}`, `Programa: ${programa}`)}
          >
            🚀 Empezar Entreno
          </button>
        </div>
      </div>
    </div>
  );
}
