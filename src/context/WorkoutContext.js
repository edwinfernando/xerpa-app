/**
 * WorkoutContext — Estado global del cronómetro de entrenamiento
 *
 * Expone:
 *  - isTimerActive : boolean   — ¿está corriendo el cronómetro?
 *  - timerSecs     : number    — segundos transcurridos
 *  - startTimer()             — inicia / reinicia desde 0
 *  - stopTimer()              — detiene (NO resetea, para que PlanView muestre el sheet)
 *  - resetTimer()             — pone timerSecs a 0 (llamado desde handleFinishClose)
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const WorkoutContext = createContext({
  isTimerActive: false,
  timerSecs: 0,
  startTimer: () => {},
  stopTimer: () => {},
  resetTimer: () => {},
});

// ─── Provider ────────────────────────────────────────────────
export function WorkoutContextProvider({ children }) {
  const [timerSecs, setTimerSecs] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isTimerActive) {
      intervalRef.current = setInterval(() => setTimerSecs(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isTimerActive]);

  function startTimer() {
    setTimerSecs(0);
    setIsTimerActive(true);
  }

  // Solo detiene — PlanView abre el sheet de finalización al recibirlo
  function stopTimer() {
    setIsTimerActive(false);
  }

  // Resetea segundos a 0 tras guardar/descartar la sesión
  function resetTimer() {
    setTimerSecs(0);
  }

  return (
    <WorkoutContext.Provider value={{ isTimerActive, timerSecs, startTimer, stopTimer, resetTimer }}>
      {children}
    </WorkoutContext.Provider>
  );
}

// ─── Hook de consumo ─────────────────────────────────────────
export function useWorkoutContext() {
  return useContext(WorkoutContext);
}
