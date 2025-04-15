import AndroidSafeArea from '../../../components/AndroidSafeArea';
import {MainHeader, SecondaryHeader} from '../../../components/Header';
import icons from '../../../constants/icons';
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {sendThreeBytes} from '../../../lib/udpClient';
import {Dropdown} from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';
import {retrieveData, saveData} from '../../../lib/db';

export default function Scenario() {
  type RootStackParamList = {
    CreateScenario:
      | {updateScenari: (newScenario: {nome: string; settings: any[]}) => void}
      | undefined;
    EditScenario: {
      nome: string;
      index: number;
      updateScenarioSettings: (index: number, newSetting: any) => void; // Modificato per ricevere una singola impostazione
    };
  };
  useEffect(() => {
    retrieveScenari();
  }, []);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [scenari, setScenari] = useState<any[]>([]);

  const handleCreateScenario = (newScenario: {nome: string}) => {
    setScenari([...scenari, {...newScenario, settings: []}]); // Inizializziamo settings come array vuoto
    saveData('scenari', JSON.stringify(scenari));
  };

  const handleUpdateScenarioSettings = (index: number, newSetting: any) => {
    const updatedScenari = scenari.map((scenario, i) =>
      i === index
        ? {...scenario, settings: [...scenario.settings, newSetting]}
        : scenario,
    );
    setScenari(updatedScenari);
    saveData('scenari', JSON.stringify(updatedScenari)); // Aggiorna i dati salvati
  };

  function retrieveScenari() {
    retrieveData('scenari').then(array => {
      if (array !== null) {
        setScenari(JSON.parse(array));
      }
    });
  }

  return (
    <AndroidSafeArea>
      <MainHeader title={'Scenario'} icon={icons.scenario} />
      <View className="flex flex-row justify-between mt-5">
        <TouchableOpacity
          className="flex w-32 items-center justify-center p-5 bg-green-600 rounded-2xl"
          onPress={() =>
            navigation.navigate('CreateScenario', {
              updateScenari: handleCreateScenario,
            })
          }>
          <Text className="text-white font-medium text-lg uppercase w-full text-center">
            Crea Scenario
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex w-32 items-center justify-center p-5 bg-primary-300 rounded-2xl"
          onPress={() => console.log(scenari)}>
          <Text className="text-white font-medium text-lg uppercase w-full text-center">
            Stampa Array
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex w-32 items-center justify-center p-5 bg-red-600 rounded-2xl ">
          <Text className="text-white font-medium text-lg uppercase w-full text-center">
            Elimina Scenario
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text className="text-2xl mt-2 font-extrabold text-primary-300">
          Scenari:
        </Text>
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
              <TouchableOpacity
                className="p-2 rounded-full bg-gray-300"
                onPress={() =>
                  navigation.navigate('EditScenario', {
                    nome: scenario.nome,
                    index,
                    updateScenarioSettings: handleUpdateScenarioSettings, // Passiamo la funzione modificata
                  })
                }>
                <Image source={icons.edit} className="size-6" />
              </TouchableOpacity>
              <TouchableOpacity className="flex items-center w-32 justify-center py-5 rounded-xl bg-primary-300">
                <Text className="text-white font-extrabold">APPLICA</Text>
              </TouchableOpacity>
              <TouchableOpacity className="p-2 rounded-full bg-red-100">
                <Image source={icons.trash} className="size-8" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </AndroidSafeArea>
  );
}

