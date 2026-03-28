import React from 'react';

export default function HistoryView() {
  return (
    <div className="view active">
      <div className="welcome-header">
        <h1>Tu Historial</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Tu constancia tiene premio</p>
      </div>

      <div className="calendar-card">
        <h3 className="month-title">Mes Actual</h3>
        <div className="calendar-grid">
          <div className="cal-day-name">L</div><div className="cal-day-name">M</div><div className="cal-day-name">X</div><div className="cal-day-name">J</div><div className="cal-day-name">V</div><div className="cal-day-name">S</div><div className="cal-day-name">D</div>
          <div></div><div></div><div></div>
          <div className="cal-day active">1</div>
          <div className="cal-day">2</div>
          <div className="cal-day">3</div>
          <div className="cal-day active">4</div>
          <div className="cal-day">5</div>
          <div className="cal-day active">6</div>
          <div className="cal-day today">7</div>
          <div className="cal-day">8</div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          3 Entrenos esta semana 🔥
        </p>
      </div>

      <div className="history-list" style={{ marginTop: '0.5rem' }}>
        <h3>Últimos Entrenos</h3>
        <div className="history-item">
          <div>
            <div className="history-item-title">S1 - Día 3: Full Body</div>
            <div className="history-item-date">Ayer, 18:30h</div>
          </div>
          <span className="history-badge">Completado</span>
        </div>
        <div className="history-item">
          <div>
            <div className="history-item-title">S1 - Día 2: Empuje</div>
            <div className="history-item-date">Hace 3 días</div>
          </div>
          <span className="history-badge">Completado</span>
        </div>
      </div>
    </div>
  );
}
