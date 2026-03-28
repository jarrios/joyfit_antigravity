import React, { useState } from 'react';
import WorkoutCard from './WorkoutCard';

export default function WorkoutView({ workoutMeta, onClose }) {
  const initialExercises = workoutMeta.programExercises || [];
  const [workouts, setWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('joyfit_workout_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.metaTitle === workoutMeta.title && parsed.type === workoutMeta.type) {
          return parsed.workouts;
        }
      }
    } catch (e) {}
    
    return initialExercises.map((w, index) => ({ 
      ...w, 
      id: w.id || `fetched-${index}`, 
      completed: false 
    }));
  });

  React.useEffect(() => {
    localStorage.setItem('joyfit_workout_state', JSON.stringify({
      metaTitle: workoutMeta.title,
      type: workoutMeta.type,
      workouts
    }));
  }, [workouts, workoutMeta]);
  
  const completedCount = workouts.filter(w => w.completed).length;
  const progress = workouts.length === 0 ? 0 : Math.round((completedCount / workouts.length) * 100);

  const handleSaveExercise = (updatedExercise) => {
    setWorkouts(prev => prev.map(w => 
      w.id === updatedExercise.id ? { ...updatedExercise, completed: true } : w
    ));
  };

  return (
    <div className="view active" style={{ paddingBottom: '3rem' }}>
      <div className="workout-header">
        <span className="nav-back" onClick={onClose}>← Cerrar Entreno</span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{workoutMeta.title}</h1>
        <p className="subtitle" style={{ marginBottom: '0.5rem' }}>{workoutMeta.context}</p>
        
        <div className="progress-bar-container">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">{progress}% completado</p>
      </div>

      {workouts.map((exercise, index) => (
        <div key={exercise.id} style={{ animation: `slideIn 0.3s ease-out ${(index+1)*0.1}s both`}}>
          <WorkoutCard 
            exercise={exercise} 
            onSave={handleSaveExercise} 
          />
        </div>
      ))}
      
      {progress === 100 && (
         <div style={{
             marginTop: '1rem', padding: '1.5rem', background: 'var(--accent-mint)', 
             color: 'white', borderRadius: '16px', textAlign: 'center', fontWeight: '800'
         }}>
             ¡Rutina Terminada! Has completado todo. 🎉
         </div>
      )}
    </div>
  );
}
