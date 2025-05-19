import {useEffect, useRef} from 'react';
import {leggiStatoZona, sendThreeBytes} from './udpClient';

// Hook custom per monitorare periodicamente lo stato di una zona tramite UDP
export function useZonaMonitor(
  zoneId: number,
  interval: number = 5000,
  pauseTrigger?: any,
) {
  // Ref per gestire il timeout di riavvio del monitor
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Funzione per inviare i comandi UDP e leggere lo stato della zona
    const fetchZonaState = () => {
      sendThreeBytes(61, zoneId, 0);
      leggiStatoZona(zoneId);
    };

    // Avvia un intervallo per monitorare la zona
    let intervalId: NodeJS.Timeout | null = setInterval(
      fetchZonaState,
      interval,
    );

    // Funzione per riavviare il monitor dopo una pausa
    const restartMonitor = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(fetchZonaState, interval);
    };

    // Se il trigger di pausa cambia, ferma il monitor e riavvialo dopo 500ms
    if (pauseTrigger !== undefined) {
      if (intervalId) clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        restartMonitor();
      }, 500);
    }

    // Pulizia intervalli e timeout quando il componente viene smontato o cambiano le dipendenze
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [zoneId, interval, pauseTrigger]);
}
