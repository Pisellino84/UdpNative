import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import icons from '../../../constants/icons';
import {udpEvents} from '../../../lib/udpClient';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {retrieveData, saveData} from '../../../lib/db';
import {
  useApply,
  useRefresh,
  useLoading,
  useIp,
} from '../../../lib/useIsLoading';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import prompt from 'react-native-prompt-android';

let currentIp = '';

export function getIp({ip}: {ip?: string} = {}) {
  if (ip && ip?.length > 0) {
    currentIp = ip;
  }
  return currentIp;
}

export default function IpPage() {
  type RootStackParamList = {
    ZoneStack: undefined;
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {setIsUseApplying} = useApply();
  const {setIsUseRefreshing} = useRefresh();
  const {setIsUseLoading} = useLoading();
  const {isUseIp, setIsUseIp} = useIp();
  useEffect(() => {
    retrieveIp();

    return () => {
      setIsUseIp(false);
      setIsUseLoading(false);
      setIsUseRefreshing(false);
    };
  }, []);

  const [ip, setIp] = useState('');

  function retrieveIp() {
    retrieveData('FW').then(fw => {
      if (fw === 'no') {
        retrieveData('ip').then(ipData => {
          if (ipData !== null && ipData !== '') {
            handleIpChange(ipData);
            saveData('FW', 'yes');
          }
        });
      } else if (fw === 'yes') {
        retrieveData('ip').then(ipData => {
          if (ipData !== null && ipData !== '') {
            handleIpChange(ipData);
          }
        });
      }
    });
  }

  const handleIpChange = (text: string) => {
    setIsUseRefreshing(true);
    setIsUseIp(true);
    setIp(text);
    /* if (isValidIP(text)) {
      currentIp = text; // Aggiorna currentIp solo se l'IP è valido
      getIp()
      udpEvents.emit('ipChanged', text);
    } */
  };

  const handleSave = () => {
    if (isValidIP(ip)) {
      currentIp = ip; // Aggiorna currentIp solo se l'IP è valido
      getIp();
      udpEvents.emit('ipChanged', ip);
    }
  };

  function isValidIP(ipToValidate: string = ip) {
    console.log('isValideip: ', ipToValidate);
    let check = 0;
    if (!ipToValidate) {
      console.log('no ip');
      return false;
    } else check++;

    const parts = ipToValidate.split('.');

    if (parts.length !== 4) {
      console.log('no 4 parts');
      return false;
    } else check++;
    for (const part of parts) {
      if (!/^\d+$/.test(part)) {
        console.log('boh');
        return false;
      } else check++;

      const num = parseInt(part, 10);

      if (isNaN(num) || num < 0 || num > 255) {
        console.log('ip maggiore o minore di 0 e 255');
        return false;
      } else check++;
    }
    console.log('check:', check);
    return check === 10;
  }

  function retrieveArray() {
    retrieveData("ipArray").then(array => {
      if (array !== null) {
        try {
          const parsed = JSON.parse(array);
          if (Array.isArray(parsed)) {
            setIpArray(parsed);
          }
        } catch {
          // fallback per vecchi dati non in formato array
          setIpArray([array]);
        }
      }
    });
  }

  const [add, setAdd] = useState(false);
  const [ipArray, setIpArray] = useState<string[]>([]);

  useEffect(() => {
    retrieveArray()
  }, [])

  console.log('ipArray', ipArray);

  return (
    <AndroidSafeArea>
      <View className="flex flex-col   items-center">
        <Text className="text-primary-300 font-extrabold text-4xl">
          Benvenuto in liveMt!
        </Text>
        <Text className="text-black-300 font-semibold text-xl">
          Inizia ad usare l'app:
        </Text>
        <View className="flex flex-col items-center justify-center rounded-full mt-5">
          {add ? <Text></Text> : null}

          {ipArray.map(asd => (
            <View key={asd} className="my-5">
              <View className="flex flex-row gap-2 justify-between w-screen px-5">
                <View className="flex justify-center items-center">
                  <TouchableOpacity className="bg-gray-300 rounded-full p-3">
                    <Image source={icons.edit} className="size-8" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className=" flex flex-row"
                  onPress={() => {
                    saveData('ip', asd);
                    saveData('FW', 'yes');
                    handleIpChange(asd);
                    // Chiamata diretta a handleSave con l'IP selezionato
                    if (isValidIP(asd)) {
                      currentIp = asd;
                      getIp();
                      udpEvents.emit('ipChanged', asd);
                    }
                    navigation.navigate('ZoneStack');
                    console.log('IP changed to:', asd);
                  }}>
                  <View className="p-5 flex border-y border-l rounded-l-full w-52 justify-center items-center">
                    <Text className="font-bold text-black-100">{asd}</Text>
                  </View>
                  <View className="bg-primary-300 border-r border-y border-primary-300 w-20  rounded-r-full flex justify-center items-center">
                    <Image
                      source={icons.backArrow}
                      className="size-8 rotate-180"
                      tintColor={'#FFFF'}
                    />
                  </View>
                </TouchableOpacity>

                <View className="flex justify-center items-center">
                  <TouchableOpacity className="bg-red-200 rounded-full p-3">
                    <Image source={icons.trash} className="size-8" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Aggiungi indirizzo IP',
                "Aggiungi un indirizzo IP da salvare per l'accesso rapido",
                [
                  {
                    text: 'Annulla',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () => {
                      prompt(
                        'Aggiungi indirizzo IP',
                        'Inserisci indirizzo IP',
                        [
                          {
                            text: 'Annulla',
                            style: 'cancel',
                          },
                          {
                            text: 'OK',
                            onPress: e => {
                              if (isValidIP(e)) {
                                const newArray = [...ipArray, e];
                                setIpArray(newArray);
                                saveData('ipArray', JSON.stringify(newArray));
                                console.log('IP array:', newArray);
                              }
                            },
                          },
                        ],
                      );
                    },
                  },
                ],
              );

              console.log([...ipArray]);
            }}>
            <Image source={icons.plus} tintColor={'green'} />
          </TouchableOpacity>

          {/* <TextInput
            placeholder={
              (currentIp === '' ? null : currentIp) ?? 'inserisci indirizzo Ip'
            }
            className="bg-white px-20 rounded-full"
            onChangeText={handleIpChange}
            keyboardType="numeric"
            maxLength={15}
          />
          <TouchableOpacity
            className="bg-primary-300 rounded-full p-3"
            onPress={() => {
              if (isValidIP()) {
                Alert.alert(
                  'Sei Sicuro?',
                  `Sei sicuro di voler usare ${ip} come indirizzo IP?\n(puoi sempre cambiarlo succesivamente)`,
                  [
                    {
                      text: 'Annulla',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'Continua',
                      onPress: () => {
                        saveData('ip', ip);
                        saveData('FW', 'yes');
                        handleSave();
                        navigation.navigate('ZoneStack');
                        console.log('IP changed to:', currentIp);
                      },
                    },
                  ],
                );
              } else {
                Alert.alert('Ip non valido', "Controlla l'ip inserito");
              }
            }}>
            <Image
              source={icons.backArrow}
              className="size-6 rotate-180"
              tintColor={'#FFFF'}
            />
          </TouchableOpacity> */}
        </View>
      </View>
    </AndroidSafeArea>
  );
}
