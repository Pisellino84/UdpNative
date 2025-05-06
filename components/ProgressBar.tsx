import {View, Text} from 'react-native';
import {useEffect, useState} from 'react';

export default function ProgressBar({progress}: {progress: number}) {
  const maxWidth = 200;
  const maxValue = 48;
  const [showWarning, setShowWarning] = useState(false);

  const clampedProgress = Math.min(progress, maxValue);
  const width = (clampedProgress / maxValue) * maxWidth;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (clampedProgress < maxValue / 2) {
        setShowWarning(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [clampedProgress]);

  return (
    <View className='justify-center items-center'>
      <View className="w-[200px] rounded-xl border border-primary-300">
        <View
          className={`bg-primary-300 h-5 flex items-center justify-center rounded-xl`}
          style={{width: width}}></View>
      </View>
          {showWarning ? (
            <Text className="text-red-500 font-bold text-sm text-center mb-2">
              Il caricamento è troppo lento, controlla la connessione o verifica che l'indirizzo IP inserito sia corretto.
            </Text>
          ) : <Text className='text-primary-300 font-extrabold text-2xl animate-pulse'>Non cambiare pagina</Text>}
    </View>
  );
}
