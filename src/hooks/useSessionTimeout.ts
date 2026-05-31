import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    testSessionModal: () => void;
  }
}

// Default: 29 minutos (1740s) de inactividad, 60s de advertencia.
export const useSessionTimeout = (
  onLogout: () => void,
  idleTimeoutSeconds: number = 1740,
  warningCountdownSeconds: number = 60
) => {
  const [isWarning, setIsWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(warningCountdownSeconds);

  // Usamos Refs para que los callbacks no cambien constantemente y no disparen limpiezas indeseadas en el useEffect
  const isWarningRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCountdown = useCallback(() => {
    // Si ya estamos en cuenta regresiva, no hacemos nada
    if (countdownTimerRef.current) return;
    
    setIsWarning(true);
    isWarningRef.current = true;
    setTimeLeft(warningCountdownSeconds);

    countdownTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time is up!
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningCountdownSeconds, onLogout]);

  const resetTimers = useCallback(() => {
    // Si ya estamos en warning, ignoramos la actividad (el usuario DEBE clickear el botón)
    if (isWarningRef.current) return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    idleTimerRef.current = setTimeout(() => {
      startCountdown();
    }, idleTimeoutSeconds * 1000);
  }, [idleTimeoutSeconds, startCountdown]);

  // Manejar el click del botón "Permanecer conectado"
  const stayLoggedIn = useCallback(() => {
    setIsWarning(false);
    isWarningRef.current = false;
    setTimeLeft(warningCountdownSeconds);
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      startCountdown();
    }, idleTimeoutSeconds * 1000);
  }, [idleTimeoutSeconds, warningCountdownSeconds, startCountdown]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'wheel', 'mousedown', 'touchstart', 'touchmove'];
    
    const handleActivity = () => {
      resetTimers();
    };

    events.forEach(event => document.addEventListener(event, handleActivity));

    // Exponer función de prueba en consola del navegador
    window.testSessionModal = () => {
      console.log('Forzando el timeout de sesión para pruebas...');
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      startCountdown();
    };

    // Inicializamos al montar
    resetTimers();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      delete (window as any).testSessionModal;
    };
  }, [resetTimers, startCountdown]); // Ahora resetTimers y startCountdown son muy estables

  return { isWarning, timeLeft, stayLoggedIn };
};
