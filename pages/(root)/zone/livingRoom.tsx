import {View, Text, TouchableOpacity, Image, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

import Slider from '@react-native-community/slider'; // https://github.com/callstack/react-native-slider
import {Dropdown} from 'react-native-element-dropdown'; // https://github.com/hoaphantn7604/react-native-element-dropdown

import AndroidSafeArea from '../../../components/AndroidSafeArea';
import icons from '../../../constants/icons';
import {SecondaryHeader} from '../../../components/Header';
import {
  leggiStatoZona,
  sendThreeBytes,
  udpEvents,
  Power,
  Mute,
  Night,
  Volume,
  Source,
} from '../../../lib/udpClient';
import {retrieveData, saveData} from '../../../lib/db';
import { useRoute, RouteProp } from '@react-navigation/native';

export default function LivingRoom() {
  // Define RootStackParamList if not already defined elsewhere
  type RootStackParamList = {
    LivingRoom: { zoneId: number };
  };
  
  const route = useRoute<RouteProp<RootStackParamList, 'LivingRoom'>>();
  const { zoneId } = route.params; // Recupera il parametro zoneId

  React.useEffect(() => {
    // Usa il parametro zoneId per chiamare leggiStatoZona
    leggiStatoZona(zoneId);
  }, [zoneId]);
  
  const Sources = [
    {label: 'Tuner', value: 16},
    {label: 'CD', value: 17},
    {label: 'DVD', value: 18},
    {label: 'SAT', value: 19},
    {label: 'PC', value: 20},
    {label: 'Multi CD', value: 21},
    {label: 'Multi DVD', value: 22},
    {label: 'TV', value: 23},
  ];

  const [power, setPower] = useState(Power);
  const [mute, setMute] = useState(Mute);
  const [night, setNight] = useState(Night);
  const [volume, setVolume] = useState(Volume);
  const [source, setSource] = useState(Source);

  useEffect(() => {
    // Funzione da eseguire ogni secondo
    /* const interval = setInterval(() => {
      leggiStatoZona(1); // Esegui la funzione desiderata
    }, 500); // Intervallo di 1 secondo (500 ms) */

    // Leggi lo stato della zona all'inizio
    leggiStatoZona(zoneId);

    // Ascolta i cambiamenti di Power
    const handlePowerChange = () => {
      if (Power == 35 || Power == 39) {
        setPower(1);
      } else {
        setPower(0);
      }
      if (Power === 35 || Power === 39) {
        setPower(1);
      } else if (Power === 33 || Power === 37) {
        setPower(0);
      }
    };

    const handleMuteChange = (newMute: number) => {
      if (Mute == 35 || Mute == 39) {
        setMute(1);
      } else {
        setMute(0);
      }
      if (newMute === 37 || newMute === 39) {
        setMute(1);
      } else if (newMute === 35 || newMute === 33) {
        setMute(0);
      }
    };

    const handleVolumeChange = (newVolume: number) => {
      retrieveData(`volume ${zoneId}`).then(savedVolume => {
        if (savedVolume !== null) {
          setVolume(Number(savedVolume));
        }
      });
      setVolume(newVolume);
    };

    const handleSourceChange = (newSource: number) => {
      setSource(newSource);
    };

    udpEvents.on('PowerChanged', handlePowerChange);
    udpEvents.on('MuteChanged', handleMuteChange);
    udpEvents.on('VolumeChanged', handleVolumeChange);

    udpEvents.on('SourceChanged', handleSourceChange);

    // Cleanup: rimuovi il listener quando il componente viene smontato
    return () => {
      udpEvents.off('PowerChanged', handlePowerChange);
      udpEvents.off('MuteChanged', handleMuteChange);
      udpEvents.off('VolumeChanged', handleVolumeChange);

      udpEvents.off('SourceChanged', handleSourceChange);
      /* clearInterval(interval); */
    };
  }, []);

  return (
    <AndroidSafeArea>
      <View className="px-5">
        <SecondaryHeader title={'Living Room'} />
        <View className="flex flex-row my-5 gap-5 justify-between border-b pb-5 border-black-50">
          <TouchableOpacity
            onPress={() => {
              if (power == 0) {
                setPower(1);
                sendThreeBytes(4, zoneId, 1);
              } else {
                setPower(0);
                sendThreeBytes(4, zoneId, 0);
              }
            }}
            className={`flex flex-row items-center gap-2 `}>
            <Image
              source={icons.power}
              className="size-11"
              tintColor={power ? '#228BE6' : '#D4D4D8'}
            />
            <Text
              className={
                power
                  ? 'text-primary-300 font-base'
                  : 'text-black-50 font-light'
              }>
              Power
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (power) {
                if (mute === 0) {
                  setMute(1);
                  sendThreeBytes(22, zoneId, 1);
                } else {
                  setMute(0);
                  sendThreeBytes(15, zoneId, Number(volume));
                  sendThreeBytes(22, zoneId, 0);
                }
              } else
                Alert.alert(
                  'La zona è spenta',
                  'Accendi la zona per attivare la funzione Mute',
                );
            }}
            className={`flex flex-row items-center gap-2 `}>
            <Image
              source={icons.mute}
              className="size-11"
              tintColor={mute ? '#228BE6' : '#D4D4D8'}
            />
            <Text
              className={
                mute ? 'text-primary-300 font' : 'text-black-50 font-light'
              }>
              Mute
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (power) {
                if (night == 0) {
                  setNight(1);
                  sendThreeBytes(24, zoneId, 1);
                } else {
                  setNight(0);
                  sendThreeBytes(24, zoneId, 0);
                }
              } else
                Alert.alert(
                  'La zona è spenta',
                  'Accendi la zona per attivare la funzione Night',
                );
            }}
            className={`flex flex-row items-center gap-2 `}>
            <Image
              source={icons.night}
              className="size-11"
              tintColor={night ? '#228BE6' : '#D4D4D8'}
            />
            <Text
              className={
                night ? 'text-primary-300 font' : 'text-black-50 font-light'
              }>
              Night
            </Text>
          </TouchableOpacity>
        </View>
        <View className="my-2.5">
          <Text className="text-black-300 text-lg font-medium mb-1">
            Volume:{' '}
            <Text className="text-2xl font-extrabold text-primary-300">
              {volume}
            </Text>
          </Text>
          <Slider
            minimumTrackTintColor="#228BE6"
            maximumTrackTintColor="#FFFFFF"
            step={2}
            minimumValue={0}
            maximumValue={80}
            value={volume ?? 0}
            disabled={!!mute}
            onValueChange={e => {
              if (!mute) {
                // Cambia il volume solo se mute non è attivo
                setVolume(e);
                if (volume !== null && volume > 0) {
                  saveData(`volume ${zoneId}`, e.toString());
                }
                sendThreeBytes(15, zoneId, e);
              } else if (volume == 0 && mute == 1) {
                retrieveData(`volume ${zoneId}`).then(savedVolume => {
                  if (savedVolume !== null) {
                    setVolume(Number(savedVolume));
                  }
                });
              }
            }}
          />
        </View>
        <View className="my-2.5">
          <Text className="text-black-300 text-lg font-medium">Source:</Text>
          {power === 0 && (
            <Text className="text-red-500 text-md font-medium -mt-1">
              Per modificare la sorgente accendi la zona
            </Text>
          )}
          <Dropdown
            data={Sources}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select source"
            disable={!power}
            value={source}
            onChange={item => {
              setSource(item.value);
              // Calcola il parametro da inviare basandoti sul valore
              const param = item.value - 16; // I valori vanno da 16 a 23, quindi sottrai 16
              if (param >= 0 && param <= 7) {
                sendThreeBytes(19, zoneId, param);
              }
            }}
            style={{
              padding: 20,
              backgroundColor: 'white',
              borderRadius: '4%',
            }}
            containerStyle={{borderRadius: '4%'}}
          />
        </View>
      </View>
    </AndroidSafeArea>
  );
}
