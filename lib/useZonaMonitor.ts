import {useEffect} from 'react';
import {leggiStatoZona} from './udpClient';

export function useZonaMonitor(zoneId: number, interval: number = 5000) {
  useEffect(() => {
    // Funzione per leggere lo stato della zona
    const fetchZonaState = () => {
      leggiStatoZona(zoneId);
    };

    // Avvia il monitoraggio con un intervallo specificato
    const intervalId = setInterval(fetchZonaState, interval);

    // Cleanup: interrompi il monitoraggio quando il componente viene smontato
    return () => clearInterval(intervalId);
  }, [zoneId, interval]);
}