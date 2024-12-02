import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  icon: string;
  title: string;
  name: string;
  value: string;
  data: string;
  hora: string;
  color: string;
};

export default function ExtratoDiv({ icon, title, name, value, data, hora, color}: Props) {
  return (
    <View style={[styles.bottomBox2,styles.primaryContainer]}>
      <View style={styles.Box0}>
        <FontAwesome name={icon} size={30} color="#0c3c45" />
      </View>
      <View style={styles.Box1}>
        <View style={styles.Box1Div}>
          <Text style={styles.textTitle}>{title}</Text>
        </View>
        <View style={styles.Box1Div}>
          <Text style={styles.textCompound}>{name}</Text>
        </View>
        <View style={styles.Box1Div}>
          <Text style={[styles.textCompound, { color: color }]}>{value}</Text>
        </View>
      </View>
      <View style={styles.Box2}>
        <View style={styles.Box1Div}>
          <Text style={styles.textData}>{data}</Text>
        </View>
        <View style={styles.Box1Div}>
          <Text style={styles.textData}>{hora}</Text>
        </View>
        <View style={styles.Box1Div}>
          <Text style={styles.textData}></Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBox2: {
    width: "90%",
    height: "auto",
    margin: "5%",
    marginBottom:"1%",
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
  },
  Box0: {
    flex: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  Box1: {
    flex: 3,
    padding: 4,
  },
  Box1Div: {
    flex: 1,
    padding: 1,
  },
  Box2: {
    flex: 1,
    padding: 4,
  },
  primaryContainer: {
    borderWidth: 0,
    borderColor: '#00a189',
    borderRadius: 18,
  },
  textTitle: {
    fontSize: 16,
    color: '#0c3c45',
    fontWeight: 'bold',
  },
  textCompound: {
    fontSize: 16,
    color: '#0c3c45',
  },
  textData: {
    fontSize: 14,
    color: '#0c3c45',
  }
});
