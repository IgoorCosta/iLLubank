<h1 align="center"> iLLuBank 👋</h1>
<p align="center">
    <img loading="lazy" src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge"/>
</p>

# Comandos mais utilizados
cd %USERPROFILE%

git init

git add .

git commit -m "Primeiro commit"

git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git

git branch -M main # Define o branch principal como "main"

git push -u origin main

# Referências

Tutorial: **https://docs.expo.dev/tutorial/create-your-first-app/**

Tutorial: **https://docs.expo.dev/tutorial/eas/android-production-build/**

Tutorial: **https://www.youtube.com/watch?v=a0KJ7l5sNGw**

Instalar Git: **https://git-scm.com/downloads**

Instalar Node: **https://nodejs.org/en**

Instalar Expo: **https://docs.expo.dev/get-started/set-up-your-environment/**

Conta Firebase: **https://console.firebase.google.com/**

Criar uma conta Expo

# Criação do projeto
1. Criar projeto: **npx create-expo-app@latest illubank**
2. Resetar projeto exemplo: **npm run reset-project**
3. Iniciar: **npx expo start**

npx expo install --fix

# Vincular o projeto ao EAS
1. Instalar biblioteca: **npx expo install expo-dev-client**
2. Instalar EAS:  **npm install -g eas-cli**
3. Realizar login: **eas login**
4. Cadastro no GIT:
5. Inicializar EAS: **eas init**
   - Modifica app.json para incluir extra.eas.projectIde atualiza seu valor com o ID exclusivo (ID: 0525e414-9b79-410a-823d-cdebc09b069e)
6. Configurar projeto: **eas build:configure**
   - Cria eas.json na raiz do diretório
  
# Compilação para o perfil de desenvolvimento
1. **eas build --platform android --profile development**
2. **npx expo start**
# Compilação de distribuição interna
1. **eas build --platform android --profile preview**

# Bibliotecas secundárias
1. **npx expo install expo-image**
2. **npx expo install expo-location**
3. **npx expo install expo-local-authentication**
   
# Banco de dados na núvem - Firebase
1. **npx expo install firebase**
2. **npx expo customize metro.config.js**
3. **npx expo install react-native-screens react-native-safe-area-context**
4. **npx expo install @react-native-async-storage/async-storage**
5. **npm install @react-native-async-storage/async-storage**
   
## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
