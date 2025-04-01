##  PROBLEMA PER CUI RIESCO A INVIARE I DATI MA NON RIESCO A RICEVERLI
Bug dell'emulatore

- **SOLUZIONE 1**
Usare dispotivo android fisico

- **SOLUZIONE2**
> **IMPORTATE**: i primi tre passaggi sono per gli avd con un api 25+, in caso possiedi un avd con api 24- puoi skippare i primi tre passaggi e avviare direttamente metro con npm run android.

Avviare metro con:

```sh
# Using npm
npm start 

# OR using Yarn
yarn start
```
Se è la prima volta che usi l'avd avvia metro con: 

```sh
# Using npm
npm run android 

# OR using Yarn
yarn run android
```

Dopo avere finito di configurare e installare l'apk chiudi l'emulatore e segui i passaggi.

Aprire il cmd ed entrare nella directory degli umulatori di android (".....\Android\Sdk\emulator")

Digitare il comando (per vedere i nomi degli emulatore digitare "emulator.exe -list-avds")

```sh
# Using npm
emulator.exe -avd <nome+emulatore> -feature -Wifi
```
Aprire un nuovo terminale e connettersi al dispositivo con il comando

```sh
# Using npm
telnet localhost 5554
```
Fare l'autenticazione come scritto nel istruzione segnate nel terminale

Fare il redirect della porta sostituendo <port>:<port> con le porte da usare

```sh
# Using npm
redir add udp:<port>:<port>
```

Per uscire dal telnet

```sh
# Using npm
quit
```

[Scarica ed estrai il repository](https://github.com/danidis91/Port-forward-UDP)

Dentro "bin/debug" avviare l'exe "PortForward.exe"

Inserire i dati come da esempio:
//    IP: 127.0.0.1
//    Port: 53280
//    e infine clieccare su "Redirect UDP"


### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
