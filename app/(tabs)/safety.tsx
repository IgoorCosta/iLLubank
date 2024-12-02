import { Text, View, StyleSheet, RefreshControl, ScrollView, Alert, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Button from '@/components/Button';
import { auth, db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { setDoc, addDoc, doc, getDocs, getDoc, collection, query, where } from 'firebase/firestore';

import { useLocation } from "@/components/Location";

export default function AboutScreen12() {
  // Verifica se está logado
  getAuth().onAuthStateChanged((user) => {
    if(!user) router.replace('/');
  });

  const { latitude, longitude, errorMsg } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const user = auth.currentUser;
  const [fator, setFator] = useState<number>(0);
  const [modoPanico, setModoPanico] = useState<string | null>(null);
  const [fatorPanico1, setfatorPanico1] = useState<number>(0);
  const [fatorPanico2, setfatorPanico2] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [distancia, setDistancia] = useState<number>(0);
  const [mov, setMov] = useState<number>(0);

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    lat1 = parseFloat(lat1);
    lon1 = parseFloat(lon1);
    lat2 = parseFloat(lat2);
    lon2 = parseFloat(lon2);

    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180); // Converter de graus para radianos
    const dLon = (lon2 - lon1) * (Math.PI / 180); // Converter de graus para radianos
    
    // Fórmula Haversine
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c; // Distância em km
    
    return distancia;
  };

  const infoLogin = async () => {
    try {
      if (user) {
        const userDocRef = doc(db, 'usuarios', user.uid); 
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          let scoreH = 100;
          const userData = userDoc.data();
          setModoPanico(userData.modoPanico);
          setfatorPanico1(userData.fatorPanico1);
          setfatorPanico2(userData.fatorPanico2);

          if(modoPanico == "1"){
            setFator(fatorPanico1);
            scoreH -= 30;
          } else if(modoPanico == "2"){
            setFator(fatorPanico2);
            scoreH -= 60;
          } else{
            setFator(1);
          }

          const userId = user.uid;
          const transacoesRef = collection(db, 'transferencia');

          const q = query(
            transacoesRef,
            where('userIdOrigem', '==', userId) // Filtro por userIdOrigem
          );

          const qDestino = query(
            transacoesRef,
            where('userId', '==', userId) // Filtro por userIdDestino
          );

          const hoje = new Date();
          const dia = String(hoje.getDate()).padStart(2, '0'); // Formata o dia como 02
          const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Formata o mês como 11
          const ano = String(hoje.getFullYear()).slice(-2); // Extrai os dois últimos dígitos do ano (24)
          const hojeString = `${dia}/${mes}/${ano}`;
          
          const querySnapshotOrigem = await getDocs(q);
          const querySnapshotDestino = await getDocs(qDestino);

          let countMovimentacoesHoje = 0;
          querySnapshotOrigem.forEach((doc) => {
            const dataDoc = doc.data().data; // Supondo que a data do documento esteja no formato DD/MM/YY
            if (dataDoc === hojeString) {
              countMovimentacoesHoje++; // Incrementa o contador quando a data coincidir com hoje
            }
          });
          querySnapshotDestino.forEach((doc) => {
            const dataDoc = doc.data().data; // Supondo que a data do documento esteja no formato DD/MM/YY
            if (dataDoc === hojeString) {
              countMovimentacoesHoje++; // Incrementa o contador quando a data coincidir com hoje
            }
          });

          setMov(countMovimentacoesHoje);
          if(mov > 0){
            scoreH -= 20;
          }

          setDistancia(calcularDistancia(userData.latitudeSegura, userData.longitudeSegura, latitude, longitude));
          if(distancia > 1){
            scoreH -= 20;
          }

          setScore(scoreH);
        }
      }
    } catch (error) {

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
      setRefreshing(false);
      setFator(0);
      setModoPanico(null);
      setScore(0);
      setDistancia(0);
      setMov(0);
  
      router.replace('/mainPanel');
    } catch (error) {

    }
  };
  
  fetchData();

  return (
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
              <Text style={styles.textcabecalhoBox}>Score de <Text style={{ fontWeight: 'bold',color: 'red', }}>{score}</Text></Text>
            </View>
            <View style={styles.Box}>
              <View style={styles.Box}>
                <Text style={styles.textmeioBox}>Nível de segurança do perfil</Text>
              </View>
            </View>
          </View>
          <View style={[styles.bottomBox,styles.primaryContainer]}>
            <View style={styles.Box}>
              <Text style={styles.textcabecalhoBox}>Modo pânico</Text>
            </View>
            <View style={styles.Box}>
              <View style={styles.Box}>
                <Text style={styles.textmeioBox}>O <Text style={{ fontWeight: 'bold', }}>nível {modoPanico}</Text> está em vigor no momento</Text>
              </View>
            </View>
          </View>

          <View style={[styles.bottomBox,styles.primaryContainer]}>
            <View style={styles.Box}>
              <Text style={styles.textcabecalhoBox}>Localização</Text>
            </View>
            <View style={styles.Box}>
              <View style={styles.Box}>
                <Text style={styles.textmeioBox}>A localização segura está a <Text style={{ fontWeight: 'bold', }}>{distancia.toFixed(2)} km</Text> de distância</Text>
              </View>
            </View>
          </View>

          <View style={[styles.bottomBox,styles.primaryContainer]}>
            <View style={styles.Box}>
              <Text style={styles.textcabecalhoBox}>Movimentações</Text>
            </View>
            <View style={styles.Box}>
              <View style={styles.Box}>
                <Text style={styles.textmeioBox}>Realizou <Text style={{ fontWeight: 'bold', }}>{mov}</Text> movimentações estranhas nas últimas 12 horas</Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
