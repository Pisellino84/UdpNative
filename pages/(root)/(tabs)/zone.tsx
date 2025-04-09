import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  sendThreeBytes,
  Nome,
  leggiStatoZona,
  Volume,
  Byte5,
} from '../../../lib/udpClient'; // Importa Nome

import '../../../global.css';

import {MainHeader} from '../../../components/Header';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import ProgressBar from '../../../components/ProgressBar';

import icons from '../../../constants/icons';

import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import {useEffect, useState, useRef, useCallback} from 'react';
import Slider from '@react-native-community/slider';

type RootStackParamList = {
  PaginaZona: {zoneId: number};
};

const Zone = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Array di 48 zone
  const zones = Array.from({length: 49}, (_, i) => i + 1);

  // Stato per memorizzare i nomi delle zone
  const [zoneNames, setZoneNames] = useState<string[]>(Array(48).fill(''));
  const [zoneVolumes, setZoneVolumes] = useState<number[]>(Array(48).fill(0));
  const [zoneBytes5, setZoneBytes5] = useState<number[]>(Array(48).fill(0));

  const [isLoading, setIsLoading] = useState(true);
  const [perc, setPerc] = useState(0);

  // useRef per memorizzare l'ultimo valore di Nome
  const lastNome = useRef<string | null>(null);

  // Funzione per caricare i nomi uno alla volta
  const loadZoneData = async () => {
    setIsLoading(false);
    setPerc(0);
    const names: string[] = [...zoneNames]; // Copia dello stato attuale
    const volumes: number[] = [...zoneVolumes];
    const bytes5: number[] = [...zoneBytes5];

    for (const zoneId of zones) {
      let nomeChanged = false; // Flag per controllare se Nome è cambiato
      let volumeChanged = false;
      let Byte5Changed = false;
      while (!nomeChanged && !volumeChanged && zoneId !== 49) {
        // Invia i tre byte richiesti
        leggiStatoZona(zoneId);
        await new Promise(resolve => setTimeout(resolve, 5)); // Ritardo per evitare di saltare zone in ms
        sendThreeBytes(61, zoneId, 0);
        console.log(Volume);

        if (Nome && Nome !== lastNome.current) {
          names[zoneId - 1] = Nome; // Usa il nome caricato
          if (Byte5) {
            bytes5[zoneId - 1] = Byte5;
            console.log('byte5', Byte5);
          } else {
            bytes5[zoneId - 1] = 0;
          }

          if (Volume) {
            volumes[zoneId - 1] = Volume;
          } else {
            volumes[zoneId - 1] = 0;
          }

          setZoneNames([...names]); // Aggiorna lo stato
          setZoneVolumes([...volumes]);
          setZoneBytes5([...bytes5]);
          setPerc(prevPerc => prevPerc + 1);
          lastNome.current = Nome; // Aggiorna l'ultimo valore di Nome
          nomeChanged = true; // Imposta il flag a true
          volumeChanged = true;
          Byte5Changed = true;
        }
      }
      // Se siamo all'ultima zona (zonaId 48), impostiamo isLoading a false
      if (zoneId === 48) {
        setIsLoading(false);
      }
    }
  };

  /* useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let intervalId: NodeJS.Timeout;

      const loadZoneStates = async () => {
        const volumes: number[] = Array(48).fill(0); // Initialize a new array
        if (isLoading || !isActive) return;
        for (let i = 1; i <= 48; i++) {
          await leggiStatoZona(i);
          await new Promise(resolve => setTimeout(resolve, 100));
      
          if (Volume !== undefined) { // Check if Volume has a value
            console.log(`Volume Zona ${i}`, Volume);
            console.log(`Nome Zona ${i}`, zoneNames[i - 1]);
            volumes[i - 1] = Volume ?? 999;
            console.log('OK');
          } else {
            console.log('NO OK');
            volumes[i - 1] = 999;
          }
        }
        setZoneVolumes(volumes); // Update state only once after the loop
      };

      loadZoneStates();
      intervalId = setInterval(loadZoneStates, 5000);
  
      return () => {
        isActive = false;
        clearInterval(intervalId);
        console.log('Zone screen unfocused - interval cleared'); // Add this log
      };
    }, [isLoading, zoneVolumes]),
  ); */

  // Carica i nomi all'avvio
  useEffect(() => {
    loadZoneData();
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
            {/* <TouchableOpacity className="flex-col items-center justify-center" onPress={() => {loadZoneData();}}>
              <Image
                source={icons.repeat}
                tintColor={'#228BE6'}
                className="size-10"
              />
            </TouchableOpacity> */}
            <TouchableOpacity
              className="bg-primary-300 p-3 rounded-xl"
              onPress={() => {
                Alert.alert(
                  'Modifica numero zone',
                  'Modifica il numero di zone da 1 a 48',
                  [
                    {
                      text: 'Annulla',
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => {
                        Alert.prompt(
                          'Modifica numero zone',
                          'Inserisci il numero di zone (1-48)',
                          [
                            {
                              text: 'Annulla',
                              style: 'cancel',
                            },
                            {
                              text: 'OK',
                              onPress: e => {
                                const num = parseInt(e ?? "", 10); // Converte la stringa in un numero
                                if (!isNaN(num) && num >= 1 && num <= 48) {
                                  sendThreeBytes(4, num, 0); // Invia il numero di zone
                                } else {
                                  Alert.alert(
                                    'Numero non valido',
                                    'Inserisci un numero tra 1 e 48.',
                                  );
                                }
                              },
                            },
                          ],
                        );
                      },
                    },
                  ],
                );
              }}>
              <Text className="text-white font-bold text-md w-20 text-center uppercase">
                Modifica Numero Zone
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

          <View className="w-full flex items-center justify-center"></View>
          {/* Genera dinamicamente i pulsanti per le zone */}
          {zones.slice(0, 6).map(zoneId => (
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
                {/*  <View className="flex flex-col gap-2">
                  <Image
                    source={icons.power}
                    className="size-6"
                    tintColor={
                      zoneBytes5[zoneId - 1] == 35 ||
                      zoneBytes5[zoneId - 1] == 3 ||
                      zoneBytes5[zoneId - 1] == 39 ||
                      zoneBytes5[zoneId - 1] == 7
                        ? '#228BE6'
                        : '#D4D4D8'
                    }
                  />
                  <Image
                    source={icons.mute}
                    className="size-6 ml-1"
                    tintColor={
                      zoneBytes5[zoneId - 1] == 37 ||
                      zoneBytes5[zoneId - 1] == 5 ||
                      zoneBytes5[zoneId - 1] == 39 ||
                      zoneBytes5[zoneId - 1] == 7
                        ? '#228BE6'
                        : '#D4D4D8'
                    }
                  />
                </View> */}
                {/* <View className="flex flex-row">
                  <Slider
                    maximumTrackTintColor="#228BE6"
                    step={2}
                    minimumValue={0}
                    maximumValue={80}
                    value={zoneVolumes[zoneId - 1]}
                    style={{width: 150}}
                    disabled
                  />
                  <Text className="font-bold">
                    {zoneVolumes[zoneId - 1] ?? 0}
                  </Text>
                </View> */}
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
