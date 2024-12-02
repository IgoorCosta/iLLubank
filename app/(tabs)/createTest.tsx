import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { auth, db } from '@/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { setDoc, addDoc, doc, getDocs, getDoc, collection, query, where, writeBatch} from 'firebase/firestore';


export default function AboutScreen12() {
  const router = useRouter();

  //const response = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());

  // Função para deletar todos os documentos de uma coleção
  const deleteAllDocumentsInCollectionBatch = async (collectionName: string) => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(collectionRef);

      querySnapshot.forEach((document) => {
        const docRef = doc(db, collectionName, document.id);
        batch.delete(docRef);
      });

      await batch.commit();
      console.log(`Coleção "${collectionName}" limpa com sucesso.`);
    } catch (error) {
      console.error(`Erro ao deletar documentos da coleção "${collectionName}":`, error);
    }
  };

  // Função para criar um usuário
  const handleCriarUsuarios = async (email: string, password: string, dadosUsuario: object) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const userDocRef = doc(db, 'usuarios', userCredential.user.uid);
      await setDoc(userDocRef, dadosUsuario, { merge: true });
      console.log(`Usuário "${email}" criado com sucesso.`);
    } catch (error) {
      console.error(`Erro ao criar usuário "${email}":`, error);
    }
  };

  // Função para criar um extrato
  const handleCriarExtrato = async (userCredential: any, dadosExtrato: object, documento: string) => {
    try {
      const transferenciasRef = collection(db, documento);
      await addDoc(transferenciasRef, { userId: userCredential.user.uid, ...dadosExtrato });
      console.log(`Extrato criado para o usuário ${userCredential.user.email}`);
    } catch (error) {
      console.error("Erro ao criar extrato:", error);
    }
  };

  // Função para criar uma transferência
  const handleCriarTransferencia = async (email: string, password: string, dadosTransferencia: object) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const transferenciasRef = collection(db, 'transferencia');
      await addDoc(transferenciasRef, { userId: userCredential.user.uid, ...dadosTransferencia });
      console.log(`Transferência criada para o usuário ${email}`);
    } catch (error) {
      console.error("Erro ao criar transferência:", error);
    }
  };

  // Configuração inicial
  const runSetup = async () => {
    try {
      console.log("Iniciando setup...");

      // Limpa as coleções
      await Promise.all([
        deleteAllDocumentsInCollectionBatch('usuarios'),
        deleteAllDocumentsInCollectionBatch('transferencia'),
        deleteAllDocumentsInCollectionBatch('fatura'),
        deleteAllDocumentsInCollectionBatch('extrato'),
        deleteAllDocumentsInCollectionBatch('extratoPanico1'),
        deleteAllDocumentsInCollectionBatch('extratoPanico2'),
      ]);

      // Cria usuários
      const usuarios = [
        { email: 'igoor.costa@usp.br', password: '123456', dados: dadosUsuario },
        { email: 'ph.diniz@usp.br', password: '123456', dados: dadosUsuario2 },
      ];

      for (const usuario of usuarios) {
        await handleCriarUsuarios(usuario.email, usuario.password, usuario.dados);
      }

      // Cria extratos
      const userCredential = await signInWithEmailAndPassword(auth, 'igoor.costa@usp.br', '123456');
      const extratos = [dadosExtrato1, dadosExtrato2, dadosExtrato3, dadosExtrato4];
      await Promise.all(extratos.map((extrato) => handleCriarExtrato(userCredential, extrato, "extrato")));

      // Cria extratos
      const extratos1 = [dadosExtratoPanico1, dadosExtratoPanico2];
      await Promise.all(extratos1.map((extrato1) => handleCriarExtrato(userCredential, extrato1, "extratoPanico1")));
      
      // Cria extratos
      const extratos2 = [dadosExtratoPanico3];
      await Promise.all(extratos2.map((extrato2) => handleCriarExtrato(userCredential, extrato2, "extratoPanico2")));

      // Cria transferências
      await signInWithEmailAndPassword(auth, 'ph.diniz@usp.br', '123456');
      await handleCriarTransferencia('ph.diniz@usp.br', '123456', dadosTransferencia1);

      alert('Setup concluído com sucesso!');
    } catch (error) {

    }
  };

  runSetup();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
        <Text style={styles.buttonText}>Reiniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Exemplo de dados do usuário
