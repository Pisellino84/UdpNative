import { View, Image, Text, TouchableOpacity } from "react-native";
import React from "react";
import icons from "../constants/icons";
import { router } from "expo-router";

interface Props {
  icon?: any;
  title: String;
  onPress?: () => void | undefined;
}

export function MainHeader({ icon = icons.standard, title }: Props) {
  return (
    <View className="flex flex-row justify-between items-center border-b pb-5 border-primary-200">
      <View className="flex flex-row gap-3 items-center">
        <Image source={icon} className="size-11 " />
        <View className="flex flex-col">
          <Text className="text-black-100 text-sm font-rubik-light">
            Tutondo LiveMT
          </Text>
          <Text className="font-rubik-bold text-2xl">{title}</Text>
        </View>
      </View>

      <Image source={icons.tutondo} className="size-9" />
    </View>
  );
}

export function SecondaryHeader({ title }: Props) {
  return (
    <>
      <View className="flex flex-row justify-between items-center border-b pb-5 border-primary-200">
        <View className="flex flex-row gap-3 items-center">
          <TouchableOpacity
            className="bg-primary-200 rounded-full p-3"
            onPress={() => {router.back() ?? router.push('/')}}
          >
            <Image source={icons.backArrow} className="size-6 " />
          </TouchableOpacity>
          <View className="flex flex-col">
            <Text className="text-black-100 text-sm font-rubik-light">
              Tutondo LiveMT
            </Text>
            <Text className="font-rubik-bold text-2xl">{title}</Text>
          </View>
        </View>

        <Image source={icons.tutondo} className="size-9" />
      </View>
    </>
  );
}
