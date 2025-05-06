import {Platform, View} from 'react-native';

import {ReactNode} from 'react';

export default function AndroidSafeArea({children}: {children: ReactNode}) {
  return (
    <View
      className="mb-24"
      style={{
        paddingTop: Platform.OS === 'android' ? 25 : 0,
        paddingHorizontal: 20,
      }}>
      {children}
    </View>
  );
}
