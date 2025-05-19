// Componente che aggiunge un'area sicura superiore su Android per evitare la status bar
import {Platform, View} from 'react-native';

import {ReactNode} from 'react';

// Definizione del componente AndroidSafeArea
export default function AndroidSafeArea({children}: {children: ReactNode}) {
  return (
    <View
      // Margine inferiore per evitare la barra di navigazione
      className="mb-24"
      style={{
        // Padding superiore solo su Android per evitare la status bar
        paddingTop: Platform.OS === 'android' ? 25 : 0,
        // Padding orizzontale costante
        paddingHorizontal: 20,
      }}>
      {/* Renderizza i figli passati al componente */}
      {children}
    </View>
  );
}
