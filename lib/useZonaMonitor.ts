import {useEffect, useRef} from 'react';
import {leggiStatoZona} from './udpClient';

export function useZonaMonitor(zoneId: number, interval: number = 5000, pauseTrigger?: any) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchZonaState = () => {
      leggiStatoZona(zoneId);
    };

    let intervalId: NodeJS.Timeout | null = setInterval(fetchZonaState, interval);

    // Funzione per riavviare il monitoraggio
    const restartMonitor = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(fetchZonaState, interval);
    };

    // Se `pauseTrigger` cambia, ferma il monitoraggio e riavvialo dopo un timeout
    if (pauseTrigger !== undefined) {
      if (intervalId) clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        restartMonitor();
      }, 500); // Riavvia dopo 500 ms di inattività
    }

    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [zoneId, interval, pauseTrigger]);
}