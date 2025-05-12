import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
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
} from '../../../lib/udpClient';

import '../../../global.css';
import prompt from 'react-native-prompt-android';

import {MainHeader} from '../../../components/Header';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import ProgressBar from '../../../components/ProgressBar';

import icons from '../../../constants/icons';

import {useNavigation, NavigationProp} from '@react-navigation/native';
import {useEffect, useState, useRef} from 'react';
import Slider from '@react-native-community/slider';
import {retrieveData, saveData} from '../../../lib/db';
import {getIp} from '../impostazioni/ip';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import React, {createContext, useContext} from 'react';
import {useLoading, useRefresh} from '../../../lib/useIsLoading';

export const udpEvents = new EventEmitter();

const Zone = () => {
  type RootStackParamList = {
    PaginaZona: {zoneId: number};
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  let ip = getIp();

  const zones = Array.from({length: 49}, (_, i) => i + 1);

  const [zoneNames, setZoneNames] = useState<string[]>(Array(48).fill(''));
  const [zoneVolumes, setZoneVolumes] = useState<number[]>(Array(48).fill(0));
  const [zoneBytes5, setZoneBytes5] = useState<number[]>(Array(48).fill(0));
  const [zoneIds, setZoneIds] = useState<number[]>(Array(48).fill(0));
  const [numZone, setNumZone] = useState(6);

  const {isUseLoading, setIsUseLoading} = useLoading();
  const {isUseRefreshing, setIsUseRefreshing} = useRefresh();
  const [isLoading, setIsLoading] = useState(true);
  const [perc, setPerc] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const lastNome = useRef<string | null>(null);
  const isUseRefreshingRef = useRef(isUseRefreshing);

  const loadZoneData = async () => {
    if (isUseLoading) {
      Alert.alert(
        'Attenzione',
        "L'applicazione dello scenario è in corso, attendere il termine del processo",
      );
      return;
    }
    setIsUseLoading(true);
    setIsUseRefreshing(true);
    setIsLoading(true);
    setPerc(0);

    const ids: number[] = [...zoneIds];
    const names: string[] = [...zoneNames];
    const volumes: number[] = [...zoneVolumes];
    const bytes5: number[] = [...zoneBytes5];
    names.fill('');
    for (const zoneId of zones) {
      let nomeChanged = false;
      let volumeChanged = false;
      let Byte5Changed = false;
      while (
        !nomeChanged &&
        !volumeChanged &&
        zoneId !== 49 &&
        ip.length >= 7
      ) {
        if (Nome === 'mem_free' && zoneId < 48) {
          sendThreeBytes(61, zoneId, 0);
        }
        ip = getIp();
        leggiStatoZona(zoneId);
        await new Promise(resolve => setTimeout(resolve, 25));
        sendThreeBytes(61, zoneId, 0);
        console.log('NOME DELLA ZONA: ', Nome, zoneId);

        if (Nome && Nome !== lastNome.current) {
          names[zoneId - 1] = Nome;
          ids[zoneId - 1] = zoneId;
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

          setZoneIds([...ids]);
          setZoneNames([...names]);
          setZoneVolumes([...volumes]);
          setZoneBytes5([...bytes5]);
          setPerc(prevPerc => prevPerc + 1);
          lastNome.current = Nome;
          nomeChanged = true;
          volumeChanged = true;
          Byte5Changed = true;
        }
      }

      if (zoneId === 48) {
        setIsLoading(false);
        setIsUseRefreshing(false);
        setIsUseLoading(false);
      }
    }
  };

  const refreshZoneData = async () => {
    console.log('refreshZoneData');
    const volumes: number[] = [...zoneVolumes];
    const bytes5: number[] = [...zoneBytes5];
    for (const zoneId of zones) {
      let changed = false;
      while (
        !isUseRefreshingRef.current &&
        !changed &&
        zoneId <= numZone &&
        ip.length >= 7
      ) {
        console.log('ZONA: ', zoneId);
        ip = getIp();
        await new Promise(resolve => setTimeout(resolve, 50));
        leggiStatoZona(zoneId);
        await new Promise(resolve => setTimeout(resolve, 50));

        if (Byte5) {
          bytes5[zoneId - 1] = Byte5;
          setZoneBytes5([...bytes5]);
          console.log('byte5', Byte5);
        }

        if (Volume) {
          volumes[zoneId - 1] = Volume;
          setZoneVolumes([...volumes]);
        }

        changed = true;
      }
    }
  };

  function retrieveNumZone() {
    retrieveData(`numZone`).then(numString => {
      if (numString !== null) {
        const numZone = parseInt(numString, 10);
        if (!isNaN(numZone)) {
          setNumZone(numZone);
          console.log('dato caricato', numString);
        } else {
          console.error('Il numZone recuperato non è un numero valido.');
        }
      }
    });
  }

  function modificaNumZone() {
    setIsUseRefreshing(true),
      Alert.alert(
        'Modifica numero zone',
        'Modifica il numero di zone da 1 a 48',
        [
          {
            text: 'Annulla',
            style: 'cancel',
            onPress: () => {
              setIsUseRefreshing(false);
            },
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
                    onPress: () => {
                      setIsUseRefreshing(false);
                    },
                  },
                  {
                    text: 'OK',
                    onPress: e => {
                      setIsUseRefreshing(false);
                      const num = parseInt(e ?? '', 10);
                      if (!isNaN(num) && num >= 1 && num <= 48) {
                        if (num <= 9) setNumZone(num);
                        else if (num == 48) setNumZone(num);
                        else setNumZone(num);
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

  useEffect(() => {
    new Promise(resolve => setTimeout(resolve, 500));
    loadZoneData();
    retrieveNumZone();
  }, []);

  useEffect(() => {
    isUseRefreshingRef.current = isUseRefreshing;
    const executeRefresh = async () => {
      while (!isUseRefreshingRef.current) {
        console.log('Esecuzione ripetitiva');
        await new Promise(resolve => setTimeout(resolve, 200));
        await refreshZoneData(); // Aspetta che la funzione termini
        await new Promise(resolve => setTimeout(resolve, 200)); // Attendi prima di ripetere
      }
    };

    if (!isUseRefreshing && !isUseLoading) {
      executeRefresh();
    }
  }, [isUseRefreshing]);

  if (isLoading) {
    return (
      <AndroidSafeArea>
        <View className="flex h-screen justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-lg mt-4 ">Recupero Dati in corso...</Text>
          <ProgressBar progress={perc} />
        </View>
      </AndroidSafeArea>
    );
  }

  return (
    <AndroidSafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadZoneData} />
        }>
        <MainHeader title="Zone" icon={icons.zone} />
        <View className="flex flex-col items-center justify-center mt-2">
          <Image source={icons.backArrow} className="-rotate-90 size-6" />
          <Text className="text-black-200 font-extrabold text-sm">
            trascina verso il basso per aggiornare
          </Text>
        </View>
        <View className="my-5 flex flex-col">
          <View className="flex flex-row justify-between items-center gap-1">
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

          {zones.slice(0, numZone).map(zona => (
            <TouchableOpacity
              key={zona}
              className="flex flex-row border-b p-5 border-black-50 justify-between items-center"
              onPress={() => {
                setIsUseRefreshing(true);
                new Promise(resolve => setTimeout(resolve, 50));
                navigation.navigate('PaginaZona', {zoneId: zoneIds[zona - 1]});
              }}>
              <View className="flex flex-row items-center gap-2">
                <View>
                  <Text className="text-xl font-medium">
                    {zoneNames[zona - 1]}
                  </Text>
                  <Text className="text-md font-light">
                    Id zona: {zoneIds[zona - 1]}
                  </Text>
                </View>
                <View className="flex flex-col gap-2">
                  <Image
                    source={icons.power}
                    className="size-6"
                    tintColor={
                      zoneBytes5[zona - 1] == 35 ||
                      zoneBytes5[zona - 1] == 3 ||
                      zoneBytes5[zona - 1] == 39 ||
                      zoneBytes5[zona - 1] == 7
                        ? '#228BE6'
                        : '#D4D4D8'
                    }
                  />
                  <Image
                    source={icons.mute}
                    className="size-6 ml-1"
                    tintColor={
                      zoneBytes5[zona - 1] == 37 ||
                      zoneBytes5[zona - 1] == 5 ||
                      zoneBytes5[zona - 1] == 39 ||
                      zoneBytes5[zona - 1] == 7
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
                    value={zoneVolumes[zona - 1]}
                    style={{width: 150}}
                    disabled
                  />
                  <Text className="font-bold">
                    {zoneVolumes[zona - 1] ?? 0}
                  </Text>
                </View>
              </View>

              <Image source={icons.rightArrow} className="size-6" />
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex flex-row items-center mb-10">
          <TouchableOpacity
            className="bg-primary-300 p-3 rounded-xl w-full"
            onPress={() => {
              modificaNumZone();
            }}>
            <Text className="text-white font-bold text-md text-center uppercase">
              Numero Zone
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AndroidSafeArea>
  );
};

export default Zone;
