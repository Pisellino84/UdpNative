import {useEffect, useRef} from 'react';
import {leggiStatoZona, sendThreeBytes} from './udpClient';

export function useZonaMonitor(
  zoneId: number,
  interval: number = 5000,
  pauseTrigger?: any,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchZonaState = () => {
      sendThreeBytes(61, zoneId, 0);
      leggiStatoZona(zoneId);
    };

    let intervalId: NodeJS.Timeout | null = setInterval(
      fetchZonaState,
      interval,
    );

    const restartMonitor = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(fetchZonaState, interval);
    };

    if (pauseTrigger !== undefined) {
      if (intervalId) clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        restartMonitor();
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [zoneId, interval, pauseTrigger]);
}
