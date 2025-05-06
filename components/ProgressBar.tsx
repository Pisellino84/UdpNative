import {View} from 'react-native';

export default function ProgressBar({progress}: {progress: number}) {
  const maxWidth = 200;
  const maxValue = 48;

  const clampedProgress = Math.min(progress, maxValue);

  const width = (clampedProgress / maxValue) * maxWidth;

  return (
    <View className="w-[200px] rounded-xl border border-primary-300">
      <View
        className={`bg-primary-300 h-5 flex items-center justify-center  rounded-xl`}
        style={{width: width}}></View>
    </View>
  );
}
