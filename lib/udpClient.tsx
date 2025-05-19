import dgram from 'react-native-udp';
import {Buffer} from 'buffer';
import EventEmitter from 'events';
import {getIp} from '../pages/(root)/impostazioni/ip';

// EventEmitter per gestire eventi UDP custom
export const udpEvents = new EventEmitter();
const PORT = 53280; // Porta UDP utilizzata
let HOST = getIp(); // Indirizzo IP di destinazione

// Creazione del socket UDP client
export const client = dgram.createSocket({type: 'udp4'});

// Bind del client UDP alla porta specificata
client.bind(PORT, (err: any) => {
  if (err) {
    return;
  } else {
    console.log(`client UDP in ascolto - Port: ${PORT}`);
  }
});

// Eventi di stato del client UDP
client.on('listening', () => {
  console.log('client is listening');
});

client.on('error', (err: any) => {});

// Variabili globali per memorizzare dati ricevuti
export let Byte5: number | null = null;
export let Byte6: number | null = null;
export let Volume: number | null = null;
export let Nome: string | null = null;

// Gestione dei messaggi ricevuti dal server UDP
client.on('message', (msg, rinfo) => {
  // Se il messaggio inizia con 61, aggiorna il nome
  if (msg.length > 0 && msg[0] === 61) {
    const nome = msg.toString('utf-8', 4);
    Nome = nome;
    const names = {
      NomeChanged: nome,
    };
    console.log('NOME: ', nome);
    Object.entries(names).forEach(([event, value]) =>
      udpEvents.emit(event, value),
    );
  }

  // Se il messaggio inizia con 50, aggiorna Byte5, Byte6 e Volume
  if (msg.length > 0 && msg[0] === 50) {
    const [byte5, byte6, volume] = [msg[4], msg[6], msg[5]];

    Byte5 = byte5;
    Byte6 = byte6;
    Volume = volume;

    const events = {
      Byte5Changed: byte5,
      Byte6Changed: byte6,
    };
    Object.entries(events).forEach(([event, value]) =>
      udpEvents.emit(event, value),
    );
  }
});

// Timeout per il client UDP
const timeoutDuration = 5000;
let timeout: NodeJS.Timeout | null = null;

// Funzione per resettare il timeout del client
function resetTimeout() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    console.log('client timeout!');
  }, timeoutDuration);
}

resetTimeout();

// Aggiorna l'IP di destinazione quando viene emesso l'evento 'ipChanged'
udpEvents.on('ipChanged', newIp => {
  HOST = `${newIp}`;
  console.log('Indirizzo IP UDP aggiornato a:', HOST);
});

// Funzione per inviare tre byte tramite UDP
export async function sendThreeBytes(
  byte1: number,
  byte2: number,
  byte3: number,
) {
  try {
    const buffer = Buffer.from([byte1, byte2, byte3]);
    client.send(buffer, 0, buffer.length, PORT, HOST, err => {
      if (!err) {
        console.log('Tre byte inviati con successo!', byte1, byte2, byte3);
        console.log('Indirizzo IP:', HOST);
      }
    });
  } catch (error) {}
}

// Funzione per leggere lo stato di una zona tramite UDP, con timeout e gestione eventi
export async function leggiStatoZona(Zona: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      udpEvents.off('Byte5Changed', onResponse);
      reject(null);
    }, 3000);

    // Callback chiamata quando si riceve l'evento Byte5Changed
    const onResponse = (byte5: number) => {
      clearTimeout(timeout);
      udpEvents.off('Byte5Changed', onResponse);
      resolve(byte5);
    };

    udpEvents.on('Byte5Changed', onResponse);

    try {
      const buffer = Buffer.from([50, Zona, 0]);
      client.send(buffer, 0, buffer.length, PORT, HOST, err => {
        if (err) {
          clearTimeout(timeout);
          udpEvents.off('Byte5Changed', onResponse);
          reject(null);
        }
      });
    } catch (error) {
      clearTimeout(timeout);
      udpEvents.off('Byte5Changed', onResponse);
      reject(null);
    }
  });
}

// Funzione per inviare un reset UDP e leggere lo stato della zona 1
export function clearUdp() {
  sendThreeBytes(61, 1, 0);
  leggiStatoZona(1);
}
