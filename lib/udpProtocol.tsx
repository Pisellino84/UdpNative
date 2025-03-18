import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

const remotePort = 53280;
const remoteHost = '192.168.30.211';
const socket = dgram.createSocket({ type: 'udp4' }); // Crea il socket una sola volta

socket.bind(remotePort, (err: any) => { // Associa il socket all'avvio
    if (err) {
        console.error('Errore durante l\'associazione del socket:', err);
    } else {
        console.log('Socket associato con successo!');
    }
});

export async function sendThreeBytes(byte1: number, byte2: number, byte3: number) {
    try {
        const buffer = Buffer.from([byte1, byte2, byte3]);
        socket.send(buffer, 0, buffer.length, remotePort, remoteHost, (err) => {
            if (err) {
                console.error('Errore durante l\'invio dei byte:', err);
            } else {
                console.log('Tre byte inviati con successo!', byte1, byte2, byte3);
            }
        });
    } catch (error) {
        console.error('Errore:', error);
    }
}