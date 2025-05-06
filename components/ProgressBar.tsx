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
        {showWarning && (
          <Text className="text-red-500 font-bold text-center mb-2">
            Il progresso è troppo lento, controlla la connessione o verifica che l'indirizzo IP sia corretto.
          </Text>
        )}
      <View className="w-[200px] rounded-xl border border-primary-300">
        <View
          className={`bg-primary-300 h-5 flex items-center justify-center rounded-xl`}
          style={{width: width}}></View>
      </View>
    </View>
  );
}
