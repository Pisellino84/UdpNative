import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import '../../../global.css';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import icons from '../../../constants/icons';

import Scenario, {EditScenario, EditSetting} from './scenario';
import Zone from './zone';
import PaginaZona from '../zone/paginaZona';
import Impostazioni from '../impostazioni/impostazioni';
import IpPage from '../impostazioni/ip';
import {CreateScenario} from './scenario';
import About from '../impostazioni/about';
import {useLoading, LoadingProvider} from '../../../lib/useIsLoading';

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
  const {isUseLoading} = useLoading();
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
        tabBarButton: ({children, onPress}) => (
          <TouchableOpacity
            className="flex-1 pb-4 justify-center items-center"
            onPress={onPress}
            /* disabled={isLoading} */
          >
            {children}
          </TouchableOpacity>
        ),
        headerShown: false,
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
    <LoadingProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="IpPage"
            component={IpPage}
            options={{headerShown: false}}
          />
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
            name="CreateScenario"
            component={CreateScenario}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="EditScenario"
            component={EditScenario}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="EditSetting"
            component={EditSetting}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="About"
            component={About}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LoadingProvider>
  );
};

export default App;
