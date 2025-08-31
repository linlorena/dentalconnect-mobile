import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const PasswordInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  style,
  error,
  ...props
}) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const toggleVisibilidade = () => {
    setMostrarSenha(prev => !prev);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            style
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!mostrarSenha}
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
          {...props}
        />
        <TouchableOpacity
          onPress={toggleVisibilidade}
          style={styles.eyeButton}
        >
          <Text style={styles.eyeButtonText}>
            {mostrarSenha ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    paddingRight: 56,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default PasswordInput;
