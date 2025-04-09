import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
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

import {useNavigation, NavigationProp, useFocusEffect} from '@react-navigation/native';
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
        
        const volumes: number[] = [...zoneVolumes];
        volumes.fill(0)
        if (isLoading || !isActive) return;
        
        for(let i = 1; i <= 48; i++) {
            
            await leggiStatoZona(i);
            volumes[i - 1] = Volume ?? 99; 
            // assumendo che leggiStatoZona sia una funzione asincrona
             setZoneVolumes([volumes[i - 1]]); // Aggiorna lo stato 
            
            console.log(`Volume: ${i}`, volumes[i - 1]);
       
        }
      };
  
      // Esegui immediatamente e poi ogni secondo
      loadZoneStates();
      intervalId = setInterval(loadZoneStates, 1000);
  
      return () => {
        isActive = false; // Pulizia quando l'effetto viene smontato
        clearInterval(intervalId); // Pulisci l'intervallo
      };
    }, [isLoading, zoneVolumes]) // Aggiungi zoneVolumes alle dipendenze se necessario
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
