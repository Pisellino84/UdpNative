import icons from '../../../constants/icons';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import {View, Text, TouchableOpacity} from 'react-native';
import {settingsHeader as SettingsHeader} from '../../../components/Header';
import {NavigationProp, useNavigation} from '@react-navigation/native';

export default function Impostazioni() {
  type RootStackParamList = {
    FirstView: undefined;
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  function handleIpChange() {
    console.log('adasd');
    navigation.navigate('FirstView');
  }
  return (
    <AndroidSafeArea>
      <View>
        <SettingsHeader title="Impostazioni" />
        <View className="flex flex-col gap-5 mt-5 ">
          <TouchableOpacity className="flex flex-row items-center gap-3 p-5 bg-primary-300 rounded-2xl" onPress={handleIpChange}>
            <Text
              className="font-extrabold text-white">
              CAMBIA IP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row items-center gap-3 p-5 bg-primary-300 rounded-2xl">
            <Text className="font-extrabold text-white">ABOUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AndroidSafeArea>
  );
}
