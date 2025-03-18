import { Tabs } from 'expo-router';
import React from 'react';
import { ImageSourcePropType, Platform, View, Text, Image } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from '../../../hooks/useColorScheme';

import icons from "../../../constants/icons"

const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? "#0061FF" : "#666876"}
      resizeMode="contain"
      className={`size-6 `}
    />
    <Text
      className={`${
        focused
          ? "text-primary-300 font-rubik-medium"
          : "text-black-200 font-rubik"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
    screenOptions={{
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: "white",
        position: "absolute",
        borderTopColor: "#0061FF1A",
        borderTopWidth: 1,
        minHeight: 70,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Zone',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.zone} title="Zone"/>,
        }}
      />
      <Tabs.Screen
        name="scenario"
        options={{
          title: 'Scenario',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.scenario} title="Scenario"/>,
        }}
      />
    </Tabs>
  );
}
