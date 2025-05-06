import {router} from 'expo-router';
import {SafeAreaView, Text, TouchableOpacity, View, Image} from 'react-native';

export default function NotFoundScreen() {
  const questaPagina = 'Questa pagina';
  const nonEsiste = '\nnon esiste';
  return (
    <>
      <SafeAreaView>
        <View className="flex h-screen-safe justify-center items-center">
          <Text className="text-xl font-rubik-bold text-center text-black-300 mt-5">
            {questaPagina}
            <Text className="text-primary-300 text-4xl">{nonEsiste}</Text>
          </Text>
          <TouchableOpacity
            className="flex flex-row justify-between items-center gap-3 mt-5"
            onPress={router.back}>
            <Image className="size-11 rounded-full bg-zinc-200" />
            <Text className="text-lg font-rubik-medium">Torna indietro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}
