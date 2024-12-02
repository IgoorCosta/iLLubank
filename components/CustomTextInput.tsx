import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';

type Props = {
  placeholder: string;
  value: string;
  keyboard: string;
  secureTextEntry?: boolean;
  onChangeText: (text: string) => void;
  theme?: 'primary' | 'default';
  label?: string;
};

export default function CustomTextInput({ 
  placeholder, 
  value,
  keyboard,
  secureTextEntry = false, 
  onChangeText, 
  theme = 'default', 
  label 
}: Props) {
  
  return (
    <View
      style={[
        styles.inputContainer,
        theme === 'primary' && styles.primaryContainer,
      ]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        keyboardType={keyboard}
        placeholderTextColor="#010101"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    width: "90%",
    height: "70%",
    justifyContent: 'center',
    paddingTop: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  primaryContainer: {
    borderWidth: 2,
    borderColor: '#00a189',
    borderRadius: 18,
  },
  textInput: {
    color: '#000',
    fontSize: 15,
    top: -5,
  },
  label: {
    color: '#00a189',
    fontSize: 16,
  },
});
