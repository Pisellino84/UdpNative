import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import Slider from '@react-native-community/slider'; // https://github.com/callstack/react-native-slider
import {Dropdown} from 'react-native-element-dropdown'; // https://github.com/hoaphantn7604/react-native-element-dropdown

import AndroidSafeArea from '../../../components/AndroidSafeArea';
import icons from '../../../constants/icons';
import {SecondaryHeader} from '../../../components/Header';
import {
  leggiStatoZona,
  sendThreeBytes,
  udpEvents,
  Byte5,
  Byte6,
  Volume,
  Nome,
} from '../../../lib/udpClient';
import {retrieveData, saveData} from '../../../lib/db';
import {useRoute, RouteProp} from '@react-navigation/native';
import {useZonaMonitor} from '../../../lib/useZonaMonitor';
import {useRefresh} from '../../../lib/useIsLoading';

export default function PaginaZona() {
  const {setIsUseRefreshing} = useRefresh();
  const [isLoading, setIsLoading] = useState(false);

  type RootStackParamList = {
    PaginaZona: {zoneId: number};
  };

  const route = useRoute<RouteProp<RootStackParamList, 'PaginaZona'>>();
  const {zoneId} = route.params;

  React.useEffect(() => {
    return () => {
      setIsUseRefreshing(false);
    };
  }, [zoneId]);

  const Sources = [
    {label: 'Tuner', value: 0},
    {label: 'CD', value: 1},
    {label: 'DVD', value: 2},
    {label: 'SAT', value: 3},
    {label: 'PC', value: 4},
    {label: 'Multi CD', value: 5},
    {label: 'Multi DVD', value: 6},
    {label: 'TV', value: 7},
  ];

  const [power, setPower] = useState(0);
  const [mute, setMute] = useState(0);
  const [source, setSource] = useState(0);
  const [volume, setVolume] = useState(Volume);

  useZonaMonitor(zoneId, 200, volume);
  const [nome, setNome] = useState(Nome);
  const [slider, setSlider] = useState(volume);
  function retrieveVolume() {
    retrieveData(`volume_${zoneId}`).then(volumeString => {
      if (volumeString !== null) {
        const volumeNumber = parseInt(volumeString, 10);
        if (!isNaN(volumeNumber)) {
          setVolume(volumeNumber);
          console.log('dato caricato', volumeNumber);
        } else {
          console.error('Il volume recuperato non è un numero valido.');
        }
      } else {
        setVolume(Volume);
      }
    });
  }

  function saveSetting() {
    saveData(`byte5_${zoneId}`, Byte5?.toString());
    saveData(`volume_${zoneId}`, Volume?.toString());
  }

  async function bomboclat() {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }

  useEffect(() => {
    bomboclat();
    leggiStatoZona(zoneId);

    const handleByte5Change = () => {
      if (Byte5 == 33 || Byte5 == 1) {
        setPower(0);
        setMute(0);
        setVolume(Volume);
        saveSetting();
      } else if (Byte5 == 35 || Byte5 == 3) {
        setPower(1);
        setMute(0);
        setVolume(Volume);
        saveSetting();
      } else if (Byte5 == 37 || Byte5 == 5) {
        setPower(0);
        setMute(1);
        retrieveVolume();
      } else if (Byte5 == 39 || Byte5 == 7) {
        setPower(1);
        setMute(1);
        retrieveVolume();
      }
    };

    const handleByte6Change = () => {
      if (Byte6 !== null) {
        const sourceValue = Byte6 % 16;
        if (sourceValue >= 0 && sourceValue <= 7) {
          setSource(sourceValue);
        }
      }
    };

    const handleVolumeChange = (newVolume: number) => {
      setVolume(newVolume);
    };

    const handleNomeChange = (newNome: string) => {
      setNome(newNome);
    };

    udpEvents.on('Byte5Changed', handleByte5Change);
    udpEvents.on('Byte6Changed', handleByte6Change);
    udpEvents.on('VolumeChanged', handleVolumeChange);
    udpEvents.on('NomeChanged', handleNomeChange);
    return () => {
      udpEvents.off('Byte5Changed', handleByte5Change);
      udpEvents.off('Byte6Changed', handleByte6Change);
      udpEvents.off('VolumeChanged', handleVolumeChange);
      udpEvents.off('NomeChanged', handleNomeChange);
    };
  }, []);

  if (isLoading) {
    return (
      <View className="h-screen w-screen flex justify-center items-center">
        <ActivityIndicator className="size-24" />
      </View>
    );
  }

  return (
    <AndroidSafeArea>
      <View className="px-5">
        <SecondaryHeader title={nome ?? 'Default Title'} />
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
        </View>
        <View className="my-2.5">
          <Text className="text-black-300 text-lg font-medium mb-1">
            Volume:{' '}
            <Text className="text-2xl font-extrabold text-primary-300">
              {slider}
            </Text>
          </Text>
          <Slider
            minimumTrackTintColor="#228BE6"
            maximumTrackTintColor="#FFFFFF"
            step={1}
            minimumValue={0}
            maximumValue={80}
            value={volume ?? 0}
            disabled={!!mute}
            onValueChange={e => {
              setSlider(e);
            }}
            onSlidingComplete={e => {
              saveData(`volume_${zoneId}`, e.toString());
              sendThreeBytes(15, zoneId, e);
              setVolume(e);
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
              sendThreeBytes(19, zoneId, item.value);
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
