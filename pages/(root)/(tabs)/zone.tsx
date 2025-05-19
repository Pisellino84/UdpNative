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
import React from 'react';
import {
  useLoading,
  useRefresh,
  useApply,
  useIp,
} from '../../../lib/useIsLoading';

export const udpEvents = new EventEmitter();

const Zone = () => {
  // Definizione dei parametri di navigazione per la pagina delle zone
  type RootStackParamList = {
    PaginaZona: {zoneId: number};
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  let ip = getIp();

  // Array di zone da 1 a 49 (in realtà si usano solo 48)
  const zones = Array.from({length: 49}, (_, i) => i + 1);

  // Stati per nomi, volumi, byte5 e id delle zone
  const [zoneNames, setZoneNames] = useState<string[]>(Array(48).fill(''));
  const [zoneVolumes, setZoneVolumes] = useState<number[]>(Array(48).fill(0));
  const [zoneBytes5, setZoneBytes5] = useState<number[]>(Array(48).fill(0));

  // Stati per refresh dei valori delle zone
  const [refreshBytes5] = useState<number[]>(Array(48).fill(0));
  const [refreshVolumes] = useState<number[]>(Array(48).fill(0));

  // Stato per gli id delle zone e il numero di zone attive
  const [zoneIds, setZoneIds] = useState<number[]>(Array(48).fill(0));
  const [numZone, setNumZone] = useState(6);

  // Hook personalizzati per gestire loading, refreshing, applying e ip
  const {isUseLoading, setIsUseLoading} = useLoading();
  const {isUseRefreshing, setIsUseRefreshing} = useRefresh();
  const {isUseApplying} = useApply();
  const {isUseIp, setIsUseIp} = useIp();
  const [isLoading, setIsLoading] = useState(true);
  const [perc, setPerc] = useState(0);
  const [showNoConnection, setShowNoConnection] = useState(false);

  // Ref per gestire valori persistenti tra render
  const lastNome = useRef<string | null>(null);
  const isUseRefreshingRef = useRef(isUseRefreshing);
  const isUseIpRef = useRef(isUseIp);
  const refreshInProgress = useRef(false);

  // Aggiorna il valore corrente di isUseIpRef quando cambia isUseIp
  useEffect(() => {
    isUseIpRef.current = isUseIp;
  }, [isUseIp]);

  // Carica i dati delle zone dalla rete
  const loadZoneData = async () => {
    try {
      if (isUseApplying) {
        Alert.alert(
          'Attenzione',
          "L'applicazione dello scenario è in corso, attendere il termine del processo",
        );
        return;
      }
      setIsUseLoading(true);
      setIsUseIp(false);
      setIsLoading(true);
      setPerc(0);

      // Copia degli stati correnti per modificarli localmente
      const ids: number[] = [...zoneIds];
      const names: string[] = [...zoneNames];
      const volumes: number[] = [...zoneVolumes];
      const bytes5: number[] = [...zoneBytes5];
      names.fill('');

      // Ciclo su tutte le zone
      for (const zoneId of zones) {
        let rispostaRicevuta = false;

        // Prova a leggere lo stato della zona finché non riceve risposta o supera i tentativi
        while (
          !rispostaRicevuta &&
          zoneId !== 49 &&
          !isUseIpRef.current &&
          ip.length >= 7
        ) {
          try {
            // Se Nome è "mem_free" e la zona è < 48, invia comando di reset
            if (Nome === 'mem_free' && zoneId < 48) {
              sendThreeBytes(61, zoneId, 0);
            }

            ip = getIp();
            await leggiStatoZona(zoneId);
            await new Promise(resolve => setTimeout(resolve, 50));
            sendThreeBytes(61, zoneId, 0);

            // Se riceve dati validi e diversi dal precedente, aggiorna gli array locali
            if (
              Nome &&
              Nome !== lastNome.current &&
              typeof Volume === 'number' &&
              typeof Byte5 === 'number'
            ) {
              names[zoneId - 1] = Nome;
              ids[zoneId - 1] = zoneId;
              bytes5[zoneId - 1] = Byte5;
              volumes[zoneId - 1] = Volume;

              // Aggiorna gli stati React
              setZoneIds([...ids]);
              setZoneNames([...names]);
              setZoneVolumes([...volumes]);
              setZoneBytes5([...bytes5]);
              setPerc(prevPerc => prevPerc + 1);
              lastNome.current = Nome;
              rispostaRicevuta = true;
            }
          } catch (err) {
            // Logga eventuali errori di rete o parsing
            console.log(`Errore durante il caricamento della zona ${zoneId}:`);
          }
        }

        // Quando arriva all'ultima zona, termina il loading
        if (zoneId === 48) {
          setIsLoading(false);
          setIsUseLoading(false);
          setIsUseRefreshing(false);
        }
      }
    } catch (err) {
      setIsLoading(false);
      setIsUseLoading(false);
      setIsUseRefreshing(false);
      console.error('Errore in loadZoneData:', err);
      Alert.alert('Errore', 'Errore durante il caricamento delle zone.');
    }
  };

  // Aggiorna periodicamente i valori di Volume e Byte5 delle zone
  const refreshZoneData = async () => {
    if (refreshInProgress.current) {
      return; // Evita esecuzioni concorrenti
    }
    refreshInProgress.current = true;
    console.log('Aggiornamento dei valori di Volume e Byte5 per ogni zona...');

    // Copia degli stati correnti per modificarli localmente
    const updatedVolumes: number[] = [...refreshVolumes];
    const updatedBytes5: number[] = [...refreshBytes5];

    try {
      for (let zone = 1; zone <= numZone; zone++) {
        console.log('refreshZoneData ciclo', {
          zone,
          isUseRefreshing: isUseRefreshingRef.current,
        });
        if (isUseRefreshingRef.current) {
          // Se viene richiesto il refresh, interrompe la funzione
          console.log(
            'Interruzione di refreshZoneData: isUseRefreshingRef.current è true',
          );
          refreshInProgress.current = false;
          return;
        }

        let rispostaRicevuta = false;
        await new Promise(resolve => setTimeout(resolve, 50));
        // Prova a leggere lo stato della zona finché non riceve risposta o supera i tentativi
        while (
          !rispostaRicevuta &&
          !isUseRefreshingRef.current &&
          ip.length >= 7
        ) {
          try {
            ip = getIp();
            await leggiStatoZona(zone);
            await new Promise(resolve => setTimeout(resolve, 50));

            // Se riceve dati validi e diversi dal precedente, aggiorna gli array locali
            if (
              typeof Volume === 'number' &&
              typeof Byte5 === 'number' &&
              (Volume !== updatedVolumes[zone - 1] ||
                Byte5 !== updatedBytes5[zone - 1])
            ) {
              updatedVolumes[zone - 1] = Volume;
              updatedBytes5[zone - 1] = Byte5;
              console.log(
                `Zona ${zone}: Volume aggiornato a ${Volume}, Byte5 aggiornato a ${Byte5}`,
              );
              rispostaRicevuta = true;
              setShowNoConnection(false);
            }
          } catch (err) {
            // Se c'è un errore di rete, mostra il messaggio di connessione assente
            console.log(`Errore durante il refresh della zona ${zone}:`, err);
            setShowNoConnection(true);
          }
        }
      }

      // Aggiorna gli stati React con i nuovi valori
      setZoneVolumes(updatedVolumes);
      setZoneBytes5(updatedBytes5);
    } catch (err) {
      console.error('Errore in refreshZoneData:', err);
    } finally {
      refreshInProgress.current = false;
    }
  };

  // Recupera il numero di zone salvato nel database locale
  function retrieveNumZone() {
    try {
      retrieveData(`numZone`)
        .then(numString => {
          if (numString !== null) {
            const numZone = parseInt(numString, 10);
            if (!isNaN(numZone)) {
              setNumZone(numZone);
              console.log('dato caricato', numString);
            } else {
              console.error('Il numZone recuperato non è un numero valido.');
            }
          }
        })
        .catch(err => {
          console.error('Errore nel recupero di numZone:', err);
        });
    } catch (err) {
      console.error('Errore in retrieveNumZone:', err);
    }
  }

  // Permette all'utente di modificare il numero di zone tramite prompt
  function modificaNumZone() {
    setIsUseRefreshing(true);
    try {
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
                      // Valida il numero inserito e aggiorna lo stato
                      const num = parseInt(e ?? '', 10);
                      if (!isNaN(num) && num >= 1 && num <= 48) {
                        setNumZone(num);
                        // Salva il nuovo numero di zone e aggiorna i dati
                        saveData('numZone', num.toString()).catch(err => {
                          console.error(
                            'Errore nel salvataggio di numZone:',
                            err,
                          );
                        });
                        loadZoneData().then(() => {
                          setIsUseRefreshing(false);
                        });
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
    } catch (err) {
      setIsUseRefreshing(false);
      console.error('Errore in modificaNumZone:', err);
      Alert.alert('Errore', 'Errore durante la modifica del numero di zone.');
    }
  }

  // Ogni volta che cambia isUseIp, lo resetta a false
  useEffect(() => {
    setIsUseIp(false);
  });

  // All'avvio, carica i dati delle zone e il numero di zone dal database
  useEffect(() => {
    setIsUseRefreshing(true);
    new Promise(resolve => setTimeout(resolve, 500));
    loadZoneData();
    retrieveNumZone();
  }, []);

  // Gestisce il refresh periodico dei dati delle zone
  useEffect(() => {
    isUseRefreshingRef.current = isUseRefreshing;
    const executeRefresh = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      while (!isUseRefreshingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 25));
        // Avvia refreshZoneData solo se non è già in corso
        if (!refreshInProgress.current) {
          await refreshZoneData();
        }
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    };

    // Avvia il refresh automatico quando non ci sono operazioni in corso
    if (!isUseRefreshing && !isUseLoading && !isUseApplying) {
      executeRefresh();
    }
  }, [isUseRefreshing, isUseLoading, isUseApplying]);

  // Se è in caricamento, mostra spinner e barra di progresso
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

  // Render principale della pagina delle zone
  return (
    <AndroidSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MainHeader title="Zone" icon={icons.zone} />
        <View className="my-5 flex flex-col">
          {/* Mostra un messaggio se manca la connessione */}
          {showNoConnection ? (
            <Text className="text-center mb-5 text-red-400">
              Controlla la Connesione
            </Text>
          ) : null}
          <View className="flex flex-row items-center mb-5">
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
          {/* Lista delle zone */}
          {zones.slice(0, numZone).map(zona => (
            <TouchableOpacity
              key={zona}
              className="flex flex-row border-b p-5 border-black-50 justify-between items-center"
              onPress={() => {
                if (!isUseApplying) {
                  setIsUseRefreshing(true);
                  new Promise(resolve => setTimeout(resolve, 50));
                  navigation.navigate('PaginaZona', {
                    zoneId: zoneIds[zona - 1],
                  });
                } else {
                  Alert.alert(
                    'Errore',
                    'Applicazione dello scenario in corso, attendere',
                  );
                }
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
                  {/* Icona accensione */}
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
                  {/* Icona mute */}
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
                {/* Slider volume */}
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
      </ScrollView>
    </AndroidSafeArea>
  );
};

export default Zone;
