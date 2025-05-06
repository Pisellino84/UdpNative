import {Text, View, Image, Linking} from 'react-native';
import AndroidSafeArea from '../../../components/AndroidSafeArea';
import {SecondaryHeader} from '../../../components/Header';
import icons from '../../../constants/icons';
import images from '../../../constants/images';

export default function About() {
  return (
    <AndroidSafeArea>
      <SecondaryHeader title="About" />
      <View className="flex flex-col gap-5 mt-5 items-center">
        <View className="flex flex-row items-center">
          <Image source={icons.tut} className="h-16 w-44" />
          <Image
            source={icons.lp}
            className="size-24 animate-spin"
            tintColor={'red'}
          />
          <Image source={icons.ndo} className="h-16 w-44"/>
        </View>
        <Text className="text-black-300 -mb-5 text-sm -mt-7 flex text-right px-5 w-screen">
          Tutondo A.T.E.C. Srl
        </Text>
        <Image source={images.about} /* style={{ width: 450, }} */ className='w-screen'/>
        <View className="flex flex-col gap-2">
          <View className="flex flex-row gap-2 justify-center items-center">
            <Image source={icons.zone} className="size-9" tintColor={"red"}/>
            <Text
              className="font-medium "
              onPress={() =>
                Linking.openURL('https://maps.app.goo.gl/2X7ek9usks8Yuau78')
              }>
              Via Nobel 8, Noventa di Piave, VE
            </Text>
          </View>
          <View className="flex flex-row gap-2 items-center">
            <Image source={icons.phone} className="size-9" tintColor={"red"}/>
            <Text className="font-medium ">0421 65288</Text>
          </View>
          <View className="flex flex-row gap-2 items-center">
            <Image source={icons.email} className="size-9" tintColor={"red"}/>
            <Text className="font-medium">marketing@tutondo.com</Text>
          </View>
          <View className="flex flex-row gap-2 items-center">
            <Image source={icons.standard} className="size-9" tintColor={"red"}/>
            <Text
              className="font-medium"
              onPress={() => Linking.openURL('https://www.tutondo.com/')}>
              www.tutondo.com
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-black-300  text-sm font-extrabold flex text-right px-5 w-screen">
            App Designed by @zaccaria_cesaro
          </Text>
        </View>
      </View>
    </AndroidSafeArea>
  );
}
