import {Image, ImageSourcePropType, Text, View} from 'react-native';
import '../../../global.css';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import icons from '../../../constants/icons';

import Scenario from './scenario';
import Zone from './zone';
import PaginaZona from '../zone/paginaZona';
import {useEffect} from 'react';
import Impostazioni from '../impostazioni/impostazioni';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from 'node_modules/@react-navigation/native/lib/typescript/commonjs/src';
import FirstView from '../../../pages/firstView';



const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}) => (
  <View className="flex-1 mt-1 flex flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? '#0061FF' : '#666876'}
      resizeMode="contain"
      className={`size-6 `}
    />
    <Text
      className={`${
        focused ? 'text-primary-300 font-extrabold' : 'text-black-200'
      } text-base w-full text-center mt-1`}>
      {title}
    </Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ZoneTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'white',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 1,
          minHeight: 100,
        },
      }}>
      <Tab.Screen
        name="Zone"
        component={Zone}
        options={{
          title: 'Zone',
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={icons.zone} title="Zone" />
          ),
        }}
      />
      <Tab.Screen
        name="Scenario"
        component={Scenario}
        options={{
          title: 'Scenario',
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <TabIcon focused={focused} icon={icons.scenario} title="Scenario" />
          ),
        }}
      />
      <Tab.Screen
        name="Impostazioni"
        component={Impostazioni}
        options={{
          title: 'Impostazioni',
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <TabIcon
              focused={focused}
              icon={icons.settings}
              title="Impostazioni"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="ZoneStack"
          component={ZoneTabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="PaginaZona"
          component={PaginaZona}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="FirstView"
          component={FirstView}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
