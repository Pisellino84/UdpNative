import dgram from 'react-native-udp';
import {Buffer} from 'buffer';
import {Alert} from 'react-native';

// PROBLEMa PER CUI RIESCO A INVIARE I DATI MA NON RIESCO A RICEVERLI            
//    bug dell'emulatore,

// SOLUZIONE 1
//    usare dispotivo android fisico     

// SOLUZIONE2
//    avviare metro con npm start (se è la prima volta che usi l'emulatore avvia metro con npm run android, dopo avere finito di configurare e installare l'apk chiudi l'emulatore e segui i passaggi)
//    Aprire il cmd ed entrare nella directory degli umulatori di android ("C:\Users\resea\AppData\Local\Android\Sdk\emulator")
//    digitare il comando "emulator.exe -avd <nome+emulatore> -feature -Wifi"
//    aprire un nuovo terminale e connettersi al dispositivo con il comando "telnet localhost 5554"
//    fare l'autenticazione come scritto nel istruzione segnate nel terminale
//    fare il redirect della porta digitando "redir add udp:53280:53280" (la porta 53280 è soggettiva, puoi scegliere la porta che vuoi)
//    digitare "quit" per uscire dal telnet
//    https://github.com/danidis91/Port-forward-UDP // Scarica ed estrai il repository
//    dentro "bin/debug" avviare l'exe "PortForward.exe" 
//    inserire i dati come da esempio:
//    IP: 127.0.0.1
//    Port: 53280
//    e infine clieccare su "Redirect UDP"

const PORT = 53280;
const HOST = '192.168.30.211'; 
const client = dgram.createSocket({type: 'udp4'}); // Crea il client una sola volta


client.bind(PORT, (err: any) => {
  // Associa il client all'avvio
  if (err) {
    console.error("Errore durante l'associazione del client:", err);
  } else {
    console.log(
      `client UDP in ascolto - Port: ${PORT}`,
    );
  }
});

client.on('listening',  () => {
  console.log('client is listening');
});

client.on('error', (err: any) => {
  console.error("Errore del client:", err);
  Alert.alert('Errore del client');
});


client.on('message', function (msg, rinfo) {
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
    console.log("client timeout!");
    // Handle timeout logic here
  }, timeoutDuration);
}

// Initialize timeout when the client is bound
resetTimeout();



  

export async function sendThreeBytes(
  byte1: number,
  byte2: number,
  byte3: number,
) {
  try {
    const buffer = Buffer.from([byte1, byte2, byte3]);
    client.send(buffer, 0, buffer.length, PORT, HOST, err => {
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
    client.send(buffer, 0, buffer.length, PORT, HOST, err => {
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
