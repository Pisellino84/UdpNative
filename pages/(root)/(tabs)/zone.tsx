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
  clearUdp,
} from '../../../lib/udpClient'; // Importa Nome

import '../../../global.css';
import prompt from 'react-native-prompt-android';

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
import {retrieveData, saveData} from '../../../lib/db';
import {getIp} from '../../../pages/firstView';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
export const udpEvents = new EventEmitter();
const Zone = () => {
  type RootStackParamList = {
    PaginaZona: {zoneId: number};
    FirstView: undefined;
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  let ip = getIp();

  // Array di 48 zone
  const zones = Array.from({length: 49}, (_, i) => i + 1);

  // Stato per memorizzare i nomi delle zone
  const [zoneNames, setZoneNames] = useState<string[]>(Array(48).fill(''));
  const [zoneVolumes, setZoneVolumes] = useState<number[]>(Array(48).fill(0));
  const [zoneBytes5, setZoneBytes5] = useState<number[]>(Array(48).fill(0));
  const [numZone, setNumZone] = useState(6); // Stato per il numero di zone

  const [isLoading, setIsLoading] = useState(true);
  const [perc, setPerc] = useState(0);

  // useRef per memorizzare l'ultimo valore di Nome
  const lastNome = useRef<string | null>(null);

  // Funzione per caricare i nomi uno alla volta
  const loadZoneData = async () => {

    setIsLoading(true); // Resetta i nomi delle zone
    setPerc(0);

    const names: string[] = [...zoneNames]; // Copia dello stato attuale
    const volumes: number[] = [...zoneVolumes];
    const bytes5: number[] = [...zoneBytes5];
    names.fill("")
    for (const zoneId of zones) {
      let nomeChanged = false; // Flag per controllare se Nome è cambiato
      let volumeChanged = false;
      let Byte5Changed = false;
      while (
        !nomeChanged &&
        !volumeChanged &&
        zoneId !== 49 &&
        ip.length >= 7
      ) {
        ip = getIp();
        // Invia i tre byte richiesti
        leggiStatoZona(zoneId);
        await new Promise(resolve => setTimeout(resolve, 10)); // Ritardo per evitare di saltare zone in ms
        sendThreeBytes(61, zoneId, 0);
        console.log("NOME DELLA ZONA: ", Nome, zoneId); // Log del nome

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

  function retrieveNumZone() {
    retrieveData(`numZone`).then(numString => {
      if (numString !== null) {
        const numZone = parseInt(numString, 10);
        if (!isNaN(numZone)) {
          if (numZone <= 9) setNumZone(numZone);
          else if(numZone == 48) setNumZone(numZone)
          else setNumZone(numZone + 1);
          console.log('dato caricato', numString);
        } else {
          console.error('Il numZone recuperato non è un numero valido.');
        }
      }
    });
  }

  function modificaNumZone() {
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
            prompt(
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
                    const num = parseInt(e ?? '', 10);
                    if (!isNaN(num) && num >= 1 && num <= 48) {
                      if (num <= 9) setNumZone(num);
                      else if(num == 48) setNumZone(num - 1)
                      else setNumZone(num + 1);
                      saveData('numZone', num.toString());
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
  }
  // Carica i nomi all'avvio
  useEffect(() => {
    new Promise(resolve => setTimeout(resolve, 10))
    loadZoneData();
    retrieveNumZone();
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
          <View className="w-full flex flex-row justify-between items-center mb-5">
            <TouchableOpacity
              className="bg-primary-300 p-3 rounded-xl"
              onPress={() => {
                modificaNumZone();
              }}>
              <Text className="text-white font-bold text-md text-center uppercase">
                Visualizza Zone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary-300 p-3 rounded-xl justify-end"
              onPress={() => {
                loadZoneData();
              }}>
              <Text className="text-white font-bold text-md text-center uppercase">
                Aggiorna Stato
              </Text>
            </TouchableOpacity>
          </View>
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
          {zones.slice(0, numZone).map(zoneId => (
            <TouchableOpacity
              key={zoneId}
              className="flex flex-row border-b p-5 border-black-50 justify-between items-center"
              onPress={() => {
                navigation.navigate('PaginaZona', {zoneId}); // Passa l'ID della zona
              }}>
              <View className="flex flex-row items-center gap-2">
                <View>
                  <Text className="text-xl font-medium">
                    {zoneNames[zoneId - 1]} {/* Mostra solo il nome caricato */}
                  </Text>
                  <Text className="text-md font-light">
                    Id zona: {zoneId} {/* Mostra solo il nome caricato */}
                  </Text>
                </View>
                <View className="flex flex-col gap-2">
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
                </View>
                <View className="flex flex-row">
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
