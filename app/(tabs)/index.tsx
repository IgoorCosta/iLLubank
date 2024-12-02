import { Text, View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import ImageViewer from "@/components/ImageViewer";
import Button from '@/components/Button';
import CustomTextInput from '@/components/CustomTextInput';
import * as LocalAuthentication from 'expo-local-authentication';

import { auth, db } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const PlaceholderImage = require('@/assets/images/icon.png');

export default function Index() {
  const [showAppOptions, setShowAppOptions] = useState<boolean>(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    try{
      setShowAppOptions((prevState) => !prevState);
      const cleanedEmail = email.trim();
      const cleanedPassword = password.trim();
      const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, '123456');

      if (userCredential && userCredential.user) {
        const userDocRef = doc(db, 'usuarios', userCredential.user.uid); // Referência ao documento do usuário
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()){
          const modoPanico = userDoc.data().modoPanico;
          if (userDoc.data().senhaNormal == cleanedPassword && modoPanico == 0) { // Normal
            router.replace('/mainPanel');
          } else if(userDoc.data().senhaNormal == cleanedPassword && modoPanico != 0) { // Pânico2
            await updateDoc(userDocRef, {modoPanico: 2});
            router.replace('/mainPanel');
          } else if(userDoc.data().senhaPanico == cleanedPassword && modoPanico == 2) { // Pânico2
            router.replace('/mainPanel');
          } else if(userDoc.data().senhaPanico == cleanedPassword && modoPanico != 2) { // Pânico1
            await updateDoc(userDocRef, {modoPanico: 1});
            router.replace('/mainPanel');
          } else{
            Alert.alert('Ocorreu um erro', 'Não foi possível carregar a conta\nPor favor, tente novamente',
              [{text: 'OK',onPress: () => console.log('Usuário reconheceu o erro'),},],
              { cancelable: true }
            );
          }
        } else { Alert.alert('Ocorreu um erro', 'Não foi possível carregar a conta\nPor favor, tente novamente',
          [{text: 'OK',onPress: () => console.log('Usuário reconheceu o erro'),},],
          { cancelable: true }
        );
      }
      }else { Alert.alert('Ocorreu um erro', 'Não foi possível carregar a conta\nPor favor, tente novamente',
        [{text: 'OK',onPress: () => console.log('Usuário reconheceu o erro'),},],
        { cancelable: true }
      );
    }
    } catch (error: any){

    } finally{
      setShowAppOptions((prevState) => !prevState);
    }
  }

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        alert('O dispositivo não suporta autenticação biométrica.');
        return;
      }

      // Verifica se há alguma biometria cadastrada no dispositivo
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        alert('Nenhuma biometria cadastrada no dispositivo.');
        return;
      }

      // Inicia a autenticação
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para entrar',
        fallbackLabel: 'Usar senha',
        disableDeviceFallback: false, // Se você quiser permitir autenticação alternativa (senha)
      });

      // Verifica se a autenticação foi bem-sucedida
      if (authResult.success) {
        const cleanedEmail = email.trim();
        if(email) {
          const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, '123456');

          if (userCredential && userCredential.user) {
            const userDocRef = doc(db, 'usuarios', userCredential.user.uid); // Referência ao documento do usuário
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()){
              const modoPanico = userDoc.data().modoPanico;
              if(modoPanico == 2) { // Pânico2
              } else if(modoPanico != 2) { // Pânico1
                await updateDoc(userDocRef, {modoPanico: 1});
              }
              router.replace('/mainPanel');
            } 
          } else{
            Alert.alert(
              'Ocorreu um erro', 'Não foi possível carregar a conta\nPor favor, tente novamente',
              [{text: 'OK',onPress: () => console.log('Usuário reconheceu o erro'),},],
              { cancelable: true }
            );
        }} 
        else {
            Alert.alert(
              'Ocorreu um erro', 'Não foi possível carregar a conta\nPor favor, tente novamente',
              [{text: 'OK',onPress: () => console.log('Usuário reconheceu o erro'),},],
              { cancelable: true }
            );
        }
      }
    } catch (error) {
      console.error('Erro durante a autenticação:', error);
    } 
  };

  const createTest = async () => {
    router.replace('/createTest');
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={createTest}>
            <ImageViewer imgSource={PlaceholderImage} />
          </TouchableOpacity>
        </View>

        {!showAppOptions ? (<View/>) : (
          <View style={styles.iconContainer}>
            <FontAwesome name="lock" size={20} color="#fff" />
          </View>
        )}
        {showAppOptions ? (<View/>) : (
          <View style={styles.iconContainer}>
            <ActivityIndicator size="large" color="#00a189" />
          </View>
        )}
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.footer2Container}>
          <CustomTextInput 
            theme="primary" 
            label="Login" 
            keyboard="default"
            placeholder="Nome, CPF/CNPJ ou chave Pix"
            value={email}
            secureTextEntry={false}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.footer2Container}>
          <CustomTextInput 
            theme="primary" 
            label="Senha"
            keyboard="numeric"
            placeholder="Digite sua senha"
            value={password}
            secureTextEntry={true}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.footerContainer}>
          <Button theme="primary" icon="sign-in" label="Login" onPress={signIn}/>
        </View>

        <View style={styles.footerContainer}>
          <Button theme="primary" icon="500px" label="Usar senha do celular" onPress={handleBiometricAuth}/>
        </View>
      </View>

      <View style={styles.refContainer}>
        <Text style={styles.text}>Versão 0.0.4</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: "100%",
    height: "100%",
  },
  topContainer: {
    flex: 6, // Ocupa 50% da tela
    backgroundColor: '#0c3c45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomContainer: {
    flex: 4, // Ocupa 50% da tela
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer2Container: {
    flex: 4,
    width: "100%",
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footerContainer: {
    flex: 2,
    width: "100%",
    marginBottom: "1%",
    marginTop: "4%",
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  refContainer: {
    flex: 1 , // Ocupa 50% da tela
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },

  text: {
    color: '#010101',
  },
});
