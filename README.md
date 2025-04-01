##  PROBLEMA PER CUI RIESCO A INVIARE I DATI MA NON RIESCO A RICEVERLI
Bug dell'emulatore

- **SOLUZIONE 1**
Usare dispotivo android fisico

- **SOLUZIONE2**
> **IMPORTATE**: i primi tre passaggi sono per gli avd con un api 25+, in caso possiedi un avd con api 24- puoi saltare i passaggi e cominciare da telnet localhost e avviare direttamente metro con npm run android.

Avvia metro

```sh
# Using npm
npm start 

# OR using Yarn
yarn start
```
Se è la prima volta che usi l'avd avvia metro con 

```sh
# Using npm
npm run android 

# OR using Yarn
yarn run android
```

Dopo avere finito di configurare e installare l'apk chiudi l'emulatore e segui i passaggi.

Aprire il cmd ed entrare nella directory degli umulatori di android (".....\Android\Sdk\emulator")

Avvia l'emulatore con la feauture Wifi 

```sh
emulator.exe -avd <nome+emulatore> -feature -Wifi
```

Per vedere i nomi degli emulatori

```sh
emulator.exe -list-avds
```

Aprire un nuovo terminale e connettersi al dispositivo 

```sh
telnet localhost 5554
```
Fare l'autenticazione come scritto nel istruzione segnate nel terminale

Fare il redirect della porta sostituendo port:port con le porte da usare

```sh
redir add udp:<port>:<port>
```

Esci dal telnet

```sh
quit
```

[Scarica ed estrai il repository](https://github.com/danidis91/Port-forward-UDP)

Dentro "bin/debug" avviare l'exe "PortForward.exe"

Inserire i dati come da esempio:
//    IP: 127.0.0.1
//    Port: 53280
//    e infine clieccare su "Redirect UDP"

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
