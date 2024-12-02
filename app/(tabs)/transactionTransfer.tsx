import { Text, View, StyleSheet, RefreshControl, ScrollView, Alert, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Button from '@/components/Button';
import { auth, db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { setDoc, addDoc, doc, getDocs, getDoc, collection, query, where } from 'firebase/firestore';

import { useLocation } from "@/components/Location";

export default function AboutScreen3() {
  // Verifica se está logado
  getAuth().onAuthStateChanged((user) => {
    if(!user) router.replace('/');
  });

  const { latitude, longitude, errorMsg } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const [value, setValue] = useState('');
  const [destino, setDestino] = useState('');
  const [senha, setSenha] = useState('');
  const [showAppOptions, setShowAppOptions] = useState<boolean>(true);
  const [fator, setFator] = useState<number>(0);
  const [modoPanico, setModoPanico] = useState<string | null>(null);
  const [fatorPanico1, setfatorPanico1] = useState<number>(0);
  const [fatorPanico2, setfatorPanico2] = useState<number>(0);
  const [conta, setConta] = useState<number>(0);

  const infoLogin = async () => {
    try {
      if (user) {
        const userDocRef = doc(db, 'usuarios', user.uid); 
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setModoPanico(userData.modoPanico);
          setfatorPanico1(userData.fatorPanico1);
          setfatorPanico2(userData.fatorPanico2);

          if(modoPanico == "1"){
            setFator(fatorPanico1);
          } else if(modoPanico == "2"){
            setFator(fatorPanico2);
          } else{
            setFator(1);
          }

          const userId = user.uid;
          const transacoesRef = collection(db, 'transferencia');
          const extratosRef = collection(db, 'extrato');
          const extratosPanico1 = collection(db, 'extratoPanico1');
          const extratosPanico2 = collection(db, 'extratoPanico2');

          const q = query(
            transacoesRef,
            where('userIdOrigem', '==', userId) // Filtro por userIdOrigem
          );

          const qDestino = query(
            transacoesRef,
            where('userId', '==', userId) // Filtro por userIdDestino
          );

          const qExtratoPagamento = query(
            extratosRef,
            where('userId', '==', userId),
            where('nome', '==', 'Pagamento efetuado') 
          );

          const qExtratoRemuneracao = query(
            extratosRef,
            where('userId', '==', userId),
            where('nome', '==', 'Remuneração') 
          );

          const qExtratoPanico1 = query(
            extratosPanico1,
            where('userId', '==', userId)
          );

          const qExtratoPanico2 = query(
            extratosPanico2,
            where('userId', '==', userId)
          );

          const querySnapshotOrigem = await getDocs(q);
          const querySnapshotDestino = await getDocs(qDestino);
          const querySnapshotExtratoPagamento = await getDocs(qExtratoPagamento);
          const querySnapshotExtratoRemuneração = await getDocs(qExtratoRemuneracao);
          const querySnapshotExtratoPanico1 = await getDocs(qExtratoPanico1);
          const querySnapshotExtratoPanico2 = await getDocs(qExtratoPanico2);

          let timer = 0;
          let todasTransacoes = [
            ...querySnapshotOrigem.docs.map(doc => ({valor: -doc.data().valor,})),
            ...querySnapshotDestino.docs.map(doc => ({valor: doc.data().valor,})),
            ...querySnapshotExtratoPagamento.docs.map(doc => ({valor: -doc.data().valor,})),
            ...querySnapshotExtratoRemuneração.docs.map(doc => ({valor: doc.data().valor,})),
          ];
          if(modoPanico == "1" || modoPanico == "2"){
            todasTransacoes = [
              ...todasTransacoes,
              ...querySnapshotExtratoPanico1.docs.map((doc) => ({ valor: -doc.data().valor })),
            ];
            if(modoPanico == "2"){
              todasTransacoes = [
                ...todasTransacoes,
                ...querySnapshotExtratoPanico2.docs.map((doc) => ({ valor: -doc.data().valor })),
              ];
              timer = 2;
            } else{
              timer = 1;
            }
          }

          if(modoPanico == "0" || (modoPanico == "1" && timer == 1) || (modoPanico == "2" && timer == 2)){
            setConta( todasTransacoes.reduce((total, transacao) => {
              return total + transacao.valor;
            }, 0));
            setLoading(false);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const fetchData = async () => {
    try {
      await  infoLogin();
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const transferir = async () => {
    try{
      setShowAppOptions((prevState) => !prevState);
      const cleanedValue = parseFloat(value.trim());
      const cleanedEmail = destino.trim().toLowerCase();
      const cleanedPassword = senha;

      if(cleanedValue <= conta && cleanedValue > 0){ // Valor correto
        if (user) {
          const userDocRef = doc(db, 'usuarios', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()){
            if (userDoc.data().senhaTransferencias == cleanedPassword) { // Senha correta
              const usuariosRef = collection(db, 'usuarios');
              const querySnapshot = await getDocs(query(usuariosRef, where('email', '==', cleanedEmail)));

              if (!querySnapshot.empty) { // Email correto
                const transferenciasRef = collection(db, 'transferencia');
                const currentDate = new Date();

                await addDoc(transferenciasRef, {
                  userIdOrigem: user.uid,
                  userId: querySnapshot.docs[0].id,
                  nomeOrigem: userDoc.data().nome,
                  nome: querySnapshot.docs[0].data().nome,
                  valor: cleanedValue,
                  data: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
                  hora: currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  latitude: latitude,
                  longitude: longitude,
                });

                Alert.alert(
                  'Enviado', 'Transferência feita com sucesso!',
                  [{text: 'OK',onPress: () => console.log('Usuário reconheceu o erro'),},],
                  { cancelable: true }
                );
                router.replace('/mainPanel');
              }
            }
          }
        }
      }
    } catch (error: any){

    } finally{
      setShowAppOptions((prevState) => !prevState);
    }
  }

  const mainPanel = async () => {
    try {
      setFator(0);
      setModoPanico(null);
      setfatorPanico1(0);
      setfatorPanico2(0);
      setConta(0);
      setRefreshing(false);
      setValue('');
      setDestino('');
      setSenha('');
      setShowAppOptions(true);
      setLoading(true);
      router.replace('/mainPanel');
    } catch (error) {

    }
  };
  
  fetchData();

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#fffff" />
      ) : (
        <View style={styles.container}>
        <View style={styles.topContainer}>
        <View style={styles.toptop}></View>
        <View style={styles.topbottom}>
          <View style={styles.topDiv}>
            <TouchableOpacity style={styles.topDiv} onPress={() => mainPanel()}>
              <FontAwesome name="chevron-circle-left" size={30} color="#fff" />
            </TouchableOpacity>
            <View style={styles.nometopDiv}>
              <Text style={styles.text}>{"Voltar"}</Text>
            </View>
          </View>
        </View>
        </View>
      
        <View style={styles.bottomContainer}>
          <ScrollView style={styles.scrollContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View style={[styles.bottomBox,styles.primaryContainer]}>
              <View style={styles.Box}>
                <Text style={styles.textcabecalhoBox}>Qual é o valor da transferência?</Text>
              </View>
              <View style={styles.Box}>
                <View style={styles.Box}>
                  <Text style={styles.textmeioBox}>Saldo disponível de <Text style={{ fontWeight: 'bold' }}>R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(conta)}</Text></Text>
                </View>
              </View>
              <View style={styles.Box}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric" // Configura o teclado para entrada de números
                  placeholder="Digite o valor"
                  value={value}
                  onChangeText={setValue} // Atualiza o estado com o valor digitado
                />
              </View>
            </View>
            <View style={[styles.bottomBox,styles.primaryContainer]}>
              <View style={styles.Box}>
                <Text style={styles.textcabecalhoBox}>Para quem você quer transferir?</Text>
              </View>
              <View style={styles.Box}>
                <View style={styles.Box}>
                  <Text style={styles.textmeioBox}>Encontre um contato ou inicie uma nova transferência</Text>
                </View>
              </View>
              <View style={styles.Box}>
                <TextInput
                  style={styles.input}
                  keyboardType="default" // Configura o teclado para entrada de números
                  placeholder="Nome, CPF/CNPJ ou chave Pix"
                  value={destino}
                  onChangeText={setDestino} // Atualiza o estado com o valor digitado
                />
              </View>
            </View>
            <View style={[styles.bottomBox,styles.primaryContainer]}>
              <View style={styles.Box}>
                <View style={styles.Box}>
                  <Text style={styles.textmeioBox}>Digite a sua senha para realizar a operação</Text>
                </View>
              </View>
              <View style={styles.Box}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric" // Configura o teclado para entrada de números
                  placeholder="Senha"
                  value={senha}
                  onChangeText={setSenha} // Atualiza o estado com o valor digitado
                  secureTextEntry={true}
                />
              </View>
            </View>
            <View style={styles.footerContainer}>
              <Button theme="primary" icon="exchange" label="Transferir" onPress={transferir}/>
            </View>
  
            {showAppOptions ? (<View/>) : (
              <ActivityIndicator size="large" color="#00a189" />
            )}
          </ScrollView>
        </View>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c3c45',
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    width: "100%",
    height: "100%",
  },
  topContainer: {
    flex: 1, 
    backgroundColor: '#0c3c45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toptop: {
    flex: 1, 
  },
  topbottom: {
    flex: 2, // Ocupa 50% da tela
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topDiv: {
    flex: 1, // Ocupa 50% da tela
    flexDirection: 'row',
    paddingLeft: 10,
    alignItems:'flex-start',
    justifyContent: 'center',
  },
  nometopDiv: {
    flex: 9, // Ocupa 50% da tela
    paddingLeft: 20,
    paddingTop: 5,
    alignItems:'flex-start',
    justifyContent: 'center',
  },

  bottomContainer: {
    flex: 6, // Ocupa 50% da tela
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flex: 1, // O scrollView ocupa a parte restante da tela
    width: "100%",
    height: "100%",
  },

  bottomBox: {
    width: "90%",
    height: "auto",
    margin: "5%",
    marginBottom:"1%",
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    flex: 1,
  },
  primaryContainer: {
    borderWidth: 0,
    borderColor: '#00a189',
    borderRadius: 18,
  },
  Box: {
    flex: 1,
    padding: 4,
    flexDirection: 'row',
  },
  textcabecalhoBox: {
    color: '#0c3c45',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  textmeioBox: {
    paddingTop: 5,
    color: '#0c3c45',
    fontSize: 16,
    fontWeight: 'semibold',
    textAlign: 'left',
    width: '100%',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#00a189',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  footerContainer: {
    flex: 1,
    marginTop:"5%",
    width: "100%",
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  text: {
    fontSize: 16,
    color: '#fff',
  },

});
