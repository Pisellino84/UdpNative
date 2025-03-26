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
} from '../../../lib/udpClient';

export default function LivingRoom() {
  const Sources = [
    {label: 'Tuner', value: 'tuner'},
    {label: 'CD', value: 'cd'},
    {label: 'DVD', value: 'dvd'},
    {label: 'SAT', value: 'sat'},
    {label: 'PC', value: 'pc'},
    {label: 'Multi CD', value: 'multiCd'},
    {label: 'Multi DVD', value: 'multiDvd'},
    {label: 'TV', value: 'tv'},
  ];

  // rivedere il power/mute/night perchè gli viene passato un numero e non un booleano

  const [power, setPower] = useState(Power);
  const [mute, setMute] = useState(Mute);
  const [night, setNight] = useState(Night);
  const [volume, setVolume] = useState(Volume);
  const [source, setSource] = useState('tuner');

  useEffect(() => {
    // Leggi lo stato della zona all'inizio
    leggiStatoZona(1);

    // Ascolta i cambiamenti di Power
    const handlePowerChange = (newPower: number) => {
      if (newPower === 35 || newPower === 39) {
        setPower(true);
      } else if (newPower === 33 || newPower === 37) {
        setPower(false);
      }
    };

    const handleMuteChange = (newMute: number) => {
      if (newMute === 37 || newMute === 39) {
        setMute(true);
      } else if (newMute === 35 || newMute === 33) {
        setMute(false);
      }
    };

    const handleVolumeChange = (newVolume: number) => {
      setVolume(newVolume);
    };

    udpEvents.on('PowerChanged', handlePowerChange);
    udpEvents.on('MuteChanged', handleMuteChange);
    udpEvents.on('VolumeChanged', handleVolumeChange);

    // Cleanup: rimuovi il listener quando il componente viene smontato
    return () => {
      udpEvents.off('PowerChanged', handlePowerChange);
      udpEvents.off('MuteChanged', handleMuteChange);
      udpEvents.off('VolumeChanged', handleVolumeChange);
    };
  }, []);

  return (
    <AndroidSafeArea>
      <View className="px-5">
        <SecondaryHeader title={'Living Room'} />
        <View className="flex flex-row my-5 gap-5 justify-between border-b pb-5 border-black-50">
          <TouchableOpacity
            onPress={() => {
              if (power == false) {
                setPower(true);
                sendThreeBytes(4, 1, 1);
              } else {
                setPower(false);
                sendThreeBytes(4, 1, 0);
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
                if (mute === false) {
                  setMute(true);
                  sendThreeBytes(22, 1, 1);
                } else {
                  setMute(false);
                  sendThreeBytes(22, 1, 0);
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
              if(power){

              if (night == false) {
                setNight(true);
                sendThreeBytes(24, 1, 1);
              } else {
                setNight(false);
                sendThreeBytes(24, 1, 0);
              } }
              else
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
            value={volume}
            disabled={mute}
            onValueChange={e => {
              if (!mute) {
                // Cambia il volume solo se mute non è attivo
                setVolume(e);
                sendThreeBytes(15, 1, e);
              }
            }}
          />
        </View>
        <View className="my-2.5">
          <Text className="text-black-300 text-lg font-medium mb-1">
            Source:
          </Text>
          <Dropdown
            data={Sources}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select source"
            value={source}
            onChange={item => {
              setSource(item.value);
              setPower(true);
              if (item.value == 'tuner') {
                sendThreeBytes(19, 1, 0);
              } else if (item.value == 'cd') {
                sendThreeBytes(19, 1, 1);
              } else if (item.value == 'dvd') {
                sendThreeBytes(19, 1, 2);
              } else if (item.value == 'sat') {
                sendThreeBytes(19, 1, 3);
              } else if (item.value == 'pc') {
                sendThreeBytes(19, 1, 4);
              } else if (item.value == 'multiCd') {
                sendThreeBytes(19, 1, 5);
              } else if (item.value == 'multiDvd') {
                sendThreeBytes(19, 1, 6);
              } else if (item.value == 'tv') {
                sendThreeBytes(19, 1, 7);
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
function handlePowerChange(...args: any[]): void {
  throw new Error('Function not implemented.');
}
