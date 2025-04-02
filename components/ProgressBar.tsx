import { Text, View } from 'react-native';

export default function ProgressBar({ progress }: { progress: number }) {
  const maxWidth = 200;
  const maxValue = 48;

  const clampedProgress = Math.min(progress, maxValue);

  const width = (clampedProgress / maxValue) * maxWidth;

  const percentage = Math.min(Math.round((clampedProgress / maxValue) * 100), 100);

  return (
    <View className="w-[200px] rounded-xl">
      <View
        className={`bg-primary-300 h-5 flex items-center justify-center  rounded-xl`}
        style={{ width: width }}
      ></View>
      <Text className="absolute justify-center right-0 left-0 items-center text-center font-extrabold">
        {percentage}%
      </Text>
    </View>
  );
}