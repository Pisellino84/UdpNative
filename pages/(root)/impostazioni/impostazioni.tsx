import icons from '../../../constants/icons';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import {View, Text, TouchableOpacity} from 'react-native';
import {MainHeader} from '../../../components/Header';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {saveData} from '../../../lib/db';

// Pagina delle impostazioni principali dell'app
export default function Impostazioni() {
  // Definizione delle rotte disponibili nello stack
  type RootStackParamList = {
    IpPage: undefined;
    About: undefined;
  };
  // Hook di navigazione
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // Gestione del cambio IP: salva un flag e naviga alla pagina IP
  function handleIpChange() {
    console.log('adasd');
    saveData('FW', 'no');
    navigation.navigate('IpPage');
  }
  return (
    <AndroidSafeArea>
      <View>
        {/* Header principale */}
        <MainHeader title="Impostazioni" icon={icons.settings} />
        <View className="flex flex-col gap-5 mt-5 ">
          {/* Pulsante per cambiare IP */}
          <TouchableOpacity
            className="flex flex-row items-center gap-3 p-5 bg-primary-300 rounded-2xl"
            onPress={handleIpChange}>
            <Text className="font-extrabold text-white">CAMBIA IP</Text>
          </TouchableOpacity>
          {/* Pulsante per la pagina About */}
          <TouchableOpacity
            className="flex flex-row items-center gap-3 p-5 bg-primary-300 rounded-2xl"
            onPress={() => navigation.navigate('About')}>
            <Text className="font-extrabold text-white">ABOUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AndroidSafeArea>
  );
}
