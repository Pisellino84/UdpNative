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
} from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useState} from 'react';
import {sendThreeBytes} from '../../../lib/udpClient';
import {Dropdown} from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';

export default function Scenario() {
  type RootStackParamList = {
    CreateScenario:
      | {updateScenari: (newScenario: {nome: string}) => void}
      | undefined;
    EditScenario: {nome: number; index: number};
  };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [scenari, setScenari] = useState<any[]>([]);

  const handleCreateScenario = (newScenario: {nome: string}) => {
    setScenari([...scenari, newScenario]);
  };

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

let settings: any[] = [];

export function EditScenario() {
  type RootStackParamList = {
    EditScenario: {nome: number; index: number};
  };
  const route = useRoute<RouteProp<RootStackParamList, 'EditScenario'>>();
  const {nome, index} = route.params;
  const [id, setId] = useState(0);
  const [power, setPower] = useState(0);
  const [mute, setMute] = useState(0);
  const [volume, setVolume] = useState(0);
  const [source, setSource] = useState(0);

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

  function handleSave() {
    settings.push({id, power, mute, volume, source});
    console.log(settings);
  }

  return (
    <AndroidSafeArea>
      <SecondaryHeader title={`Modifica ${nome} ${index}`} />
      <View className="mt-5">
        <Text className="text-lg font-bold mb-2">Scegli Zona:</Text>
        <View className="flex flex-row gap-10 items-center">
          <TextInput
            placeholder="es: 6"
            className="bg-white w-full rounded-xl p-5"
            onChangeText={e => {
              const numeroId = parseInt(e, 10); // Il secondo argomento 10 indica che vogliamo interpretare la stringa come un numero in base 10 (decimale)
              if (!isNaN(numeroId)) {
                // Verifica se la conversione ha avuto successo (se la stringa non è "Not a Number")
                setId(numeroId);
              } else {
                // Gestisci il caso in cui l'input non è un numero valido, ad esempio reimpostando l'id a null o mostrando un messaggio di errore.
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
              if (power == 0) {
                setPower(1);
              } else {
                setPower(0);
              }
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
              if (mute === 0) {
                setMute(1);
                sendThreeBytes(22, id, 1);
              } else {
                setMute(0);
                sendThreeBytes(22, id, 0);
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
          <Text className="text-white font-extrabold text-xl">SALVA</Text>
        </TouchableOpacity>
      </View>
    </AndroidSafeArea>
  );
}
