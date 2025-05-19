import {View, Image, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import icons from '../constants/icons';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {clearUdp} from '../lib/udpClient';

// Interfaccia delle proprietà accettate dai componenti Header
interface Props {
  icon?: any; // Icona opzionale da mostrare nell'header principale
  title: String; // Titolo da mostrare nell'header
  onPress?: () => void | undefined; // Callback opzionale per eventi click
}

// Header principale con icona, titolo e logo Tutondo
export function MainHeader({icon = icons.standard, title}: Props) {
  return (
    <View className="flex flex-row justify-between items-center border-b pb-5 border-primary-200">
      <View className="flex flex-row gap-3 items-center">
        {/* Icona principale */}
        <Image source={icon} className="size-11 " />
        <View className="flex flex-col">
          {/* Sottotitolo */}
          <Text className="text-black-100 text-sm font-light">
            Tutondo LiveMT
          </Text>
          {/* Titolo principale */}
          <Text className="font-bold text-2xl">{title}</Text>
        </View>
      </View>

      {/* Logo Tutondo a destra */}
      <Image source={icons.tutondo} className="size-9" />
    </View>
  );
}

// Header secondario con pulsante "indietro", titolo e logo Tutondo
export function SecondaryHeader({title}: Props) {
  // Definizione dei parametri di navigazione
  type RootStackParamList = {
    Impostazioni: undefined;
  };
  // Hook per la navigazione
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <>
      <View className="flex flex-row justify-between items-center border-b pb-5 border-primary-200">
        <View className="flex flex-row gap-3 items-center">
          {/* Pulsante indietro che pulisce anche la connessione UDP */}
          <TouchableOpacity
            className="bg-primary-200 rounded-full p-3"
            onPress={() => {
              navigation.goBack(), clearUdp();
            }}>
            <Image source={icons.backArrow} className="size-6 " />
          </TouchableOpacity>
          <View className="flex flex-col">
            {/* Sottotitolo */}
            <Text className="text-black-100 text-sm font-light">
              Tutondo LiveMT
            </Text>
            {/* Titolo principale */}
            <Text className="font-bold text-2xl">{title}</Text>
          </View>
        </View>

        {/* Logo Tutondo a destra */}
        <Image source={icons.tutondo} className="size-9" />
      </View>
    </>
  );
}
