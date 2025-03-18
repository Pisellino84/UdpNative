import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {sendThreeBytes} from '../../../lib/udpProtocol';
import '../../../global.css';
import {MainHeader} from '../../../components/Header';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import { router } from 'expo-router';
import icons from '../../../constants/icons';

export default function Index() {
  return (
    <SafeAreaView>
      <AndroidSafeArea>
        <MainHeader title="Zone" />
        <TouchableOpacity
          onPress={() => {
            /* for(let i = 1; i <= 6; i++ ) */ sendThreeBytes(4, 1, 2);
          }}>
          <Text className="text-2xl text-red-600 font-rubik-bold">UDP</Text>
        </TouchableOpacity>
        <View className="my-5 flex flex-col gap-3">
          <View className="flex flex-row justify-between items-center">
            <TouchableOpacity><Text className="text-primary-300 font-rubik-light">Turn all Zones ON</Text></TouchableOpacity>
            <TouchableOpacity><Text className="text-primary-300 font-rubik-light">Turn all Zones OFF</Text></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => {router.push("./zone/livingRoom")}} className="flex flex-row border-b p-5 border-black-50 justify-between items-center">
            <Text className="text-xl font-rubik-medium">Living Room</Text>
            <Image source={icons.rightArrow} className="size-6"/>
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row  border-b p-5 border-black-50 justify-between items-center">
            <Text className="text-xl font-rubik-medium">Kitchen</Text>
            <Image source={icons.rightArrow} className="size-6"/>
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row  border-b p-5 border-black-50 justify-between items-center">
            <Text className="text-xl font-rubik-medium">Bathroom</Text>
            <Image source={icons.rightArrow} className="size-6"/>
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row  border-b p-5 border-black-50 justify-between items-center">
            <Text className="text-xl font-rubik-medium text-primary-300">Current ON Zones</Text>
            <Image source={icons.rightArrow} className="size-6"/>
          </TouchableOpacity>
        </View>
      </AndroidSafeArea>
    </SafeAreaView>
  );
}
