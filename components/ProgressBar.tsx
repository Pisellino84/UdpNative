import {View, Text} from 'react-native';
import {useEffect, useState} from 'react';

// Componente ProgressBar che mostra una barra di avanzamento e un warning se il progresso è lento
export default function ProgressBar({progress}: {progress: number}) {
  // Larghezza massima della barra in pixel
  const maxWidth = 200;
  // Valore massimo del progresso
  const maxValue = 48;
  // Stato per mostrare o meno il messaggio di warning
  const [showWarning, setShowWarning] = useState(false);

  // Limita il valore di progresso al massimo consentito
  const clampedProgress = Math.min(progress, maxValue);
  // Calcola la larghezza della barra in base al progresso
  const width = (clampedProgress / maxValue) * maxWidth;

  // Effetto che mostra il warning dopo 5 secondi se il progresso è basso
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (clampedProgress < maxValue / 2) {
        setShowWarning(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [clampedProgress]);

  return (
    <View className="justify-center items-center">
      {/* Contenitore della barra di avanzamento */}
      <View className="w-[200px] rounded-xl border border-primary-300">
        {/* Barra di avanzamento riempita */}
        <View
          className={`bg-primary-300 h-5 flex items-center justify-center rounded-xl`}
          style={{width: width}}></View>
      </View>
      {/* Messaggio di warning se il caricamento è troppo lento */}
      {showWarning ?? (
        <Text className="text-red-500 font-bold text-sm text-center mb-2">
          Il caricamento è troppo lento, controlla la connessione o verifica che
          l'indirizzo IP inserito sia corretto.
        </Text>
      )}
    </View>
  );
}
