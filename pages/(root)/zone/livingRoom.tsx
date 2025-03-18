import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SecondaryHeader } from "../../../components/Header";
import icons from "../../../constants/icons";
import Slider from "@react-native-community/slider"; // https://github.com/callstack/react-native-slider
import { Dropdown } from "react-native-element-dropdown"; // https://github.com/hoaphantn7604/react-native-element-dropdown

export default function LivingRoom() {
  const Sources = [
    { label: "Tuner", value: "tuner" },
    { label: "MP3", value: "mp3" },
    { label: "PC", value: "pc" },
    { label: "Aux", value: "aux" },
    { label: "Bluetooth", value: "bluetooth" },
  ];

  const [power, setPower] = useState(false);
  const [mute, setMute] = useState(false);
  const [night, setNight] = useState(false);
  const [volume, setVolume] = useState(50);
  const [source, setSource] = useState("aux");

  return (
    <SafeAreaView>
      <View className="px-5">
        <SecondaryHeader title={"Living Room"} />
        <View className="flex flex-row my-5 gap-5 justify-between border-b pb-5 border-black-50">
          <TouchableOpacity
            onPress={() => {
              if (power == false) {
                setPower(true);
              } else {
                setPower(false);
              }
            }}
            className={`flex flex-row items-center gap-2 `}
          >
            <Image
              source={icons.power}
              className="size-11"
              tintColor={power ? "#228BE6" : "#D4D4D8"}
            />
            <Text
              className={
                power
                  ? "text-primary-300 font-base"
                  : "text-black-50 font-light"
              }
            >
              Power
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (mute == false) {
                setMute(true);
              } else {
                setMute(false);
              }
            }}
            className={`flex flex-row items-center gap-2 `}
          >
            <Image
              source={icons.mute}
              className="size-11"
              tintColor={mute ? "#228BE6" : "#D4D4D8"}
            />
            <Text
              className={
                mute
                  ? "text-primary-300 font"
                  : "text-black-50 font-light"
              }
            >
              Mute
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (night == false) {
                setNight(true);
              } else {
                setNight(false);
              }
            }}
            className={`flex flex-row items-center gap-2 `}
          >
            <Image
              source={icons.night}
              className="size-11"
              tintColor={night ? "#228BE6" : "#D4D4D8"}
            />
            <Text
              className={
                night
                  ? "text-primary-300 font"
                  : "text-black-50 font-light"
              }
            >
              Night
            </Text>
          </TouchableOpacity>
        </View>
        <View className="my-2.5">
          <Text className="text-black-300 text-lg font-medium mb-1">
            Volume:{" "}
            <Text className="text-2xl font-extrabold text-primary-300">
              {volume}
            </Text>
          </Text>
          <Slider
            minimumTrackTintColor="#228BE6"
            maximumTrackTintColor="#FFFFFF"
            step={1}
            minimumValue={0}
            maximumValue={100}
            value={volume}
            onValueChange={(e) => {
              setVolume(e);
            }}
          />
        </View>
        <View className="my-2.5">
          <Text className="text-black-300 text-lg font-medium mb-1">
            Source:
          </Text>
          <Dropdown
            data={Sources}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select source"
            value={source}
            onChange={(item) => {
              setSource(item.value);
            }}
            style={{
              padding: 20,
              backgroundColor: "white",
              borderRadius: "4%",
            }}
            containerStyle={{ borderRadius: "4%" }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
