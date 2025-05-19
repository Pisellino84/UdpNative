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
import {useRefresh, useLoading, useIp} from '../../../lib/useIsLoading';

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
  const {setIsUseRefreshing} = useRefresh();
  const {setIsUseLoading} = useLoading();
  const {setIsUseIp} = useIp();
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
        </TouchableOpacity>
      </View>
    </View>
  );
}
