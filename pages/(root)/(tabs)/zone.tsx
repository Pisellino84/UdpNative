import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {sendThreeBytes, Nome, leggiStatoZona} from '../../../lib/udpClient'; // Importa Nome

import '../../../global.css';

import {MainHeader} from '../../../components/Header';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import ProgressBar from '../../../components/ProgressBar';

import icons from '../../../constants/icons';

import {useNavigation, NavigationProp} from '@react-navigation/native';
import {useEffect, useState, useRef} from 'react';
import Slider from '@react-native-community/slider';
import {retrieveData} from 'lib/db';

type RootStackParamList = {
  PaginaZona: {zoneId: number};
};

const Zone = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Array di 48 zone
  const zones = Array.from({length: 49}, (_, i) => i + 1);

  // Stato per memorizzare i nomi delle zone
  const [zoneNames, setZoneNames] = useState<string[]>(Array(48).fill(''));
  const [isLoading, setIsLoading] = useState(true);
  const [perc, setPerc] = useState(0);

  // useRef per memorizzare l'ultimo valore di Nome
  const lastNome = useRef<string | null>(null);

  // Funzione per caricare i nomi uno alla volta
  const loadZoneNames = async () => {
    const names: string[] = [...zoneNames]; // Copia dello stato attuale

    for (const zoneId of zones) {
      let nomeChanged = false; // Flag per controllare se Nome è cambiato

      while (!nomeChanged && zoneId !== 49) {
        sendThreeBytes(61, zoneId, 0); // Invia i tre byte richiesti
        await new Promise(resolve => setTimeout(resolve, 30)); // Ritardo per evitare di saltare zone in ms

        if (Nome && Nome !== lastNome.current) {
          names[zoneId - 1] = Nome; // Usa il nome caricato
          setZoneNames([...names]); // Aggiorna lo stato
          setPerc(prevPerc => prevPerc + 1);
          lastNome.current = Nome; // Aggiorna l'ultimo valore di Nome
          nomeChanged = true; // Imposta il flag a true
        }
        retrieveData(`volume_`)
      }

      // Se siamo all'ultima zona (zonaId 48), impostiamo isLoading a false
      if (zoneId === 48) {
        setIsLoading(false);
      }
    }
  };

  // Carica i nomi all'avvio
  useEffect(() => {
    loadZoneNames();
  }, []);

  if (isLoading) {
    // Mostra la schermata di caricamento
    return (
      <AndroidSafeArea>
        <View className="flex h-screen justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-lg mt-4">Caricamento in corso...</Text>
          <ProgressBar progress={perc} />
        </View>
      </AndroidSafeArea>
    );
  }

  return (
    <AndroidSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MainHeader title="Zone" icon={icons.zone} />
        <View className="my-5 flex flex-col gap-3">
          <View className="flex flex-row justify-between items-center">
            <TouchableOpacity>
              <Text
                className="text-primary-300 font-light"
                onPress={() => {
                  zones.forEach(zoneId => sendThreeBytes(4, zoneId, 1));
                }}>
                Turn all Zones ON
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text
                className="text-primary-300 font-light"
                onPress={() => {
                  zones.forEach(zoneId => sendThreeBytes(4, zoneId, 0));
                }}>
                Turn all Zones OFF
              </Text>
            </TouchableOpacity>
          </View>

          {/* Genera dinamicamente i pulsanti per le zone */}
          {zones.map(zoneId => (
            <TouchableOpacity
              key={zoneId}
              className="flex flex-row border-b p-5 border-black-50 justify-between items-center"
              onPress={() => {
                navigation.navigate('PaginaZona', {zoneId}); // Passa l'ID della zona
              }}>
              <View className="flex flex-row items-center gap-2">
                <Text className="text-xl font-medium">
                  {zoneNames[zoneId - 1]} {/* Mostra solo il nome caricato */}
                </Text>
                <View className="flex flex-col gap-1">
                  <Image source={icons.power} className="size-4" />
                  <Image source={icons.mute} className="size-4" />
                </View>
                <View className="flex flex-row">
                  <Slider
                    maximumTrackTintColor="#228BE6"
                    step={2}
                    minimumValue={0}
                    maximumValue={80}
                    value={50}
                    style={{width: 150}}
                    disabled
                  />
                  <Text className="font-bold">12</Text>
                </View>
              </View>

              <Image source={icons.rightArrow} className="size-6" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </AndroidSafeArea>
  );
};

export default Zone;
