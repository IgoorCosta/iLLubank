import { Text, View, StyleSheet, RefreshControl, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Button from '@/components/Button';
import { auth, db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { setDoc, addDoc, doc, getDocs, getDoc, collection, query, where } from 'firebase/firestore';

import ExtratoDiv from '@/components/ExtratoDiv';

export default function AboutScreen2() {
  getAuth().onAuthStateChanged((user) => {
    if(!user) router.replace('/');
  });

  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [transacoesEnviadas, setTransacoesEnvidas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
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
            ...querySnapshotOrigem.docs.map(doc => ({ 
              id: doc.id, 
              icon: "qrcode",
              title: "Transferência enviada",
              color: "red",
              name: doc.data().nome,
              valor: -doc.data().valor,
              value: `- ${new Intl.NumberFormat('pt-BR', { 
                style: 'currency',
                currency: 'BRL', 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              }).format(doc.data().valor)}`,
              data: doc.data().data,
              hora: doc.data().hora })),

            ...querySnapshotDestino.docs.map(doc => ({ 
              id: doc.id, 
              icon: "qrcode",
              title: "Transferência recebida",
              color: "green",
              name: doc.data().nomeOrigem,
              valor: doc.data().valor,
              value: `+ ${new Intl.NumberFormat('pt-BR', { 
                style: 'currency',
                currency: 'BRL', 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
              }).format(doc.data().valor)}`,
              data: doc.data().data,
              hora: doc.data().hora})),

            ...querySnapshotExtratoPagamento.docs.map(doc => ({ 
              id: doc.id, 
              icon: "barcode",
              title: doc.data().nome,
              color: "red",
              name: doc.data().nomeOrigem,
              valor: -doc.data().valor,
              value: `- ${new Intl.NumberFormat('pt-BR', { 
                style: 'currency',
                currency: 'BRL', 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
              }).format(doc.data().valor)}`,
              data: doc.data().data,
              hora: doc.data().hora})),

            ...querySnapshotExtratoRemuneração.docs.map(doc => ({ 
              id: doc.id, 
              icon: "money",
              title: doc.data().nome,
              color: "green",
              name: doc.data().nomeOrigem,
              valor: doc.data().valor,
              value: `+ ${new Intl.NumberFormat('pt-BR', { 
                style: 'currency',
                currency: 'BRL', 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2
              }).format(doc.data().valor)}`,
              data: doc.data().data,
              hora: doc.data().hora})),
          ];
          if(modoPanico == "1" || modoPanico == "2"){
            todasTransacoes = [
              ...todasTransacoes,
              ...querySnapshotExtratoPanico1.docs.map((doc) => ({ id: doc.id, 
                icon: "barcode",
                title: doc.data().nome,
                color: "red",
                name: doc.data().nomeOrigem,
                valor: -doc.data().valor,
                value: `- ${new Intl.NumberFormat('pt-BR', { 
                  style: 'currency',
                  currency: 'BRL', 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2
                }).format(doc.data().valor)}`,
                data: doc.data().data,
                hora: doc.data().hora})),
            ];
            if(modoPanico == "2"){
              todasTransacoes = [
                ...todasTransacoes,
                ...querySnapshotExtratoPanico2.docs.map((doc) => ({ id: doc.id, 
                  icon: "barcode",
                  title: doc.data().nome,
                  color: "red",
                  name: doc.data().nomeOrigem,
                  valor: -doc.data().valor,
                  value: `- ${new Intl.NumberFormat('pt-BR', { 
                    style: 'currency',
                    currency: 'BRL', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2
                  }).format(doc.data().valor)}`,
                  data: doc.data().data,
                  hora: doc.data().hora})),
              ];
              timer = 2;
            } else{
              timer = 1;
            }
          }

          const todasTransacoesOrdenadas = todasTransacoes.sort((a, b) => {
            const dateA = new Date(`${a.data.split('/').reverse().join('-')}T${a.hora}`);
            const dateB = new Date(`${b.data.split('/').reverse().join('-')}T${b.hora}`);
            return dateB - dateA;
          });

          if(modoPanico == "0" || (modoPanico == "1" && timer == 1) || (modoPanico == "2" && timer == 2)){
            setConta( todasTransacoes.reduce((total, transacao) => {
              return total + transacao.valor;
            }, 0));
            setLoading(false);
          }

          setTransacoesEnvidas(todasTransacoesOrdenadas);
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

  const mainPanel = async () => {
    try {
      setTransacoesEnvidas([]); // Resetando o array de transações enviadas
      setRefreshing(false); // Resetando o estado de refresh
      setFator(0); // Resetando o fator
      setModoPanico(null); // Resetando o modo pânico para null
      setfatorPanico1(0); // Resetando o fator pânico 1
      setfatorPanico2(0); // Resetando o fator pânico 2
      setConta(0);
      setLoading(true);
  
      router.replace('/mainPanel');
    } catch (error) {
    }
  };

  fetchData();

  useEffect(() => {
    return () => {
      setLoading(true); // Reseta o loading para true quando o componente for desmontado
    };
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
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
                <Text style={styles.textcabecalhoBox}>Histórico</Text>
              </View>
              <View style={styles.Box}>
                <View style={styles.Box}>
                  <Text style={styles.textmeioBox}>Saldo disponível de <Text style={{ fontWeight: 'bold' }}>R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(conta)}</Text></Text>
                </View>
              </View>
            </View>
  
            <View>
              {transacoesEnviadas.map(transacao => (
                <ExtratoDiv 
                  key={transacao.id}
                  icon={transacao.icon}
                  title={transacao.title}
                  name={transacao.name}
                  value={transacao.value}
                  data={transacao.data}
                  hora={transacao.hora}
                  color={transacao.color}
                />
              ))}
            </View>
            
            <View style={[styles.bottomBox2]}>
            </View>
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
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    backgroundColor: '#0c3c45',
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
  primaryContainer: {
    borderWidth: 0,
    borderColor: '#00a189',
    borderRadius: 18,
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
  bottomBox2: {
    width: "90%",
    height: "auto",
    margin: "5%",
    marginBottom:"1%",
    padding: 10,
    flex: 1,
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
