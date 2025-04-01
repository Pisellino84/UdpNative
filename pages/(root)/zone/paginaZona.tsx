import {View, Text, TouchableOpacity, Image, Alert} from 'react-native';
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

export default function PaginaZona() {
  // Define RootStackParamList if not already defined elsewhere
  type RootStackParamList = {
    PaginaZona: {zoneId: number};
  };

  const route = useRoute<RouteProp<RootStackParamList, 'PaginaZona'>>();
  const {zoneId} = route.params; // Recupera il parametro zoneId

  React.useEffect(() => {
    // Usa il parametro zoneId per chiamare leggiStatoZona
    sendThreeBytes(61, zoneId, 0);
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
  const [night, setNight] = useState(0);
  const [source, setSource] = useState(0);
  const [volume, setVolume] = useState(Volume);
  const [nome, setNome] = useState(Nome);

  useEffect(() => {
    // Leggi lo stato della zona all'inizio
    leggiStatoZona(zoneId);

    // Ascolta i cambiamenti di Power
    const handleByte5Change = () => {
      if (Byte5 == 33 || Byte5 == 1 ) {
        setPower(0);
        setMute(0);
      } else if (Byte5 == 35 || Byte5 == 3) {
        setPower(1);
        setMute(0);
      } else if (Byte5 == 37 || Byte5 == 5) {
        setPower(0);
        setMute(1);
      } else if (Byte5 == 39 || Byte5 == 7) {
        setPower(1);
        setMute(1);
      }
    };

    const handleByte6Change = () => {
      if (Byte6 !== null) {
        const sourceValue = Byte6 % 16; // Calcola il valore della sorgente
        if (sourceValue >= 0 && sourceValue <= 7) {
          setSource(sourceValue);
        }
      }
    };

    /* const handleByte6Change = () => {
      if (Byte6 == 0 || Byte6 == 16 || Byte6 == 32 || Byte6 == 48 || Byte6 == 64 || Byte6 == 80 || Byte6 == 96 || Byte6 == 112 || Byte6 == 160 || Byte6 == 224) {
        setSource(0);
      } else if (Byte6 == 1 || Byte6 == 17 || Byte6 == 33 || Byte6 == 49 || Byte6 == 65 || Byte6 == 81 || Byte6 == 97 || Byte6 == 113 || Byte6 == 161 || Byte6 == 225) {
        setSource(1);
      } else if (Byte6 == 2 || Byte6 == 18  || Byte6 == 34 || Byte6 == 50 || Byte6 == 66 || Byte6 == 82 || Byte6 == 98 || Byte6 == 114 || Byte6 == 162 || Byte6 == 226) {
        setSource(2);
      } else if (Byte6 == 3 || Byte6 == 19  || Byte6 == 35 || Byte6 == 51 || Byte6 == 67 || Byte6 == 83 || Byte6 == 99 || Byte6 == 115 || Byte6 == 163 || Byte6 == 227) {
        setSource(3);
      } else if (Byte6 == 4 || Byte6 == 20  || Byte6 == 36 || Byte6 == 52 || Byte6 == 68 || Byte6 == 84 || Byte6 == 100 || Byte6 == 116 || Byte6 == 164 || Byte6 == 228) {
        setSource(4);
      } else if (Byte6 == 5 || Byte6 == 21  || Byte6 == 37 || Byte6 == 53 || Byte6 == 69 || Byte6 == 85 || Byte6 == 101 || Byte6 == 117 || Byte6 == 165 || Byte6 == 229) {
        setSource(5);
      } else if (Byte6 == 6  || Byte6 == 22  || Byte6 == 38 || Byte6 == 54 || Byte6 == 70 || Byte6 == 86 || Byte6 == 102 || Byte6 == 118 || Byte6 == 166 || Byte6 == 230) {
        setSource(6);
      } else if (Byte6 == 7  || Byte6 == 23 || Byte6 == 39 || Byte6 == 55 || Byte6 == 71 || Byte6 == 87 || Byte6 == 103 || Byte6 == 119 || Byte6 == 167 || Byte6 == 231) {
        setSource(7);
      }
    }; */

    const handleVolumeChange = (newVolume: number) => {
      retrieveData(`volume ${zoneId}`).then(savedVolume => {
        if (savedVolume !== null) {
          setVolume(Number(savedVolume));
        }
      });
      setVolume(newVolume);
    };

    const handleNomeChange = (newNome: string) => {
      setNome(newNome);
    };

    udpEvents.on('Byte5Changed', handleByte5Change);
    udpEvents.on('Byte6Changed', handleByte6Change);
    udpEvents.on('VolumeChanged', handleVolumeChange);
    udpEvents.on('NomeChanged', handleNomeChange);

    // Cleanup: rimuovi il listener quando il componente viene smontato
    return () => {
      udpEvents.off('Byte5Changed', handleByte5Change);
      udpEvents.off('Byte6Changed', handleByte6Change);
      udpEvents.off('VolumeChanged', handleVolumeChange);
      udpEvents.off('NomeChanged', handleNomeChange);
    };
  }, []);

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
                if (night === 0) {
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
              sendThreeBytes(19, zoneId, item.value)
              /* if (Byte6 != null && Byte6 <= 7 ) {
                sendThreeBytes(19, zoneId, item.value)
              } else if (Byte6 != null && Byte6 >= 16 && Byte6 <= 23) {
                sendThreeBytes(19, zoneId, item.value)
              } else if (Byte6 != null && Byte6 >= 32 && Byte6 <= 39) {
                sendThreeBytes(19, zoneId, item.value) 
              } */
            }}
            style={{
              padding: 20,
              backgroundColor: 'white',
              borderRadius: '4%',
            }}
            containerStyle={{borderRadius: '4%'}}
          />
        </View>
        <TouchableOpacity onPress={() => leggiStatoZona(zoneId)}>
          <Text>TEST</Text>
        </TouchableOpacity>
      </View>
    </AndroidSafeArea>
  );
}
