import {Text, TouchableOpacity, View} from 'react-native';
import { sendThreeBytes } from '../lib/udpProtocol';
import "../global.css"



export default function Index() {
  
  return (
    <View style={{padding: 50}}>
      <TouchableOpacity onPress={() => {/* for(let i = 1; i <= 6; i++ ) */sendThreeBytes(4, 1, 2)}}>
        <Text className='text-2xl text-red-600 font-rubik-bold'>UDP</Text>
      </TouchableOpacity>
    </View>
  );
}
