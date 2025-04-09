import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import icons  from '../constants/icons'; // Assicurati di avere il percorso corretto per le icone 
import { udpEvents } from '../lib/udpClient';

let currentIp = "";

export function getIp() {
  return currentIp;
}

export default function FirstView() {
  const [ip, setIp] = useState("");

  const handleIpChange = (text: string) => {
    setIp(text);
    currentIp = text;
    udpEvents.emit('ipChanged', text); // Emetti un evento quando l'IP cambia
  };

  return (
    <View className="flex-1 flex-col bg-white justify-center items-center">
      <Text className="text-primary-300 font-extrabold text-4xl">
        Benvenuto in liveMt!
      </Text>
      <Text className="text-primary-300 font-extrabold text-xl">
        Inizia ad usare l'app:
      </Text>
      <View className="flex flex-row items-center justify-center border rounded-full mt-5">
        <TextInput
          placeholder="Inserisci IP"
          className="bg-white px-20 rounded-full"
          value={ip}
          onChangeText={handleIpChange}
          keyboardType="numeric"
          maxLength={15}
        />
        <TouchableOpacity
          className="bg-primary-300 rounded-full p-3"
          onPress={() => {
            Alert.alert('Sei Sicuro?', `Sei sicuro di voler usare ${ip} come indirizzo IP?\n(puoi sempre cambiarlo succesivamente)`, [
              {
                text: 'Annulla',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'Continua',
                onPress: () => {
                  console.log('IP changed to:', ip);
                  // Qui potresti voler fare qualcosa con l'IP,
                  // magari chiamare un'altra funzione che usa getIp()
                },
              },
            ]);
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