import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveData(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, value);
    console.log('Dati salvati con successo!', key, value);
  } catch (error) {
    console.error('Errore durante il salvataggio dei dati:', error);
  }
}

export async function retrieveData(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      console.log('Dati recuperati:', value);
      return value;
    } else {
      console.log('Nessun dato trovato per la chiave:', key);
      return null;
    }
  } catch (error) {
    console.error('Errore durante il recupero dei dati:', error);
    return null;
  }
}

export async function clearAllData() {
  try {
    await AsyncStorage.clear();
    console.log('Tutti i dati rimossi con successo!');
  } catch (error) {
    console.error('Errore durante la rimozione di tutti i dati:', error);
  }
}
