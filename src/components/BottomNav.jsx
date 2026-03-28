import React from 'react';

export default function BottomNav({ currentView, onNavigate }) {
  return (
    <div className="bottom-nav">
      <div 
        className={`nav-item ${currentView === 'program' ? 'active' : ''}`} 
        onClick={() => onNavigate('program')}
      >
        <span className="nav-icon">📍</span>
        <span>Programa</span>
      </div>
      <div 
        className={`nav-item ${currentView === 'freestyle' ? 'active' : ''}`} 
        onClick={() => onNavigate('freestyle')}
      >
        <span className="nav-icon">🔀</span>
        <span>Libre</span>
      </div>
      <div 
        className={`nav-item ${currentView === 'history' ? 'active' : ''}`} 
        onClick={() => onNavigate('history')}
      >
        <span className="nav-icon">📅</span>
        <span>Historial</span>
      </div>
    </div>
  );
}