const dadosUsuario = {
  nome: 'Igor',
  idade: 23,
  celular: '+55 11 98765-4321',
  email: 'igoor.costa@usp.br',
  cep: '03646-000',
  dataUltimoAcesso: '21:38 26/11/2024',

  agencia: '1234',
  conta: '56789-0',
  banco: '01',
  limiteCredito: 10000,
  investimentos: 35000,
  emprestimo: 40000,
  latitudeSegura: -23.5234132,
  longitudeSegura: -46.5301852,

  biometria: true,
  senhaNormal: '123456',
  senhaPanico: '000000',
  senhaTransferencias: '123456',
  
  modoPanico: 0,
  fatorPanico1: 0.1,
  fatorPanico2: 0.05,
};
const dadosUsuario2 = {
  nome: 'Paulo',
  idade: 20,
  celular: '+55 11 98765-4321',
  email: 'ph.diniz@usp.br',
  cep: '03646-000',
  dataUltimoAcesso: '21:38 26/11/2024',

  agencia: '1234',
  conta: '56789-0',
  banco: '01',
  limiteCredito: 400,
  investimentos: 0,
  emprestimo: 1000,

  biometria: true,
  senhaNormal: '123456',
  senhaPanico: '000000',
  senhaTransferencias: '123456',
  latitudeSegura: -23.5234132,
  longitudeSegura: -46.5301852,
  
  modoPanico: 0,
  fatorPanico1: 1,
  fatorPanico2: 1,
};

const dadosTransferencia1 = {
  nome: "Paulo",
  userIdOrigem: "541dQu6vvAK98f260dmG2afRAfr2",
  nomeOrigem: "Wanderlei",
  valor: 100,
  data: '15/11/24',
  hora: '09:15',
  latitude: "-52.431234",
  longitude: "-43.123543",
};

// Exemplo de dados do usuário
const dadosExtrato1 = {
  nome: 'Remuneração',
  nomeOrigem: "Salário",
  valor: 15000,
  data: '01/11/24',
  hora: '08:23',
};
const dadosExtrato2 = {
  nome: 'Pagamento efetuado',
  nomeOrigem: "Seguro",
  valor: 300,
  data: '02/11/24',
  hora: '11:41',
};
const dadosExtrato3 = {
  nome: 'Pagamento efetuado',
  nomeOrigem: "Fatura",
  valor: 4000,
  data: '07/11/24',
  hora: '15:12',
};
const dadosExtrato4 = {
  nome: 'Pagamento efetuado',
  nomeOrigem: "Boleto",
  valor: 1700,
  data: '10/11/24',
  hora: '15:12',
};

const dadosExtratoPanico1 = {
  nome: 'Pagamento efetuado',
  nomeOrigem: "Empréstimo consignado",
  valor: 5500,
  data: '05/11/24',
  hora: '08:03',
};
const dadosExtratoPanico2 = {
  nome: 'Pagamento efetuado',
  nomeOrigem: "Empréstimo consignado",
  valor: 1500,
  data: '17/11/24',
  hora: '14:46',
};
const dadosExtratoPanico3 = {
  nome: 'Pagamento efetuado',
  nomeOrigem: "Boleto",
  valor: 1000,
  data: '19/11/24',
  hora: '13:07',
};


const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa toda a tela
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    backgroundColor: '#0c3c45', // Fundo opcional
  },
  button: {
    backgroundColor: '#00a189', // Cor do botão
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff', // Cor do texto
    fontSize: 18,
    fontWeight: 'bold',
  },
});
