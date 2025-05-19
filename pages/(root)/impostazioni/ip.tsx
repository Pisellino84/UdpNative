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
import {useRefresh, useLoading, useIp} from '../../../lib/useConst';
import RNAppRestart from '@brandingbrand/react-native-app-restart';

// Variabile globale per l'IP corrente
let currentIp = '';

// Funzione per ottenere o impostare l'IP corrente
export function getIp({ip}: {ip?: string} = {}) {
  if (ip && ip?.length > 0) {
    currentIp = ip;
  }
  return currentIp;
}

// Pagina per l'inserimento e la gestione dell'indirizzo IP
export default function IpPage() {
  // Definizione delle rotte disponibili nello stack
  type RootStackParamList = {
    ZoneStack: undefined;
  };
  // Hook di navigazione
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // Hook per gestire gli stati globali di refresh, loading e ip
  const {setIsUseRefreshing} = useRefresh();
  const {setIsUseLoading} = useLoading();
  const {setIsUseIp} = useIp();

  useEffect(() => {
    retrieveIp();
    setIsUseRefreshing(true);

    return () => {
      setIsUseLoading(false);
    };
  }, []);

  const [ip, setIp] = useState('');
  const [firstView, setFirstView] = useState(true);

  // Recupera l'IP salvato e aggiorna lo stato
  function retrieveIp() {
    retrieveData('ip').then(ipData => {
      if (ipData == null || ipData == '') {
        setFirstView(true);
      } else {
        setFirstView(false);
        setIp(ipData);
      }
    });
  }

  // Aggiorna lo stato locale e globale quando cambia l'IP
  const handleIpChange = (text: string) => {
    setIsUseRefreshing(true);
    setIp(text);
  };

  // Salva l'IP se valido e aggiorna lo stato globale
  const handleSave = () => {
    if (isValidIP(ip)) {
      currentIp = ip; // Aggiorna currentIp solo se l'IP è valido
      getIp();
      udpEvents.emit('ipChanged', ip);
    }
  };

  // Funzione di validazione dell'indirizzo IP
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

  return (
    <View className="flex-1 flex-col bg-white justify-center items-center">
      <Text className="text-primary-300 font-extrabold text-4xl">
        Benvenuto in liveMt!
      </Text>
      <Text className="text-black-300 font-semibold text-xl">
        Inizia ad usare l'app:
      </Text>
      <View className="flex flex-row items-center justify-center border rounded-full mt-5">
        <TextInput
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
                `Sei sicuro di voler usare ${ip} come indirizzo IP?\n${
                  firstView
                    ? '(Puoi sempre cambiarlo successivamente)'
                    : "(L'Applicazione si riavvierà automaticamente)"
                }`,
                [
                  {
                    text: 'Annulla',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Continua',
                    onPress: () => {
                      if (!firstView) {
                        saveData('ip', ip);
                        saveData('FW', 'yes');
                        handleSave();
                        console.log('IP changed to:', currentIp);
                        RNAppRestart.restartApplication();
                      } else {
                        saveData('ip', ip);
                        saveData('FW', 'yes');
                        handleSave();
                        console.log('IP changed to:', currentIp);
                        navigation.navigate('ZoneStack');
                      }
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
        </TouchableOpacity>
      </View>
    </View>
  );
}
