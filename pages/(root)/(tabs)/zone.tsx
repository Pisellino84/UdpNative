import {ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {sendThreeBytes, Nome} from '../../../lib/udpClient'; // Importa Nome
import '../../../global.css';
import {MainHeader} from '../../../components/Header';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import icons from '../../../constants/icons';

import {useNavigation, NavigationProp} from '@react-navigation/native';
import React, {useState} from 'react';

type RootStackParamList = {
  PaginaZona: {zoneId: number}; 
};

const Zone = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Array di 48 zone
  const zones = Array.from({length: 49}, (_, i) => i + 1);

  // Stato per memorizzare i nomi delle zone
  const [zoneNames, setZoneNames] = useState<string[]>(Array(49).fill(''));
  const [isLoading, setIsLoading] = useState(true); 

  // Funzione per caricare i nomi uno alla volta
  const loadZoneNames = async () => {
    const names: string[] = [...zoneNames]; // Copia dello stato attuale

    while (isLoading) {
      for (const zoneId of zones) {
        sendThreeBytes(61, zoneId, 0); // Invia i tre byte richiesti
        await new Promise(resolve => setTimeout(resolve, 30)); // Ritardo per evitare di saltare zone

        if (Nome) {
          names[zoneId - 1] = Nome; // Usa il nome caricato
          setZoneNames([...names]); // Aggiorna lo stato
        }
      }

      // Controlla se tutti i nomi sono stati caricati
      const allNamesLoaded = names.every(name => name !== '');
      if (allNamesLoaded) {
        setIsLoading(false); // Disattiva la schermata di caricamento
        break; // Esce dal ciclo
      }
    }
  };

  // Carica i nomi all'avvio
  React.useEffect(() => {
    loadZoneNames();
  }, []);

  if (isLoading) {
    // Mostra la schermata di caricamento
    return (
      <AndroidSafeArea>
        <View className="flex h-screen justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-lg mt-4">Caricamento in corso...</Text>
        </View>
      </AndroidSafeArea>
    );
  }

  return (
    <AndroidSafeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MainHeader title="Zone" icon={icons.zone} />
        <View className="my-5 flex flex-col gap-3">
          <View className="flex flex-row justify-between items-center">
            <TouchableOpacity>
              <Text
                className="text-primary-300 font-light"
                onPress={() => {
                  zones.forEach(zoneId => sendThreeBytes(4, zoneId, 1));
                }}>
                Turn all Zones ON
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text
                className="text-primary-300 font-light"
                onPress={() => {
                  zones.forEach(zoneId => sendThreeBytes(4, zoneId, 0));
                }}>
                Turn all Zones OFF
              </Text>
            </TouchableOpacity>
          </View>

          {/* Genera dinamicamente i pulsanti per le zone */}
          {zones.map(zoneId => (
            <TouchableOpacity
              key={zoneId}
              className="flex flex-row border-b p-5 border-black-50 justify-between items-center"
              onPress={() => {
                navigation.navigate('PaginaZona', {zoneId}); // Passa l'ID della zona
              }}>
              <Text className="text-xl font-medium">
                {zoneNames[zoneId - 1]} {/* Mostra solo il nome caricato */}
              </Text>
              <Image source={icons.rightArrow} className="size-6" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </AndroidSafeArea>
  );
};

export default Zone;
