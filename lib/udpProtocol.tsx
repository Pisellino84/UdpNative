import dgram from 'react-native-udp';
import {Buffer} from 'buffer';
import {Alert} from 'react-native';

// POSSIBILI PROBLEMI PER CUI RIESCO A INVIARE I DATI MA NON RIESCO A RICEVERLI:
//    1. Bug dell'emulatore (se possibile bisognerebbe provare su un dispositivo fisico);
//    2. Problemi di rete (router, firewall(provato a disattivare insieme all'antivirus), antivirus, etc.);
//    3. Problemi di configurazione dell' UDP (porta, IP, etc.);

const PORT = 53280;
const HOST = '192.168.30.211'; 
const socket = dgram.createSocket({type: 'udp4'}); // Crea il socket una sola volta

socket.bind(PORT, (err: any) => {
  // Associa il socket all'avvio
  if (err) {
    console.error("Errore durante l'associazione del socket:", err);
  } else {
    console.log(
      `Socket UDP in ascolto - Port: ${PORT}`,
    );
  }
});

socket.on('error', (err: any) => {
  console.error("Errore del socket:", err);
  Alert.alert('Errore del socket');
});


socket.on('message', function (msg, rinfo) {
  console.log('Message received (hex)', msg.toString("hex"), rinfo);
  console.log('Message received (string)', msg.toString(), rinfo);
  console.log('Message received (buffer)', msg, rinfo);
});

const timeoutDuration = 5000; // 5000 millisecondi = 5 secondi
let timeout: NodeJS.Timeout | null = null;

function resetTimeout() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    console.log("Socket timeout!");
    // Handle timeout logic here
  }, timeoutDuration);
}

// Initialize timeout when the socket is bound
resetTimeout();


  

export async function sendThreeBytes(
  byte1: number,
  byte2: number,
  byte3: number,
) {
  try {
    const buffer = Buffer.from([byte1, byte2, byte3]);
    socket.send(buffer, 0, buffer.length, PORT, HOST, err => {
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
    const buffer = Buffer.from([50, Zona, 0]);
    socket.send(buffer, 0, buffer.length, PORT, HOST, err => {
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
