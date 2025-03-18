import {Text, TouchableOpacity, View} from 'react-native';
import { sendThreeBytes } from './lib/udpProtocol';



export default function Index() {
  
  return (
    <View style={{padding: 50}}>
      <TouchableOpacity onPress={() => {/* for(let i = 1; i <= 6; i++ ) */sendThreeBytes(4, 1, 2)}}>
        <Text>UDP</Text>
      </TouchableOpacity>
    </View>
  );
}
