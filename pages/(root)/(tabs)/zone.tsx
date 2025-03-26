import {Image, Text, TouchableOpacity, View} from 'react-native';
import {sendThreeBytes} from '../../../lib/udpClient';
import '../../../global.css';
import {MainHeader} from '../../../components/Header';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import icons from '../../../constants/icons';

import {NavigationContainer, useNavigation, NavigationProp} from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';



type RootStackParamList = {
  LivingRoom: undefined;
  // add other routes here
};

const Zone = ()  => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
      <AndroidSafeArea>
        <MainHeader title="Zone" icon={icons.zone}/>
        <View className="my-5 flex flex-col gap-3">
          <View className="flex flex-row justify-between items-center">
            <TouchableOpacity>
              <Text
                className="text-primary-300 font-light"
                onPress={() => {
                  for (let i = 1; i <= 6; i++) sendThreeBytes(4, i, 1);
                }}>
                Turn all Zones ON
              </Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text
                className="text-primary-300 font-light"
                onPress={() => {
                  for (let i = 1; i <= 6; i++) sendThreeBytes(4, i, 0);
                }}>
                Turn all Zones OFF
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="flex flex-row border-b p-5 border-black-50 justify-between items-center"
            onPress={() => {navigation.navigate('LivingRoom')}}>
            <Text className="text-xl font-medium">Living Room</Text>
            <Image source={icons.rightArrow} className="size-6" />
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row  border-b p-5 border-black-50 justify-between items-center">
            <Text className="text-xl font-medium">Kitchen</Text>
            <Image source={icons.rightArrow} className="size-6" />
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row  border-b p-5 border-black-50 justify-between items-center">
            <Text className="text-xl font-medium">Bathroom</Text>
            <Image source={icons.rightArrow} className="size-6" />
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row  border-b p-5 border-black-50 justify-between items-center">
            <Text className="text-xl font-medium text-primary-300">
              Current ON Zones
            </Text>
            <Image source={icons.rightArrow} className="size-6" />
          </TouchableOpacity>
        </View>
      </AndroidSafeArea>
  );
}

export default Zone;