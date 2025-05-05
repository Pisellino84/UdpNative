import dgram from 'react-native-udp';
import {Buffer} from 'buffer';
import {Alert} from 'react-native';
import EventEmitter from 'events';
import { getIp } from '../pages/(root)/impostazioni/ip';
import { useEffect } from 'react';

export const udpEvents = new EventEmitter();
const PORT = 53280;
let HOST = getIp(); // Inizializza con l'IP iniziale

export const client = dgram.createSocket({type: 'udp4'});

client.bind(PORT, (err: any) => {
  if (err) {
    // console.error("Errore durante l'associazione del client:", err);
    return;
  } else {
    console.log(`client UDP in ascolto - Port: ${PORT}`);
  }
});

client.on('listening', () => {
  console.log('client is listening');
});

client.on('error', (err: any) => {
  // console.error('Errore del client:', err);
});

export let Byte5: number | null = null;
export let Byte6: number | null = null;
export let Volume: number | null = null;
export let Nome: string | null = null;

client.on('message', (msg, rinfo) => {
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

  if (msg.length > 0 && msg[0] === 50) {
    /*  console.log('Message received (buffer)', msg, rinfo);  */
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

const timeoutDuration = 5000;
let timeout: NodeJS.Timeout | null = null;

function resetTimeout() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    console.log('client timeout!');
  }, timeoutDuration);
}

resetTimeout();

// Ascolta l'evento 'ipChanged' e aggiorna HOST
udpEvents.on('ipChanged', (newIp) => {
  HOST = `${newIp}`;
  console.log('Indirizzo IP UDP aggiornato a:', HOST);
});

export async function sendThreeBytes(
  byte1: number,
  byte2: number,
  byte3: number,
) {
  try {
    const buffer = Buffer.from([byte1, byte2, byte3]);
    client.send(buffer, 0, buffer.length, PORT, HOST, err => {
      if (err) {
        // console.error("Errore durante l'invio dei byte:", err);
      } else {
        console.log('Tre byte inviati con successo!', byte1, byte2, byte3);
        console.log("Indirizzo IP:", HOST);
      }
    });
  } catch (error) {
    // console.error('Errore:', error);
  }
}

export async function leggiStatoZona(Zona: number) {
  try {
    const buffer = Buffer.from([50, Zona, 0]);
    client.send(buffer, 0, buffer.length, PORT, HOST, err => {
      if (err) {
        // console.error("Errore durante l'invio della lettura zona:", err);
      } else {
        /* console.log('lettura zona avvenuta successo!'); */
      }
    });
  } catch (error) {
    // console.error('Errore:', error);
  }
}

export function clearUdp() {
  sendThreeBytes(61, 1 , 0)
  leggiStatoZona(1)
}