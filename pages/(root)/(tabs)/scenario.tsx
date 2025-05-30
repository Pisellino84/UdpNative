import AndroidSafeArea from '../../../components/AndroidSafeArea';
// Import dei componenti header e delle icone
import {MainHeader, SecondaryHeader} from '../../../components/Header';
import icons from '../../../constants/icons';
// Import dei componenti React Native
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
// Import di hook di navigazione e stato
import {
  NavigationProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {useState, useCallback} from 'react';
// Import di componenti di terze parti
import {Dropdown} from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';
// Import di funzioni di persistenza e UDP
import {retrieveData, saveData} from '../../../lib/db';
import {leggiStatoZona, sendThreeBytes} from '../../../lib/udpClient';
import {useLoading, useRefresh, useApply} from '../../../lib/useConst';

// Variabile globale per la lista degli scenari
let scenari: any[] = [];

// Componente principale Scenario: mostra la lista degli scenari e permette la gestione
export default function Scenario() {
  const navigation = useNavigation<NavigationProp<any>>();
  // Stato per forzare il rerender
  const [, setRenderTrigger] = useState(0);

  // Recupera gli scenari salvati da AsyncStorage
  const retrieveScenari = useCallback(() => {
    retrieveData('scenari').then(array => {
      if (array !== null) {
        scenari = JSON.parse(array);
        console.log('Scenari recuperati:', scenari);
        setRenderTrigger(prev => prev + 1);
      }
    });
  }, []);

  // Aggiorna la lista scenari ogni volta che si torna su questa schermata
  useFocusEffect(
    useCallback(() => {
      retrieveScenari();
      return () => {};
    }, [retrieveScenari]),
  );

  // Gestione creazione nuovo scenario
  const handleCreateScenario = (newScenario: {nome: string}) => {
    const isDuplicateName = scenari.some(
      scenario =>
        scenario.nome.toLowerCase() === newScenario.nome.toLowerCase(),
    );

    if (isDuplicateName) {
      Alert.alert(
        'Nome Scenario Duplicato',
        `Lo scenario "${newScenario.nome}" esiste già. Inserisci un nome diverso.`,
        [{text: 'OK'}],
      );
      return;
    } else if (newScenario.nome === '') {
      Alert.alert('Nome Scenario Vuoto', `Inserisci un nome per lo scenario.`, [
        {text: 'OK'},
      ]);
      return;
    }

    scenari = [...scenari, {...newScenario, settings: []}];
    saveData('scenari', JSON.stringify(scenari)).then(() => {
      retrieveScenari();
    });
    console.log('Scenari dopo la creazione:', scenari);
  };

  // Aggiorna le impostazioni di uno scenario
  const handleUpdateScenarioSettings = (index: number, newSetting: any) => {
    const updatedScenari = scenari.map((scenario, i) =>
      i === index
        ? {...scenario, settings: [...scenario.settings, newSetting]}
        : scenario,
    );
    scenari = updatedScenari;
    saveData('scenari', JSON.stringify(updatedScenari)).then(() => {
      setRenderTrigger(prev => prev + 1);
    });
    console.log("Scenari dopo l'aggiornamento:", scenari);
  };

  // Elimina uno scenario dalla lista
  function handleDeleteScenario(indexToDelete: number) {
    Alert.alert(
      'Elimina Scenario',
      `Sei sicuro di voler eliminare lo scenario "${scenari[indexToDelete].nome}"?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            const updatedScenari = scenari.filter(
              (_, index) => index !== indexToDelete,
            );
            scenari = updatedScenari;
            saveData('scenari', JSON.stringify(scenari)).then(() => {
              retrieveScenari();
              console.log('Scenario eliminato. Scenari aggiornati:', scenari);
            });
          },
        },
      ],
    );
  }

  // Hook custom per gestire loading/apply/refresh globali
  const {isUseLoading} = useLoading();
  const {setIsUseRefreshing} = useRefresh();
  const {setIsUseApplying} = useApply();

  // Funzione di utilità per delay asincrono
  async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  // Stato per mostrare spinner durante l'applicazione scenario
  const [isLoading, setIsLoading] = useState(false);

  // Applica uno scenario inviando i comandi UDP
  async function Applica(scenario: any) {
    try {
      const statoZona = await leggiStatoZona(1);
      if (statoZona === undefined || statoZona === null) {
        Alert.alert(
          'Errore',
          'Nessuna risposta ricevuta dal dispositivo. Applicazione dello scenario annullata.',
          [{text: 'OK'}],
        );
        return;
      } else if (isUseLoading) {
        Alert.alert(
          'Errore',
          'Aspetta che il recupero dei dati sia completato prima di applicare lo scenario.',
          [{text: 'OK'}],
        );
        return;
      }
      if (
        !scenario.settings ||
        !Array.isArray(scenario.settings) ||
        scenario.settings.length === 0
      ) {
        Alert.alert('Errore', 'Nessuna impostazione selezionata', [
          {text: 'OK'},
        ]);
        return;
      }
    } catch (error) {
      Alert.alert(
        'Errore',
        'Si è verificato un errore durante la lettura dello stato della zona. Applicazione dello scenario annullata.',
        [{text: 'OK'}],
      );
      return;
    }

    const time = 30;
    setIsUseApplying(true);
    setIsUseRefreshing(true);
    setIsLoading(true);
    console.log(`Applicando lo scenario: ${scenario.nome}`);

    // Ciclo di invio comandi UDP per ogni impostazione dello scenario
    for (const setting of scenario.settings) {
      console.log('Impostazione:', setting);
      console.log('  ID:', setting.id);
      console.log('  Volume:', setting.volume);
      await saveData(`volume_${setting.id}`, setting.volume?.toString());
      await sendThreeBytes(15, setting.id, setting.volume);
      await delay(time);

      console.log('  Mute:', setting.mute);
      await sendThreeBytes(4, setting.id, 1);
      await delay(time);
      await sendThreeBytes(22, setting.id, setting.mute);
      await delay(time);
      await sendThreeBytes(19, setting.id, setting.source);
      await delay(time);

      console.log('  Source:', setting.source);

      await sendThreeBytes(19, setting.id, setting.source);
      await delay(time);

      console.log('  Power:', setting.power);

      await sendThreeBytes(4, setting.id, setting.power);
      await delay(time);

      console.log('---');
    }
    setIsUseApplying(false);
    setIsUseRefreshing(false);
    setIsLoading(false);
  }

  // Mostra spinner durante l'applicazione scenario
  if (isLoading) {
    return (
      <AndroidSafeArea>
        <View className="flex h-screen justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-lg mt-4">
            Applicazione dello scenario in corso...
          </Text>
        </View>
      </AndroidSafeArea>
    );
  }

  // Render principale: lista scenari e pulsanti di gestione
  return (
    <AndroidSafeArea>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        className="mb-5">
        <MainHeader title={'Scenario'} icon={icons.scenario} />
        <View className="flex flex-col justify-between mt-5">
          <TouchableOpacity
            className="flex w-full items-center justify-center p-5 bg-green-600 rounded-2xl"
            onPress={() =>
              navigation.navigate('CreateScenario', {
                updateScenari: handleCreateScenario,
              })
            }>
            <Text className="text-white font-medium text-lg uppercase w-full text-center">
              Crea Scenario
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          {scenari.map((scenario, index) => (
            <View
              key={index}
              className="flex border-b border-black-50 py-3 space-y-10">
              <View className="flex flex-row p-5">
                <View className="flex flex-row gap-2">
                  <View className="flex justify-center items-center text-center w-full">
                    <Text className="text-xl font-medium uppercase">
                      {scenario.nome}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex flex-row mt-3 items-center justify-between">
                {/* Pulsante modifica scenario */}
                <TouchableOpacity
                  className="p-2 rounded-full bg-gray-300"
                  onPress={() =>
                    navigation.navigate('EditScenario', {
                      nome: scenario.nome,
                      index,
                      updateScenarioSettings: handleUpdateScenarioSettings,
                    })
                  }>
                  <Image source={icons.edit} className="size-6" />
                </TouchableOpacity>
                {/* Pulsante applica scenario */}
                <TouchableOpacity
                  className="flex items-center w-32 justify-center py-5 rounded-xl bg-primary-300"
                  onPress={() => {
                    Applica(scenario);
                  }}>
                  <Text className="text-white font-extrabold">APPLICA</Text>
                </TouchableOpacity>
                {/* Pulsante elimina scenario */}
                <TouchableOpacity
                  className="p-2 rounded-full bg-red-100"
                  onPress={() => {
                    handleDeleteScenario(index);
                  }}>
                  <Image source={icons.trash} className="size-8" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </AndroidSafeArea>
  );
}

// Componente per la creazione di un nuovo scenario
export function CreateScenario({route}: {route: any}) {
  const [nome, setNome] = useState('');
  const {updateScenari} = route.params;
  const navigation = useNavigation();

  return (
    <AndroidSafeArea>
      <SecondaryHeader title={'Crea Scenario'} />
      <View className="flex flex-col mt-5 p-5">
        <Text className="text-lg font-bold mb-2">Nome Scenario:</Text>
        <TextInput
          onChangeText={setNome}
          maxLength={20}
          placeholder="es: Soggiorno"
          className="bg-white rounded-xl p-5"
        />
        <TouchableOpacity
          className="flex rounded-xl mt-2 p-5 bg-green-500 justify-center items-center"
          onPress={() => {
            updateScenari({nome});
            navigation.goBack();
          }}>
          <Text className="font-bold text-white text-xl">OK</Text>
        </TouchableOpacity>
      </View>
    </AndroidSafeArea>
  );
}

// Interfaccia per una singola impostazione di scenario
interface Setting {
  id: number | null;
  note: string;
  power: number;
  mute: number;
  volume: number;
  source: number;
}

// Componente per la modifica di uno scenario e delle sue impostazioni
export function EditScenario({route}: {route: any}) {
  // Props ricevute dalla navigazione: nome iniziale, indice scenario, funzione di update
  const {nome: initialNome, index, updateScenarioSettings} = route.params;
  // Stato per i campi del form di aggiunta/modifica impostazione
  const [nome, setNome] = useState(initialNome);
  const [id, setId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [power, setPower] = useState(0);
  const [mute, setMute] = useState(0);
  const [volume, setVolume] = useState(0);
  const [source, setSource] = useState(0);
  // Stato per le impostazioni correnti dello scenario selezionato
  const [currentScenarioSettings, setCurrentScenarioSettings] = useState<any[]>(
    [],
  );
  const navigation = useNavigation<NavigationProp<any>>();

  // Opzioni disponibili per la sorgente audio
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

  // Aggiorna le impostazioni correnti quando cambia lo scenario selezionato
  useFocusEffect(
    useCallback(() => {
      if (scenari[index] && scenari[index].settings) {
        setCurrentScenarioSettings(scenari[index].settings);
      }
    }, [index]),
  );

  // Salva una nuova impostazione per lo scenario
  function handleSaveSetting() {
    if (id !== null) {
      const isDuplicateId = currentScenarioSettings.some(
        setting => setting.id === id,
      );

      if (isDuplicateId) {
        Alert.alert(
          'ID Duplicato',
          `L'ID ${id} esiste già nelle impostazioni per lo scenario "${nome}". Inserisci un ID diverso.`,
          [{text: 'OK'}],
        );
        return;
      }

      const newSetting: Setting = {id, note, power, mute, volume, source};
      updateScenarioSettings(index, newSetting);

      setCurrentScenarioSettings(prevSettings => [...prevSettings, newSetting]);
      console.log(
        'Impostazioni salvate per lo scenario con indice:',
        index,
        newSetting,
      );

      setNote('');
      setPower(0);
      setMute(0);
      setVolume(0);
      setSource(0);
      setId(null);
    } else {
      console.warn("L'ID non è valido.");
    }
  }

  // Elimina una singola impostazione dallo scenario
  function handleDelete(settingIndex: any) {
    const newSettings = [...currentScenarioSettings];
    newSettings.splice(settingIndex, 1);
    setCurrentScenarioSettings(newSettings);

    const updatedScenari = [...scenari];
    if (updatedScenari[index]) {
      updatedScenari[index].settings = newSettings;
      scenari = updatedScenari;
      saveData('scenari', JSON.stringify(scenari));
    }
  }

  // Salva il nuovo nome dello scenario
  function handleSaveNome() {
    if (!nome.trim()) {
      Alert.alert(
        'Nome Invalido',
        'Il nome dello scenario non può essere vuoto.',
        [{text: 'OK'}],
      );
      return;
    }

    const isDuplicateName = scenari.some(
      (scenario, i) =>
        i !== index && scenario.nome.toLowerCase() === nome.toLowerCase(),
    );

    if (isDuplicateName) {
      Alert.alert(
        'Nome Duplicato',
        `Lo scenario "${nome}" esiste già. Inserisci un nome diverso.`,
        [{text: 'OK'}],
      );
      return;
    }

    const updatedScenari = [...scenari];
    if (updatedScenari[index]) {
      updatedScenari[index].nome = nome;
      scenari = updatedScenari;
      saveData('scenari', JSON.stringify(scenari)).then(() => {
        Alert.alert(
          'Nome Aggiornato',
          `Il nome dello scenario è stato aggiornato a "${nome}".`,
          [{text: 'OK'}],
        );
        navigation.goBack();
      });
    }
  }

  return (
    <AndroidSafeArea>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <SecondaryHeader title={`Modifica ${initialNome}`} />
        <View className="mt-5 ">
          <Text className="text-lg font-bold mb-2">Nome Scenario:</Text>
          <View className="flex flex-row">
            <TextInput
              onChangeText={setNome}
              maxLength={20}
              placeholder={nome}
              className="bg-white w-1/2 rounded-xl p-5"
            />
            <TouchableOpacity
              className="bg-primary-300 p-5 w-1/2 flex items-center justify-center rounded-xl "
              onPress={handleSaveNome}>
              <Text className="font-bold text-white text-xl">Salva Nome</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-lg font-bold mb-2 mt-5">Scegli Zona:</Text>
          <View className="flex flex-row gap-10 items-center">
            <TextInput
              placeholder="Inserisci Id della Zona (es: 4)"
              maxLength={2}
              className="bg-white w-full rounded-xl p-5"
              keyboardType="number-pad"
              onChangeText={e => {
                const numeroId = parseInt(e, 10);
                if (!isNaN(numeroId) && numeroId <= 48) {
                  setId(numeroId);
                } else if (e !== '') {
                  console.warn("Input non valido per l'ID");
                  setId(null);
                } else {
                  setId(null);
                }
              }}
              value={id !== null ? id.toString() : ''}
            />
          </View>

          <Text className="text-lg font-bold mb-2 mt-5">Note:</Text>
          <View className="flex flex-row gap-10 items-center">
            <TextInput
              placeholder="Inserisci le tue note"
              maxLength={120}
              className="bg-white w-full  rounded-xl p-5 justify-start"
              value={note}
              multiline
              onChangeText={setNote}
            />
          </View>

          <View className="flex flex-row my-5 gap-5 justify-between border-b pb-5 border-black-50">
            <TouchableOpacity
              className={`flex flex-row items-center gap-2 `}
              onPress={() => setPower(prev => (prev === 0 ? 1 : 0))}>
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
              onPress={() => setMute(prev => (prev === 0 ? 1 : 0))}
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
                {volume}
              </Text>
            </Text>
            <Slider
              minimumTrackTintColor="#228BE6"
              maximumTrackTintColor="#FFFFFF"
              step={1}
              minimumValue={0}
              maximumValue={80}
              value={volume ?? 0}
              onValueChange={setVolume}
            />
          </View>
          <View className="my-2.5">
            <Text className="text-black-300 text-lg font-medium">Source:</Text>
            <Dropdown
              data={Sources}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Seleziona sorgente"
              value={source}
              onChange={item => {
                setSource(item.value);
              }}
              style={{
                padding: 20,
                backgroundColor: 'white',
                borderRadius: '4%',
              }}
              containerStyle={{borderRadius: '4%'}}
            />
          </View>
          <TouchableOpacity
            onPress={handleSaveSetting}
            className="bg-green-500 p-5 flex items-center justify-center rounded-xl mt-5">
            <Text className="text-white font-extrabold text-xl">
              Aggiungi Impostazione
            </Text>
          </TouchableOpacity>

          <View className="mt-5">
            <Text className="text-xl text-primary-300 font-bold mb-2">
              Impostazioni Salvate:{' '}
              {currentScenarioSettings.length > 0
                ? currentScenarioSettings.length
                : null}
            </Text>
            {currentScenarioSettings
              .sort((a, b) => a.id - b.id)
              .map((setting, settingIndex) => (
                <View
                  className="flex flex-row justify-between border-y border-black-50 py-3 space-y-10"
                  key={settingIndex}>
                  <View className="bg-gray-100 p-3 rounded-md mb-2">
                    <Text className="font-medium">
                      Zona ID:{' '}
                      <Text className="font-extrabold text-lg text-primary-300">
                        {setting.id}
                      </Text>
                    </Text>
                    <Text className="font-medium">
                      Note:{' '}
                      <Text className="font-extrabold text-lg text-primary-300">
                        {setting.note}
                      </Text>
                    </Text>
                    <Text className="font-medium">
                      Power:{' '}
                      <Text className="font-extrabold text-lg text-primary-300">
                        {setting.power ? 'On' : 'Off'}
                      </Text>
                    </Text>
                    <Text className="font-medium">
                      Mute:{' '}
                      <Text className="font-extrabold text-lg text-primary-300">
                        {setting.mute ? 'Muted' : 'Unmuted'}
                      </Text>
                    </Text>
                    <Text className="font-medium">
                      Volume:{' '}
                      <Text className="font-extrabold text-lg text-primary-300">
                        {setting.volume}
                      </Text>
                    </Text>
                    <Text className="font-medium">
                      Source:{' '}
                      <Text className="font-extrabold text-lg text-primary-300">
                        {Sources.find(s => s.value === setting.source)?.label ||
                          'Sconosciuta'}
                      </Text>
                    </Text>
                  </View>
                  <View className="flex flex-row gap-5">
                    <TouchableOpacity
                      className="flex justify-center items-center bg-gray-300 rounded-full  my-3"
                      onPress={() => {
                        navigation.navigate('EditSetting', {
                          setting,
                          settingIndex,
                          scenarioIndex: index,
                          onSettingUpdated: (
                            updatedSetting: any,
                            idx: any | number,
                          ) => {
                            const updatedSettings = [
                              ...currentScenarioSettings,
                            ];
                            updatedSettings[idx] = updatedSetting;
                            setCurrentScenarioSettings(updatedSettings);
                          },
                        });
                      }}>
                      <Image source={icons.edit} className="size-10" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex justify-center items-center bg-red-100 rounded-full  my-3"
                      onPress={() => {
                        Alert.alert(
                          'Elimina Impostazione',
                          `Sei sicuro di voler eliminare l'impostazione per la zona ${setting.id}?`,
                          [
                            {
                              text: 'Annulla',
                              style: 'cancel',
                            },
                            {
                              text: 'Elimina',
                              onPress: () => {
                                handleDelete(settingIndex);
                              },
                            },
                          ],
                        );
                      }}>
                      <Image source={icons.trash} className="size-10" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            {currentScenarioSettings.length === 0 && (
              <Text className="text-gray-500">
                Nessuna impostazione salvata per questo scenario.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </AndroidSafeArea>
  );
}

export function EditSetting({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const {setting, settingIndex, scenarioIndex, onSettingUpdated} = route.params;
  const [note, setNote] = useState(setting.note);
  const [power, setPower] = useState(setting.power);
  const [mute, setMute] = useState(setting.mute);
  const [volume, setVolume] = useState(setting.volume);
  const [source, setSource] = useState(setting.source);

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

  const handleSave = () => {
    const updatedSetting = {
      ...setting,
      note,
      power,
      mute,
      volume,
      source,
    };

    const updatedScenari = [...scenari];
    if (
      updatedScenari[scenarioIndex] &&
      updatedScenari[scenarioIndex].settings
    ) {
      updatedScenari[scenarioIndex].settings[settingIndex] = updatedSetting;
      scenari = updatedScenari;

      saveData('scenari', JSON.stringify(scenari)).then(() => {
        if (onSettingUpdated) {
          onSettingUpdated(updatedSetting, settingIndex);
        }
        navigation.goBack();
      });
    }
  };

  return (
    <AndroidSafeArea>
      <SecondaryHeader title={`Modifica Zona ${setting.id}`} />
      <View className="mt-5 p-5">
        <Text className="text-lg font-bold mb-2">Note:</Text>
        <TextInput
          placeholder="Inserisci le tue note"
          maxLength={120}
          className="bg-white w-full rounded-xl p-5 justify-start"
          value={note}
          multiline
          onChangeText={setNote}
        />

        <View className="flex flex-row my-5 gap-5 justify-between border-b pb-5 border-black-50">
          <TouchableOpacity
            className={`flex flex-row items-center gap-2`}
            onPress={() => setPower((prev: number) => (prev === 0 ? 1 : 0))}>
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
            onPress={() => setMute((prev: number) => (prev === 0 ? 1 : 0))}
            className={`flex flex-row items-center gap-2`}>
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
              {volume}
            </Text>
          </Text>
          <Slider
            minimumTrackTintColor="#228BE6"
            maximumTrackTintColor="#FFFFFF"
            step={1}
            minimumValue={0}
            maximumValue={80}
            value={volume ?? 0}
            onValueChange={setVolume}
          />
        </View>

        <View className="my-2.5">
          <Text className="text-black-300 text-lg font-medium">Source:</Text>
          <Dropdown
            data={Sources}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Seleziona sorgente"
            value={source}
            onChange={item => setSource(item.value)}
            style={{
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 12,
            }}
            containerStyle={{borderRadius: 12}}
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Conferma Modifica',
              `Sei sicuro di voler modificare le impostazioni per la zona ${setting.id}?`,
              [
                {
                  text: 'Annulla',
                  style: 'cancel',
                },
                {
                  text: 'Conferma',
                  onPress: handleSave,
                },
              ],
            );
          }}
          className="bg-green-500 p-5 flex items-center justify-center rounded-xl mt-5">
          <Text className="text-white font-extrabold text-xl">
            Salva Modifiche
          </Text>
        </TouchableOpacity>
      </View>
    </AndroidSafeArea>
  );
}
