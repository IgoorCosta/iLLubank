import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  label: string;
  icon: string;
  theme?: 'primary';
  onPress?: () => void;
};

export default function Button({ label, icon, theme, onPress}: Props) {
  if (theme === 'primary') {
    return (
      <View
        style={[
          styles.buttonContainer,
          { borderWidth: 0, borderColor: '#00a189', borderRadius: 18 },
        ]}>
        <Pressable style={[styles.button, { backgroundColor: '#0c3c45' }]}
          onPress={onPress}>
          <FontAwesome name={icon} size={18} color="#fff" style={styles.buttonIcon} />
          <Text style={[styles.buttonLabel, { color: '#fff' }]}>{label}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "90%",
    height: "auto",
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    paddingRight: 12,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
});
