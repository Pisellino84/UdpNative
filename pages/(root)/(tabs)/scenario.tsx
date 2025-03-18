import { MainHeader } from "../../../components/Header";
import icons from "../../../constants/icons";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
} from "react-native";

export default function Scenario() {
  return (
    <SafeAreaView>
      <View className="px-5">
        <MainHeader title={"Scenario"} icon={icons.scenario} />
        <View className="flex flex-col gap-5 my-5">
          <TouchableOpacity className="flex w-full p-5 bg-primary-300 rounded-2xl "><Text className="text-white font-medium text-xl uppercase w-full text-center">Party</Text></TouchableOpacity>
          <TouchableOpacity className="flex w-full p-5 bg-primary-300 rounded-2xl "><Text className="text-white font-medium text-xl uppercase w-full text-center">Dinner</Text></TouchableOpacity>
          <TouchableOpacity className="flex w-full p-5 bg-primary-300 rounded-2xl "><Text className="text-white font-medium text-xl uppercase w-full text-center">Weekend</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}