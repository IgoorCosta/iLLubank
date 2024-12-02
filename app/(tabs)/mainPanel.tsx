import { Text, View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { auth, db } from '@/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { getDocs, doc, getDoc, collection, query, where } from 'firebase/firestore';

export default function AboutScreen0() {
  // Verifica se está logado
  getAuth().onAuthStateChanged((user) => {
    if(!user) router.replace('/');
  });

  const [refreshing, setRefreshing] = useState(false);
  const user = auth.currentUser;
  const [fator, setFator] = useState<number>(1);
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
  const [modoPanico, setModoPanico] = useState<string | null>(null);
  const [fatorPanico1, setfatorPanico1] = useState<number>(1);
  const [fatorPanico2, setfatorPanico2] = useState<number>(1);
  const [conta, setConta] = useState<number>(1);
  const [credito, setCredito] = useState<number>(1);
  const [investimento, setInvestimento] = useState<number>(1);
  const [emprestimo, setEmprestimo] = useState<number>(1);
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(false);

  const infoLogin = async () => {
    try {
      if (user) {
        const userDocRef = doc(db, 'usuarios', user.uid); 
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNomeUsuario(userData.nome);
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

          setCredito(userData.limiteCredito * fator);
          setInvestimento(userData.investimentos * fator);
          setEmprestimo(userData.emprestimo * fator);

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
  
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Faz logout primeiro
  
      // Reseta as variáveis após logout
      setFator(0);
      setNomeUsuario(null);
      setModoPanico(null);
      setConta(0);
      setCredito(0);
      setInvestimento(0);
      setEmprestimo(0);
      setIsBalanceVisible(false);
  
      router.replace('/'); // Redireciona para a página inicial
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prevState) => !prevState);
  };

  fetchData();

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.toptop}></View>
        <View style={styles.topbottom}>
          <View style={styles.topDiv}>
            <View style={styles.topDiv}>
              <FontAwesome name="user-circle-o" size={26} color="#fff" />
            </View>
            <View style={styles.nometopDiv}>
              <Text style={styles.text}>{nomeUsuario}</Text>
            </View>
          </View>

          <View style={styles.topDiv}>
            <View style={styles.toptop}>
              <TouchableOpacity onPress={toggleBalanceVisibility}>
                <FontAwesome name={isBalanceVisible ? 'eye' : 'eye-slash'} size={23} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.toptop}>
              <FontAwesome name="search" size={23} color="#fff" />
            </View>
            <View style={styles.toptop}>
              <FontAwesome name="cog" size={23} color="#fff" />
            </View>
            <View style={styles.toptop}>
              <TouchableOpacity onPress={handleLogout}>
                <FontAwesome name="sign-out" size={23} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    
      <View style={styles.bottomContainer}>
        <ScrollView style={styles.scrollContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={[styles.bottomBox1]}>
            <TouchableOpacity style={styles.Box1} onPress={() => router.replace('/transactionTransfer')}>
              <View style={styles.icone}>
                <FontAwesome name="random" size={25} color="#00a189" />
              </View>
              <View style={styles.legenda}>
                <Text style={styles.textWithIcon1}>Pix e</Text>
                <Text style={styles.textWithIcon1}>Transferir</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Box1}>
              <View style={styles.icone}>
                <FontAwesome name="barcode" size={25} color="#00a189" />
              </View>
              <View style={styles.legenda}>
                <Text style={styles.textWithIcon1}>Pagar</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Box1}>
              <View style={styles.icone}>
                <FontAwesome name="credit-card" size={25} color="#00a189" />
              </View>
              <View style={styles.legenda}>
                <Text style={styles.textWithIcon1}>Meus</Text>
                <Text style={styles.textWithIcon1}>Cartões</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.Box1} onPress={() => router.replace('/safety')}>
              <View style={styles.icone}>
                <FontAwesome name="lock" size={25} color="#00a189" />
              </View>
              <View style={styles.legenda}>
                <Text style={styles.textWithIcon1}>Segurança</Text>
              </View>
            </TouchableOpacity>

          </View>

          <View style={[styles.bottomBox,styles.primaryContainer]}>
            <View style={styles.Box}>
              <Text style={styles.textcabecalhoBox}>Conta</Text>
            </View>
            <View style={styles.Box}>
              <View style={styles.Box}>
                <Text style={styles.textmeioBox}>Saldo atual:</Text>
              </View>
              <View style={styles.Box}>
                <Text style={styles.textmeiodireitaBox}>{isBalanceVisible ? `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(conta)}` : '****'}</Text>
              </View>
            </View>
            <View style={styles.Box}>
              <TouchableOpacity style={styles.textWithIcon} onPress={() => router.replace('/transactionStatement')}>
                  <FontAwesome name="arrow-circle-o-down" size={25} color="#0c3c45" />
                  <Text style={styles.textinfoBox}>Acessar extrato</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.bottomBox,styles.primaryContainer]}>
            <View style={styles.Box}>
              <Text style={styles.textcabecalhoBox}>Cartão de Crédito</Text>
            </View>
            <View style={styles.Box}>
              <View style={styles.Box}>
                <Text style={styles.textmeioBox}>Limite atual:</Text>
              </View>
              <View style={styles.Box}>
                <Text style={styles.textmeiodireitaBoxpre}>{isBalanceVisible ? `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(credito)}` : '****'}</Text>
              </View>
            </View>
            <View style={styles.Box}>
              <View style={styles.textWithIcon}>
                <FontAwesome name="cc-mastercard" size={25} color="#0c3c45" />
                <Text style={styles.textinfoBox}>Acessar fatura</Text>
              </View>
            </View>
          </View>

          <View style={[styles.bottomBox,styles.primaryContainer]}>
            <View style={styles.Box}>
              <Text style={styles.textcabecalhoBox}>Investimentos</Text>
            </View>
            <View style={styles.Box}>
              <View style={styles.Box}>
                <Text style={styles.textmeioBox}>Total em investimentos:</Text>
              </View>
              <View style={styles.Box}>
                <Text style={styles.textmeiodireitaBoxpre}>{isBalanceVisible ? `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(investimento)}` : '****'}</Text>
              </View>
            </View>
            <View style={styles.Box}>
              <View style={styles.textWithIcon}>
                <FontAwesome name="gg" size={25} color="#0c3c45" />
                <Text style={styles.textinfoBox}>Acessar investimentos</Text>
              </View>
            </View>
          </View>

          <View style={[styles.bottomBoxUltimo,styles.primaryContainer]}>
            <View style={styles.Box}>
              <Text style={styles.textcabecalhoBox}>Empréstimo</Text>
            </View>
            <View style={styles.Box}>
              <View style={styles.Box}>
                <Text style={styles.textmeioBox}>Valor disponível de até:</Text>
              </View>
              <View style={styles.Box}>
                <Text style={styles.textmeiodireitaBoxpre}>{isBalanceVisible ? `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(emprestimo)}` : '****'}</Text>
              </View>
            </View>
            <View style={styles.Box}>
              <View style={styles.textWithIcon}>
                <FontAwesome name="sliders" size={25} color="#0c3c45" />
                <Text style={styles.textinfoBox}>Acessar análise</Text>
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
    backgroundColor: '#ffffff',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  nometopDiv: {
    flex: 2, // Ocupa 50% da tela
    alignItems: 'flex-start',
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
  bottomBoxUltimo: {
    width: "90%",
    height: "auto",
    margin: "5%",
    marginBottom:"10%",
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    flex: 1,
  },
  bottomBox1: {
    width: "90%",
    height: "auto",
    margin: "5%",
    marginBottom:"1%",
    flex: 1,
    flexDirection: 'row',
  },
  Box1: {
    flex: 1,
    padding: 5,
    margin: "1%",
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icone: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legenda: {
    flex: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWithIcon1: {
    color: '#0c3c45',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'left',
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
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  textmeioBox: {
    color: '#0c3c45',
    fontSize: 15,
    fontWeight: 'semibold',
    textAlign: 'left',
    width: '100%',
  },
  textmeiodireitaBox: {
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right', // Alinha o texto à direita
    width: '100%',
  },
  textmeiodireitaBoxver: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right', // Alinha o texto à direita
    width: '100%',
  },
  textmeiodireitaBoxpre: {
    color: '#0c3c45',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right', // Alinha o texto à direita
    width: '100%',
  },

  textinfoBox: {
    color: '#0c3c45',
    fontSize: 14,
    paddingLeft: 10,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  textWithIcon: {
    flexDirection: 'row', // Alinha os itens horizontalmente
    alignItems: 'center', // Centraliza verticalmente o texto e o ícone
  },

  textInput: {
    color: '#000',
    fontSize: 18,
  },
  label: {
    color: '#00a189',
    fontSize: 14,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#fff',
  },
  text2: {
    fontSize: 16,
    color: '#010101',
  },
});
