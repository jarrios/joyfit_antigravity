import React, { useState, useEffect } from 'react';
import HomeView from './components/HomeView';
import SessionDetailView from './components/SessionDetailView';
import ExerciseListView from './components/ExerciseListView';
import ExerciseDetailView from './components/ExerciseDetailView';
import HistoryView from './components/HistoryView';

const API_URL = "https://script.google.com/macros/s/AKfycbw5jrZ6F1PCOl0Qq2TTyX0dM01BkBTO_OVnlgyaH0CpwhmgZVttRnp7bKFpJifYEDFf/exec";

function filterByProgram(exercises, programKey) {
  if (!exercises.length) return [];
  if (programKey === 'kettlebell') {
    const kb = exercises.filter(e =>
      (e.Programa || e.programa || '').toLowerCase().includes('kettle')
    );
    return kb.length ? kb : exercises;
  }
  // 'estandar' — exclude pure kettlebell entries if a Programa field separates them
  const std = exercises.filter(e =>
    !(e.Programa || e.programa || '').toLowerCase().includes('kettle')
  );
  return std.length ? std : exercises;
}

export default function App() {
  const [view, setViewRaw] = useState('home');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programExercises, setProgramExercises] = useState([]);
  const [sessionExercises, setSessionExercises] = useState([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // ── Browser history integration for mobile back button ──
  const VIEW_PARENT = {
    'home': null,
    'session-detail': 'home',
    'exercise-list': 'session-detail',
    'exercise-detail': 'exercise-list',
    'history': 'home',
  };

  const navigateTo = (newView) => {
    setViewRaw(newView);
    window.history.pushState({ view: newView }, '', '');
  };

  useEffect(() => {
    // Set initial history state
    window.history.replaceState({ view: 'home' }, '', '');

    const handlePopState = (event) => {
      if (event.state?.view) {
        setViewRaw(event.state.view);
      } else {
        // No state → go home and re-push so we don't leave the app
        setViewRaw('home');
        window.history.pushState({ view: 'home' }, '', '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [lastSession, setLastSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('joyfit_lastSession') || 'null'); } catch { return null; }
  });

  const [allExercises, setAllExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch(API_URL)
      .then(res => { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
      .then(data => {
        if (!Array.isArray(data)) {
          setErrorMsg("La API no devolvió un array.");
        } else {
          setAllExercises(data.filter(d => d.Ejercicio || d.name || d.ejercicio));
        }
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Error al conectar con Google Sheets: " + err.message);
        setLoading(false);
      });
  }, []);

  // ── Home → select program → Vista 2 (session list) ──
  const handleSelectProgram = (programKey) => {
    setSelectedProgram(programKey);
    const base = filterByProgram(allExercises, programKey);
    setProgramExercises(base);
    navigateTo('session-detail');
  };

  // ── Vista 2 → select session → Vista 3 (exercise list) ──
  const handleSelectSession = (semana, dia, exercises) => {
    setSessionExercises(exercises.map(e => ({ ...e, completed: false })));
    setSessionTitle(`Semana ${semana} · Día ${dia}`);
    navigateTo('exercise-list');
  };

  // ── Home → continue → Vista 3 (skip Vista 2) ──
  const handleContinue = (last) => {
    setSelectedProgram(last.programKey);
    setSessionExercises(last.exercises);
    setSessionTitle(last.title);
    setCurrentExerciseIndex(last.currentExerciseIndex || 0);
    navigateTo('exercise-list');
  };

  // ── Vista 3 → start exercise → Vista 4 ──
  const handleStartExercise = (idx) => {
    // If clicked exercise is part of a superset, navigate to first member
    const group = sessionExercises[idx]?.Grupo_Superset || sessionExercises[idx]?.superset || null;
    if (group) {
      const firstInGroup = sessionExercises.findIndex(e =>
        (e.Grupo_Superset || e.superset || null) === group
      );
      setCurrentExerciseIndex(firstInGroup >= 0 ? firstInGroup : idx);
    } else {
      setCurrentExerciseIndex(idx);
    }
    navigateTo('exercise-detail');
  };

  // ── Vista 4 → save exercise → auto advance ──
  const handleSaveExercise = (idx, sets, notes) => {
    const updated = sessionExercises.map((ex, i) =>
      i === idx ? { ...ex, completedSets: sets, notes, completed: true } : ex
    );
    setSessionExercises(updated);

    const lastSessionData = {
      programKey: selectedProgram,
      title: sessionTitle,
      programName: selectedProgram === 'kettlebell' ? 'Programa Kettlebell' : 'Programa Estándar',
      exercises: updated,
      currentExerciseIndex: idx + 1 < updated.length ? idx + 1 : idx,
      completedCount: updated.filter(e => e.completed).length,
    };
    setLastSession(lastSessionData);
    localStorage.setItem('joyfit_lastSession', JSON.stringify(lastSessionData));

    // ── Guardar en Google Sheets (via GET para evitar el redirect 302 de Apps Script) ──
    const exercise = updated[idx];
    const postData = {
      date: new Date().toISOString(),
      program: selectedProgram === 'kettlebell' ? 'Kettlebell' : 'Estándar',
      week: exercise.Semana || exercise.semana || '',
      day: exercise.Dia || exercise.dia || '',
      exercise: exercise.name || exercise.ejercicio || exercise.Ejercicio || '',
      sets: sets.map(s => ({
        id: s.id,
        reps: s.reps,
        kgs: s.kgs,
        bands: (s.bands || []).filter(b => b !== 'ninguna'),
      })),
      notes: notes || '',
    };

    const submitUrl = new URL(API_URL);
    submitUrl.searchParams.append('action', 'save');
    submitUrl.searchParams.append('data', JSON.stringify(postData));

    fetch(submitUrl.toString(), {
      method: 'GET',
      mode: 'no-cors',
    }).catch(err => console.error('Error guardando en Sheets:', err));

    // Auto-advance: skip past the entire superset group
    const group = exercise.Grupo_Superset || exercise.superset || null;
    let nextIdx = idx + 1;
    if (group) {
      // Find the last member of this group
      let lastInGroup = idx;
      for (let j = idx + 1; j < updated.length; j++) {
        if ((updated[j].Grupo_Superset || updated[j].superset || null) === group) {
          lastInGroup = j;
        } else break;
      }
      nextIdx = lastInGroup + 1;
    }

    if (nextIdx < updated.length) {
      setCurrentExerciseIndex(nextIdx);
    } else {
      navigateTo('exercise-list');
    }
  };

  // ── Render ──

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite' }}>⏳</div>
        <p style={{ fontWeight: 700 }}>Cargando rutina…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-warm)' }}>Error de Conexión</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {view === 'home' && (
        <HomeView
          lastSession={lastSession}
          onContinue={handleContinue}
          onSelectProgram={handleSelectProgram}
          onShowHistory={() => navigateTo('history')}
        />
      )}

      {view === 'session-detail' && (
        <SessionDetailView
          program={selectedProgram}
          exercises={programExercises}
          onSelectSession={handleSelectSession}
          onBack={() => window.history.back()}
        />
      )}

      {view === 'exercise-list' && (
        <ExerciseListView
          sessionTitle={sessionTitle}
          exercises={sessionExercises}
          onStartExercise={handleStartExercise}
          onBack={() => window.history.back()}
        />
      )}

      {view === 'exercise-detail' && (
        <ExerciseDetailView
          key={currentExerciseIndex}
          exercises={sessionExercises}
          currentIndex={currentExerciseIndex}
          onSave={handleSaveExercise}
          onBack={() => window.history.back()}
        />
      )}

      {view === 'history' && (
        <div>
          <div style={{ padding: '1.5rem 1rem 0' }}>
            <span
              style={{ color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => window.history.back()}
            >« Volver</span>
          </div>
          <HistoryView />
        </div>
      )}
    </div>
  );
}
