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

let currentIp = '';

export function getIp() {
  return currentIp;
}

export default function IpPage() {
  type RootStackParamList = {
    ZoneStack: undefined;
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  useEffect(() => {
    retrieveIp();
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
      } else if(fw === 'yes') {
        retrieveData('ip').then(ipData => {
          if (ipData !== null && ipData !== '') {
            handleIpChange(ipData);
            navigation.navigate('ZoneStack');
          }
        });
      }
    });
  }

  const handleIpChange = (text: string) => {
    setIp(text);
    currentIp = text;
    udpEvents.emit('ipChanged', text);
  };

  function isValidIP() {
    console.log('isValideip: ', ip);
    let check = 0;
    if (!ip) {
      console.log('no ip');
      return false;
    } else check++;

    const parts = ip.split('.');

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
        console.log('ip maggiorne  o minrnwe di 0 e 255');
        return false;
      } else check++;
    }
    console.log('check:', check);
    if (check == 10) return true;
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
                      navigation.navigate('ZoneStack');
                      console.log('IP changed to:', ip);
                    },
                  },
                ],
              );
            } else {
              Alert.alert('Ip non valido', 'Controlla l\'ip inserito');
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
