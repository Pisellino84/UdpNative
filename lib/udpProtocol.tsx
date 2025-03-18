import dgram from 'react-native-udp';
import {Buffer} from 'buffer';
import {Alert} from 'react-native';

const remotePort = 53280;
const remoteHost = '192.168.30.211';
const socket = dgram.createSocket({type: 'udp4', debug: true}); // Crea il socket una sola volta

socket.bind(remotePort, (err: any) => {
  // Associa il socket all'avvio
  if (err) {
    console.error("Errore durante l'associazione del socket:", err);
  } else {
    console.log(
      `Socket UDP in ascolto - Port: ${remotePort} - IP: ${remoteHost}`,
    );
  }
});


socket.on('message', function (msg, rinfo) {
    console.log('Message received', /* msg.toString() */ rinfo.toString());
  });
  

export async function sendThreeBytes(
  byte1: number,
  byte2: number,
  byte3: number,
) {
  try {
    const buffer = Buffer.from([byte1, byte2, byte3]);
    socket.send(buffer, 0, buffer.length, remotePort, remoteHost, err => {
      if (err) {
        console.error("Errore durante l'invio dei byte:", err);
        Alert.alert('Errore');
      } else {
        console.log('Tre byte inviati con successo!', byte1, byte2, byte3);
      }
    });
  } catch (error) {
    console.error('Errore:', error);
  }
}

export async function leggiStatoZona(Zona: number) {
  try {
    const buffer = Buffer.from([50, Zona, 1]);
    socket.send(buffer, 0, buffer.length, remotePort, remoteHost, err => {
      if (err) {
        console.error("Errore durante l'invio della lettura zona:", err);
        Alert.alert('Errore');
      } else {
        console.log('lettura zona avvenuta successo!');
      }
    });
  } catch (error) {
    console.error('Errore:', error);
  }
}
