import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  style,
  textStyle 
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primary: {
    backgroundColor: '#0f766e',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#0f766e',
  },
  outlineText: {
    color: '#0f766e',
  },
  disabledText: {
    color: '#9ca3af',
  },
});

export default Button;