export function CreateScenario({route}: {route: any}) {
  const [nome, setNome] = useState('');
  const {updateScenari} = route.params;
  const navigation = useNavigation();

  return (
    <AndroidSafeArea>
      <SecondaryHeader title={'Crea Scenario'} />
      <View className="flex flex-col mt-5">
        <Text className="text-lg font-bold mb-2">Nome Scenario:</Text>
        <TextInput
          onChangeText={e => setNome(e)}
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
interface Setting {
  id: number | null;
  power: number;
  mute: number;
  volume: number;
  source: number;
}

interface Scenario {
  nome: string;
  settings: any[]; // O specifica un tipo più preciso se lo conosci
  // Altre proprietà dello scenario, se presenti
}

export function EditScenario({route}: {route: any}) {
  const {nome, index, updateScenarioSettings} = route.params;
  const [id, setId] = useState<number | null>(null);
  const [power, setPower] = useState(0);
  const [mute, setMute] = useState(0);
  const [volume, setVolume] = useState(0);
  const [source, setSource] = useState(0);
  const [currentScenarioSettings, setCurrentScenarioSettings] = useState<any[]>(
    [],
  );
  const [allScenari, setAllScenari] = useState<Scenario[]>([]); // Tipizzato come array di Scenario

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

  useEffect(() => {
    retrieveScenariForEdit();
  }, []);

  function retrieveScenariForEdit() {
    retrieveData('scenari').then(array => {
      if (array !== null) {
        const parsedScenari: Scenario[] = JSON.parse(array); // Tipizzato come array di Scenario
        setAllScenari(parsedScenari);
        // Trova lo scenario corrente e imposta le sue impostazioni per la visualizzazione
        const currentScenario = parsedScenari.find(
          (scenario: Scenario, i) => i === index,
        );
        if (currentScenario && currentScenario.settings) {
          setCurrentScenarioSettings(currentScenario.settings);
        }
      }
    });
  }

  function handleSave() {
    if (id !== null || id !== id) {
      const newSetting: Setting = {id, power, mute, volume, source}; // Tipizzato come Setting
      updateScenarioSettings(index, newSetting);
      // Ottimisticamente aggiorna la visualizzazione locale
      setCurrentScenarioSettings(prevSettings => [...prevSettings, newSetting]);
      console.log(
        'Impostazioni salvate per lo scenario con indice:',
        index,
        newSetting,
      );
      // Resetta gli stati del form
      setId(null);
      setPower(0);
      setMute(0);
      setVolume(0);
      setSource(0);
    } else {
      console.warn("L'ID non è valido.");
    }
  }

  return (
    <AndroidSafeArea>
      <ScrollView>
        <SecondaryHeader title={`Modifica ${nome} ${index}`} />
        <View className="mt-5">
          <Text className="text-lg font-bold mb-2">Scegli Zona:</Text>
          <View className="flex flex-row gap-10 items-center">
            <TextInput
              placeholder="es: 6"
              className="bg-white w-full rounded-xl p-5"
              onChangeText={e => {
                const numeroId = parseInt(e, 10);
                if (!isNaN(numeroId)) {
                  setId(numeroId);
                } else {
                  console.warn("Input non valido per l'ID");
                }
              }}
            />
            {/* <Image source={icons.plus} className='size-14 w-fit'/> */}
          </View>

          <View className="flex flex-row my-5 gap-5 justify-between border-b pb-5 border-black-50">
            <TouchableOpacity
              className={`flex flex-row items-center gap-2 `}
              onPress={() => {
                setPower(prev => (prev === 0 ? 1 : 0));
              }}>
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
                setMute(prev => (prev === 0 ? 1 : 0));
                if (id !== null) {
                  sendThreeBytes(22, id, mute === 0 ? 1 : 0);
                } else {
                  console.warn(
                    'ID non impostato, impossibile inviare comando Mute.',
                  );
                }
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
              onValueChange={e => {
                setVolume(e);
              }}
            />
          </View>
          <View className="my-2.5">
            <Text className="text-black-300 text-lg font-medium">Source:</Text>
            <Dropdown
              data={Sources}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select source"
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
            onPress={() => {
              handleSave();
            }}
            className="bg-green-500 p-5 flex items-center justify-center rounded-xl mt-5">
            <Text className="text-white font-extrabold text-xl">
              Aggiungi Impostazione
            </Text>
          </TouchableOpacity>

          <View className="mt-5">
            <Text className="text-lg font-bold mb-2">
              Impostazioni Salvate:
            </Text>
            {currentScenarioSettings.map((setting, settingIndex) => (
              <View className='flex flex-row justify-between'>
                <View
                  key={settingIndex}
                  className="bg-gray-100 p-3 rounded-md mb-2">
                  <Text>Zona ID: {setting.id}</Text>
                  <Text>Power: {setting.power ? 'On' : 'Off'}</Text>
                  <Text>Mute: {setting.mute ? 'Muted' : 'Unmuted'}</Text>
                  <Text>Volume: {setting.volume}</Text>
                  <Text>
                    Source:{' '}
                    {Sources.find(s => s.value === setting.source)?.label ||
                      'Sconosciuta'}
                  </Text>
                </View>
                <TouchableOpacity className='flex justify-center items-center bg-red-100 rounded-full my-3' onPress={() => currentScenarioSettings.splice(settingIndex, 1)}>
                  <Image source={icons.trash} className='size-10' />
                </TouchableOpacity>
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
