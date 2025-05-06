import {ScrollView} from 'react-native';
import React from 'react';
import {Slot} from 'expo-router';

export default function InstallazioneLayout() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      alwaysBounceVertical={true}
      alwaysBounceHorizontal={false}>
      <Slot />
    </ScrollView>
  );
}
