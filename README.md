##  PROBLEMA PER CUI RIESCO A INVIARE I DATI MA NON RIESCO A RICEVERLI
Bug dell'emulatore

- **SOLUZIONE 1**
Usare dispotivo android fisico

- **SOLUZIONE2**


```sh
# Using npm
npm run android 
```

Aprire un nuovo terminale e connettersi al dispositivo 

```sh
telnet localhost 5554
```
Fare l'autenticazione come scritto nelle istruzioni segnate nel terminale

Fare il redirect della porta sostituendo port:port con le porte da usare

```sh
redir add udp:<port>:<port>
```

Esci dal telnet

```sh
quit
```

ESEMPIO

```sh
telnet localhost 5554
auth Xt6qJrCst0dgJNbs
redir add udp:53280:53280
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
