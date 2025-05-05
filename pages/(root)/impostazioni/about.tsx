import {Text, View, Image} from 'react-native';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import {SecondaryHeader} from '../../../components/Header';
import images from '../../../constants/images';
import icons from '../../../constants/icons';

export default function About() {
  return (
    <AndroidSafeArea>
      <SecondaryHeader title="About" />
      <View className="flex flex-col gap-5 mt-5 justify-center items-center">
        <Image source={images.tutondo} className=" h-16 w-96" />
        <Text className="text-primary-300 font-extrabold text-xl">
          Tutondo A.T.E.C. Srl
        </Text>
        <View className="flex flex-col gap-2">
          <View className="flex flex-row gap-2 justify-center items-center">
            <Image source={icons.zone} className="size-9" />
            <Text className="font-bold ">
              via Nobel, 8, Noventa di Piave, Italy
            </Text>
          </View>
          <View className="flex flex-row gap-2 items-center">
            <Image source={icons.phone} className="size-9" />
            <Text className="font-bold ">0421 65288</Text>
          </View>
          <View className="flex flex-row gap-2 items-center">
            <Image source={icons.email} className="size-9" />
            <Text className="font-bold ">marketing@tutondo.com</Text>
          </View>
          <View className="flex flex-row gap-2 items-center">
            <Image source={icons.standard} className="size-9" />
            <Text className="font-bold underline">www.tutondo.com</Text>
          </View>
        </View>
      </View>
    </AndroidSafeArea>
  );
}
